// src/components/sidebar-content.tsx
'use client'

import React, { useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, FileText, Trash2, LogOut, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { type User } from '@supabase/supabase-js';
import Image from 'next/image';
import ProfileDialog from '@/components/profile-dialog';

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "All Notes", href: "/dashboard/notes", icon: FileText },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
];

interface SidebarContentProps {
  user: User | null;
}

export default function SidebarContent({ user }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // useEffect untuk fetch user sudah dihapus, karena data didapat dari props

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) { toast.error("Logout failed: " + error.message); }
    else { router.push('/login'); router.refresh(); }
  };

  const displayName = user?.user_metadata.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata.avatar_url || '/avatars/1.png';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Buggy Notes</h1>
      </div>
      <nav className="mt-4 flex-grow px-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={`flex items-center rounded-lg p-2 my-1 transition-colors ${pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center rounded-lg p-2 my-1 transition-colors hover:bg-muted"
            >
              <Sun className="mr-3 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute mr-3 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Ganti Tema</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="space-y-2 p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start h-auto p-2 transition-transform hover:scale-105 active:scale-95" onClick={() => setIsProfileOpen(true)}>
          <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
            <Image src={avatarUrl} alt="User Avatar" fill className="object-cover"/>
          </div>
          <span className="truncate">{displayName}</span>
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start transition-transform hover:scale-105 active:scale-95">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>

      <ProfileDialog user={user} isOpen={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
}