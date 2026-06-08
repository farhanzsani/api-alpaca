
/**
 * GET /api/v1/business-locations
 * Public endpoint — semua lokasi bisa dilihat untuk halaman explore.
 * Query: mine=true untuk filter hanya punya sendiri.
 */
export default defineEventHandler(async (event) => {
  try {
    const user = getOptionalFirebaseUser(event);
    const query = getQuery(event);

    const where: Record<string, unknown> = {};
    // Jika request ?mine=true, filter hanya milik user yang login
    if (query.mine === "true") {
      if (!user) {
        setResponseStatus(event, 401);
        return errorResponse("Harap login untuk melihat lokasi bisnis Anda.");
      }
      where.owner_id = user.uid;
    }

    const locations = await prisma.businessLocation.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        owner: {
          select: { id: true, display_name: true, photo_url: true, phone_number: true },
        },
      },
    });

    return successResponse("Berhasil mengambil daftar lokasi bisnis.", locations, {
      total: locations.length,
    });
  } catch (error) {
    console.error("[GET /api/v1/business-locations]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
