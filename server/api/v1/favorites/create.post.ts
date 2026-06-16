interface CreateFavoriteBody {
  item_id?: string;
  item_type?: "product" | "business";
}

/**
 * POST /api/v1/favorites/create
 *
 * Menambahkan produk atau toko ke daftar favorit user yang login.
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid, email, name, role: firebaseRole } = getFirebaseUser(event);
    const body = await readBody<CreateFavoriteBody>(event);

    if (!body.item_id || !body.item_type) {
      setResponseStatus(event, 422);
      return errorResponse("item_id dan item_type wajib diisi.");
    }

    if (body.item_type !== "product" && body.item_type !== "business") {
      setResponseStatus(event, 422);
      return errorResponse("item_type harus bernilai 'product' atau 'business'.");
    }

    const existingUser = await prisma.user.findUnique({ where: { id: uid } });
    if (!existingUser) {
      const validRoles = ["owner_umkm", "customer"];
      const role =
        firebaseRole && validRoles.includes(firebaseRole) ? firebaseRole : "customer";

      await prisma.user.create({
        data: {
          id: uid,
          email: email ?? `${uid}@unknown.local`,
          display_name: name ?? "User",
          role,
        },
      });
    }

    const item =
      body.item_type === "product"
        ? await prisma.product.findUnique({ where: { id: body.item_id } })
        : await prisma.businessLocation.findUnique({ where: { id: body.item_id } });

    if (!item) {
      setResponseStatus(event, 404);
      return errorResponse("Item favorit tidak ditemukan.");
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        user_id_item_id_item_type: {
          user_id: uid,
          item_id: body.item_id,
          item_type: body.item_type,
        },
      },
      update: {},
      create: {
        user_id: uid,
        item_id: body.item_id,
        item_type: body.item_type,
      },
    });

    return successResponse("Berhasil menambahkan favorit.", favorite);
  } catch (error) {
    console.error("[POST /api/v1/favorites/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
