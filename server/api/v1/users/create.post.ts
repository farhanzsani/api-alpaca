
/**
 * POST /api/v1/users/create
 *
 * Sinkronisasi user dari Firebase Auth ke database lokal.
 * Dipanggil setelah register/login pertama kali di Flutter.
 * Route ini PUBLIC tapi tetap memverifikasi Firebase token secara manual.
 *
 * Body: { email, display_name, role, photo_url?, phone_number? }
 * id otomatis diambil dari Firebase UID token.
 */
import { verifyFirebaseToken } from "../../../lib/firebase";

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi token manual (karena route ini dikecualikan dari middleware)
    const authHeader = getHeader(event, "authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
      setResponseStatus(event, 401);
      return errorResponse("Token autentikasi tidak ditemukan.");
    }

    let decoded;
    try {
      decoded = await verifyFirebaseToken(token);
    } catch {
      setResponseStatus(event, 401);
      return errorResponse("Token tidak valid atau sudah expired.");
    }

    const body = await readBody(event);

    const required = ["email", "display_name", "role"] as const;
    for (const field of required) {
      if (!body[field]) {
        setResponseStatus(event, 400);
        return errorResponse(`Field '${field}' wajib diisi.`);
      }
    }

    const validRoles = ["owner_umkm", "customer"];
    if (!validRoles.includes(body.role)) {
      setResponseStatus(event, 400);
      return errorResponse(`Role tidak valid. Pilihan: ${validRoles.join(", ")}.`);
    }

    // Upsert — buat baru jika belum ada, update jika sudah ada (idempotent)
    const user = await prisma.user.upsert({
      where: { id: decoded.uid },
      create: {
        id: decoded.uid,
        email: body.email.trim().toLowerCase(),
        display_name: body.display_name.trim(),
        role: body.role,
        photo_url: body.photo_url ?? null,
        phone_number: body.phone_number ?? null,
      },
      update: {
        email: body.email.trim().toLowerCase(),
        display_name: body.display_name.trim(),
        photo_url: body.photo_url ?? null,
        phone_number: body.phone_number ?? null,
      },
      select: {
        id: true, email: true, display_name: true,
        role: true, photo_url: true, phone_number: true,
        created_at: true, updated_at: true,
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Pengguna berhasil disinkronkan.", user);
  } catch (error) {
    console.error("[POST /api/v1/users/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
