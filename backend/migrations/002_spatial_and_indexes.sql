-- Migration 002: Spatial and Relational Indexes

-- 1. Spatial Indexes (PostGIS GiST)
CREATE INDEX IF NOT EXISTS idx_users_location_gist 
ON users USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_residue_listings_location_gist 
ON residue_listings USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_buyer_requirements_location_gist 
ON buyer_requirements USING GIST (location);

-- 2. Foreign Key & Query Filter Indexes
CREATE INDEX IF NOT EXISTS idx_residue_listings_farmer_id 
ON residue_listings (farmer_id);

CREATE INDEX IF NOT EXISTS idx_residue_listings_crop_status 
ON residue_listings (crop_type, status);

CREATE INDEX IF NOT EXISTS idx_buyer_requirements_buyer_id 
ON buyer_requirements (buyer_id);

CREATE INDEX IF NOT EXISTS idx_buyer_requirements_crop_active 
ON buyer_requirements (crop_type, is_active);

CREATE INDEX IF NOT EXISTS idx_pathway_rules_crop_active 
ON pathway_rules (crop_type, is_active);

CREATE INDEX IF NOT EXISTS idx_offers_listing_id 
ON offers (listing_id);

CREATE INDEX IF NOT EXISTS idx_offers_buyer_id_status 
ON offers (buyer_id, status);

CREATE INDEX IF NOT EXISTS idx_offers_farmer_id_status 
ON offers (farmer_id, status);

CREATE INDEX IF NOT EXISTS idx_snapshots_listing_id 
ON recommendation_snapshots (listing_id);

CREATE INDEX IF NOT EXISTS idx_system_cost_parameters_key 
ON system_cost_parameters (key);

-- 3. Privacy-Preserving View (masks exact private coordinates and phone numbers)
CREATE OR REPLACE VIEW vw_public_residue_listings AS
SELECT 
  r.id,
  r.crop_type,
  r.quantity_tons,
  r.moisture_pct,
  r.condition,
  r.storage_type,
  r.status,
  r.created_at,
  ST_AsGeoJSON(ST_Centroid(ST_SnapToGrid(r.location::geometry, 0.01)))::jsonb AS approximate_location,
  u.name AS farmer_display_name,
  u.address AS general_village_area
FROM residue_listings r
JOIN users u ON r.farmer_id = u.id
WHERE r.status = 'ACTIVE' AND u.is_active = TRUE;
