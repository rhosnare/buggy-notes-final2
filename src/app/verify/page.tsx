'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Confetti from 'react-confetti'
import { motion } from 'framer-motion'

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
    if (!email || !otp) return
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)}/>}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.5 }} className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Verifikasi Email Anda</h1>
            <p className="text-muted-foreground"> Kami telah mengirimkan kode 6 digit ke <strong>{email}</strong>. </p>
        </div>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="h-16 text-center text-3xl tracking-[1em]" disabled={isLoading || showConfetti}/>
          <Button type="submit" className="w-full" disabled={isLoading || showConfetti}> {isLoading ? 'Memverifikasi...' : 'Verifikasi'} </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
    return ( <Suspense fallback={<div>Loading...</div>}> <VerifyComponent /> </Suspense> )
}