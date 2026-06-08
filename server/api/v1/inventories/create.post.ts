
/** POST /api/v1/inventories/create — owner_id otomatis dari Firebase UID */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const body = await readBody(event);

    const required = ["product_name", "category", "unit"] as const;
    for (const field of required) {
      if (!body[field]) {
        setResponseStatus(event, 400);
        return errorResponse(`Field '${field}' wajib diisi.`);
      }
    }

    const ownerExists = await prisma.user.findUnique({
      where: { id: uid }, select: { id: true },
    });
    if (!ownerExists) {
      setResponseStatus(event, 404);
      return errorResponse("Pengguna tidak ditemukan. Pastikan sudah melakukan sinkronisasi akun.");
    }

    const item = await prisma.inventory.create({
      data: {
        owner_id: uid,
        product_name: body.product_name.trim(),
        category: body.category.trim(),
        quantity: body.quantity ?? 0,
        minimum_stock: body.minimum_stock ?? 0,
        unit: body.unit.trim(),
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Inventaris berhasil ditambahkan.", item);
  } catch (error) {
    console.error("[POST /api/v1/inventories/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
