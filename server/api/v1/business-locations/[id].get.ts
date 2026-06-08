
/**
 * GET /api/v1/business-locations/:id
 * Public — siapa pun yang login bisa lihat detail lokasi bisnis.
 */
export default defineEventHandler(async (event) => {
  try {
    // Public — tidak butuh login
    const id = getRouterParam(event, "id");

    const location = await prisma.businessLocation.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, display_name: true, photo_url: true, phone_number: true },
        },
      },
    });

    if (!location) {
      setResponseStatus(event, 404);
      return errorResponse(`Lokasi bisnis dengan id '${id}' tidak ditemukan.`);
    }

    return successResponse("Berhasil mengambil detail lokasi bisnis.", location);
  } catch (error) {
    console.error("[GET /api/v1/business-locations/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
