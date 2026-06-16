import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Load .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, daysAgo));
  return date;
}

// ─── Data Pool ────────────────────────────────────────────────────────────────

const FOOD_CATEGORIES = ["Makanan", "Minuman", "Camilan", "Kue & Roti", "Oleh-oleh", "Bumbu & Rempah"];
const WASTE_CATEGORIES = ["Organik", "Anorganik", "Minyak Bekas", "Kemasan", "Sisa Bahan Baku"];
const INVENTORY_CATEGORIES = ["Bahan Baku", "Bahan Tambahan", "Kemasan", "Peralatan", "Bahan Bakar"];
const UNITS = ["pcs", "kg", "liter", "gram", "porsi", "botol", "bungkus", "lusin", "pack"];
// Titik-titik koordinat nyata di dalam wilayah Desa Rowokangkung & sekitarnya, Kec. Rowokangkung, Lumajang
const ROWOKANGKUNG_SPOTS = [
  { dusun: "Krajan",       lat: -8.2271, lng: 113.1892 },
  { dusun: "Curah Malang", lat: -8.2298, lng: 113.1921 },
  { dusun: "Wonokoyo",     lat: -8.2243, lng: 113.1867 },
  { dusun: "Sumber Waru",  lat: -8.2315, lng: 113.1845 },
  { dusun: "Ngemplak",     lat: -8.2260, lng: 113.1940 },
  { dusun: "Sidorejo",     lat: -8.2285, lng: 113.1810 },
  { dusun: "Karang Anyar", lat: -8.2230, lng: 113.1975 },
  { dusun: "Tegal Rejo",   lat: -8.2330, lng: 113.1880 },
  { dusun: "Sumber Agung", lat: -8.2205, lng: 113.1835 },
  { dusun: "Rowokangkung", lat: -8.2252, lng: 113.1908 },
];

const ROWOKANGKUNG_STREETS = [
  "Jl. Raya Rowokangkung",
  "Jl. Sumber Waru",
  "Jl. Curah Malang",
  "Jl. Wonokoyo",
  "Jl. Tegal Rejo",
  "Jl. Karang Anyar",
  "Jl. Veteran",
  "Jl. Merdeka",
  "Jl. Pemuda",
  "Jl. Pasar Rowokangkung",
  "Jl. Ngemplak",
  "Jl. Sumber Agung",
];

const BUSINESS_NAMES = [
  "Warung Bu Sari", "Kedai Pak Budi", "Dapur Ibu Tini", "Kantin Maju Jaya",
  "Warung Sederhana", "RM Nusantara", "Kedai Kopi Santai", "Toko Kue Manis",
  "Warung Barokah", "Kedai Pak Haji", "Dapur Bunda", "Warung Pojok",
  "Toko Oleh-oleh Nusantara", "RM Padang Jaya", "Warung Soto Ayam Pak Gito",
  "Kedai Bakso Pak Kumis", "Rujak Cingur Bu Anik", "Mie Ayam Pak Tono",
  "Nasi Goreng Spesial Pak Eko", "Pecel Lele Bu Yanti",
];

