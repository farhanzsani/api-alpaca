import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ----------------------------------------------------------------
// Firebase Admin SDK – singleton
// Digunakan untuk memverifikasi ID Token yang dikirim dari Flutter.
// ----------------------------------------------------------------

let firebaseApp: App;

function getFirebaseApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      "FIREBASE_PROJECT_ID belum dikonfigurasi di environment variables."
    );
  }

  // Jika ada service account JSON (opsional, untuk full admin access)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  } else {
    // Tanpa service account — masih bisa verifikasi token via public keys
    firebaseApp = initializeApp({ projectId });
  }

  return firebaseApp;
}

/**
 * Verifikasi Firebase ID Token yang dikirim dari client (Flutter).
 * Melempar error jika token tidak valid atau expired.
 */
export async function verifyFirebaseToken(idToken: string) {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const decoded = await auth.verifyIdToken(idToken);
  return decoded;
}
