<template>
  <div class="app">
    <!-- ── Navbar ─────────────────────────────────────────── -->
    <nav class="navbar">
      <div class="nav-inner">
        <div class="nav-brand">
          <span class="brand-icon">🦙</span>
          <span class="brand-name">Alpaca <span class="brand-tag">API</span></span>
        </div>
        <div class="nav-links">
          <a href="#endpoints" class="nav-link">Endpoints</a>
          <a href="#stats" class="nav-link">Stats</a>
          <a href="#docs" class="nav-link">Docs</a>
          <span class="nav-badge">v1.0</span>
        </div>
      </div>
    </nav>

    <!-- ── Hero ──────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
        <div class="orb orb-3" />
        <div class="grid-overlay" />
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="pulse-dot" />
          Server Online
        </div>
        <h1 class="hero-title">
          Alpaca <span class="gradient-text">Web API</span>
        </h1>
        <p class="hero-subtitle">
          Backend API untuk Pariwisata Kuliner & UMKM Desa Rowokangkung, Lumajang.<br>
          Dibangun dengan <strong>Nuxt 3</strong> · <strong>Nitro</strong> · <strong>Prisma ORM</strong> · <strong>PostgreSQL</strong>
        </p>
        <div class="hero-actions">
          <a href="#endpoints" class="btn-primary">
            <span>Lihat Endpoints</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </a>
          <a href="/api/stats" target="_blank" class="btn-secondary">
            <span>Live Stats</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
        <div class="hero-tech">
          <span class="tech-pill">🟢 Nuxt 4.4</span>
          <span class="tech-pill">⚡ Nitro</span>
          <span class="tech-pill">🔷 Prisma 7</span>
          <span class="tech-pill">🐘 PostgreSQL</span>
          <span class="tech-pill">☁️ Supabase</span>
        </div>
      </div>
    </section>

    <!-- ── Live Stats ─────────────────────────────────────── -->
    <section id="stats" class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">📊 Live Database Stats</h2>
          <p class="section-sub">Data real-time langsung dari Supabase PostgreSQL</p>
        </div>

        <div v-if="loading" class="loading-grid">
          <div v-for="i in 6" :key="i" class="stat-skeleton" />
        </div>

        <div v-else class="stats-grid">
          <div class="stat-card" v-for="stat in statsCards" :key="stat.label">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-value">{{ stat.value.toLocaleString('id-ID') }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-glow" :style="{ background: stat.color }" />
          </div>
        </div>

        <div v-if="stats && !loading" class="balance-card">
          <div class="balance-item income">
            <span class="balance-icon">📈</span>
            <div>
              <div class="balance-label">Total Pemasukan</div>
              <div class="balance-value">{{ formatRupiah(stats.totalIncome) }}</div>
            </div>
          </div>
          <div class="balance-divider" />
          <div class="balance-item expense">
            <span class="balance-icon">📉</span>
            <div>
              <div class="balance-label">Total Pengeluaran</div>
              <div class="balance-value">{{ formatRupiah(stats.totalExpense) }}</div>
            </div>
          </div>
          <div class="balance-divider" />
          <div class="balance-item net">
            <span class="balance-icon">💰</span>
            <div>
              <div class="balance-label">Net Balance</div>
              <div class="balance-value" :class="(stats.totalIncome - stats.totalExpense) >= 0 ? 'positive' : 'negative'">
                {{ formatRupiah(stats.totalIncome - stats.totalExpense) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Endpoints ──────────────────────────────────────── -->
    <section id="endpoints" class="section section-dark">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">🔌 API Endpoints</h2>
          <p class="section-sub">Base URL: <code class="inline-code">http://localhost:3000/api/v1</code></p>
        </div>

        <div class="endpoints-grid">
          <div v-for="group in endpointGroups" :key="group.resource" class="endpoint-card">
            <div class="endpoint-header">
              <span class="endpoint-icon">{{ group.icon }}</span>
              <div>
                <div class="endpoint-resource">{{ group.resource }}</div>
                <div class="endpoint-desc">{{ group.desc }}</div>
              </div>
            </div>
            <div class="endpoint-list">
              <div v-for="ep in group.endpoints" :key="ep.path" class="endpoint-row">
                <span class="method-badge" :class="ep.method.toLowerCase()">{{ ep.method }}</span>
                <code class="endpoint-path">{{ ep.path }}</code>
                <span class="endpoint-note">{{ ep.note }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Response Format ────────────────────────────────── -->
    <section id="docs" class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">📄 Response Format</h2>
          <p class="section-sub">Semua endpoint mengembalikan format JSON yang konsisten</p>
        </div>
        <div class="docs-grid">
          <div class="code-card">
            <div class="code-header">
              <span class="code-dot green" /><span class="code-dot yellow" /><span class="code-dot red" />
              <span class="code-title">✅ Success Response</span>
            </div>
            <pre class="code-block"><code>{{ successExample }}</code></pre>
          </div>
          <div class="code-card">
            <div class="code-header">
              <span class="code-dot green" /><span class="code-dot yellow" /><span class="code-dot red" />
              <span class="code-title">❌ Error Response</span>
            </div>
            <pre class="code-block"><code>{{ errorExample }}</code></pre>
          </div>
        </div>

        <!-- Query Params -->
        <div class="params-section">
          <h3 class="params-title">Query Parameters Umum</h3>
          <div class="params-table">
            <div class="params-row header">
              <span>Parameter</span><span>Tipe</span><span>Endpoint</span><span>Keterangan</span>
            </div>
            <div v-for="p in queryParams" :key="p.param" class="params-row">
              <code>{{ p.param }}</code>
              <span class="type-badge">{{ p.type }}</span>
              <span class="muted">{{ p.endpoint }}</span>
              <span>{{ p.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────── -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span>🦙</span>
          <span>Alpaca API &copy; 2026</span>
        </div>
        <div class="footer-info">
          Pariwisata Kuliner & UMKM · Desa Rowokangkung, Lumajang, Jawa Timur
        </div>
        <div class="footer-stack">
          Built with Nuxt 3 · Prisma · Supabase
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Alpaca API — Pariwisata Kuliner & UMKM Rowokangkung, Lumajang',
  meta: [
    { name: 'description', content: 'Web API Backend untuk aplikasi pariwisata kuliner dan UMKM Desa Rowokangkung, Lumajang. Dibangun dengan Nuxt 3, Prisma ORM, dan Supabase PostgreSQL.' },
    { name: 'theme-color', content: '#0f1117' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' },
  ],
})

// ── Stats ──────────────────────────────────────────────────
const loading = ref(true)
const stats = ref<any>(null)

const { data } = await useFetch('/api/stats')
if (data.value?.data) {
  stats.value = data.value.data
}
loading.value = false

const statsCards = computed(() => {
  if (!stats.value) return []
  return [
    { icon: '👤', label: 'Total Pengguna', value: stats.value.users, color: 'rgba(99,102,241,0.3)' },
    { icon: '🏪', label: 'Owner UMKM', value: stats.value.owners, color: 'rgba(16,185,129,0.3)' },
    { icon: '🍜', label: 'Produk', value: stats.value.products, color: 'rgba(245,158,11,0.3)' },
    { icon: '💳', label: 'Transaksi', value: stats.value.transactions, color: 'rgba(239,68,68,0.3)' },
    { icon: '📦', label: 'Inventaris', value: stats.value.inventories, color: 'rgba(59,130,246,0.3)' },
    { icon: '📍', label: 'Lokasi Bisnis', value: stats.value.businessLocations, color: 'rgba(168,85,247,0.3)' },
  ]
})

// ── Helpers ────────────────────────────────────────────────
function formatRupiah(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

// ── Endpoint Groups ────────────────────────────────────────
const endpointGroups = [
  {
    icon: '👤', resource: 'Users', desc: 'Sinkronisasi & manajemen pengguna',
    endpoints: [
      { method: 'GET',  path: '/users',        note: 'Daftar semua pengguna' },
      { method: 'GET',  path: '/users/:id',    note: 'Detail pengguna' },
      { method: 'POST', path: '/users/create', note: 'Sinkron dari Firebase Auth' },
      { method: 'PUT',  path: '/users/:id',    note: 'Update profil' },
    ],
  },
  {
    icon: '🍜', resource: 'Products', desc: 'Manajemen produk UMKM',
    endpoints: [
      { method: 'GET',    path: '/products?owner_id=',  note: 'Daftar produk per owner' },
      { method: 'GET',    path: '/products/:id',        note: 'Detail produk' },
      { method: 'POST',   path: '/products/create',     note: 'Tambah produk baru' },
      { method: 'PUT',    path: '/products/:id',        note: 'Update produk' },
      { method: 'DELETE', path: '/products/:id',        note: 'Hapus produk' },
    ],
  },
  {
    icon: '💳', resource: 'Transactions', desc: 'Catatan pemasukan & pengeluaran',
    endpoints: [
      { method: 'GET',    path: '/transactions?owner_id=', note: 'Daftar transaksi + summary' },
      { method: 'GET',    path: '/transactions/:id',       note: 'Detail transaksi' },
      { method: 'POST',   path: '/transactions/create',    note: 'Catat transaksi baru' },
      { method: 'PUT',    path: '/transactions/:id',       note: 'Edit transaksi' },
      { method: 'DELETE', path: '/transactions/:id',       note: 'Hapus transaksi' },
    ],
  },
  {
    icon: '📦', resource: 'Inventories', desc: 'Stok & inventaris bahan baku',
    endpoints: [
      { method: 'GET',    path: '/inventories?owner_id=', note: 'Daftar stok (+ low_stock filter)' },
      { method: 'GET',    path: '/inventories/:id',       note: 'Detail item' },
      { method: 'POST',   path: '/inventories/create',    note: 'Tambah item baru' },
      { method: 'PUT',    path: '/inventories/:id',       note: 'Update stok' },
      { method: 'DELETE', path: '/inventories/:id',       note: 'Hapus item' },
    ],
  },
  {
    icon: '♻️', resource: 'Waste Resources', desc: 'Pengelolaan limbah & daur ulang',
    endpoints: [
      { method: 'GET',    path: '/waste-resources?owner_id=', note: 'Daftar limbah (+ reusable filter)' },
      { method: 'GET',    path: '/waste-resources/:id',       note: 'Detail limbah' },
      { method: 'POST',   path: '/waste-resources/create',    note: 'Catat limbah baru' },
      { method: 'PUT',    path: '/waste-resources/:id',       note: 'Update data limbah' },
      { method: 'DELETE', path: '/waste-resources/:id',       note: 'Hapus data' },
    ],
  },
  {
    icon: '📍', resource: 'Business Locations', desc: 'Peta UMKM Rowokangkung',
    endpoints: [
      { method: 'GET',    path: '/business-locations',            note: 'Semua lokasi (explore map)' },
      { method: 'GET',    path: '/business-locations/nearby',     note: 'Lokasi terdekat (lat, lng, radius)' },
      { method: 'GET',    path: '/business-locations/:id',        note: 'Detail + info owner' },
      { method: 'POST',   path: '/business-locations/create',     note: 'Daftarkan lokasi baru' },
      { method: 'PUT',    path: '/business-locations/:id',        note: 'Update lokasi' },
      { method: 'DELETE', path: '/business-locations/:id',        note: 'Hapus lokasi' },
    ],
  },
  {
    icon: '❤️', resource: 'Favorites', desc: 'Produk & lokasi favorit pengguna',
    endpoints: [
      { method: 'GET',    path: '/favorites?user_id=',                        note: 'Daftar favorit pengguna' },
      { method: 'POST',   path: '/favorites/create',                          note: 'Tambah ke favorit' },
      { method: 'DELETE', path: '/favorites/:itemType/:itemId?user_id=',      note: 'Hapus dari favorit' },
    ],
  },
  {
    icon: '🖼️', resource: 'Media', desc: 'Galeri gambar produk & lokasi',
    endpoints: [
      { method: 'GET',    path: '/media?ref_id=&ref_type=', note: 'Daftar media per referensi' },
      { method: 'DELETE', path: '/media/:id',               note: 'Hapus media' },
    ],
  },
  {
    icon: '☁️', resource: 'Upload', desc: 'Upload file ke Supabase Storage',
    endpoints: [
      { method: 'POST',   path: '/upload/image',  note: 'Upload gambar (multipart/form-data)' },
    ],
  },
]

// ── Code Examples ──────────────────────────────────────────
const successExample = `{
  "status": "success",
  "message": "Berhasil mengambil daftar produk.",
  "data": [ ... ],
  "meta": {
    "total": 10
  }
}`

const errorExample = `{
  "status": "error",
  "message": "Parameter 'owner_id' wajib disertakan.",
  "data": null
}`

// ── Query Params ───────────────────────────────────────────
const queryParams = [
  { param: 'owner_id',  type: 'string (UUID)',    endpoint: 'products, transactions, inventories, waste-resources', desc: 'Filter data berdasarkan pemilik UMKM' },
  { param: 'user_id',   type: 'string (UUID)',    endpoint: 'favorites',                desc: 'Filter favorit berdasarkan pengguna' },
  { param: 'category',  type: 'string',           endpoint: 'products, inventories, waste-resources', desc: 'Filter berdasarkan kategori' },
  { param: 'available', type: 'boolean',          endpoint: 'products',                desc: 'Filter ketersediaan produk (true/false)' },
  { param: 'type',      type: 'income | expense', endpoint: 'transactions',            desc: 'Filter jenis transaksi' },
  { param: 'date_from', type: 'ISO date',         endpoint: 'transactions',            desc: 'Filter tanggal mulai' },
  { param: 'date_to',   type: 'ISO date',         endpoint: 'transactions',            desc: 'Filter tanggal akhir' },
  { param: 'low_stock', type: 'boolean',          endpoint: 'inventories',             desc: 'Tampilkan hanya stok menipis' },
  { param: 'reusable',  type: 'boolean',          endpoint: 'waste-resources',         desc: 'Filter limbah yang bisa didaur ulang' },
  { param: 'lat',       type: 'number',           endpoint: 'business-locations/nearby', desc: 'Latitude titik referensi pengguna' },
  { param: 'lng',       type: 'number',           endpoint: 'business-locations/nearby', desc: 'Longitude titik referensi pengguna' },
  { param: 'radius',    type: 'number (km)',      endpoint: 'business-locations/nearby', desc: 'Radius pencarian dalam kilometer' },
  { param: 'ref_id',    type: 'string (UUID)',    endpoint: 'media',                   desc: 'ID referensi (produk / lokasi)' },
  { param: 'ref_type',  type: 'string',           endpoint: 'media',                   desc: 'Tipe referensi (product / business_location)' },
]
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0d14;
  --bg-card: #111827;
  --bg-card2: #1a2235;
  --border: rgba(255,255,255,0.07);
  --border-hover: rgba(99,202,183,0.3);
  --text: #e2e8f0;
  --text-muted: #64748b;
  --accent: #10b981;
  --accent2: #6366f1;
  --accent3: #f59e0b;
  --red: #ef4444;
  --font: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', monospace;
}

html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--text); font-family: var(--font); line-height: 1.6; overflow-x: hidden; }

/* ── Navbar ── */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(10,13,20,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem;
}
.nav-brand { display: flex; align-items: center; gap: .6rem; font-size: 1.2rem; font-weight: 700; }
.brand-icon { font-size: 1.5rem; }
.brand-name { color: #fff; }
.brand-tag {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  font-size: .85rem; font-weight: 600; margin-left: .2rem;
}
.nav-links { display: flex; align-items: center; gap: 1.5rem; }
.nav-link { color: var(--text-muted); text-decoration: none; font-size: .9rem; transition: color .2s; }
.nav-link:hover { color: var(--accent); }
.nav-badge {
  background: rgba(16,185,129,.15); color: var(--accent);
  border: 1px solid rgba(16,185,129,.3);
  padding: .2rem .6rem; border-radius: 99px; font-size: .75rem; font-weight: 600;
}

/* ── Hero ── */
.hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 6rem 2rem 4rem; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(100px); opacity: .4; animation: float 8s ease-in-out infinite;
}
.orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #10b98133, transparent); top: -200px; left: -100px; }
.orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #6366f133, transparent); bottom: -150px; right: -100px; animation-delay: -3s; }
.orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, #f59e0b22, transparent); top: 40%; left: 50%; animation-delay: -6s; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
@keyframes float { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }

.hero-content {
  position: relative; z-index: 1;
  text-align: center; max-width: 800px;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
  color: var(--accent); padding: .4rem 1rem; border-radius: 99px;
  font-size: .85rem; font-weight: 500; margin-bottom: 1.5rem;
}
.pulse-dot {
  width: 8px; height: 8px; background: var(--accent); border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.5); } }

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; letter-spacing: -.02em;
  color: #fff; margin-bottom: 1.2rem; line-height: 1.1;
}
.gradient-text {
  background: linear-gradient(135deg, #10b981 0%, #6366f1 50%, #f59e0b 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-subtitle {
  font-size: 1.1rem; color: var(--text-muted); max-width: 600px;
  margin: 0 auto 2rem; line-height: 1.7;
}
.hero-subtitle strong { color: var(--text); }

.hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
.btn-primary, .btn-secondary {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .8rem 1.8rem; border-radius: 12px;
  font-size: .95rem; font-weight: 600; text-decoration: none;
  transition: all .3s; cursor: pointer;
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #059669);
  color: #fff; box-shadow: 0 0 30px rgba(16,185,129,.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(16,185,129,.5); }
.btn-secondary {
  background: rgba(255,255,255,.06); border: 1px solid var(--border);
  color: var(--text);
}
.btn-secondary:hover { background: rgba(255,255,255,.1); border-color: var(--border-hover); transform: translateY(-2px); }

.hero-tech { display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; }
.tech-pill {
  background: rgba(255,255,255,.05); border: 1px solid var(--border);
  padding: .35rem .9rem; border-radius: 99px; font-size: .8rem; color: var(--text-muted);
  transition: all .2s;
}
.tech-pill:hover { border-color: var(--border-hover); color: var(--text); }

/* ── Sections ── */
.section { padding: 6rem 2rem; }
.section-dark { background: rgba(0,0,0,.3); }
.container { max-width: 1200px; margin: 0 auto; }
.section-header { text-align: center; margin-bottom: 3rem; }
.section-title { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: .5rem; }
.section-sub { color: var(--text-muted); font-size: 1rem; }
.inline-code {
  background: rgba(99,102,241,.15); color: var(--accent2);
  padding: .15rem .5rem; border-radius: 6px; font-family: var(--mono); font-size: .9rem;
}

/* ── Stats ── */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  position: relative; overflow: hidden;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; padding: 1.5rem; text-align: center;
  transition: all .3s; cursor: default;
}
.stat-card:hover { transform: translateY(-4px); border-color: var(--border-hover); }
.stat-icon { font-size: 2rem; margin-bottom: .5rem; }
.stat-value { font-size: 2rem; font-weight: 800; color: #fff; font-family: var(--mono); }
.stat-label { font-size: .85rem; color: var(--text-muted); margin-top: .2rem; }
.stat-glow {
  position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
  width: 80%; height: 40px; border-radius: 50%; filter: blur(20px);
}
.loading-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-skeleton {
  height: 140px; background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card2) 50%, var(--bg-card) 75%);
  background-size: 200% 100%; border-radius: 16px; animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.balance-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 20px; padding: 2rem;
  display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 1rem; align-items: center;
}
.balance-item { display: flex; align-items: center; gap: 1rem; }
.balance-icon { font-size: 2rem; }
.balance-label { font-size: .85rem; color: var(--text-muted); }
.balance-value { font-size: 1.2rem; font-weight: 700; color: #fff; margin-top: .2rem; font-family: var(--mono); }
.balance-value.positive { color: var(--accent); }
.balance-value.negative { color: var(--red); }
.balance-divider { width: 1px; height: 50px; background: var(--border); }

/* ── Endpoints ── */
.endpoints-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(520px, 1fr)); gap: 1.5rem;
}
.endpoint-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden; transition: all .3s;
}
.endpoint-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
.endpoint-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,.02);
}
.endpoint-icon { font-size: 1.8rem; }
.endpoint-resource { font-weight: 700; color: #fff; font-size: 1rem; }
.endpoint-desc { font-size: .8rem; color: var(--text-muted); margin-top: .1rem; }
.endpoint-list { padding: .8rem 1rem; }
.endpoint-row {
  display: flex; align-items: center; gap: .8rem;
  padding: .5rem .5rem; border-radius: 8px; transition: background .2s;
}
.endpoint-row:hover { background: rgba(255,255,255,.03); }
.method-badge {
  font-family: var(--mono); font-size: .7rem; font-weight: 700;
  padding: .2rem .5rem; border-radius: 5px; min-width: 56px; text-align: center;
}
.method-badge.get    { background: rgba(16,185,129,.15); color: #10b981; border: 1px solid rgba(16,185,129,.3); }
.method-badge.post   { background: rgba(99,102,241,.15); color: #818cf8; border: 1px solid rgba(99,102,241,.3); }
.method-badge.put    { background: rgba(245,158,11,.15); color: #fbbf24; border: 1px solid rgba(245,158,11,.3); }
.method-badge.delete { background: rgba(239,68,68,.15);  color: #f87171; border: 1px solid rgba(239,68,68,.3); }
.endpoint-path { font-family: var(--mono); font-size: .82rem; color: var(--text); flex: 1; }
.endpoint-note { font-size: .78rem; color: var(--text-muted); white-space: nowrap; }

/* ── Docs ── */
.docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.code-card {
  background: #0d1117; border: 1px solid var(--border);
  border-radius: 16px; overflow: hidden;
}
.code-header {
  display: flex; align-items: center; gap: .4rem;
  padding: .8rem 1.2rem; border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,.02);
}
.code-dot { width: 10px; height: 10px; border-radius: 50%; }
.code-dot.green  { background: #10b981; }
.code-dot.yellow { background: #f59e0b; }
.code-dot.red    { background: #ef4444; }
.code-title { font-size: .82rem; color: var(--text-muted); margin-left: .5rem; }
.code-block {
  padding: 1.5rem; font-family: var(--mono); font-size: .82rem;
  line-height: 1.8; color: #7dd3fc; overflow-x: auto;
}

.params-section { margin-top: 2rem; }
.params-title { font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: 1rem; }
.params-table { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.params-row {
  display: grid; grid-template-columns: 1.2fr .6fr 1.8fr 2fr;
  gap: 1rem; padding: .9rem 1.2rem; align-items: center;
  font-size: .85rem; border-bottom: 1px solid var(--border);
  transition: background .2s;
}
.params-row:last-child { border-bottom: none; }
.params-row.header { background: rgba(255,255,255,.04); font-weight: 600; color: var(--text-muted); font-size: .8rem; }
.params-row:not(.header):hover { background: rgba(255,255,255,.02); }
.type-badge {
  background: rgba(245,158,11,.1); color: #fbbf24;
  border: 1px solid rgba(245,158,11,.2);
  padding: .15rem .5rem; border-radius: 6px; font-family: var(--mono); font-size: .75rem; white-space: nowrap;
}
.muted { color: var(--text-muted); font-size: .8rem; }

/* ── Footer ── */
.footer {
  border-top: 1px solid var(--border);
  padding: 2rem;
  background: rgba(0,0,0,.3);
}
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}
.footer-brand { display: flex; align-items: center; gap: .5rem; font-weight: 600; color: #fff; }
.footer-info, .footer-stack { font-size: .85rem; color: var(--text-muted); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links { gap: 1rem; }
  .nav-link { display: none; }
  .endpoints-grid { grid-template-columns: 1fr; }
  .docs-grid { grid-template-columns: 1fr; }
  .balance-card { grid-template-columns: 1fr; gap: 1.5rem; }
  .balance-divider { display: none; }
  .params-row { grid-template-columns: 1fr 1fr; }
  .params-row .muted, .params-row:last-child { display: none; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
