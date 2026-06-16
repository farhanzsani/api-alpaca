/**
 * DELETE /api/v1/favorites/:itemType/:itemId
 *
 * Menghapus produk atau toko dari daftar favorit user yang login.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const itemType = getRouterParam(event, "itemType");
    const itemId = getRouterParam(event, "itemId");

    if (itemType !== "product" && itemType !== "business") {
      setResponseStatus(event, 422);
      return errorResponse("itemType harus bernilai 'product' atau 'business'.");
    }

    if (!itemId) {
      setResponseStatus(event, 422);
      return errorResponse("itemId wajib diisi.");
    }

    await prisma.favorite.deleteMany({
      where: {
        user_id: uid,
        item_id: itemId,
        item_type: itemType,
      },
    });

    return successResponse("Berhasil menghapus favorit.", null);
  } catch (error) {
    console.error("[DELETE /api/v1/favorites/:itemType/:itemId]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
