
/** DELETE /api/v1/inventories/:id — hanya pemilik yang bisa hapus */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Inventaris dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Inventaris ini bukan milik Anda.");
    }

    await prisma.inventory.delete({ where: { id } });
    return successResponse("Inventaris berhasil dihapus.", { id });
  } catch (error) {
    console.error("[DELETE /api/v1/inventories/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
