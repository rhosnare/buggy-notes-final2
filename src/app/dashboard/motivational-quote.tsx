// src/app/dashboard/motivational-quote.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
  { text: "Catatan kecil hari ini adalah sejarah besar esok hari.", author: "Anonim" },
  { text: "Ide terbaik datang saat kita menulisnya.", author: "Paulo Coelho" },
  { text: "Menulis adalah cara terbaik untuk berbicara tanpa gangguan.", author: "Jules Renard" },
  { text: "Jangan pernah menunda menuliskan ide cemerlang Anda.", author: "Albert Einstein" },
  { text: "Setiap kata yang tertulis adalah langkah menuju pemahaman.", author: "Marie Curie" },
  { text: "Tulislah sesuatu yang layak dibaca, atau lakukan sesuatu yang layak ditulis.", author: "Benjamin Franklin" },
];

export default function MotivationalQuote() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Pastikan quotes tidak kosong sebelum mengatur interval
    if (quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 10000); // Ganti kutipan setiap 10 detik

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

  // Jika array quotes kosong atau currentQuote tidak ditemukan
  if (!currentQuote) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-6 text-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-xl text-white">
        <p className="text-xl font-bold italic">Loading quotes...</p>
      </div>
    );
  }

  return (
    // ✨ PERUBAHAN DI SINI: shadow-xl, dan pastikan flexbox untuk centering ✨
    <div className="flex flex-col h-full justify-center items-center p-6 text-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-xl text-white"> 
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote.text} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4 font-serif" // ✨ TAMBAH font-serif ✨
        >
          {/* ✨ PERUBAHAN FONT: sm:text-4xl, font-extrabold, leading-tight ✨ */}
          <p className="text-3xl sm:text-4xl font-extrabold italic leading-tight tracking-wide">
            &ldquo;{currentQuote.text}&rdquo;
          </p>
          {/* ✨ PERUBAHAN FONT: sm:text-xl, font-semibold ✨ */}
          <p className="text-lg sm:text-xl font-semibold opacity-80 mt-4">
            — {currentQuote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}