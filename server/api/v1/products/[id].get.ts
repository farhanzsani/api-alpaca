
/**
 * GET /api/v1/products/:id
 * Public endpoint - siapa pun bisa melihat detail produk.
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        owner: {
          select: { 
            id: true, 
            display_name: true, 
            photo_url: true, 
            phone_number: true 
          },
        },
      },
    });

    if (!product) {
      setResponseStatus(event, 404);
      return errorResponse(`Produk dengan id '${id}' tidak ditemukan.`);
    }

    return successResponse("Berhasil mengambil detail produk.", product);
  } catch (error) {
    console.error("[GET /api/v1/products/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
