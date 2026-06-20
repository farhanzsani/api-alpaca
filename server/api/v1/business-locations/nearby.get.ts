
/**
 * GET /api/v1/business-locations/nearby
 * Public endpoint — menampilkan daftar toko terdekat berdasarkan koordinat customer.
 *
 * Query Parameters:
 *   - latitude  (number, required) : Latitude posisi customer saat ini
 *   - longitude (number, required) : Longitude posisi customer saat ini
 *   - radius    (number, optional) : Radius pencarian dalam km. Default: 10
 *   - limit     (number, optional) : Jumlah maksimal toko yang dikembalikan. Default: 20
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Menghitung jarak antara dua titik koordinat menggunakan Haversine Formula.
 * @returns Jarak dalam kilometer
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // --- Validasi Parameter ---
    const latitude = parseFloat(query.latitude as string);
    const longitude = parseFloat(query.longitude as string);
    const radius = query.radius ? parseFloat(query.radius as string) : 10;
    const limit = query.limit ? parseInt(query.limit as string, 10) : 20;

    if (isNaN(latitude) || isNaN(longitude)) {
      setResponseStatus(event, 400);
      return errorResponse(
        "Parameter 'latitude' dan 'longitude' wajib diisi dan harus berupa angka."
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setResponseStatus(event, 400);
      return errorResponse(
        "Koordinat tidak valid. Latitude harus antara -90 sampai 90, longitude antara -180 sampai 180."
      );
    }

    if (isNaN(radius) || radius <= 0 || radius > 500) {
      setResponseStatus(event, 400);
      return errorResponse("Parameter 'radius' harus berupa angka positif dan tidak melebihi 500 km.");
    }

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      setResponseStatus(event, 400);
      return errorResponse("Parameter 'limit' harus berupa angka positif dan tidak melebihi 100.");
    }

    // --- Filter Kasar: Bounding Box ---
    // Mengurangi beban query ke database dengan hanya mengambil data
    // dalam kotak persegi di sekitar koordinat customer.
    const deltaLat = radius / 111.12;
    const deltaLon = radius / (111.12 * Math.cos((latitude * Math.PI) / 180));

    const minLat = latitude - deltaLat;
    const maxLat = latitude + deltaLat;
    const minLon = longitude - deltaLon;
    const maxLon = longitude + deltaLon;

    const candidates = await prisma.businessLocation.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLon, lte: maxLon },
      },
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            photo_url: true,
            phone_number: true,
          },
        },
      },
    });

    // --- Filter Presisi & Hitung Jarak: Haversine Formula ---
    // Setelah filter kasar, hitung jarak sebenarnya dan filter berdasarkan radius
    const nearbyLocations = candidates
      .map((loc) => ({
        ...loc,
        distance_km: parseFloat(
          haversineDistance(latitude, longitude, loc.latitude, loc.longitude).toFixed(2)
        ),
      }))
      .filter((loc) => loc.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    return successResponse(
      "Berhasil mengambil daftar toko terdekat.",
      nearbyLocations,
      {
        total: nearbyLocations.length,
        customer_location: { latitude, longitude },
        radius_km: radius,
      }
    );
  } catch (error) {
    console.error("[GET /api/v1/business-locations/nearby]", error);
    setResponseStatus(event, 500);
    return errorResponse("Terjadi kesalahan pada server.");
  }
});
