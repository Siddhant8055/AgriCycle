const { pool } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parseCoordinates, haversineDistanceKm } = require('../../utils/geo');

const CROP_TYPE_MAP = {
  paddy_straw: 'PADDY_STRAW',
  wheat_straw: 'WHEAT_STRAW',
  sugarcane_residue: 'SUGARCANE_TRASH',
  sugarcane_trash: 'SUGARCANE_TRASH',
  soybean_stover: 'SOYBEAN_STRAW',
  soybean_straw: 'SOYBEAN_STRAW',
  cotton_stalks: 'COTTON_STALKS',
  maize_stalks: 'CORN_STALKS',
  corn_stalks: 'CORN_STALKS',
};

const DISPLAY_CROP_NAMES = {
  PADDY_STRAW: 'Paddy Straw',
  WHEAT_STRAW: 'Wheat Straw',
  SUGARCANE_TRASH: 'Sugarcane Residue',
  SOYBEAN_STRAW: 'Soybean Stover',
  COTTON_STALKS: 'Cotton Stalks',
  CORN_STALKS: 'Maize Stalks',
};

const CROP_EMOJIS = {
  PADDY_STRAW: '🌾',
  WHEAT_STRAW: '🌱',
  SUGARCANE_TRASH: '🎋',
  SOYBEAN_STRAW: '🌿',
  COTTON_STALKS: '🌸',
  CORN_STALKS: '🌽',
};

const normalizeCrop = (crop) => {
  if (!crop) return 'PADDY_STRAW';
  const lower = crop.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return CROP_TYPE_MAP[lower] || crop.toUpperCase();
};

const normalizeCondition = (cond) => {
  if (!cond) return 'FRESH';
  const c = cond.toUpperCase().trim();
  if (['DRY', 'SEMI_DRY', 'FRESH'].includes(c)) {
    if (c === 'DRY') return 'FRESH';
    if (c === 'SEMI_DRY') return 'WEATHERED';
    return 'FRESH';
  }
  if (['FRESH', 'WEATHERED', 'PARTIAL_DECAY', 'DECOMPOSED', 'CONTAMINATED'].includes(c)) {
    return c;
  }
  return 'FRESH';
};

const normalizeStorage = (storage) => {
  if (!storage) return 'LOOSE';
  const s = storage.toUpperCase().trim();
  return s === 'BALED' ? 'BALED' : 'LOOSE';
};

