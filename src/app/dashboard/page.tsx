import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import { type Note } from "@/lib/types";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect('/login'); }
  const { data: notes, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
  if (error) { console.error("Error fetching notes:", error); }
  return <DashboardClient initialNotes={notes as Note[] ?? []} userEmail={user.email ?? ''} />;
}