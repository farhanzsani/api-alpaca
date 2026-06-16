/**
 * GET /api/v1/favorites
 *
 * Mengambil daftar produk dan toko favorit milik user yang login.
 * Query opsional: item_type=product|business
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const query = getQuery(event);
    const itemType = query.item_type as string | undefined;

    if (itemType !== undefined && itemType !== "product" && itemType !== "business") {
      setResponseStatus(event, 422);
      return errorResponse("item_type harus bernilai 'product' atau 'business'.");
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        user_id: uid,
        ...(itemType ? { item_type: itemType } : {}),
      },
      orderBy: { created_at: "desc" },
    });

    const productIds = favorites
      .filter((favorite) => favorite.item_type === "product")
      .map((favorite) => favorite.item_id);
    const businessIds = favorites
      .filter((favorite) => favorite.item_type === "business")
      .map((favorite) => favorite.item_id);

    const [products, businesses] = await Promise.all([
      productIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
              owner: {
                select: { id: true, display_name: true, photo_url: true, phone_number: true },
              },
            },
          })
        : [],
      businessIds.length > 0
        ? prisma.businessLocation.findMany({
            where: { id: { in: businessIds } },
            include: {
              owner: {
                select: { id: true, display_name: true, photo_url: true, phone_number: true },
              },
            },
          })
        : [],
    ]);

    const productsById = new Map(products.map((product) => [product.id, product]));
    const businessesById = new Map(businesses.map((business) => [business.id, business]));

    const data = favorites
      .map((favorite) => {
        const item =
          favorite.item_type === "product"
            ? productsById.get(favorite.item_id)
            : businessesById.get(favorite.item_id);

        if (!item) return null;

        return {
          id: favorite.id,
          user_id: favorite.user_id,
          item_id: favorite.item_id,
          item_type: favorite.item_type,
          created_at: favorite.created_at,
          item,
        };
      })
      .filter(Boolean);

    return successResponse("Berhasil mengambil daftar favorit.", data, {
      total: data.length,
    });
  } catch (error) {
    console.error("[GET /api/v1/favorites]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
