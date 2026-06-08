
/**
 * GET /api/v1/products/:id
 * Hanya pemilik produk yang bisa mengakses.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      setResponseStatus(event, 404);
      return errorResponse(`Produk dengan id '${id}' tidak ditemukan.`);
    }

    if (product.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Produk ini bukan milik Anda.");
    }

    return successResponse("Berhasil mengambil detail produk.", product);
  } catch (error) {
    console.error("[GET /api/v1/products/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
