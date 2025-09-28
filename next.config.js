/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  // ======================================================
  // ✨ INI ADALAH SOLUSI YANG BENAR & FINAL ✨
  // Memaksa Next.js untuk tidak menggunakan 'lightningcss' saat build
  optimizeFonts: false,
  // ======================================================
};

export default config;