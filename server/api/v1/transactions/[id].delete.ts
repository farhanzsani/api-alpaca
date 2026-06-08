
/** DELETE /api/v1/transactions/:id — hanya pemilik yang bisa hapus */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      setResponseStatus(event, 404);
      return errorResponse(`Transaksi dengan id '${id}' tidak ditemukan.`);
    }

    if (existing.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Akses ditolak. Transaksi ini bukan milik Anda.");
    }

    await prisma.transaction.delete({ where: { id } });
    return successResponse("Transaksi berhasil dihapus.", { id });
  } catch (error) {
    console.error("[DELETE /api/v1/transactions/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
