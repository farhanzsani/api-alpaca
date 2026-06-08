/**
 * Helper untuk membuat format response JSON yang konsisten di seluruh API.
 *
 * @param status   - 'success' | 'error'
 * @param message  - Pesan singkat hasil operasi
 * @param data     - Data payload (opsional, null jika error)
 * @param meta     - Metadata tambahan seperti pagination (opsional)
 */
export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
}

export function successResponse<T>(
  message: string,
  data: T,
  meta?: Record<string, unknown>
): ApiResponse<T> {
  return {
    status: "success",
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function errorResponse(message: string): ApiResponse<null> {
  return {
    status: "error",
    message,
    data: null,
  };
}