const PRODUCTS_DATA = [
  { name: "Nasi Goreng Spesial", cat: "Makanan", min: 15000, max: 35000, unit: "porsi" },
  { name: "Mie Ayam Bakso", cat: "Makanan", min: 12000, max: 25000, unit: "porsi" },
  { name: "Soto Ayam", cat: "Makanan", min: 15000, max: 30000, unit: "porsi" },
  { name: "Gado-gado", cat: "Makanan", min: 12000, max: 22000, unit: "porsi" },
  { name: "Rendang Sapi", cat: "Makanan", min: 25000, max: 55000, unit: "porsi" },
  { name: "Ayam Goreng", cat: "Makanan", min: 18000, max: 35000, unit: "pcs" },
  { name: "Bakso Spesial", cat: "Makanan", min: 15000, max: 28000, unit: "porsi" },
  { name: "Pecel Lele", cat: "Makanan", min: 15000, max: 27000, unit: "porsi" },
  { name: "Nasi Padang", cat: "Makanan", min: 20000, max: 45000, unit: "porsi" },
  { name: "Sate Ayam", cat: "Makanan", min: 20000, max: 40000, unit: "porsi" },
  { name: "Es Teh Manis", cat: "Minuman", min: 3000, max: 7000, unit: "gelas" },
  { name: "Es Jeruk", cat: "Minuman", min: 5000, max: 10000, unit: "gelas" },
  { name: "Jus Alpukat", cat: "Minuman", min: 12000, max: 20000, unit: "gelas" },
  { name: "Kopi Hitam", cat: "Minuman", min: 5000, max: 12000, unit: "gelas" },
  { name: "Es Dawet", cat: "Minuman", min: 8000, max: 15000, unit: "gelas" },
  { name: "Wedang Jahe", cat: "Minuman", min: 8000, max: 15000, unit: "gelas" },
  { name: "Teh Tarik", cat: "Minuman", min: 8000, max: 15000, unit: "gelas" },
  { name: "Keripik Singkong", cat: "Camilan", min: 5000, max: 15000, unit: "bungkus" },
  { name: "Pisang Goreng", cat: "Camilan", min: 5000, max: 12000, unit: "pcs" },
  { name: "Tahu Isi", cat: "Camilan", min: 2000, max: 5000, unit: "pcs" },
  { name: "Tempe Mendoan", cat: "Camilan", min: 3000, max: 8000, unit: "pcs" },
  { name: "Onde-onde", cat: "Camilan", min: 2000, max: 5000, unit: "pcs" },
  { name: "Kue Lapis", cat: "Kue & Roti", min: 5000, max: 15000, unit: "potong" },
  { name: "Bolu Kukus", cat: "Kue & Roti", min: 3000, max: 8000, unit: "pcs" },
  { name: "Martabak Manis", cat: "Kue & Roti", min: 20000, max: 45000, unit: "pcs" },
  { name: "Brownies Kukus", cat: "Kue & Roti", min: 25000, max: 60000, unit: "loyang" },
  { name: "Sambal Bawang", cat: "Bumbu & Rempah", min: 10000, max: 25000, unit: "botol" },
  { name: "Bumbu Rendang", cat: "Bumbu & Rempah", min: 15000, max: 35000, unit: "bungkus" },
  { name: "Keripik Tempe", cat: "Oleh-oleh", min: 10000, max: 25000, unit: "bungkus" },
  { name: "Dodol Garut", cat: "Oleh-oleh", min: 15000, max: 35000, unit: "bungkus" },
];

const INVENTORY_ITEMS = [
  { name: "Tepung Terigu", cat: "Bahan Baku", unit: "kg" },
  { name: "Beras Premium", cat: "Bahan Baku", unit: "kg" },
  { name: "Minyak Goreng", cat: "Bahan Baku", unit: "liter" },
  { name: "Gula Pasir", cat: "Bahan Baku", unit: "kg" },
  { name: "Garam", cat: "Bahan Baku", unit: "kg" },
  { name: "Telur Ayam", cat: "Bahan Baku", unit: "kg" },
  { name: "Ayam Potong", cat: "Bahan Baku", unit: "kg" },
  { name: "Daging Sapi", cat: "Bahan Baku", unit: "kg" },
  { name: "Santan Kelapa", cat: "Bahan Baku", unit: "liter" },
  { name: "Kecap Manis", cat: "Bahan Tambahan", unit: "botol" },
  { name: "Saos Tiram", cat: "Bahan Tambahan", unit: "botol" },
  { name: "Tepung Bumbu", cat: "Bahan Tambahan", unit: "bungkus" },
  { name: "Plastik Kemasan", cat: "Kemasan", unit: "pack" },
  { name: "Kotak Makan", cat: "Kemasan", unit: "pcs" },
  { name: "Kantong Kertas", cat: "Kemasan", unit: "pack" },
  { name: "Gas LPG 3kg", cat: "Bahan Bakar", unit: "tabung" },
];

const WASTE_ITEMS = [
  { name: "Sisa Nasi", cat: "Organik", reusable: true, notes: "Bisa dijadikan pakan ternak atau kompos" },
  { name: "Kulit Bawang", cat: "Organik", reusable: true, notes: "Dapat digunakan sebagai pupuk organik" },
  { name: "Ampas Kelapa", cat: "Organik", reusable: true, notes: "Dijadikan pakan ternak" },
  { name: "Minyak Jelantah", cat: "Minyak Bekas", reusable: true, notes: "Bisa dijual ke pengepul biodiesel" },
  { name: "Botol Plastik", cat: "Anorganik", reusable: false, notes: "Dikumpulkan untuk dijual ke pengepul" },
  { name: "Kertas Bekas", cat: "Anorganik", reusable: false, notes: "Dikumpulkan untuk daur ulang" },
  { name: "Sisa Sayuran", cat: "Organik", reusable: true, notes: "Dijadikan kompos" },
  { name: "Kemasan Plastik", cat: "Kemasan", reusable: false, notes: "Dibuang ke TPS terdekat" },
];

