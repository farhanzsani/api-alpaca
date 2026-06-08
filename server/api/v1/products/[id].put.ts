
/**
 * PUT /api/v1/products/:id
 * Hanya pemilik produk yang bisa mengupdate.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Produk dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Produk ini bukan milik Anda.");
    }

    if (body.price !== undefined && (typeof body.price !== "number" || body.price < 0)) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'price' harus berupa angka yang tidak negatif.");
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.product_name !== undefined && { product_name: body.product_name.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() ?? null }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.image_url !== undefined && { image_url: body.image_url ?? null }),
        ...(body.category !== undefined && { category: body.category.trim() }),
        ...(body.is_available !== undefined && { is_available: body.is_available }),
        ...(body.quantity !== undefined && { quantity: body.quantity }),
        ...(body.minimum_stock !== undefined && { minimum_stock: body.minimum_stock }),
        ...(body.unit !== undefined && { unit: body.unit.trim() }),
      },
    });

    return successResponse("Produk berhasil diperbarui.", product);
  } catch (error) {
    console.error("[PUT /api/v1/products/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
