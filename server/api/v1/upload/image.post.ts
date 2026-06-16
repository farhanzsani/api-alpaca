import { supabase } from "../../../lib/supabase";

/**
 * POST /api/v1/upload/image
 * 
 * Upload gambar ke Supabase Storage
 * Content-Type: multipart/form-data
 * Field: file (required), category (optional)
 * 
 * Response:
 *   200 - { status: "success", data: { url: "https://...", uploaded_at: "..." } }
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const form = await readMultipartFormData(event);
    
    if (!form || form.length === 0) {
      setResponseStatus(event, 400);
      return errorResponse("File tidak ditemukan.");
    }

    const file = form.find((part) => part.name === "file");
    const categoryPart = form.find((part) => part.name === "category");
    const category = categoryPart?.data?.toString("utf-8") || null;
    
    if (!file || !file.data) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'file' wajib diisi.");
    }

    // Generate unique filename dengan folder berdasarkan category
    const ext = file.filename?.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    
    // Tentukan folder berdasarkan category
    let folder = "gallery"; // default
    if (category === "product") folder = "products";
    else if (category === "profile") folder = "profiles";
    
    const filename = `${folder}/${timestamp}-${random}.${ext}`;
    
    // Upload to Supabase Storage (semua di bucket alpaca-image)
    const { data, error } = await supabase.storage
      .from("alpaca-image")
      .upload(filename, file.data, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[Upload Error]", error);
      setResponseStatus(event, 500);
      return errorResponse(`Upload gagal: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("alpaca-image")
      .getPublicUrl(data.path);

    // Simpan metadata ke database (hanya untuk gallery dan profile, bukan product)
    let media = null;
    if (category !== "product") {
      media = await prisma.mediaLibrary.create({
        data: {
          owner_id: uid,
          url: urlData.publicUrl,
          filename: data.path,
          category,
        },
      });
    }

    return successResponse("Upload berhasil.", {
      image_url: urlData.publicUrl,
      owner_id: uid,
      category: category,
      uploaded_at: media?.created_at || new Date(),
    });
  } catch (error) {
    console.error("[POST /api/v1/upload/image]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
