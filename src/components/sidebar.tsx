// src/components/sidebar.tsx
import { type User } from "@supabase/supabase-js";
import SidebarContent from "./sidebar-content";

interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-card flex flex-col">
      {/* Teruskan data user ke SidebarContent */}
      <SidebarContent user={user} />
    </aside>
  );
}