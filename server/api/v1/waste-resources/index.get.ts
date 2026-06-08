
/**
 * GET /api/v1/waste-resources
 * Query: category (opsional), reusable ("true"|"false", opsional)
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const query = getQuery(event);

    const where: Record<string, unknown> = { owner_id: uid };
    if (query.category) where.category = query.category;
    if (query.reusable !== undefined) where.reusable = query.reusable === "true";

    const wasteResources = await prisma.wasteResource.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return successResponse("Berhasil mengambil daftar limbah.", wasteResources, {
      total: wasteResources.length,
      reusable_count: wasteResources.filter((w) => w.reusable).length,
    });
  } catch (error) {
    console.error("[GET /api/v1/waste-resources]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
