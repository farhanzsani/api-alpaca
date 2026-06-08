import { verifyFirebaseToken } from "../lib/firebase";

// ----------------------------------------------------------------
// Auth Middleware – Global
//
// Berjalan di setiap request ke /api/**
// Memverifikasi Firebase ID Token dari header Authorization.
// Meng-inject hasil decode ke event.context.firebaseUser
// ----------------------------------------------------------------

// Route yang tidak butuh autentikasi sama sekali
const PUBLIC_ROUTES = [
  "/api/stats",           // stats landing page
  "/api/v1/users/create", // sync user setelah register (diverifikasi manual di handler)
];

// Route yang public TAPI hanya untuk GET method
const PUBLIC_GET_ROUTES = [
  "/api/v1/business-locations"
];

export default defineEventHandler(async (event) => {
  const url = event.path ?? "";
  const method = event.method;

  // Hanya jalankan auth check untuk route /api/**
  if (!url.startsWith("/api/")) return;

  // Lewati route publik
  if (PUBLIC_ROUTES.some((route) => url.startsWith(route))) return;
  if (method === "GET" && PUBLIC_GET_ROUTES.some((route) => url.startsWith(route))) return;

  // Ambil Authorization header
  const authHeader = getHeader(event, "authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    setResponseStatus(event, 401);
    return {
      status: "error",
      message: "Token autentikasi tidak ditemukan. Sertakan header Authorization: Bearer <token>.",
      data: null,
    };
  }

  try {
    const decoded = await verifyFirebaseToken(token);

    // Inject ke context agar bisa dipakai di semua handler
    event.context.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
    };
  } catch (err) {
    console.error("[Auth Middleware] Token tidak valid:", err);
    setResponseStatus(event, 401);
    return {
      status: "error",
      message: "Token tidak valid atau sudah expired. Silakan login ulang.",
      data: null,
    };
  }
});
