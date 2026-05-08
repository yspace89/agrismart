const { createClient } = require('@supabase/supabase-js');

// Load from env (using node --env-file in the next step)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("🚀 Starting seeding process...");

  // 1. Insert Land
  const { data: land, error: landError } = await supabase
    .from('lands')
    .insert([{ name: 'Kebun Utama (Blok A)', area_sqm: 10000 }])
    .select()
    .single();

  if (landError) {
    console.error("Error inserting land:", landError);
    return;
  }
  console.log("✅ Land created:", land.name);

  // 2. Insert Planting Season
  const { data: season, error: seasonError } = await supabase
    .from('planting_seasons')
    .insert([{
      land_id: land.id,
      crop_name: 'Jagung Hibrida',
      budget_total: 25000000,
      status: 'ongoing',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
    }])
    .select()
    .single();

  if (seasonError) {
    console.error("Error inserting season:", seasonError);
    return;
  }
  console.log("✅ Season created:", season.crop_name);

  // 3. Insert Expenses
  const expenses = [
    { season_id: season.id, category: 'Benih', amount: 2500000, description: 'Bibit Pioneer P35' },
    { season_id: season.id, category: 'Pupuk', amount: 5000000, description: 'Urea & NPK Phonska' },
    { season_id: season.id, category: 'Upah', amount: 3000000, description: 'Tenaga tanam & pembersihan' },
    { season_id: season.id, category: 'BBM', amount: 1500000, description: 'Solar Pompa Air' },
  ];

  const { error: expError } = await supabase.from('expenses').insert(expenses);
  if (expError) console.error("Error inserting expenses:", expError);
  else console.log("✅ Expenses created");

  // 4. Insert Growth Logs
  const logs = [
    { season_id: season.id, milestone: 'Vegetative', height_cm: 15, condition_score: 5, notes: 'Pertumbuhan awal sangat seragam' },
    { season_id: season.id, milestone: 'Vegetative', height_cm: 45, condition_score: 4, notes: 'Muncul sedikit ulat grayak, sudah ditangani' },
  ];

  const { error: logError } = await supabase.from('growth_logs').insert(logs);
  if (logError) console.error("Error inserting logs:", logError);
  else console.log("✅ Growth logs created");

  // 5. Insert Sensor Logs
  const sensors = [
    { land_id: land.id, sensor_type: 'moisture', value: 65.5 },
    { land_id: land.id, sensor_type: 'ph', value: 6.8 },
  ];

  const { error: sensorError } = await supabase.from('sensor_logs').insert(sensors);
  if (sensorError) console.error("Error inserting sensors:", sensorError);
  else console.log("✅ Sensor logs created");

  console.log("✨ Seeding completed successfully!");
}

seed();
