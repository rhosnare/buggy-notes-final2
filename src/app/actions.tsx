'use server'
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createNote(title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")
  const { data, error } = await supabase.from('notes').insert({ title, user_id: user.id, content: '' }).select('id').single()
  if (error) { console.error("Error creating note:", error); throw new Error(error.message) }
  revalidatePath('/dashboard/notes'); revalidatePath(`/dashboard/notes/${data.id}`)
  return data
}

export async function updateNote(noteId: number, title: string, content: string | null) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').update({ title, content }).eq('id', noteId)
  if (error) { console.error("Error updating note:", error); throw new Error(error.message) }
  revalidatePath(`/dashboard/notes/${noteId}`); revalidatePath('/dashboard')
}

export async function updateNoteStatus(noteId: number, status: 'pending' | 'done' | 'trashed') {
   const supabase = await createClient()
   const { error } = await supabase.from('notes').update({ status }).eq('id', noteId)
   if (error) { console.error("Error updating note status:", error); throw new Error(error.message) }
   revalidatePath('/dashboard/notes'); revalidatePath('/dashboard/trash'); revalidatePath('/dashboard')
}

export async function deleteNotePermanently(noteId: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('notes').delete().eq('id', noteId)
  if (error) { console.error("Error deleting note permanently:", error); throw new Error(error.message) }
  revalidatePath('/dashboard/trash'); revalidatePath('/dashboard')
}

