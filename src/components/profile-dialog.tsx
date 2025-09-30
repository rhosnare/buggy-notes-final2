'use client'

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { type User } from '@supabase/supabase-js';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { updateUserProfile } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Skema validasi untuk form
const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Nama minimal harus 2 karakter." }),
});

// Konfigurasi avatar
const AVATAR_COUNT = 5; // Sesuaikan dengan jumlah gambar avatar yang Anda punya
const avatars = Array.from({ length: AVATAR_COUNT }, (_, i) => `/avatars/${i + 1}.png`);

interface ProfileDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ user, isOpen, onOpenChange }: ProfileDialogProps) {
  const [isPending, startTransition] = useTransition();
  // State untuk menyimpan avatar yang dipilih
  const [selectedAvatar, setSelectedAvatar] = useState(user?.user_metadata.avatar_url || avatars[0]);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    // Nilai default untuk form
    defaultValues: {
      fullName: user?.user_metadata.full_name || user?.email?.split('@')[0] || '',
    },
  });

  // Efek untuk me-reset form jika data user berubah (misal: setelah update)
  useEffect(() => {
    if (user) {
      form.reset({
          fullName: user.user_metadata.full_name || user.email?.split('@')[0] || '',
      });
      setSelectedAvatar(user.user_metadata.avatar_url || avatars[0]);
    }
  }, [user, form]);

  // Fungsi yang dijalankan saat form disubmit
  function onSubmit(values: z.infer<typeof profileSchema>) {
    startTransition(async () => {
      try {
        await updateUserProfile({
          fullName: values.fullName,
          avatarUrl: selectedAvatar,
        });
        toast.success("Profil berhasil diperbarui!");
        onOpenChange(false); // Tutup dialog setelah berhasil
      } catch (error) {
        toast.error((error as Error).message);
      }
    });
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profil Anda</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bagian Pilihan Avatar */}
            <div className="space-y-2">
                <FormLabel>Pilih Avatar</FormLabel>
                <div className="grid grid-cols-6 gap-2">
                    {avatars.map((avatar) => (
                        <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={cn(
                                "rounded-full overflow-hidden aspect-square relative transition-all duration-200",
                                selectedAvatar === avatar 
                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                                    : "hover:scale-110"
                            )}
                        >
                            <Image src={avatar} alt={`Avatar ${avatar}`} fill className="object-cover"/>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Bagian Input Nama */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Anda..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}