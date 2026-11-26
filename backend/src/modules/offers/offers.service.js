const { pool } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class OffersService {
  async getOffers({ userId, role, listingId }) {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (userId) {
      if (role === 'BUYER') {
        conditions.push(`o.buyer_id = $${paramIndex++}`);
        params.push(userId);
      } else if (role === 'FARMER') {
        conditions.push(`o.farmer_id = $${paramIndex++}`);
        params.push(userId);
      } else {
        conditions.push(`(o.farmer_id = $${paramIndex} OR o.buyer_id = $${paramIndex})`);
        params.push(userId);
        paramIndex++;
      }
    }

    if (listingId) {
      conditions.push(`o.listing_id = $${paramIndex++}`);
      params.push(listingId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        o.id,
        o.listing_id,
        o.buyer_id,
        o.farmer_id,
        o.pathway,
        o.proposed_quantity_tons,
        o.agreed_price_per_ton,
        o.status,
        o.message,
        o.created_at,
        r.crop_type,
        r.storage_type,
        buyer.name as buyer_name,
        buyer.phone as buyer_phone,
        farmer.name as farmer_name,
        farmer.phone as farmer_phone
      FROM offers o
      JOIN residue_listings r ON o.listing_id = r.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users farmer ON o.farmer_id = farmer.id
      ${whereClause}
      ORDER BY o.created_at DESC;
    `;

    const result = await pool.query(sql, params);
    return result.rows.map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      buyerId: row.buyer_id,
      buyerName: row.buyer_name,
      buyerPhone: row.buyer_phone,
      farmerId: row.farmer_id,
      farmerName: row.farmer_name,
      farmerPhone: row.farmer_phone,
      cropType: row.crop_type,
      crop: row.crop_type.replace(/_/g, ' '),
      pathway: row.pathway,
      quantityTons: parseFloat(row.proposed_quantity_tons),
      qty: `${parseFloat(row.proposed_quantity_tons)} tonnes`,
      pricePerTon: parseFloat(row.agreed_price_per_ton),
      offer: `₹${parseFloat(row.agreed_price_per_ton)}/t`,
      status: (row.status || 'PENDING').toLowerCase(),
      statusRaw: row.status,
      message: row.message,
      createdAt: row.created_at,
      time: new Date(row.created_at).toLocaleDateString(),
    }));
  }

  async createOffer({
    listingId,
    buyerId,
    farmerId,
    pathway = 'SELL_RAW_BIOMASS',
    proposedQuantityTons,
    agreedPricePerTon,
    message,
  }) {
    if (!listingId) throw new AppError('Listing ID is required', 400);

    // Look up listing to get farmer_id if not supplied
    let fId = farmerId;
    if (!fId) {
      const listingRes = await pool.query('SELECT farmer_id, quantity_tons FROM residue_listings WHERE id = $1', [listingId]);
      if (listingRes.rows.length === 0) throw new AppError('Listing not found', 404);
      fId = listingRes.rows[0].farmer_id;
      if (!proposedQuantityTons) proposedQuantityTons = listingRes.rows[0].quantity_tons;
    }

    const bId = buyerId || 'b0000000-0000-0000-0000-000000000001';
    const qty = parseFloat(proposedQuantityTons) || 10;
    const price = parseFloat(agreedPricePerTon) || 1800;

    const sql = `
      INSERT INTO offers (
        listing_id, buyer_id, farmer_id, pathway, proposed_quantity_tons, agreed_price_per_ton, message, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
      RETURNING id, listing_id, buyer_id, farmer_id, pathway, proposed_quantity_tons, agreed_price_per_ton, status, created_at;
    `;

    const result = await pool.query(sql, [listingId, bId, fId, pathway, qty, price, message || null]);
    return result.rows[0];
  }

  async updateOfferStatus(offerId, status, userId) {
    const allowed = ['PENDING', 'ACCEPTED', 'REJECTED', 'CONFIRMED', 'CANCELLED'];
    const norm = status.toUpperCase();
    if (!allowed.includes(norm)) {
      throw new AppError(`Invalid status. Must be one of: ${allowed.join(', ')}`, 400);
    }

    const sql = `
      UPDATE offers
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, updated_at;
    `;
    const result = await pool.query(sql, [norm, offerId]);
    if (result.rows.length === 0) throw new AppError('Offer not found', 404);
    return result.rows[0];
  }
}

module.exports = new OffersService();
