'use client'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteNotePermanently, updateNoteStatus } from '@/app/actions'
import { toast } from 'sonner'
import { RotateCcw, Trash2, Loader2 } from 'lucide-react'

interface TrashActionsProps { noteId: number }

export default function TrashActions({ noteId }: TrashActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
        try { await updateNoteStatus(noteId, 'pending'); toast.success("Catatan berhasil dipulihkan.") }
        catch (error) { toast.error((error as Error).message) }
    });
  }

  const handleDelete = () => {
    startTransition(async () => {
        try { await deleteNotePermanently(noteId); toast.success("Catatan dihapus secara permanen.") }
        catch (error) { toast.error((error as Error).message) }
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleRestore} disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RotateCcw className="mr-2 h-4 w-4" />}
         Pulihkan
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
             Hapus Permanen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat diurungkan. Catatan ini akan dihapus secara permanen dari server kami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}