const TRANSACTION_TITLES = {
  income: [
    "Penjualan harian", "Penjualan weekend", "Penjualan event", "Order catering",
    "Penjualan online", "Penjualan offline", "Bonus pelanggan setia", "Penjualan bulk order",
  ],
  expense: [
    "Beli bahan baku", "Bayar listrik", "Bayar gas LPG", "Beli kemasan",
    "Upah karyawan", "Bayar sewa tempat", "Beli peralatan dapur", "Bayar air",
    "Transport belanja", "Bayar internet", "Beli bumbu rempah", "Maintenance peralatan",
  ],
};

const NAMES = [
  "Sari Dewi", "Budi Santoso", "Tini Rahayu", "Ahmad Fauzi", "Rina Wati",
  "Joko Susilo", "Ani Sulastri", "Hendra Gunawan", "Sri Mulyani", "Wahyu Pratama",
  "Eka Putri", "Dodi Hermawan", "Fitri Handayani", "Agus Setiawan", "Nurul Hidayah",
  "Rendi Kurniawan", "Dewi Lestari", "Bambang Wijaya", "Siti Aminah", "Fajar Ramadan",
];

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Memulai seeding...\n");

  // Bersihkan data lama
  console.log("🧹 Membersihkan data lama...");
  await prisma.wasteResource.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.businessLocation.deleteMany();
  await prisma.user.deleteMany();
  console.log("   ✅ Data lama dihapus\n");

  // ── 1. Users ─────────────────────────────────────────────────────────────
  console.log("👤 Membuat users (20 owner UMKM + 10 customer)...");

  const ownerUsers = await Promise.all(
    NAMES.map(async (name, i) => {
      const firebaseUid = `firebase_${name.toLowerCase().replace(/\s/g, "_")}_${i}`;
      return prisma.user.create({
        data: {
          id: firebaseUid,
          email: `${name.toLowerCase().replace(/\s/g, ".")}${i}@alpaca.id`,
          display_name: name,
          role: "owner_umkm",
          phone_number: `08${randomBetween(100000000, 999999999)}`,
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        },
      });
    })
  );

  const customerUsers = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const firebaseUid = `firebase_customer_${i}`;
      return prisma.user.create({
        data: {
          id: firebaseUid,
          email: `customer${i + 1}@alpaca.id`,
          display_name: `Customer ${i + 1}`,
          role: "customer",
          phone_number: `08${randomBetween(100000000, 999999999)}`,
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=customer${i}`,
        },
      });
    })
  );

  console.log(`   ✅ ${ownerUsers.length} owner + ${customerUsers.length} customer dibuat\n`);

  // ── 2. Business Locations ────────────────────────────────────────────────
  console.log("📍 Membuat business locations (Desa Rowokangkung, Lumajang)...");

  await Promise.all(
    ownerUsers.map(async (owner, i) => {
      const spot = randomFrom(ROWOKANGKUNG_SPOTS);
      const businessName = BUSINESS_NAMES[i % BUSINESS_NAMES.length];
      const locCount = randomBetween(1, 2);

      return Promise.all(
        Array.from({ length: locCount }, (_, j) => {
          // Sebar koordinat dalam radius ~200m di sekitar titik dusun
          const latOffset = (Math.random() - 0.5) * 0.004;
          const lngOffset = (Math.random() - 0.5) * 0.004;
          const street = randomFrom(ROWOKANGKUNG_STREETS);

          return prisma.businessLocation.create({
            data: {
              owner_id: owner.id,
              business_name: j === 0 ? businessName : `${businessName} Cabang ${j + 1}`,
              latitude: spot.lat + latOffset,
              longitude: spot.lng + lngOffset,
              address: `${street} No.${randomBetween(1, 99)}, Dusun ${spot.dusun}, Desa Rowokangkung, Kec. Rowokangkung, Lumajang, Jawa Timur 67358`,
              description: `${businessName} menyajikan berbagai masakan khas dengan cita rasa autentik. Berlokasi di Dusun ${spot.dusun}, Rowokangkung. Buka setiap hari mulai pukul 07.00 – 21.00 WIB.`,
              image_url: `https://picsum.photos/seed/${owner.id}${j}/800/400`,
            },
          });
        })
      );
    })
  );

  const locationCount = await prisma.businessLocation.count();
  console.log(`   ✅ ${locationCount} lokasi bisnis dibuat (Rowokangkung, Lumajang)\n`);

  // ── 3. Products ──────────────────────────────────────────────────────────
  console.log("🍜 Membuat products...");

  await Promise.all(
    ownerUsers.map(async (owner) => {
      const productCount = randomBetween(5, 12);
      const shuffled = [...PRODUCTS_DATA].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, productCount);

      return Promise.all(
        selected.map((p) => {
          const price = randomBetween(p.min, p.max);
          const qty = randomBetween(0, 100);
          const minStock = randomBetween(5, 20);
          return prisma.product.create({
            data: {
              owner_id: owner.id,
              product_name: p.name,
              description: `${p.name} lezat dan fresh dibuat setiap hari. Tersedia dalam berbagai pilihan rasa dan ukuran sesuai selera.`,
              price,
              category: p.cat,
              is_available: Math.random() > 0.1,
              quantity: qty,
              minimum_stock: minStock,
              unit: p.unit,
              image_url: `https://picsum.photos/seed/${p.name.replace(/\s/g, "")}/400/300`,
            },
          });
        })
      );
    })
  );

  const productCount = await prisma.product.count();
  console.log(`   ✅ ${productCount} produk dibuat\n`);

  // ── 4. Transactions ──────────────────────────────────────────────────────
  console.log("💰 Membuat transactions (90 hari terakhir)...");

  await Promise.all(
    ownerUsers.map(async (owner) => {
      const txCount = randomBetween(30, 80);

      return Promise.all(
        Array.from({ length: txCount }, () => {
          const isIncome = Math.random() > 0.4;
          const type = isIncome ? "income" : "expense";
          const amount = isIncome
            ? randomBetween(50000, 5000000)
            : randomBetween(20000, 2000000);

          return prisma.transaction.create({
            data: {
              owner_id: owner.id,
              type,
              title: randomFrom(TRANSACTION_TITLES[type]),
              amount,
              description: `${type === "income" ? "Pemasukan" : "Pengeluaran"} operasional usaha.`,
              date: randomDate(90),
            },
          });
        })
      );
    })
  );

  const txCount = await prisma.transaction.count();
  console.log(`   ✅ ${txCount} transaksi dibuat\n`);

  // ── 5. Inventories ───────────────────────────────────────────────────────
  console.log("📦 Membuat inventories...");

  await Promise.all(
    ownerUsers.map(async (owner) => {
      const itemCount = randomBetween(6, 14);
      const shuffled = [...INVENTORY_ITEMS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, itemCount);

      return Promise.all(
        selected.map((item) => {
          const qty = randomBetween(0, 200);
          const minStock = randomBetween(5, 30);
          return prisma.inventory.create({
            data: {
              owner_id: owner.id,
              product_name: item.name,
              category: item.cat,
              quantity: qty,
              minimum_stock: minStock,
              unit: item.unit,
            },
          });
        })
      );
    })
  );

  const invCount = await prisma.inventory.count();
  console.log(`   ✅ ${invCount} item inventaris dibuat\n`);

  // ── 6. Waste Resources ───────────────────────────────────────────────────
  console.log("♻️  Membuat waste resources...");

  await Promise.all(
    ownerUsers.map(async (owner) => {
      const wasteCount = randomBetween(3, 7);
      const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, wasteCount);

      return Promise.all(
        selected.map((item) =>
          prisma.wasteResource.create({
            data: {
              owner_id: owner.id,
              waste_name: item.name,
              quantity: randomBetween(1, 50),
              unit: randomFrom(["kg", "liter", "pcs", "bungkus"]),
              category: item.cat,
              reusable: item.reusable,
              processing_notes: item.notes,
            },
          })
        )
      );
    })
  );

  const wasteCount = await prisma.wasteResource.count();
  console.log(`   ✅ ${wasteCount} item limbah dibuat\n`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════");
  console.log("✅ SEEDING SELESAI!");
  console.log("═══════════════════════════════════════");
  console.log(`   👤 Users             : ${ownerUsers.length + customerUsers.length}`);
  console.log(`   📍 Business Locations: ${locationCount}`);
  console.log(`   🍜 Products          : ${productCount}`);
  console.log(`   💰 Transactions      : ${txCount}`);
  console.log(`   📦 Inventories       : ${invCount}`);
  console.log(`   ♻️  Waste Resources   : ${wasteCount}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
