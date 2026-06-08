
/** POST /api/v1/waste-resources/create — owner_id otomatis dari Firebase UID */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const body = await readBody(event);

    const required = ["waste_name", "unit", "category"] as const;
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

    const item = await prisma.wasteResource.create({
      data: {
        owner_id: uid,
        waste_name: body.waste_name.trim(),
        quantity: body.quantity ?? 0,
        unit: body.unit.trim(),
        category: body.category.trim(),
        reusable: body.reusable ?? false,
        processing_notes: body.processing_notes?.trim() ?? null,
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Data limbah berhasil ditambahkan.", item);
  } catch (error) {
    console.error("[POST /api/v1/waste-resources/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
