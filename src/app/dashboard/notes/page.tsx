import { createClient } from "@/lib/supabase/server"
import { type Note } from "@/lib/types"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import CreateNoteDialog from "./create-note-dialog"

export default async function NotesPage() {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select('*').in('status', ['pending', 'done']).order('created_at', { ascending: false })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Notes</h1>
        <CreateNoteDialog />
      </div>
      {notes && notes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(notes as Note[]).map(note => ( <Link href={`/dashboard/notes/${note.id}`} key={note.id}> <Card className="transition-transform duration-300 hover:scale-105"> <CardHeader> <CardTitle className="truncate">{note.title}</CardTitle> </CardHeader> </Card> </Link> ))}
        </div>
      ) : ( <p className="mt-4 text-muted-foreground">Kamu belum punya catatan. Buat satu!</p> )}
    </div>
  )
}