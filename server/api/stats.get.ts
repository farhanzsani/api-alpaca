import { prisma } from "../utils/prisma";

/**
 * GET /api/stats
 * Live stats untuk dashboard UI
 */
export default defineEventHandler(async () => {
  const [users, products, transactions, inventories, wasteResources, businessLocations] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.transaction.count(),
      prisma.inventory.count(),
      prisma.wasteResource.count(),
      prisma.businessLocation.count(),
    ]);

  const owners = await prisma.user.count({ where: { role: "owner_umkm" } });
  const customers = await prisma.user.count({ where: { role: "customer" } });

  const income = await prisma.transaction.aggregate({
    where: { type: "income" },
    _sum: { amount: true },
  });

  const expense = await prisma.transaction.aggregate({
    where: { type: "expense" },
    _sum: { amount: true },
  });

  return {
    status: "success",
    data: {
      users, owners, customers,
      products, transactions, inventories,
      wasteResources, businessLocations,
      totalIncome: Number(income._sum.amount ?? 0),
      totalExpense: Number(expense._sum.amount ?? 0),
    },
  };
});
