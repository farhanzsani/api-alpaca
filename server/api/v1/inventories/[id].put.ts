
/** PUT /api/v1/inventories/:id — hanya pemilik yang bisa update */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Inventaris dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Inventaris ini bukan milik Anda.");
    }

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        ...(body.product_name !== undefined && { product_name: body.product_name.trim() }),
        ...(body.category !== undefined && { category: body.category.trim() }),
        ...(body.quantity !== undefined && { quantity: body.quantity }),
        ...(body.minimum_stock !== undefined && { minimum_stock: body.minimum_stock }),
        ...(body.unit !== undefined && { unit: body.unit.trim() }),
      },
    });

    return successResponse("Inventaris berhasil diperbarui.", item);
  } catch (error) {
    console.error("[PUT /api/v1/inventories/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
