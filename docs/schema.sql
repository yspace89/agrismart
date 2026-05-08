-- SQL Schema for AgriSmart ERP

-- Lands / Plots
CREATE TABLE IF NOT EXISTS lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    area_sqm DECIMAL,
    location_json JSONB, -- For simple GPS coordinates
    status TEXT DEFAULT 'active', -- active, resting, maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planting Seasons / Projects
CREATE TABLE IF NOT EXISTS planting_seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES lands(id),
    crop_name TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    estimated_harvest_date DATE,
    budget_total DECIMAL DEFAULT 0,
    status TEXT DEFAULT 'ongoing', -- ongoing, harvested, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Tracking
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID REFERENCES planting_seasons(id),
    category TEXT NOT NULL, -- Seed, Fertilizer, Labor, Logistics, Fuel, Others
    amount DECIMAL NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth Logs (from Telegram)
CREATE TABLE IF NOT EXISTS growth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID REFERENCES planting_seasons(id),
    milestone TEXT, -- Vegetative, Generative, Harvesting
    height_cm DECIMAL,
    condition_score INTEGER CHECK (condition_score >= 1 AND condition_score <= 5),
    notes TEXT,
    photo_url TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    quantity DECIMAL DEFAULT 0,
    unit TEXT NOT NULL, -- kg, L, bags, etc
    par_level DECIMAL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor Logs (IoT Simulation)
CREATE TABLE IF NOT EXISTS sensor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    land_id UUID REFERENCES lands(id),
    sensor_type TEXT NOT NULL, -- moisture, ph, temperature, humidity
    value DECIMAL NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Views for Forecasting
CREATE OR REPLACE VIEW v_season_financials AS
SELECT 
    ps.id AS season_id,
    ps.crop_name,
    ps.budget_total,
    COALESCE(SUM(e.amount), 0) AS total_spent,
    ps.budget_total - COALESCE(SUM(e.amount), 0) AS remaining_budget,
    (COALESCE(SUM(e.amount), 0) / NULLIF(ps.budget_total, 0)) * 100 AS burn_rate_percent
FROM planting_seasons ps
LEFT JOIN expenses e ON ps.id = e.season_id
GROUP BY ps.id, ps.crop_name, ps.budget_total;
