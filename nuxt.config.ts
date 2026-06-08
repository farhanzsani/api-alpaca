// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // SSR aktif agar UI & API berjalan bersamaan
  ssr: true,

  // Nitro config — konfigurasi Nitro server engine
  nitro: {
    // Aktifkan experimental database support (opsional, bisa digunakan kelak)
    experimental: {
      database: false,
    },
  },

  // Runtime config — env variables yang dapat diakses di server side
  runtimeConfig: {
    // Private keys (hanya server side)
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET ?? "alpaca-default-secret",
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
    firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "",

    // Public keys (dapat diakses di client side juga)
    public: {
      appName: "Alpaca API",
      apiVersion: "v1",
    },
  },
});
