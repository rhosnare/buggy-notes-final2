'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { type Note } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, PlusCircle } from 'lucide-react'
import MotivationalQuote from './motivational-quote'
import { type User } from '@supabase/supabase-js'

interface DashboardClientProps {
  initialNotes: Note[]
  currentUser: User | null
}

export default function DashboardClient({ initialNotes, currentUser }: DashboardClientProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [user, setUser] = useState(currentUser); 
  const supabase = createClient()

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);


  useEffect(() => {
    const channel = supabase.channel('realtime notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(currentNotes => [payload.new as Note, ...currentNotes]);
          }
          if (payload.eventType === 'UPDATE') {
            setNotes(currentNotes => currentNotes.map(note => 
              note.id === payload.new.id ? payload.new as Note : note
            ));
          }
          if (payload.eventType === 'DELETE') {
            setNotes(currentNotes => currentNotes.filter(note => note.id !== (payload.old as Note).id));
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const stats = useMemo(() => {
    const allNotes = notes.filter(n => n.status !== 'trashed');
    const done = allNotes.filter(n => n.status === 'done').length;
    const pending = allNotes.filter(n => n.status === 'pending').length;
    return { total: allNotes.length, done, pending }
  }, [notes])
  
  const recentNotes = useMemo(() => notes
    .filter(n => n.status !== 'trashed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3), [notes]);

  const displayName = user?.user_metadata.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {displayName}!</h1>
      
      {/* Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Catatan</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catatan Selesai</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.done}</div></CardContent>
        </Card>
        <Card className="transition-transform duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catatan Tertunda</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Kutipan Motivasi */}
        {/* ✨ PERUBAHAN DI SINI: Hapus CardContent, tambahkan kelas ✨ */}
        <Card className="lg:col-span-4 h-[350px] overflow-hidden p-0 border-none shadow-none">
            <MotivationalQuote />
        </Card>
        
        {/* Daftar Catatan Terbaru */}
        <Card className="lg:col-span-3 h-[350px]">
          <CardHeader><CardTitle>3 Catatan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {recentNotes.length > 0 ? (
                <ul className="space-y-4">
                    {recentNotes.map(note => (
                        <li key={note.id}>
                            <Link href={`/dashboard/notes/${note.id}`} className="flex items-center rounded-lg p-2 transition-colors hover:bg-muted">
                                <FileText className="mr-3 flex-shrink-0"/>
                                <span className="truncate font-semibold">{note.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">Belum ada catatan. Buat satu!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aksi Cepat */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Aksi Cepat</h2>
        <div className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/notes">
                <Card className="flex flex-col items-center justify-center p-6 text-center transition-all hover:scale-105 hover:bg-muted h-full">
                    <PlusCircle className="h-10 w-10 mb-2 text-primary" />
                    <h3 className="font-semibold">Buat Catatan Baru</h3>
                    <p className="text-sm text-muted-foreground">Mulai tulis ide brilian Anda.</p>
                </Card>
            </Link>
        </div>
      </div>
    </div>
  )
}