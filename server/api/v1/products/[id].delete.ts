
/**
 * DELETE /api/v1/products/:id
 * Hanya pemilik produk yang bisa menghapus.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Produk dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Produk ini bukan milik Anda.");
    }

    await prisma.product.delete({ where: { id } });

    return successResponse("Produk berhasil dihapus.", { id });
  } catch (error) {
    console.error("[DELETE /api/v1/products/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
