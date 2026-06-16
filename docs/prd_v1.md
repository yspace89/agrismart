# PRD: Agrinova ERP v1.0
## Predictive Financial & Yield Management System

## 1. Executive Summary
Agrinova adalah platform ERP agrikultur "Industrial-Grade" yang berfokus pada **Manajemen Keuangan Prediktif** dan **Forecasting Hasil Panen**. Sistem ini dirancang untuk menyelesaikan masalah ketidakpastian cashflow, kebocoran biaya (leakage), dan kurangnya data riil dari lapangan dengan mengintegrasikan data dari Telegram Bot, Sensor IoT, dan Dashboard Analytics Premium.

---

## 2. Problem Statement
1.  **Cashflow Uncertainty:** Pemilik lahan sering tidak tahu apakah dana operasional cukup sampai masa panen tiba.
2.  **Invisible Leakage:** Kehilangan inventaris (pupuk/solar) dan ketidakefisienan tenaga kerja yang sulit dideteksi secara manual.
3.  **Yield Unpredictability:** Estimasi hasil panen yang hanya berdasarkan "feeling", bukan data pertumbuhan riil, sehingga perencanaan penjualan sering meleset.

---

## 3. Core Value Proposition (UVP)
> "Transforming Agricultural Chaos into Financial Certainty through Real-time Data & Predictive Analytics."

---

## 4. User Personas
| Persona | Role | Primary Goal |
|---------|------|--------------|
| **Farm Owner** | Investor/Owner | Memastikan ROI positif dan memantau kesehatan cashflow. |
| **Farm Manager** | Supervisor | Mengontrol biaya operasional dan memastikan target panen tercapai. |
| **Field Officer** | Operasional | Melaporkan aktivitas harian dan kondisi tanaman dengan mudah (Telegram). |

---

## 5. Feature Breakdown

### 5.1 Strategic Dashboard (Next.js - Desktop)
- **Financial Health Bar:** Visualisasi sisa budget vs waktu operasional.
- **Yield Probability Meter:** Indikator probabilitas keberhasilan panen berdasarkan data pertumbuhan harian.
- **ROI Simulator:** Fitur simulasi dampak perubahan harga input (pupuk/bbm) terhadap profit akhir.
- **Bento Grid Analytics:** Summary harian untuk pengeluaran, aktivitas, dan alert IoT.

### 5.2 Financial & Budgeting (Next.js - Desktop)
- **Season Budgeting:** Setting budget per kategori (Benih, Pupuk, Upah, Logistik) di awal musim.
- **Expense Verification:** Alur persetujuan pengeluaran yang di-input dari lapangan.
- **Dynamic Burn-Rate Tracking:** Kalkulasi otomatis kecepatan penggunaan dana harian.

### 5.3 Telegram Field Ops (Communication Interface)
- **Activity Logging:** Input tugas harian (pemupukan, penyiraman) dengan Foto & GPS Tag.
- **Expense Reporter:** Kirim bukti belanja atau laporan upah langsung via Telegram Bot.
- **Milestone Reporting:** Bot proaktif menanyakan kondisi tanaman (tinggi, jumlah daun) untuk data forecasting.
- **Weekly Summary:** Broadcast laporan otomatis setiap akhir minggu ke Owner/Manager.

### 5.4 IoT Sensor Integration (Data Intelligence)
- **Soil Moisture Monitoring:** Optimasi jadwal penyiraman untuk menghemat listrik & air.
- **Weather API Integration:** Penyesuaian jadwal tanam/panen berdasarkan prediksi cuaca lokal.
- **Virtual Sensor Simulator:** Simulasi data IoT untuk kebutuhan eksplorasi tanpa hardware fisik awal.

---

## 6. Technical Stack (Zero-Cost Industrial Stack)
- **Database:** Supabase (PostgreSQL) + PostGIS untuk data geografis.
- **Frontend:** Next.js 14 (Hosted on Vercel) - Premium UI with Shadcn & Tailwind.
- **Interface:** Telegram Bot API (via Next.js Webhooks).
- **Backend Logic:** Next.js API Routes.
- **Analytics:** Recharts / Tremor for data visualization.

---

## 7. Success Metrics
- **OpEx Efficiency:** Penurunan biaya operasional sebesar 10-15% melalui kontrol ketat.
- **Forecast Accuracy:** Akurasi prediksi hasil panen mendekati 90% di akhir musim.
- **Response Time:** Deteksi anomali (biaya/tanaman) dalam waktu < 24 jam.

---

## 8. Development Roadmap (Phase 1)
- [ ] **Sprint 1:** Setup Supabase Schema & Next.js Core.
- [ ] **Sprint 2:** Telegram Bot Integration (Activity & Expense Logging).
- [ ] **Sprint 3:** Financial Dashboard & Burn-Rate Logic.
- [ ] **Sprint 4:** IoT Integration (Simulated Data) & Yield Forecasting Algorithm.
- [ ] **Sprint 5:** Final Polish & Premium UI Micro-animations.
