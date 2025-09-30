// src/app/login/page.tsx
'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

// ✨ Komponen Ikon Google ✨
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" {...props}>
        <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.686H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.686 30.172-22.91 0-43.894-19.119-43.894-42.607s20.983-42.607 43.894-42.607c13.348 0 20.323 6.11-25.083 10.926-4.723 5.33-8.71 19.12-26.686 19.12-22.91 0-43.894-19.119-43.894-42.607s20.983-42.607 43.894-42.607c13.348 0 20.323 6.11-25.083 10.926 11.336-11.336 21.846-34.133 21.846-51.531 0-22.91-19.119-43.894-42.607-43.894-34.133 0-61.622 27.489-61.622 61.622s27.489 61.622 61.622 61.622c1.581 0 3.132-.123 4.653-.357-12.04 16.096-26.686 42.607-39.49 42.607-22.91 0-43.894-19.119-43.894-42.607s20.983-42.607 43.894-42.607c13.348 0 20.323 6.11-25.083 10.926z" />
        <path fill="#34A853" d="M130.55 261.1c34.133 0 61.622-27.489 61.622-61.622s-27.489-61.622-61.622-61.622-61.622 27.489-61.622 61.622 27.489 61.622 61.622 61.622z" />
        <path fill="#FBBC05" d="M130.55 133.451c-22.91 0-43.894 19.119-43.894 42.607s20.983 42.607 43.894 42.607 43.894-19.119 43.894-42.607-20.983-42.607-43.894-42.607z" />
        <path fill="#EA4335" d="M130.55 65.795c-22.91 0-43.894 19.119-43.894 42.607s20.983 42.607 43.894 42.607 43.894-19.119 43.894-42.607-20.983-42.607-43.894-42.607z" />
    </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong.' }),
});

// ✨ Definisikan varian animasi di luar komponen ✨
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

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Email belum terverifikasi.', { description: 'Silakan cek inbox Anda untuk kode verifikasi.', action: { label: 'Ke Halaman Verifikasi', onClick: () => router.push(`/verify?email=${encodeURIComponent(values.email)}`) } });
      } else {
        toast.error(error.message);
      }
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } });
  }

  async function handlePasswordReset() {
    if (!resetEmail) { toast.error('Silakan masukkan alamat email Anda.'); return; }
    setIsResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${location.origin}/reset-password` });
    setIsResetting(false);
    if (error) { toast.error(error.message); } else { toast.success('Link reset password telah dikirim! Silakan cek email Anda.'); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-card sm:p-8 sm:space-y-6">
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Selamat Datang Kembali!</h1>
          <p className="text-muted-foreground">Masuk untuk melanjutkan ke Buggy Notes</p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <Button variant="outline" className="w-full transition-transform hover:scale-105 active:scale-95" onClick={handleGoogleLogin}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Masuk dengan Google
            </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-card">Atau lanjut dengan</span></div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input placeholder="anda@email.com" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="password" render={({ field }) => ( <FormItem> <FormLabel>Password</FormLabel> <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                <div className="text-right text-sm">
                    <Dialog>
                        <DialogTrigger asChild><Button variant="link" className="h-auto p-0 font-normal">Lupa Password?</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Reset Password Anda</DialogTitle></DialogHeader>
                            <p className="text-sm text-muted-foreground">Masukkan email Anda untuk menerima link reset password.</p>
                            <Input type="email" placeholder="anda@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}/>
                            <DialogFooter><Button onClick={handlePasswordReset} disabled={isResetting}> {isResetting ? 'Mengirim...' : 'Kirim Link Reset'} </Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting ? 'Masuk...' : 'Masuk'} </Button>
              </form>
            </Form>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}