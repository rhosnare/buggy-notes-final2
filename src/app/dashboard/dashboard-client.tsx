'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Note } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Link from 'next/link'
import { FileText } from 'lucide-react'

const COLORS = ['#16a34a', '#f97316'];

interface DashboardClientProps { initialNotes: Note[], userEmail: string | undefined }

export default function DashboardClient({ initialNotes, userEmail }: DashboardClientProps) {
  const [notes, setNotes] = useState(initialNotes)
  const supabase = createClient()
  useEffect(() => { setNotes(initialNotes); }, [initialNotes]);
  useEffect(() => {
    const channel = supabase.channel('realtime notes').on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
        if (payload.eventType === 'INSERT') { setNotes(currentNotes => [payload.new as Note, ...currentNotes]); }
        if (payload.eventType === 'UPDATE') { setNotes(currentNotes => currentNotes.map(note => note.id === payload.new.id ? payload.new as Note : note)); }
        if (payload.eventType === 'DELETE') { setNotes(currentNotes => currentNotes.filter(note => note.id !== (payload.old as Note).id)); }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const stats = useMemo(() => {
    const allNotes = notes.filter(n => n.status !== 'trashed');
    const done = allNotes.filter(n => n.status === 'done').length;
    const pending = allNotes.filter(n => n.status === 'pending').length;
    return { total: allNotes.length, done, pending }
  }, [notes])

  const chartData = [ { name: 'Selesai', value: stats.done }, { name: 'Tertunda', value: stats.pending } ]
  const recentNotes = useMemo(() => notes.filter(n => n.status !== 'trashed').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3), [notes]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {userEmail}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-transform duration-300 hover:scale-105"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Catatan</CardTitle></CardHeader> <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent> </Card>
        <Card className="transition-transform duration-300 hover:scale-105"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Catatan Selesai</CardTitle></CardHeader> <CardContent><div className="text-2xl font-bold">{stats.done}</div></CardContent> </Card>
        <Card className="transition-transform duration-300 hover:scale-105"> <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Catatan Tertunda</CardTitle></CardHeader> <CardContent><div className="text-2xl font-bold">{stats.pending}</div></CardContent> </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader><CardTitle>Ringkasan Catatan</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {chartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                </Pie> <Tooltip /> <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>3 Catatan Terbaru</CardTitle></CardHeader>
          <CardContent>
            {recentNotes.length > 0 ? (
                <ul className="space-y-4">
                    {recentNotes.map(note => ( <li key={note.id}> <Link href={`/dashboard/notes/${note.id}`} className="flex items-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"> <FileText className="mr-3 flex-shrink-0"/> <span className="truncate font-semibold">{note.title}</span> </Link> </li> ))}
                </ul>
            ) : ( <p className="text-sm text-muted-foreground">Belum ada catatan.</p> )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}