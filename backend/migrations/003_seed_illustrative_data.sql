-- Migration 003: Seed Illustrative Demo Data
-- All user passwords default to: DemoPass123!
-- Real bcrypt hash: $2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2

-- 1. Seed Demo Users
INSERT INTO users (id, name, email, phone, password_hash, role, location, address, is_active)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Admin Demo User',
    'admin.demo@agricycle.test',
    '+919800000001',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'ADMIN',
    ST_SetSRID(ST_MakePoint(74.2433, 16.7050), 4326),
    'Kolhapur City, Maharashtra',
    TRUE
  ),
  (
    'f0000000-0000-0000-0000-000000000001',
    'Ramesh Patil (Farmer)',
    'farmer.demo@agricycle.test',
    '+919800000002',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'FARMER',
    ST_SetSRID(ST_MakePoint(74.2433, 16.7050), 4326),
    'Karveer Taluka, Kolhapur District',
    TRUE
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Suresh Deshmukh (Farmer)',
    'farmer.shirol@agricycle.test',
    '+919800000003',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'FARMER',
    ST_SetSRID(ST_MakePoint(74.5985, 16.7358), 4326),
    'Shirol Taluka, Kolhapur District',
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'Demo Sugar Mill Co-generation Unit',
    'buyer.cogen@agricycle.test',
    '+919800000004',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'BUYER',
    ST_SetSRID(ST_MakePoint(74.4080, 16.6210), 4326),
    'Hupari Industrial Corridor, Kolhapur',
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Demo Cattle Feed Processing Cooperative',
    'buyer.feed@agricycle.test',
    '+919800000005',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'BUYER',
    ST_SetSRID(ST_MakePoint(74.2700, 16.6400), 4326),
    'Gokul Shirgaon MIDC, Kolhapur',
    TRUE
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Demo Agro-Biomass Briquette Plant',
    'buyer.briquette@agricycle.test',
    '+919800000006',
    '$2a$10$CLSLpW9cyPaH0T48QKn0O.ZDVNMeLWuM8EqFLsSFdd6EJt776H/q2',
    'BUYER',
    ST_SetSRID(ST_MakePoint(74.4500, 16.7450), 4326),
    'Hatkanangale Agro Cluster, Kolhapur',
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Seed System Cost Parameters
INSERT INTO system_cost_parameters (key, value_number, unit, description, geographic_scope, source_reference, is_illustrative_test_assumption)
VALUES
  (
    'fixed_transport_base_fee',
    500.0000,
    'INR/trip',
    'Fixed base dispatch charge for tractor-trolley or light commercial vehicle.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption for local agricultural transport in Western Maharashtra.',
    TRUE
  ),
  (
    'variable_transport_per_ton_km',
    25.0000,
    'INR/ton-km',
    'Variable transportation fee per metric tonne per kilometre.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption based on diesel rates and rural haulage estimates.',
    TRUE
  ),
  (
    'baling_cost_per_ton',
    400.0000,
    'INR/ton',
    'Mechanical compression and baling cost per tonne of loose residue.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption for custom hiring center tractor-baler services.',
    TRUE
  ),
  (
    'loading_handling_cost_per_ton',
    150.0000,
    'INR/ton',
    'Farm-gate labor cost for manual raking, loading, and field clearing.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption based on rural agricultural labor wages.',
    TRUE
  ),
  (
    'compost_conversion_ratio',
    0.6000,
    'ton_output/ton_residue',
    'Finished organic compost yield multiplier per tonne of raw residue.',
    'All_Regions',
    'ICAR Ex-situ Crop Residue Management baseline conversion standard.',
    FALSE
  ),
  (
    'compost_local_market_price_per_ton',
    2500.0000,
    'INR/ton',
    'Estimated local farm-gate value of enriched organic compost.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption for organic compost trading in Kolhapur.',
    TRUE
  ),
  (
    'compost_pit_labor_cost_per_ton',
    300.0000,
    'INR/ton',
    'Labor and inoculum cost required to prepare and turn compost pits.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption for on-farm compost preparation.',
    TRUE
  ),
  (
    'biochar_conversion_ratio',
    0.2500,
    'ton_output/ton_residue',
    'Finished biochar yield per tonne of dry biomass through pyrolysis.',
    'All_Regions',
    'Academic literature standard: Patel & Panwar (2023).',
    FALSE
  ),
  (
    'biochar_local_market_price_per_ton',
    12000.0000,
    'INR/ton',
    'Estimated market realization rate for soil-grade pyrolyzed biochar.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption based on soil conditioner market prices.',
    TRUE
  ),
  (
    'biochar_kiln_processing_cost_per_ton',
    1500.0000,
    'INR/ton',
    'Capital depreciation and labor operating cost for farm-scale kiln.',
    'Kolhapur_Region_Illustrative',
    'Illustrative test assumption for decentralized kiln operation.',
    TRUE
  )
ON CONFLICT (key) DO UPDATE SET
  value_number = EXCLUDED.value_number,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- 3. Seed Pathway Eligibility Rules
INSERT INTO pathway_rules (crop_type, pathway_name, is_eligible, rationale, max_moisture_allowed, disallowed_conditions, conversion_yield, yield_unit, source_note)
VALUES
  (
    'PADDY_STRAW',
    'SELL_RAW_BIOMASS',
    TRUE,
    'Suitable for co-firing in thermal power boilers or biomass energy generation.',
    22.0,
    ARRAY['CONTAMINATED', 'DECOMPOSED'],
    NULL,
    NULL,
    'Central Electricity Authority (CEA) biomass co-firing specifications.'
  ),
  (
    'PADDY_STRAW',
    'SELL_RAW_FODDER',
    FALSE,
    'Untreated rice straw has high silica (>12%) and low digestibility without chemical treatment.',
    18.0,
    ARRAY['PARTIAL_DECAY', 'DECOMPOSED', 'CONTAMINATED'],
    NULL,
    NULL,
    'ICAR National Institute of Animal Nutrition and Physiology (NIANP).'
  ),
  (
    'PADDY_STRAW',
    'ON_FARM_COMPOST',
    TRUE,
    'High carbon residue creates structural bulk when mixed with cow dung slurry.',
    40.0,
    ARRAY['CONTAMINATED'],
    0.60,
    'ton_compost_per_ton_residue',
    'ICAR Ex-situ Crop Residue Management Options handbook.'
  ),
  (
    'PADDY_STRAW',
    'ON_FARM_BIOCHAR',
    TRUE,
    'Pyrolysis converts dry straw into stable biochar, capturing recalcitrant carbon.',
    18.0,
    ARRAY['DECOMPOSED', 'CONTAMINATED'],
    0.25,
    'ton_biochar_per_ton_residue',
    'Patel & Panwar (2023), Biochar from Agricultural Crop Residues.'
  ),
  (
    'SUGARCANE_TRASH',
    'SELL_RAW_BIOMASS',
    TRUE,
    'High calorific value (~3,800 kcal/kg) makes leaf trash an ideal boiler fuel.',
    25.0,
    ARRAY['DECOMPOSED', 'CONTAMINATED'],
    NULL,
    NULL,
    'Vasantdada Sugar Institute (VSI) Pune co-generation notes.'
  ),
  (
    'SUGARCANE_TRASH',
    'SELL_RAW_FODDER',
    FALSE,
    'Razor-edged leaf blades are unpalatable and non-nutritious for cattle.',
    20.0,
    ARRAY['PARTIAL_DECAY', 'DECOMPOSED', 'CONTAMINATED'],
    NULL,
    NULL,
    'VSI Pune Agricultural Chemistry and Animal Husbandry notes.'
  ),
  (
    'SUGARCANE_TRASH',
    'ON_FARM_COMPOST',
    TRUE,
    'Excellent for pit composting with bio-culture or in-situ ratoon mulch.',
    35.0,
    ARRAY['CONTAMINATED'],
    0.65,
    'ton_compost_per_ton_residue',
    'ICAR-Indian Institute of Sugarcane Research (IISR).'
  ),
  (
    'SUGARCANE_TRASH',
    'ON_FARM_BIOCHAR',
    TRUE,
    'High lignin-to-cellulose ratio yields dense, high-grade agricultural biochar.',
    20.0,
    ARRAY['DECOMPOSED', 'CONTAMINATED'],
    0.28,
    'ton_biochar_per_ton_residue',
    'Illustrative test assumption benchmarked from biochar pyrolyzer trials.'
  ),
  (
    'SOYBEAN_STRAW',
    'SELL_RAW_FODDER',
    TRUE,
    'Rich in crude protein (6-8%) and palatable pod husk residues for cattle.',
    16.0,
    ARRAY['DECOMPOSED', 'CONTAMINATED'],
    NULL,
    NULL,
    'ICAR-Indian Institute of Soybean Research (IISR) Indore.'
  ),
  (
    'SOYBEAN_STRAW',
    'SELL_RAW_BIOMASS',
    TRUE,
    'High energy density suitable for agro-pellet and briquette extrusion.',
    20.0,
    ARRAY['DECOMPOSED', 'CONTAMINATED'],
    NULL,
    NULL,
    'Biomass Energy Research Association benchmarks.'
  ),
  (
    'SOYBEAN_STRAW',
    'ON_FARM_COMPOST',
    TRUE,
    'Rapidly decomposing legume straw with low C:N ratio that enriches soil nitrogen.',
    30.0,
    ARRAY['CONTAMINATED'],
    0.60,
    'ton_compost_per_ton_residue',
    'Soil Science Society of India composting manual.'
  )
ON CONFLICT (crop_type, pathway_name) DO UPDATE SET
  is_eligible = EXCLUDED.is_eligible,
  rationale = EXCLUDED.rationale,
  max_moisture_allowed = EXCLUDED.max_moisture_allowed,
  conversion_yield = EXCLUDED.conversion_yield,
  source_note = EXCLUDED.source_note,
  updated_at = CURRENT_TIMESTAMP;

-- 4. Seed Buyer Demand
INSERT INTO buyer_requirements (
  id, buyer_id, crop_type, pathway, min_quantity_tons, max_quantity_tons, 
  max_moisture_pct, offered_price_per_ton, currency, service_radius_km, location, 
  pickup_capability, terms, is_active
)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'SUGARCANE_TRASH',
    'SELL_RAW_BIOMASS',
    5.00,
    500.00,
    22.0,
    1800.00,
    'INR',
    40.00,
    ST_SetSRID(ST_MakePoint(74.4080, 16.6210), 4326),
    TRUE,
    'Weighment at mill gate. Moisture penalty applies above 18%. Pickup available within 30 km.',
    TRUE
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'SOYBEAN_STRAW',
    'SELL_RAW_FODDER',
    2.00,
    200.00,
    15.0,
    3200.00,
    'INR',
    35.00,
    ST_SetSRID(ST_MakePoint(74.2700, 16.6400), 4326),
    TRUE,
    'Clean straw with no fungal infection accepted.',
    TRUE
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'PADDY_STRAW',
    'SELL_RAW_BIOMASS',
    3.00,
    300.00,
    20.0,
    2100.00,
    'INR',
    50.00,
    ST_SetSRID(ST_MakePoint(74.4500, 16.7450), 4326),
    FALSE,
    'Baled straw preferred. Fixed freight incentive given for direct farmer delivery.',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Residue Listings
INSERT INTO residue_listings (
  id, farmer_id, crop_type, quantity_tons, moisture_pct, condition, storage_type, 
  location, photo_url, availability_start, availability_end, status
)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'SUGARCANE_TRASH',
    10.00,
    14.0,
    'FRESH',
    'LOOSE',
    ST_SetSRID(ST_MakePoint(74.2433, 16.7050), 4326),
    'https://images.unsplash.com/photo-1595856417767-f370c0c6607e?auto=format&fit=crop&w=600&q=80',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'ACTIVE'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000002',
    'SOYBEAN_STRAW',
    8.00,
    12.0,
    'FRESH',
    'BALED',
    ST_SetSRID(ST_MakePoint(74.5985, 16.7358), 4326),
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '20 days',
    'ACTIVE'
  )
ON CONFLICT (id) DO NOTHING;
