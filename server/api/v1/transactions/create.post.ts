
/**
 * POST /api/v1/transactions/create
 * Body: { type, title, amount, date, description? }
 * owner_id otomatis dari Firebase UID.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const body = await readBody(event);

    const required = ["type", "title", "amount", "date"] as const;
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        setResponseStatus(event, 400);
        return errorResponse(`Field '${field}' wajib diisi.`);
      }
    }

    const validTypes = ["income", "expense"];
    if (!validTypes.includes(body.type)) {
      setResponseStatus(event, 400);
      return errorResponse(`Tipe transaksi tidak valid. Pilihan: ${validTypes.join(", ")}.`);
    }

    if (typeof body.amount !== "number" || body.amount < 0) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'amount' harus berupa angka yang tidak negatif.");
    }

    const ownerExists = await prisma.user.findUnique({
      where: { id: uid }, select: { id: true },
    });
    if (!ownerExists) {
      setResponseStatus(event, 404);
      return errorResponse("Pengguna tidak ditemukan. Pastikan sudah melakukan sinkronisasi akun.");
    }

    const transaction = await prisma.transaction.create({
      data: {
        owner_id: uid,
        type: body.type,
        title: body.title.trim(),
        amount: body.amount,
        description: body.description?.trim() ?? null,
        date: new Date(body.date),
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Transaksi berhasil ditambahkan.", transaction);
  } catch (error) {
    console.error("[POST /api/v1/transactions/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
