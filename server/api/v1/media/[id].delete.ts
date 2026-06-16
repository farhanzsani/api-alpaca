import { supabase } from "../../../lib/supabase";

/**
 * DELETE /api/v1/media/:id
 * Hapus media dari database dan Supabase Storage
 */
export default defineEventHandler(async (event) => {
  try {
    const { uid } = getFirebaseUser(event);
    const id = getRouterParam(event, "id");

    if (!id) {
      setResponseStatus(event, 400);
      return errorResponse("ID media tidak ditemukan.");
    }

    const media = await prisma.mediaLibrary.findUnique({
      where: { id },
    });

    if (!media) {
      setResponseStatus(event, 404);
      return errorResponse("Media tidak ditemukan.");
    }

    if (media.owner_id !== uid) {
      setResponseStatus(event, 403);
      return errorResponse("Anda tidak memiliki akses untuk menghapus media ini.");
    }

    // Hapus dari Supabase Storage
    const { error } = await supabase.storage
      .from("alpaca-image")
      .remove([media.filename]);

    if (error) {
      console.error("[Delete from Storage Error]", error);
    }

    // Hapus dari database
    await prisma.mediaLibrary.delete({
      where: { id },
    });

    return successResponse("Media berhasil dihapus.", null);
  } catch (error) {
    console.error("[DELETE /api/v1/media/:id]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
