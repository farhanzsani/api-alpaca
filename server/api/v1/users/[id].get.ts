
/**
 * GET /api/v1/users/:id
 * User hanya bisa lihat profil sendiri. Admin bisa lihat semua (belum diimplementasi).
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    // Hanya bisa akses profil sendiri
    if (id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Anda hanya bisa melihat profil sendiri.");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, display_name: true,
        role: true, photo_url: true, phone_number: true,
        created_at: true, updated_at: true,
      },
    });

    if (!user) {
      setResponseStatus(event, 404);
      return errorResponse(`Pengguna dengan id '${id}' tidak ditemukan.`);
    }

    return successResponse("Berhasil mengambil detail pengguna.", user);
  } catch (error) {
    console.error("[GET /api/v1/users/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