class ListingsService {
  async getAllListings({ farmerId, cropType, status, search, limit = 50 }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (farmerId) {
      conditions.push(`r.farmer_id = $${paramIndex++}`);
      params.push(farmerId);
    }

    if (status) {
      conditions.push(`r.status = $${paramIndex++}`);
      params.push(status.toUpperCase());
    }

    if (cropType) {
      conditions.push(`r.crop_type = $${paramIndex++}`);
      params.push(normalizeCrop(cropType));
    }

    if (search) {
      conditions.push(`(
        r.crop_type ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR 
        u.address ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        r.id,
        r.farmer_id,
        r.crop_type,
        r.quantity_tons,
        r.moisture_pct,
        r.condition,
        r.storage_type,
        r.location,
        r.photo_url,
        r.availability_start,
        r.availability_end,
        r.status,
        r.created_at,
        u.name as farmer_name,
        u.phone as farmer_phone,
        u.email as farmer_email,
        u.address as farmer_address
      FROM residue_listings r
      JOIN users u ON r.farmer_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex};
    `;
    params.push(limit);

    const result = await pool.query(sql, params);

    // Get active buyer requirements to compute buyer interest
    const buyersResult = await pool.query(
      'SELECT crop_type, location, service_radius_km FROM buyer_requirements WHERE is_active = TRUE;'
    );
    const activeRequirements = buyersResult.rows;

    return result.rows.map((row) => this.formatListing(row, activeRequirements));
  }

  async getListingById(id) {
    const sql = `
      SELECT 
        r.id,
        r.farmer_id,
        r.crop_type,
        r.quantity_tons,
        r.moisture_pct,
        r.condition,
        r.storage_type,
        r.location,
        r.photo_url,
        r.availability_start,
        r.availability_end,
        r.status,
        r.created_at,
        u.name as farmer_name,
        u.phone as farmer_phone,
        u.email as farmer_email,
        u.address as farmer_address
      FROM residue_listings r
      JOIN users u ON r.farmer_id = u.id
      WHERE r.id = $1;
    `;

    const result = await pool.query(sql, [id]);
    if (result.rows.length === 0) {
      throw new AppError('Residue listing not found', 404, 'NOT_FOUND');
    }

    const buyersResult = await pool.query(
      'SELECT crop_type, location, service_radius_km FROM buyer_requirements WHERE is_active = TRUE;'
    );
    return this.formatListing(result.rows[0], buyersResult.rows);
  }

  async createListing({
    farmerId,
    cropType,
    quantity,
    moisturePct,
    condition,
    storageType,
    latitude,
    longitude,
    photoUrl,
    availabilityStart,
    availabilityEnd,
    askingPrice,
    address,
  }) {
    if (!farmerId) throw new AppError('Farmer ID is required', 400);
    if (!cropType) throw new AppError('Crop type is required', 400);
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) throw new AppError('Quantity must be greater than 0 tonnes', 400);

    const normalizedCrop = normalizeCrop(cropType);
    const normalizedCond = normalizeCondition(condition);
    const normalizedStorage = normalizeStorage(storageType);
    const moisture = moisturePct ? parseFloat(moisturePct) : (normalizedCond === 'FRESH' ? 14.0 : 22.0);

    const lat = latitude ? parseFloat(latitude) : 16.7050;
    const lng = longitude ? parseFloat(longitude) : 74.2433;
    const locString = `SRID=4326;POINT(${lng} ${lat})`;

    const sql = `
      INSERT INTO residue_listings (
        farmer_id, crop_type, quantity_tons, moisture_pct, condition, storage_type,
        location, photo_url, availability_start, availability_end, status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7,
        $8,
        COALESCE($9::date, CURRENT_DATE),
        COALESCE($10::date, CURRENT_DATE + INTERVAL '30 days'),
        'ACTIVE'
      )
      RETURNING id, farmer_id, crop_type, quantity_tons, moisture_pct, condition, storage_type,
                location, photo_url, availability_start, availability_end, status, created_at;
    `;

    const result = await pool.query(sql, [
      farmerId,
      normalizedCrop,
      qty,
      moisture,
      normalizedCond,
      normalizedStorage,
      locString,
      photoUrl || null,
      availabilityStart || null,
      availabilityEnd || null,
    ]);

    return this.getListingById(result.rows[0].id);
  }

  async updateListingStatus(id, status, userId) {
    const allowed = ['ACTIVE', 'MATCHED', 'CLOSED', 'CANCELLED'];
    const norm = status.toUpperCase();
    if (!allowed.includes(norm)) {
      throw new AppError(`Invalid status. Must be one of: ${allowed.join(', ')}`, 400);
    }

    const checkSql = `SELECT farmer_id FROM residue_listings WHERE id = $1`;
    const checkRes = await pool.query(checkSql, [id]);
    if (checkRes.rows.length === 0) throw new AppError('Listing not found', 404);

    if (userId && checkRes.rows[0].farmer_id !== userId) {
      throw new AppError('You do not have permission to modify this listing', 403);
    }

    const sql = `
      UPDATE residue_listings
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status;
    `;
    const result = await pool.query(sql, [norm, id]);
    return result.rows[0];
  }

  async deleteListing(id, userId) {
    const checkSql = `SELECT farmer_id FROM residue_listings WHERE id = $1`;
    const checkRes = await pool.query(checkSql, [id]);
    if (checkRes.rows.length === 0) throw new AppError('Listing not found', 404);

    if (userId && checkRes.rows[0].farmer_id !== userId) {
      throw new AppError('You do not have permission to delete this listing', 403);
    }

    await pool.query('DELETE FROM residue_listings WHERE id = $1', [id]);
    return { success: true, message: 'Listing deleted successfully' };
  }

  formatListing(row, activeRequirements = []) {
    const cropName = DISPLAY_CROP_NAMES[row.crop_type] || row.crop_type;
    const emoji = CROP_EMOJIS[row.crop_type] || '🌾';
    const qtyTons = parseFloat(row.quantity_tons);
    const coords = parseCoordinates(row.location);

    // Calculate interested buyers within radius
    let buyerInterest = 0;
    if (activeRequirements && activeRequirements.length > 0) {
      buyerInterest = activeRequirements.filter((req) => {
        const matchesCrop = req.crop_type === row.crop_type || req.crop_type === 'ALL_BIOMASS';
        if (!matchesCrop) return false;
        const bCoords = parseCoordinates(req.location);
        const dist = haversineDistanceKm(coords.latitude, coords.longitude, bCoords.latitude, bCoords.longitude);
        return dist <= (parseFloat(req.service_radius_km) || 40);
      }).length;
    }

    // Indicative asking price benchmark based on crop
    const benchmarkRates = {
      PADDY_STRAW: 850,
      SUGARCANE_TRASH: 1200,
      SOYBEAN_STRAW: 750,
      WHEAT_STRAW: 600,
      COTTON_STALKS: 550,
      CORN_STALKS: 500,
    };
    const rate = benchmarkRates[row.crop_type] || 700;

    return {
      id: row.id,
      farmerId: row.farmer_id,
      crop: cropName,
      cropType: row.crop_type,
      emoji,
      qty: `${qtyTons} tonnes`,
      quantityTons: qtyTons,
      moisturePct: parseFloat(row.moisture_pct) || 15,
      condition: row.condition === 'FRESH' ? 'Dry' : (row.condition === 'WEATHERED' ? 'Semi-dry' : row.condition),
      conditionRaw: row.condition,
      storageForm: row.storage_type === 'BALED' ? 'Baled' : 'Loose',
      storageType: row.storage_type,
      price: `₹${rate}/t`,
      pricePerTon: rate,
      askingTotal: `₹${(qtyTons * rate).toLocaleString('en-IN')}`,
      status: (row.status || 'ACTIVE').toLowerCase(),
      statusRaw: row.status,
      date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      availableFrom: row.availability_start ? new Date(row.availability_start).toLocaleDateString() : 'Immediate',
      buyers: buyerInterest,
      location: row.farmer_address || 'Kolhapur District',
      latitude: coords.latitude,
      longitude: coords.longitude,
      farmer: row.farmer_name || 'Farmer',
      farmerPhone: row.farmer_phone,
      farmerEmail: row.farmer_email,
      photoUrl: row.photo_url,
      uses: ['Biomass Energy', 'Compost', 'Biochar', 'Animal Fodder'],
    };
  }
}

module.exports = new ListingsService();
