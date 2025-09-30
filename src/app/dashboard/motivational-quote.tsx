'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
    "Catatan kecil hari ini adalah sejarah besar esok hari.",
    "Setiap ide besar dimulai dari satu baris tulisan.",
    "Jangan hanya berpikir, tuliskan.",
    "Tuangkan isi kepalamu, biarkan pikiranmu bebas.",
    "Apa yang akan kamu ciptakan hari ini?",
];

export default function MotivationalQuote() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        }, 7000); // Ganti kutipan setiap 7 detik

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-full items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7 }}
                    className="text-center text-xl italic text-muted-foreground md:text-2xl"
                >
                    "{quotes[index]}"
                </motion.p>
            </AnimatePresence>
        </div>
    );
}