
/**
 * GET /api/v1/transactions
 * Query: type (opsional: income|expense), date_from, date_to
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const query = getQuery(event);

    const where: Record<string, unknown> = { owner_id: uid };
    if (query.type) where.type = query.type;
    if (query.date_from || query.date_to) {
      where.date = {
        ...(query.date_from && { gte: new Date(query.date_from as string) }),
        ...(query.date_to && { lte: new Date(query.date_to as string) }),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return successResponse("Berhasil mengambil daftar transaksi.", transactions, {
      total: transactions.length,
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error("[GET /api/v1/transactions]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
