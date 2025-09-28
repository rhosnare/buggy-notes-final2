import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import NoteEditorClient from "./note-editor-client"

export default async function NoteEditorPage({ params }: { params: { noteId: string } }) {
    const supabase = await createClient()
    const noteId = parseInt(params.noteId, 10);
    if (isNaN(noteId)) { notFound(); }
    const { data: note } = await supabase.from('notes').select('*').eq('id', noteId).single()
    if (!note) { notFound() }
    return <NoteEditorClient initialNote={note} />
}