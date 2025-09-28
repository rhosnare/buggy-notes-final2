'use client'
import React, { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // <-- IMPORT BARU
import { toast } from 'sonner'
import { type Note } from '@/lib/types'
import { updateNote, updateNoteStatus } from '@/app/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, ChevronLeft } from 'lucide-react' // <-- IMPORT ICON BARU

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debouncedValue
}

export default function NoteEditorClient({ initialNote }: { initialNote: Note }) {
    const router = useRouter()
    const [note, setNote] = useState(initialNote)
    const [title, setTitle] = useState(initialNote.title)
    const [content, setContent] = useState(initialNote.content ?? '')
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
    const [isPending, startTransition] = useTransition()
    const debouncedTitle = useDebounce(title, 1500)
    const debouncedContent = useDebounce(content, 1500)

    const saveChanges = useCallback(async (newTitle: string, newContent: string) => {
        if (newTitle === note.title && newContent === (note.content ?? '')) return
        setStatus('saving')
        startTransition(async () => {
            try {
                await updateNote(note.id, newTitle, newContent)
                setNote(prev => ({ ...prev!, title: newTitle, content: newContent }))
                setStatus('saved'); setTimeout(() => setStatus('idle'), 2000)
            } catch (error) { toast.error((error as Error).message); setStatus('idle') }
        })
    }, [note]);

    useEffect(() => { saveChanges(debouncedTitle, debouncedContent) }, [debouncedTitle, debouncedContent, saveChanges])

    const handleTrashNote = () => {
        // Kita gunakan AlertDialog yang lebih baik di sini
        // (Pastikan Anda sudah 'add alert-dialog' via shadcn)
        startTransition(async () => {
            try {
                await updateNoteStatus(note.id, 'trashed')
                toast.success("Catatan dipindahkan ke sampah.")
                router.push('/dashboard/notes')
            } catch (error) { toast.error((error as Error).message) }
        })
    }

    return (
        <div className="mx-auto flex h-full max-w-4xl flex-col">
            <div className="flex items-center justify-between mb-4">
                {/* ✨ TOMBOL KEMBALI DITAMBAHKAN DI SINI ✨ */}
                <Link href="/dashboard/notes" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Kembali ke semua catatan
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 transition-opacity"> {status === 'saving' ? 'Menyimpan...' : status === 'saved' ? 'Tersimpan ✓' : ''} </span>
                    <Button variant="ghost" size="icon" onClick={handleTrashNote} disabled={isPending}> {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} </Button>
                </div>
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul Catatan" className="border-none p-0 text-4xl font-bold shadow-none focus-visible:ring-0"/>
            <Textarea value={content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} className="mt-4 flex-grow resize-none border-none p-0 text-lg shadow-none focus-visible:ring-0" placeholder="Mulai tulis di sini..."/>
        </div>
    )
}