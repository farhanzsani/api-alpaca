import type { H3Event } from "h3";

export interface FirebaseUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/**
 * Ambil Firebase user yang sudah diverifikasi dari event context.
 * Dijamin ada karena middleware auth sudah memvalidasi sebelum handler dipanggil.
 * Melempar error 401 jika tidak ada.
 */
export function getFirebaseUser(event: H3Event): FirebaseUser {
  const user = event.context.firebaseUser as FirebaseUser | undefined;
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized: Firebase user tidak ditemukan di context.",
    });
  }
  return user;
}

/**
 * Ambil Firebase user dari event context (opsional).
 * Berguna untuk route yang public tapi bisa punya kelakuan berbeda jika user login.
 */
export function getOptionalFirebaseUser(event: H3Event): FirebaseUser | null {
  return (event.context.firebaseUser as FirebaseUser | undefined) ?? null;
}
