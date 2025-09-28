import { createClient } from "@/lib/supabase/server"
import { type Note } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import TrashActions from './trash-actions'

export default async function TrashPage() {
  const supabase = await createClient()
  const { data: notes } = await supabase.from('notes').select('*').eq('status', 'trashed').order('created_at', { ascending: false })
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sampah</h1>
      <div className="space-y-4">
        {notes && notes.length > 0 ? (
          (notes as Note[]).map(note => ( <Card key={note.id}> <CardContent className="flex items-center justify-between p-4"> <span className="font-semibold">{note.title}</span> <TrashActions noteId={note.id} /> </CardContent> </Card> ))
        ) : ( <p className="mt-4 text-muted-foreground">Tempat sampah kosong.</p> )}
      </div>
    </div>
  )
}