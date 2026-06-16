/**
 * DEBUG ENDPOINT - hapus setelah selesai debug
 * GET /api/v1/transactions/debug
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);

    // Cek user
    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    // Ambil SEMUA transaksi tanpa filter
    const allTransactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });

    // Ambil transaksi dengan filter owner_id
    const myTransactions = await prisma.transaction.findMany({
      where: { owner_id: uid },
      orderBy: { date: "desc" },
    });

    return {
      debug: {
        current_uid: uid,
        user_found: !!user,
        user_data: user,
        total_all_transactions: allTransactions.length,
        total_my_transactions: myTransactions.length,
        all_transactions: allTransactions,
        my_transactions: myTransactions,
      },
    };
  } catch (error) {
    console.error("[DEBUG transactions]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
