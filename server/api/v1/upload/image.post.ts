import { supabase } from "../../../lib/supabase";

/**
 * POST /api/v1/upload/image
 * 
 * Upload gambar ke Supabase Storage
 * Content-Type: multipart/form-data
 * Field: file (required)
 * 
 * Response:
 *   200 - { status: "success", data: { url: "https://..." } }
 */
export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    
    if (!form || form.length === 0) {
      setResponseStatus(event, 400);
      return errorResponse("File tidak ditemukan.");
    }

    const file = form.find((part) => part.name === "file");
    
    if (!file || !file.data) {
      setResponseStatus(event, 400);
      return errorResponse("Field 'file' wajib diisi.");
    }

    // Generate unique filename
    const ext = file.filename?.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Upload to Supabase Storage
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

    return successResponse("Upload berhasil.", {
      url: urlData.publicUrl,
      filename: data.path,
    });
  } catch (error) {
    console.error("[POST /api/v1/upload/image]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
