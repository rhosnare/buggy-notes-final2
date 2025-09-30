// src/app/actions.ts
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Fungsi untuk membuat catatan baru
export async function createNote(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  const { data, error } = await supabase
    .from('notes')
    .insert({ title, user_id: user.id, content: '' })
    .select('id')
    .single()

  if (error) {
    console.error("Error creating note:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/notes')
  revalidatePath(`/dashboard/notes/${data.id}`)
  
  return data
}

// Fungsi untuk memperbarui catatan
export async function updateNote(noteId: number, title: string, content: string | null) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', noteId)

  if (error) {
    console.error("Error updating note:", error)
    throw new Error(error.message)
  }
  
  revalidatePath(`/dashboard/notes/${noteId}`)
  revalidatePath('/dashboard')
}

// Fungsi untuk memperbarui status catatan
export async function updateNoteStatus(noteId: number, status: 'pending' | 'done' | 'trashed') {
   const supabase = await createClient()
   const { error } = await supabase
     .from('notes')
     .update({ status })
     .eq('id', noteId)

   if (error) {
    console.error("Error updating note status:", error)
    throw new Error(error.message)
   }

   revalidatePath('/dashboard/notes')
   revalidatePath('/dashboard/trash')
   revalidatePath('/dashboard')
}

// Fungsi untuk menghapus catatan permanen
export async function deleteNotePermanently(noteId: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    
  if (error) {
    console.error("Error deleting note permanently:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/trash')
  revalidatePath('/dashboard')
}

// ✨ FUNGSI BARU UNTUK UPDATE PROFIL PENGGUNA ✨
export async function updateUserProfile(formData: { fullName: string; avatarUrl: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Memperbarui metadata pengguna di Supabase Auth
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: formData.fullName,
      avatar_url: formData.avatarUrl,
    },
  });

  if (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message);
  }

  // Revalidate path layout agar sidebar bisa update nama & avatar baru
  revalidatePath('/dashboard', 'layout');
}