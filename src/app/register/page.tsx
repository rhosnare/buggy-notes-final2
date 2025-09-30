'use client'

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Password minimal harus 6 karakter." }),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      // ✨ 1. LOGIKA COOLDOWN DIJALANKAN DI AWAL ✨
      const cooldownKey = `signup_cooldown_${values.email}`;
      const lastAttempt = localStorage.getItem(cooldownKey);
      
      if (lastAttempt && (Date.now() - parseInt(lastAttempt)) < 30000) {
          const timeLeft = Math.ceil((30000 - (Date.now() - parseInt(lastAttempt))) / 1000);
          toast.error(`Anda baru saja meminta kode. Silakan tunggu ${timeLeft} detik lagi.`);
          return; // Hentikan fungsi di sini
      }

      // ✨ 2. TIMESTAMP LANGSUNG DISIMPAN SETELAH LOLOS CEK ✨
      // Ini memastikan cooldown berjalan bahkan jika Supabase mengirim ulang OTP
      localStorage.setItem(cooldownKey, Date.now().toString());

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Hapus timestamp jika terjadi error sebenarnya (misal: password terlalu lemah)
        // agar pengguna bisa langsung memperbaiki dan mencoba lagi tanpa menunggu.
        localStorage.removeItem(cooldownKey);
        
        if (error.message.includes("User already registered")) {
            toast.error("Email sudah terdaftar dan terverifikasi.", {
                description: "Silakan gunakan email lain atau login.",
            });
            form.setError("email", { 
                type: "manual", 
                message: "Email ini sudah digunakan." 
            });
        } else {
            toast.error(error.message);
        }
      } else {
        toast.success("Pendaftaran berhasil!", {
            description: "Kami telah mengirim kode verifikasi ke email Anda."
        });
        router.push(`/verify?email=${encodeURIComponent(values.email)}`);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-card sm:p-8 sm:space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">Buat Akun Baru</h1>
            <p className="text-muted-foreground">Selamat datang di Buggy Notes!</p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="anda@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                              {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                           </button>
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : "Daftar"}
                </Button>
              </form>
            </Form>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}