
/** PUT /api/v1/waste-resources/:id — hanya pemilik yang bisa update */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const existing = await prisma.wasteResource.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Limbah dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Data ini bukan milik Anda.");
    }

    const item = await prisma.wasteResource.update({
      where: { id },
      data: {
        ...(body.waste_name !== undefined && { waste_name: body.waste_name.trim() }),
        ...(body.quantity !== undefined && { quantity: body.quantity }),
        ...(body.unit !== undefined && { unit: body.unit.trim() }),
        ...(body.category !== undefined && { category: body.category.trim() }),
        ...(body.reusable !== undefined && { reusable: body.reusable }),
        ...(body.processing_notes !== undefined && { processing_notes: body.processing_notes?.trim() ?? null }),
      },
    });

    return successResponse("Data limbah berhasil diperbarui.", item);
  } catch (error) {
    console.error("[PUT /api/v1/waste-resources/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
