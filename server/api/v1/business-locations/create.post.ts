
/** POST /api/v1/business-locations/create — owner_id otomatis dari Firebase UID */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const body = await readBody(event);

    const required = ["business_name", "latitude", "longitude", "address"] as const;
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        setResponseStatus(event, 400);
        return errorResponse(`Field '${field}' wajib diisi.`);
      }
    }

    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      setResponseStatus(event, 400);
      return errorResponse("Field 'latitude' dan 'longitude' harus berupa angka.");
    }

    const ownerExists = await prisma.user.findUnique({
      where: { id: uid }, select: { id: true },
    });
    if (!ownerExists) {
      setResponseStatus(event, 404);
      return errorResponse("Pengguna tidak ditemukan. Pastikan sudah melakukan sinkronisasi akun.");
    }

    const location = await prisma.businessLocation.create({
      data: {
        owner_id: uid,
        business_name: body.business_name.trim(),
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address.trim(),
        description: body.description?.trim() ?? null,
        image_url: body.image_url ?? null,
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Lokasi bisnis berhasil ditambahkan.", location);
  } catch (error) {
    console.error("[POST /api/v1/business-locations/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
