
/**
 * PUT /api/v1/users/:id
 * User hanya bisa update profil sendiri.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    // Hanya bisa update profil sendiri
    if (id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Anda hanya bisa mengubah profil sendiri.");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Pengguna dengan id '${id}' tidak ditemukan.`);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.display_name !== undefined && { display_name: body.display_name.trim() }),
        ...(body.photo_url !== undefined && { photo_url: body.photo_url ?? null }),
        ...(body.phone_number !== undefined && { phone_number: body.phone_number ?? null }),
      },
      select: {
        id: true, email: true, display_name: true,
        role: true, photo_url: true, phone_number: true,
        created_at: true, updated_at: true,
      },
    });

    return successResponse("Profil pengguna berhasil diperbarui.", user);
  } catch (error) {
    console.error("[PUT /api/v1/users/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
