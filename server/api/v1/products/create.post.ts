
/**
 * Interface body untuk membuat produk baru.
 * owner_id tidak lagi diterima dari body — diambil dari Firebase token.
 */
interface CreateProductBody {
  product_name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available?: boolean;
  quantity?: number;
  minimum_stock?: number;
  unit: string;
}

/**
 * POST /api/v1/products/create
 *
 * Menambah produk baru. owner_id otomatis dari Firebase UID.
 *
 * Request Body (JSON):
 *   - product_name  (wajib) : Nama produk
 *   - price         (wajib) : Harga produk (angka positif)
 *   - category      (wajib) : Kategori produk
 *   - unit          (wajib) : Satuan produk (pcs, kg, liter, dsb.)
 *   - description   (opsional)
 *   - image_url     (opsional)
 *   - is_available  (opsional, default: true)
 *   - quantity      (opsional, default: 0)
 *   - minimum_stock (opsional, default: 0)
 *
 * Response:
 *   201 - Produk berhasil dibuat
 *   400 - Validasi gagal / field wajib tidak ada
 *   404 - User tidak ditemukan di database
 *   500 - Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const body = await readBody<CreateProductBody>(event);

    // ------ Validasi Field Wajib ------
    const required: (keyof CreateProductBody)[] = [
      "product_name",
      "price",
      "category",
      "unit",
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        setResponseStatus(event, 400);
        return errorResponse(`Field '${field}' wajib diisi.`);
      }
    }

    if (typeof body.price !== "number" || body.price < 0) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'price' harus berupa angka yang tidak negatif.");
    }

    // ------ Validasi user ada di database ------
    const ownerExists = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true },
    });

    if (!ownerExists) {
      setResponseStatus(event, 404);
      return errorResponse("Pengguna tidak ditemukan. Pastikan sudah melakukan sinkronisasi akun.");
    }

    // ------ Simpan ke database ------
    const product = await prisma.product.create({
      data: {
        owner_id: uid,
        product_name: body.product_name.trim(),
        description: body.description?.trim() ?? null,
        price: body.price,
        image_url: body.image_url ?? null,
        category: body.category.trim(),
        is_available: body.is_available ?? true,
        quantity: body.quantity ?? 0,
        minimum_stock: body.minimum_stock ?? 0,
        unit: body.unit.trim(),
      },
    });

    setResponseStatus(event, 201);
    return successResponse("Produk berhasil ditambahkan.", product);
  } catch (error) {
    console.error("[POST /api/v1/products/create]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server. Silakan coba lagi.");
  }
});
