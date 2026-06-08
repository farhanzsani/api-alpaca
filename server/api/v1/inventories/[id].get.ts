
/** GET /api/v1/inventories/:id — hanya pemilik yang bisa akses */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const item = await prisma.inventory.findUnique({ where: { id } });

    if (!item) {
      setResponseStatus(event, 404);
      return errorResponse(`Inventaris dengan id '${id}' tidak ditemukan.`);
    }

    if (item.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Inventaris ini bukan milik Anda.");
    }

    return successResponse("Berhasil mengambil detail inventaris.", item);
  } catch (error) {
    console.error("[GET /api/v1/inventories/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
