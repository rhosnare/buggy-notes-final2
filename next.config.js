/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// Menggunakan 'import' standar ES Module (dari kode asli Anda)
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  // Flag ini penting untuk memperbaiki build di Netlify
  optimizeFonts: false,
};

// Menggunakan 'export default' standar ES Module (dari kode asli Anda)
export default config;