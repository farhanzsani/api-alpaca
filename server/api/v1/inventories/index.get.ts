
/**
 * GET /api/v1/inventories
 * Query: category (opsional), low_stock (opsional: "true")
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const query = getQuery(event);

    const where: Record<string, unknown> = { owner_id: uid };
    if (query.category) where.category = query.category;

    const inventories = await prisma.inventory.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const result = query.low_stock === "true"
      ? inventories.filter((i) => i.quantity <= i.minimum_stock)
      : inventories;

    return successResponse("Berhasil mengambil daftar inventaris.", result, {
      total: result.length,
      low_stock_count: inventories.filter((i) => i.quantity <= i.minimum_stock).length,
    });
  } catch (error) {
    console.error("[GET /api/v1/inventories]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
