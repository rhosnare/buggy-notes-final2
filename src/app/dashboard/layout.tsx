'use client'
import Sidebar from "@/components/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }} // <-- UBAH NILAI Y DI SINI
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}  // <-- UBAH NILAI Y DI SINI
            transition={{ duration: 0.2 }} // <-- Percepat durasi sedikit
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}