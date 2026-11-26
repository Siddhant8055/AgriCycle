-- Migration 001: Initial Schema
-- Tables and integrity constraints for AgriCycle

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Users (Farmers, Buyers, Admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'BUYER', 'ADMIN')),
  location GEOGRAPHY(Point, 4326),
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_user_contact_present CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 2. Residue Listings
CREATE TABLE IF NOT EXISTS residue_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_type VARCHAR(50) NOT NULL CHECK (crop_type IN (
    'PADDY_STRAW', 'SUGARCANE_TRASH', 'SOYBEAN_STRAW', 
    'WHEAT_STRAW', 'CORN_STALKS', 'COTTON_STALKS'
  )),
  quantity_tons NUMERIC(10, 2) NOT NULL CHECK (quantity_tons > 0),
  moisture_pct NUMERIC(5, 2) CHECK (moisture_pct IS NULL OR (moisture_pct >= 0 AND moisture_pct <= 100)),
  condition VARCHAR(30) NOT NULL DEFAULT 'FRESH' CHECK (condition IN (
    'FRESH', 'WEATHERED', 'PARTIAL_DECAY', 'DECOMPOSED', 'CONTAMINATED'
  )),
  storage_type VARCHAR(20) NOT NULL DEFAULT 'LOOSE' CHECK (storage_type IN ('LOOSE', 'BALED')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  photo_url TEXT,
  availability_start DATE,
  availability_end DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'MATCHED', 'CLOSED', 'CANCELLED'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_listing_availability_window CHECK (
    availability_end IS NULL OR availability_start IS NULL OR availability_end >= availability_start
  )
);

CREATE TRIGGER set_timestamp_residue_listings
BEFORE UPDATE ON residue_listings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 3. Buyer Requirements
CREATE TABLE IF NOT EXISTS buyer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_type VARCHAR(50) NOT NULL CHECK (crop_type IN (
    'PADDY_STRAW', 'SUGARCANE_TRASH', 'SOYBEAN_STRAW', 
    'WHEAT_STRAW', 'CORN_STALKS', 'COTTON_STALKS', 'ALL_BIOMASS'
  )),
  pathway VARCHAR(50) NOT NULL CHECK (pathway IN (
    'SELL_RAW_BIOMASS', 'SELL_RAW_FODDER', 'ON_FARM_COMPOST', 
    'ON_FARM_BIOCHAR', 'INDUSTRIAL_PULP', 'BRIQUETTE_PRODUCTION'
  )),
  min_quantity_tons NUMERIC(10, 2) NOT NULL CHECK (min_quantity_tons > 0),
  max_quantity_tons NUMERIC(10, 2),
  max_moisture_pct NUMERIC(5, 2) CHECK (max_moisture_pct IS NULL OR (max_moisture_pct >= 0 AND max_moisture_pct <= 100)),
  offered_price_per_ton NUMERIC(10, 2) NOT NULL CHECK (offered_price_per_ton >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  service_radius_km NUMERIC(8, 2) NOT NULL CHECK (service_radius_km > 0),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  pickup_capability BOOLEAN NOT NULL DEFAULT TRUE,
  terms TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_buyer_quantity_range CHECK (
    max_quantity_tons IS NULL OR max_quantity_tons >= min_quantity_tons
  )
);

CREATE TRIGGER set_timestamp_buyer_requirements
BEFORE UPDATE ON buyer_requirements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 4. Pathway Rules
CREATE TABLE IF NOT EXISTS pathway_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type VARCHAR(50) NOT NULL,
  pathway_name VARCHAR(50) NOT NULL,
  is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  rationale TEXT NOT NULL,
  max_moisture_allowed NUMERIC(5, 2) CHECK (max_moisture_allowed IS NULL OR (max_moisture_allowed >= 0 AND max_moisture_allowed <= 100)),
  disallowed_conditions TEXT[] DEFAULT '{}',
  conversion_yield NUMERIC(8, 4) CHECK (conversion_yield IS NULL OR conversion_yield > 0),
  yield_unit VARCHAR(50),
  source_note TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_crop_pathway UNIQUE (crop_type, pathway_name)
);

CREATE TRIGGER set_timestamp_pathway_rules
BEFORE UPDATE ON pathway_rules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 5. System Cost Parameters
CREATE TABLE IF NOT EXISTS system_cost_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value_number NUMERIC(12, 4) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  geographic_scope VARCHAR(100) NOT NULL DEFAULT 'Kolhapur_Region_Illustrative',
  source_reference TEXT NOT NULL,
  is_illustrative_test_assumption BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_system_cost_parameters
BEFORE UPDATE ON system_cost_parameters
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 6. Offers
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES residue_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pathway VARCHAR(50) NOT NULL,
  proposed_quantity_tons NUMERIC(10, 2) NOT NULL CHECK (proposed_quantity_tons > 0),
  agreed_price_per_ton NUMERIC(10, 2) NOT NULL CHECK (agreed_price_per_ton >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'CANCELLED'
  )),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_offers
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 7. Recommendation Snapshots
CREATE TABLE IF NOT EXISTS recommendation_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES residue_listings(id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  engine_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0-academic',
  ranked_pathways_json JSONB NOT NULL,
  matched_buyers_json JSONB NOT NULL,
  calculation_inputs_json JSONB NOT NULL,
  explanation_waterfall_json JSONB NOT NULL
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'PARAM_CALIBRATE')),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
