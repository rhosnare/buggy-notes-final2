// src/app/verify/page.tsx
'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'

// ✨ Varian animasi untuk efek stagger ✨
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function VerifyComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!email) {
      toast.error("Email tidak ditemukan. Mengarahkan ke halaman pendaftaran.")
      router.push('/register')
    }
  }, [email, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || otp.length < 6) {
        toast.error("OTP harus 6 digit.");
        return;
    }
    setIsLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    } else {
      toast.success("Email berhasil diverifikasi!")
      setShowConfetti(true)
      setTimeout(() => { router.push('/login') }, 5000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background px-4">
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)}/>}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-md dark:bg-card sm:p-8 sm:space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">Verifikasi Email Anda</h1>
            <p className="text-muted-foreground break-words">
              Kami telah mengirimkan kode 6 digit ke <strong>{email}</strong>.
            </p>
        </motion.div>
        <motion.form variants={itemVariants} onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Hanya izinkan angka
            placeholder="123456"
            maxLength={6}
            className="h-16 text-center text-3xl tracking-[0.5em] sm:tracking-[1em]"
            disabled={isLoading || showConfetti}
          />
          <Button type="submit" className="w-full transition-transform hover:scale-105 active:scale-95" disabled={isLoading || showConfetti}>
            {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}

// Gunakan Suspense untuk memastikan useSearchParams bekerja dengan baik
export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyComponent />
        </Suspense>
    )
}