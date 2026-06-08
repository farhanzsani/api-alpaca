
/** DELETE /api/v1/business-locations/:id — hanya pemilik yang bisa hapus */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const existing = await prisma.businessLocation.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Lokasi bisnis dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Lokasi ini bukan milik Anda.");
    }

    await prisma.businessLocation.delete({ where: { id } });
    return successResponse("Lokasi bisnis berhasil dihapus.", { id });
  } catch (error) {
    console.error("[DELETE /api/v1/business-locations/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
