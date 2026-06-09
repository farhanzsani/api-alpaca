
/**
 * GET /api/v1/products
 *
 * - Customer: Melihat semua produk yang tersedia
 * - Owner UMKM: Melihat produk miliknya sendiri
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
    const firebaseUser = getFirebaseUser(event);
    const { uid, email, name } = firebaseUser;
    const query = getQuery(event);

    const category = query.category as string | undefined;
    const available = query.available as string | undefined;

    // Cek role user, auto-create jika belum ada
    let user = await prisma.user.findUnique({
      where: { id: uid },
      select: { role: true },
    });

    if (!user) {
      // Auto-create user dengan role customer sebagai default
      user = await prisma.user.create({
        data: {
          id: uid,
          email: email ?? "unknown@example.com",
          display_name: name ?? "User",
          role: "customer",
        },
        select: { role: true },
      });
    }

    // Filter berdasarkan role
    const where: any = {};

    console.log(`[GET /api/v1/products] User ${uid} has role: ${user.role}`);

    if (user.role === "owner_umkm") {
      // Owner UMKM hanya lihat produknya sendiri
      where.owner_id = uid;
      console.log(`[GET /api/v1/products] Filtering by owner_id: ${uid}`);
    } else {
      console.log(`[GET /api/v1/products] Customer mode - showing all products`);
    }

    if (category) {
      where.category = category;
    }

    if (available !== undefined) {
      where.is_available = available === "true";
    }

    console.log(`[GET /api/v1/products] Where clause:`, JSON.stringify(where));

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
