const { pool } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const { parseCoordinates } = require('../../utils/geo');

class BuyersService {
  async getRequirements({ cropType, buyerId, pathway }) {
    const conditions = ['br.is_active = TRUE'];
    const params = [];
    let paramIndex = 1;

    if (cropType) {
      conditions.push(`(br.crop_type = $${paramIndex} OR br.crop_type = 'ALL_BIOMASS')`);
      params.push(cropType.toUpperCase());
      paramIndex++;
    }

    if (buyerId) {
      conditions.push(`br.buyer_id = $${paramIndex}`);
      params.push(buyerId);
      paramIndex++;
    }

    if (pathway) {
      conditions.push(`br.pathway = $${paramIndex}`);
      params.push(pathway.toUpperCase());
      paramIndex++;
    }

    const sql = `
      SELECT 
        br.id,
        br.buyer_id,
        br.crop_type,
        br.pathway,
        br.min_quantity_tons,
        br.max_quantity_tons,
        br.max_moisture_pct,
        br.offered_price_per_ton,
        br.currency,
        br.service_radius_km,
        br.pickup_capability,
        br.terms,
        br.created_at,
        br.location,
        u.name as buyer_name,
        u.phone as buyer_phone,
        u.email as buyer_email,
        u.address as buyer_address
      FROM buyer_requirements br
      JOIN users u ON br.buyer_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY br.created_at DESC;
    `;

    const result = await pool.query(sql, params);
    return result.rows.map((row) => {
      const coords = parseCoordinates(row.location);
      return {
        id: row.id,
        buyerId: row.buyer_id,
        buyerName: row.buyer_name,
        buyerPhone: row.buyer_phone,
        buyerAddress: row.buyer_address,
        cropType: row.crop_type,
        pathway: row.pathway,
        minQuantityTons: parseFloat(row.min_quantity_tons),
        maxQuantityTons: row.max_quantity_tons ? parseFloat(row.max_quantity_tons) : null,
        maxMoisturePct: row.max_moisture_pct ? parseFloat(row.max_moisture_pct) : 20,
        offeredPricePerTon: parseFloat(row.offered_price_per_ton),
        serviceRadiusKm: parseFloat(row.service_radius_km),
        pickupCapability: row.pickup_capability,
        terms: row.terms,
        latitude: coords.latitude,
        longitude: coords.longitude,
        date: new Date(row.created_at).toLocaleDateString(),
      };
    });
  }

  async createRequirement({
    buyerId,
    cropType,
    pathway = 'SELL_RAW_BIOMASS',
    minQuantityTons,
    maxQuantityTons,
    maxMoisturePct,
    offeredPricePerTon,
    serviceRadiusKm,
    latitude,
    longitude,
    terms,
  }) {
    if (!buyerId) throw new AppError('Buyer ID is required', 400);
    if (!cropType) throw new AppError('Crop type is required', 400);

    const minQty = parseFloat(minQuantityTons) || 1.0;
    const maxQty = maxQuantityTons ? parseFloat(maxQuantityTons) : null;
    const price = parseFloat(offeredPricePerTon);
    const radius = parseFloat(serviceRadiusKm) || 40.0;
    const lat = latitude ? parseFloat(latitude) : 16.7050;
    const lng = longitude ? parseFloat(longitude) : 74.2433;
    const locString = `SRID=4326;POINT(${lng} ${lat})`;

    const sql = `
      INSERT INTO buyer_requirements (
        buyer_id, crop_type, pathway, min_quantity_tons, max_quantity_tons,
        max_moisture_pct, offered_price_per_ton, service_radius_km, location, terms, is_active
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9,
        $10, TRUE
      )
      RETURNING id, buyer_id, crop_type, pathway, min_quantity_tons, max_quantity_tons,
                offered_price_per_ton, service_radius_km, created_at;
    `;

    const result = await pool.query(sql, [
      buyerId,
      cropType.toUpperCase(),
      pathway.toUpperCase(),
      minQty,
      maxQty,
      maxMoisturePct ? parseFloat(maxMoisturePct) : 20.0,
      price,
      radius,
      locString,
      terms || null,
    ]);

    return result.rows[0];
  }
}

module.exports = new BuyersService();
