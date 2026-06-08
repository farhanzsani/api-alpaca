
/**
 * GET /api/v1/users
 * Query: role (opsional) — filter by role
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const where: Record<string, unknown> = {};
    if (query.role) where.role = query.role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true, email: true, display_name: true,
        role: true, photo_url: true, phone_number: true,
        created_at: true, updated_at: true,
      },
    });

    return successResponse("Berhasil mengambil daftar pengguna.", users, { total: users.length });
  } catch (error) {
    console.error("[GET /api/v1/users]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
