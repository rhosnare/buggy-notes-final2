// src/app/dashboard/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import MobileSidebar from "@/components/mobile-sidebar";
import PageTransition from "@/components/page-transition";
import { type User } from "@supabase/supabase-js";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="hidden md:flex">
        {/* Kirim data user dari server sebagai prop */}
        <Sidebar user={user} />
      </div>
      <div className="flex flex-col flex-1">
        {/* Kirim data user dari server sebagai prop */}
        <MobileSidebar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}