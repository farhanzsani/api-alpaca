
/**
 * GET /api/v1/products
 *
 * - Customer (logged in): Melihat semua produk yang tersedia, atau filter berdasarkan owner_id
 * - Customer (not logged in): Melihat semua produk yang tersedia
 * - Owner UMKM: Melihat produk miliknya sendiri
 *
 * Query Parameters:
 *   - owner_id  (opsional) : filter berdasarkan pemilik toko (untuk customer)
 *   - category  (opsional) : filter berdasarkan kategori produk
 *   - available (opsional) : filter ketersediaan ("true" | "false")
 *
 * Response:
 *   200 - Berhasil mengambil daftar produk
 *   500 - Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    const firebaseUser = getOptionalFirebaseUser(event);
    const query = getQuery(event);

    const ownerId = query.owner_id as string | undefined;
    const category = query.category as string | undefined;
    const available = query.available as string | undefined;

    const where: any = {};

    // If user is logged in, check their role
    if (firebaseUser) {
      const { uid, email, name } = firebaseUser;
      
      // Cek role user, auto-create jika belum ada
      let user = await prisma.user.findUnique({
        where: { id: uid },
        select: { role: true },
      });

      if (!user) {
        // Auto-create user berdasarkan custom claims dari Firebase
        const firebaseRole = firebaseUser.role;
        const validRoles = ["owner_umkm", "customer"];
        const role = firebaseRole && validRoles.includes(firebaseRole) ? firebaseRole : "customer";

        user = await prisma.user.create({
          data: {
            id: uid,
            email: email ?? "unknown@example.com",
            display_name: name ?? "User",
            role,
          },
          select: { role: true },
        });
      }

      if (user.role === "owner_umkm") {
        // Owner UMKM hanya lihat produknya sendiri
        where.owner_id = uid;
      } else if (ownerId) {
        // Customer bisa filter berdasarkan owner_id jika disediakan
        where.owner_id = ownerId;
      }
    } else {
      // Not logged in - show all products or filter by owner_id
      if (ownerId) {
        where.owner_id = ownerId;
      }
    }

    if (category) {
      where.category = category;
    }

    if (available !== undefined) {
      where.is_available = available === "true";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        owner: {
          select: { 
            id: true, 
            display_name: true, 
            photo_url: true 
          },
        },
      },
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
