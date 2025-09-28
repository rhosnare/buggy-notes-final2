'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createNote } from '@/app/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CreateNoteDialog() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    if (!title) { toast.error("Judul tidak boleh kosong."); return }
    startTransition(async () => {
      try {
        const newNote = await createNote(title)
        toast.success(`Catatan "${title}" berhasil dibuat!`)
        setIsOpen(false); setTitle('')
        router.push(`/dashboard/notes/${newNote.id}`)
      } catch (error) { toast.error((error as Error).message) }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button>+ Catatan Baru</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Buat Catatan Baru</DialogTitle></DialogHeader>
        <Input placeholder="Masukkan judul catatan..." value={title} onChange={e => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()}/>
        <DialogFooter><Button onClick={handleCreate} disabled={isPending}> {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Buat Catatan & Buka Editor </Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}