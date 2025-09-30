/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  // Flag ini penting untuk memperbaiki build di Netlify (TETAP PERTAHANKAN)
  optimizeFonts: false,

  // ✨ TAMBAHKAN KONFIGURASI IZIN GAMBAR DI SINI ✨
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // Izinkan semua path dari hostname ini
      },
    ],
  },
};

export default config;