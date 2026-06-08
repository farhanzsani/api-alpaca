
/** GET /api/v1/transactions/:id — hanya pemilik yang bisa akses */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction) {
      setResponseStatus(event, 404);
      return errorResponse(`Transaksi dengan id '${id}' tidak ditemukan.`);
    }

    if (transaction.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Transaksi ini bukan milik Anda.");
    }

    return successResponse("Berhasil mengambil detail transaksi.", transaction);
  } catch (error) {
    console.error("[GET /api/v1/transactions/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
