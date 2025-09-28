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

const formSchema = z.object({
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong.' }),
});

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.5 }} className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Selamat Datang Kembali!</h1>
          <p className="text-muted-foreground">Masuk untuk melanjutkan ke Buggy Notes</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}> Masuk dengan Google </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">Atau lanjut dengan</span></div>
        </div>
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}> {form.formState.isSubmitting ? 'Masuk...' : 'Masuk'} </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground"> Belum punya akun?{' '} <Link href="/register" className="font-semibold text-primary hover:underline"> Daftar sekarang </Link> </p>
      </motion.div>
    </div>
  );
}