
/**
 * GET /api/v1/products
 *
 * Mengambil semua produk milik user yang sedang login (berdasarkan Firebase UID).
 *
 * Query Parameters:
 *   - category  (opsional) : filter berdasarkan kategori produk
 *   - available (opsional) : filter ketersediaan ("true" | "false")
 *
 * Response:
 *   200 - Berhasil mengambil daftar produk
 *   401 - Token tidak valid
 *   500 - Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const query = getQuery(event);

    const category = query.category as string | undefined;
    const available = query.available as string | undefined;

    // Bangun filter dinamis berdasarkan UID dari Firebase token
    const where: Record<string, unknown> = { owner_id: uid };

    if (category) {
      where.category = category;
    }

    if (available !== undefined) {
      where.is_available = available === "true";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return successResponse("Berhasil mengambil daftar produk.", products, {
      total: products.length,
    });
  } catch (error) {
    console.error("[GET /api/v1/products]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server. Silakan coba lagi.");
  }
});
