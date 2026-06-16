/**
 * GET /api/v1/media
 * Ambil list gambar media library (hanya category 'gallery' atau null)
 * Query: owner_id (required for public access)
 */
export default defineEventHandler(async (event) => {
  try {
    const user = getOptionalFirebaseUser(event);
    const query = getQuery(event);
    
    // Pakai owner_id dari query, atau fallback ke user yang login
    const ownerId = (query.owner_id as string) || user?.uid;

    if (!ownerId) {
      setResponseStatus(event, 400);
      return errorResponse("Parameter owner_id diperlukan.");
    }

    const media = await prisma.mediaLibrary.findMany({
      where: { 
        owner_id: ownerId,
        // Hanya tampilkan foto dengan category 'gallery' atau null
        OR: [
          { category: "gallery" },
          { category: null }
        ]
      },
      orderBy: { created_at: "desc" },
    });

    return successResponse("Berhasil mengambil daftar media.", media, {
      total: media.length,
    });
  } catch (error) {
    console.error("[GET /api/v1/media]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
