'use client'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, FileText, Trash2, LogOut, Moon, Sun } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "All Notes", href: "/dashboard/notes", icon: FileText },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error("Logout failed: " + error.message) }
    else { router.push('/login'); router.refresh() }
  }

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-gray-100 p-4 dark:bg-gray-900 md:flex md:flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Buggy Notes</h1>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <nav className="mt-8 flex-grow">
            <ul>
                {navItems.map((item) => (
                    <li key={item.name}>
                        <Link href={item.href} className={`flex items-center rounded-lg p-2 my-1 transition-colors ${ pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-gray-200 dark:hover:bg-gray-800" }`}>
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start"> <LogOut className="mr-3 h-5 w-5" /> Logout </Button>
    </aside>
  )
}