
/** PUT /api/v1/business-locations/:id — hanya pemilik yang bisa update */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const existing = await prisma.businessLocation.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Lokasi bisnis dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Lokasi ini bukan milik Anda.");
    }

    if (
      (body.latitude !== undefined && typeof body.latitude !== "number") ||
      (body.longitude !== undefined && typeof body.longitude !== "number")
    ) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'latitude' dan 'longitude' harus berupa angka.");
    }

    const location = await prisma.businessLocation.update({
      where: { id },
      data: {
        ...(body.business_name !== undefined && { business_name: body.business_name.trim() }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.address !== undefined && { address: body.address.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() ?? null }),
        ...(body.image_url !== undefined && { image_url: body.image_url ?? null }),
      },
    });

    return successResponse("Lokasi bisnis berhasil diperbarui.", location);
  } catch (error) {
    console.error("[PUT /api/v1/business-locations/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
