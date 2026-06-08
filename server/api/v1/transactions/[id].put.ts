
/** PUT /api/v1/transactions/:id — hanya pemilik yang bisa update */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const body = await readBody(event);

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Transaksi dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Transaksi ini bukan milik Anda.");
    }

    if (body.type && !["income", "expense"].includes(body.type)) {
      setResponseStatus(event, 400);
      return errorResponse("Tipe transaksi tidak valid. Pilihan: income, expense.");
    }

    if (body.amount !== undefined && (typeof body.amount !== "number" || body.amount < 0)) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'amount' harus berupa angka yang tidak negatif.");
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(body.type !== undefined && { type: body.type }),
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.description !== undefined && { description: body.description?.trim() ?? null }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
      },
    });

    return successResponse("Transaksi berhasil diperbarui.", transaction);
  } catch (error) {
    console.error("[PUT /api/v1/transactions/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
