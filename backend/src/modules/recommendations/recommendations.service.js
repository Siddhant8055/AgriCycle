const { pool } = require('../../config/database');
const valuationService = require('./valuation.service');
const { AppError } = require('../../middlewares/errorHandler');
const { parseCoordinates, haversineDistanceKm } = require('../../utils/geo');

class RecommendationsService {
  async getCostParameters() {
    const result = await pool.query('SELECT key, value_number FROM system_cost_parameters;');
    const params = {};
    result.rows.forEach((row) => {
      params[row.key] = parseFloat(row.value_number);
    });
    return params;
  }

  async getListingDetails(listingId) {
    const sql = `
      SELECT 
        r.id,
        r.farmer_id,
        r.crop_type,
        r.quantity_tons,
        r.moisture_pct,
        r.condition,
        r.storage_type,
        r.status,
        r.location,
        u.name as farmer_name,
        u.address as farmer_address
      FROM residue_listings r
      JOIN users u ON r.farmer_id = u.id
      WHERE r.id = $1;
    `;
    const result = await pool.query(sql, [listingId]);
    if (result.rows.length === 0) {
      throw new AppError('Listing not found', 404, 'NOT_FOUND');
    }
    const row = result.rows[0];
    const coords = parseCoordinates(row.location);
    return {
      ...row,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  }

  async getEligibleRules(cropType) {
    const sql = `
      SELECT crop_type, pathway_name, is_eligible, rationale, max_moisture_allowed, disallowed_conditions, conversion_yield
      FROM pathway_rules
      WHERE crop_type = $1;
    `;
    const result = await pool.query(sql, [cropType]);
    return result.rows;
  }

  async findMatchedBuyers(listing, cropType) {
    const sql = `
      SELECT 
        br.id as requirement_id,
        br.buyer_id,
        br.crop_type,
        br.pathway,
        br.min_quantity_tons,
        br.max_quantity_tons,
        br.max_moisture_pct,
        br.offered_price_per_ton,
        br.service_radius_km,
        br.terms,
        br.location,
        u.name as buyer_name,
        u.address as buyer_address,
        u.phone as buyer_phone
      FROM buyer_requirements br
      JOIN users u ON br.buyer_id = u.id
      WHERE (br.crop_type = $1 OR br.crop_type = 'ALL_BIOMASS')
        AND br.is_active = TRUE
      ORDER BY br.offered_price_per_ton DESC;
    `;
    const result = await pool.query(sql, [cropType]);

    const matched = [];
    for (const row of result.rows) {
      const bCoords = parseCoordinates(row.location);
      const distanceKm = haversineDistanceKm(listing.latitude, listing.longitude, bCoords.latitude, bCoords.longitude);
      const serviceRadius = parseFloat(row.service_radius_km) || 40;
      if (distanceKm <= serviceRadius) {
        matched.push({
          ...row,
          distance_km: distanceKm,
        });
      }
    }
    return matched;
  }

  async generateRecommendations(listingId) {
    const listing = await this.getListingDetails(listingId);
    const costParams = await this.getCostParameters();
    const rules = await this.getEligibleRules(listing.crop_type);
    const matchedBuyers = await this.findMatchedBuyers(listing, listing.crop_type);

    const qty = parseFloat(listing.quantity_tons);
    const moisture = parseFloat(listing.moisture_pct) || 15;
    const cond = listing.condition;

    const recommendations = [];

    // 1. Direct Sale to Buyer (Biomass Power / Briquette)
    const biomassRule = rules.find((r) => r.pathway_name === 'SELL_RAW_BIOMASS');
    const matchedBiomassBuyer = matchedBuyers.find((b) => b.pathway === 'SELL_RAW_BIOMASS');

    const biomassPrice = matchedBiomassBuyer ? parseFloat(matchedBiomassBuyer.offered_price_per_ton) : 2100;
    const biomassDist = matchedBiomassBuyer ? parseFloat(matchedBiomassBuyer.distance_km) : 22.0;
    const biomassBuyerName = matchedBiomassBuyer ? matchedBiomassBuyer.buyer_name : 'Kolhapur Bio-Energy Co-gen';

    const isBiomassMoistureOk = !biomassRule || !biomassRule.max_moisture_allowed || moisture <= parseFloat(biomassRule.max_moisture_allowed);
    const isBiomassCondOk = !biomassRule || !biomassRule.disallowed_conditions || !biomassRule.disallowed_conditions.includes(cond);

    if (biomassRule && biomassRule.is_eligible && isBiomassMoistureOk && isBiomassCondOk) {
      const biomassEval = valuationService.calculateRawSaleNRV({
        quantityTons: qty,
        distanceKm: biomassDist,
        offeredPricePerTon: biomassPrice,
        condition: cond,
        costParams,
      });

      recommendations.push({
        id: 'direct_sale_biomass',
        type: 'direct_sale',
        label: 'Direct Sale to Biomass Co-gen',
        buyer: biomassBuyerName,
        buyerId: matchedBiomassBuyer ? matchedBiomassBuyer.buyer_id : null,
        requirementId: matchedBiomassBuyer ? matchedBiomassBuyer.requirement_id : null,
        eligible: true,
        grossRevenue: biomassEval.grossRevenue,
        transportCost: biomassEval.transportCost,
        handlingCost: biomassEval.handlingCost,
        processingCost: 0,
        netProceeds: biomassEval.netProceeds,
        priceUnit: `₹${biomassPrice}/t`,
        distance: `${biomassDist} km`,
        quantity: `${qty} t`,
        color: '#047857',
        rationale: matchedBiomassBuyer
          ? `Verified buyer within ${biomassDist} km with active purchase contract.`
          : 'High boiler calorific demand in Kolhapur regional industrial cluster.',
        assumptions: [
          `Transport: fixed ₹${costParams.fixed_transport_base_fee || 500} + ₹${costParams.variable_transport_per_ton_km || 25}/t-km`,
          `Handling & Baling: ₹${(costParams.baling_cost_per_ton || 400) + (costParams.loading_handling_cost_per_ton || 150)}/t`,
        ],
        uncertainty: 'Actual freight varies slightly with road routing.',
        range: biomassEval.range,
      });
    } else {
      recommendations.push({
        id: 'direct_sale_biomass',
        type: 'direct_sale',
        label: 'Direct Sale to Biomass Co-gen',
        eligible: false,
        exclusionReason: !isBiomassMoistureOk
          ? `Moisture (${moisture}%) exceeds boiler ceiling (${biomassRule.max_moisture_allowed}%). Lot requires drying.`
          : 'Disqualified by condition degradation.',
        grossRevenue: null,
        netProceeds: null,
        color: '#b42318',
      });
    }

    // 2. On-Farm Compost Pathway
    const compostRule = rules.find((r) => r.pathway_name === 'ON_FARM_COMPOST');
    const isCompostOk = compostRule ? compostRule.is_eligible : true;

    const compostEval = valuationService.calculateCompostNRV({
      quantityTons: qty,
      costParams,
    });

    if (isCompostOk) {
      recommendations.push({
        id: 'on_farm_compost',
        type: 'compost',
        label: 'On-Farm Compost Pathway',
        buyer: null,
        eligible: true,
        grossRevenue: compostEval.grossRevenue,
        transportCost: 0,
        handlingCost: compostEval.handlingCost,
        processingCost: compostEval.processingCost,
        netProceeds: compostEval.netProceeds,
        priceUnit: `₹${costParams.compost_local_market_price_per_ton || 2500}/t compost`,
        distance: '0 km (On-Farm)',
        quantity: `${qty} t → ~${compostEval.outputTonnes} t compost`,
        color: '#059669',
        rationale: compostRule ? compostRule.rationale : 'Enriches soil organic carbon without incurring road freight expenses.',
        assumptions: [
          `Yield: ${((costParams.compost_conversion_ratio || 0.6) * 100)}% finished compost yield`,
          `Pit turning & labor: ₹${costParams.compost_pit_labor_cost_per_ton || 300}/t`,
        ],
        uncertainty: 'Compost market realization depends on local nursery and vineyard demand.',
        range: compostEval.range,
      });
    }

    // 3. On-Farm Biochar Production
    const biocharRule = rules.find((r) => r.pathway_name === 'ON_FARM_BIOCHAR');
    const isBiocharOk = biocharRule ? biocharRule.is_eligible : true;

    const biocharEval = valuationService.calculateBiocharNRV({
      quantityTons: qty,
      costParams,
    });

    if (isBiocharOk) {
      recommendations.push({
        id: 'on_farm_biochar',
        type: 'biochar',
        label: 'Biochar Pyrolysis Production',
        buyer: 'BioChar India / Local Agricultural Co-op',
        eligible: true,
        grossRevenue: biocharEval.grossRevenue,
        transportCost: 0,
        handlingCost: biocharEval.handlingCost,
        processingCost: biocharEval.processingCost,
        netProceeds: biocharEval.netProceeds,
        priceUnit: `₹${costParams.biochar_local_market_price_per_ton || 12000}/t biochar`,
        distance: 'On-Farm Kiln',
        quantity: `${qty} t → ~${biocharEval.outputTonnes} t biochar`,
        color: '#d97706',
        rationale: biocharRule ? biocharRule.rationale : 'High-grade carbon sequestration product with durable soil conditioning value.',
        assumptions: [
          `Pyrolysis conversion yield: ${((costParams.biochar_conversion_ratio || 0.25) * 100)}%`,
          `Kiln maintenance & labor: ₹${costParams.biochar_kiln_processing_cost_per_ton || 1500}/t`,
        ],
        uncertainty: 'Requires decentralized low-cost kiln or custom-hiring pyrolyzer.',
        range: biocharEval.range,
      });
    }

    // 4. Animal Fodder Pathway
    const fodderRule = rules.find((r) => r.pathway_name === 'SELL_RAW_FODDER');
    const matchedFodderBuyer = matchedBuyers.find((b) => b.pathway === 'SELL_RAW_FODDER');

    if (fodderRule && fodderRule.is_eligible && matchedFodderBuyer) {
      const fodderPrice = parseFloat(matchedFodderBuyer.offered_price_per_ton);
      const fodderDist = parseFloat(matchedFodderBuyer.distance_km);
      const fodderEval = valuationService.calculateRawSaleNRV({
        quantityTons: qty,
        distanceKm: fodderDist,
        offeredPricePerTon: fodderPrice,
        condition: cond,
        costParams,
      });

      recommendations.push({
        id: 'animal_fodder',
        type: 'fodder',
        label: 'Cattle Feed / Dairy Procurer',
        buyer: matchedFodderBuyer.buyer_name,
        buyerId: matchedFodderBuyer.buyer_id,
        requirementId: matchedFodderBuyer.requirement_id,
        eligible: true,
        grossRevenue: fodderEval.grossRevenue,
        transportCost: fodderEval.transportCost,
        handlingCost: fodderEval.handlingCost,
        processingCost: 0,
        netProceeds: fodderEval.netProceeds,
        priceUnit: `₹${fodderPrice}/t`,
        distance: `${fodderDist} km`,
        quantity: `${qty} t`,
        color: '#2563eb',
        rationale: 'High palatability and crude protein value accepted by local dairy cooperative.',
        assumptions: [`Dairy procurement rate: ₹${fodderPrice}/t at farm-gate delivery`],
        range: fodderEval.range,
      });
    } else {
      recommendations.push({
        id: 'animal_fodder',
        type: 'fodder',
        label: 'Cattle Feed / Dairy Procurer',
        eligible: false,
        exclusionReason: fodderRule ? fodderRule.rationale : 'Crop residue has high silica or low digestibility unsuitable for direct livestock fodder.',
        grossRevenue: null,
        netProceeds: null,
        color: '#b42318',
      });
    }

    // Sort eligible pathways descending by net take-home proceeds
    const eligibleSorted = recommendations
      .filter((r) => r.eligible)
      .sort((a, b) => b.netProceeds - a.netProceeds);

    const ineligible = recommendations.filter((r) => !r.eligible);

    eligibleSorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    const finalRankedList = [...eligibleSorted, ...ineligible];

    // Compute Break-Even Distance
    const topSale = eligibleSorted.find((r) => r.type === 'direct_sale' || r.type === 'fodder');
    const compostNet = compostEval.netProceeds;
    let breakEvenKm = 0;
    if (topSale) {
      breakEvenKm = valuationService.calculateBreakEvenDistance({
        quantityTons: qty,
        offeredPricePerTon: biomassPrice,
        condition: cond,
        compostNetProceeds: compostNet,
        costParams,
      });
    }

    // Waterfall breakdown for the top recommendation
    const topPick = eligibleSorted[0] || null;
    const waterfall = topPick
      ? [
          { name: 'Gross Revenue', amount: topPick.grossRevenue, fill: '#047857' },
          { name: 'Transport Cost', amount: -topPick.transportCost, fill: '#d97706' },
          { name: 'Handling & Labor', amount: -(topPick.handlingCost + (topPick.processingCost || 0)), fill: '#dc2626' },
          { name: 'Net Take-Home', amount: topPick.netProceeds, fill: '#10b981' },
        ]
      : [];

    return {
      listingId,
      cropType: listing.crop_type,
      quantityTons: qty,
      breakEvenDistanceKm: breakEvenKm,
      matchedBuyersCount: matchedBuyers.length,
      recommendations: finalRankedList,
      waterfall,
    };
  }
}

module.exports = new RecommendationsService();
