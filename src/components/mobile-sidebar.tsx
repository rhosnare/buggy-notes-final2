// src/components/mobile-sidebar.tsx
'use client'

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import SidebarContent from "./sidebar-content";
import { type User } from "@supabase/supabase-js";

interface MobileSidebarProps {
  user: User | null;
}

export default function MobileSidebar({ user }: MobileSidebarProps) {
    return (
        <div className="md:hidden p-4 border-b flex items-center bg-card">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Buka Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-card border-none">
                    {/* Teruskan data user ke SidebarContent */}
                    <SidebarContent user={user} />
                </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold ml-4">Buggy Notes</h1>
        </div>
    )
}