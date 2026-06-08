
/** DELETE /api/v1/waste-resources/:id — hanya pemilik yang bisa hapus */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const existing = await prisma.wasteResource.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Limbah dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Data ini bukan milik Anda.");
    }

    await prisma.wasteResource.delete({ where: { id } });
    return successResponse("Data limbah berhasil dihapus.", { id });
  } catch (error) {
    console.error("[DELETE /api/v1/waste-resources/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
