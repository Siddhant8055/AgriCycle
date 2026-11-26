/**
 * Pure Domain Valuation Service
 * Decoupled from HTTP and database libraries for 100% testability.
 * Implements Net Realizable Value (NRV) models: Model A (SELL_RAW) & Model B (FARMER_PROCESSED)
 */

class ValuationService {
  /**
   * Calculate Model A: SELL_RAW (Biomass / Fodder)
   */
  calculateRawSaleNRV({
    quantityTons,
    distanceKm = 15,
    offeredPricePerTon,
    condition = 'FRESH',
    costParams,
  }) {
    const qty = Math.max(0.1, Number(quantityTons));
    const price = Number(offeredPricePerTon);
    const dist = Math.max(0, Number(distanceKm));

    const fixedTransport = Number(costParams.fixed_transport_base_fee || 500);
    const variableTransport = Number(costParams.variable_transport_per_ton_km || 25);
    const balingCost = Number(costParams.baling_cost_per_ton || 400);
    const handlingRate = Number(costParams.loading_handling_cost_per_ton || 150);

    // 1. Gross Revenue
    const grossRevenue = Math.round(qty * price);

    // 2. Quality Penalty
    let qualityMultiplier = 1.0;
    if (condition === 'WEATHERED') qualityMultiplier = 0.90;
    else if (condition === 'PARTIAL_DECAY') qualityMultiplier = 0.75;
    else if (condition === 'DECOMPOSED') qualityMultiplier = 0.50;
    else if (condition === 'CONTAMINATED') qualityMultiplier = 0.20;

    const qualityDeduction = Math.round(grossRevenue * (1 - qualityMultiplier));

    // 3. Transport Cost (Geodesic distance * 1.3 road tortuosity)
    const roadFactor = 1.3;
    const transportCost = Math.round(fixedTransport + (dist * roadFactor * qty * variableTransport));

    // 4. Handling & Baling
    const handlingCost = Math.round(qty * (balingCost + handlingRate));

    // 5. Net Realizable Value (NRV)
    const netProceeds = Math.round(grossRevenue - qualityDeduction - transportCost - handlingCost);

    return {
      grossRevenue,
      qualityDeduction,
      transportCost,
      handlingCost,
      processingCost: 0,
      netProceeds,
      breakdown: {
        gross: grossRevenue,
        quality: -qualityDeduction,
        transport: -transportCost,
        handling: -handlingCost,
        net: netProceeds,
      },
      range: {
        low: Math.round(netProceeds * 0.90),
        expected: netProceeds,
        high: Math.round(netProceeds * 1.10),
      },
    };
  }

  /**
   * Calculate Model B: FARMER_PROCESSED (On-Farm Compost)
   */
  calculateCompostNRV({ quantityTons, costParams }) {
    const qty = Math.max(0.1, Number(quantityTons));

    const conversionRatio = Number(costParams.compost_conversion_ratio || 0.60);
    const marketPrice = Number(costParams.compost_local_market_price_per_ton || 2500);
    const pitLaborCost = Number(costParams.compost_pit_labor_cost_per_ton || 300);
    const handlingRate = Number(costParams.loading_handling_cost_per_ton || 150);

    const outputTonnes = parseFloat((qty * conversionRatio).toFixed(2));
    const grossRevenue = Math.round(outputTonnes * marketPrice);
    const processingCost = Math.round(qty * pitLaborCost);
    const handlingCost = Math.round(qty * handlingRate);
    const transportCost = 0; // On-farm decomposition

    const netProceeds = Math.round(grossRevenue - processingCost - handlingCost);

    return {
      outputTonnes,
      grossRevenue,
      qualityDeduction: 0,
      transportCost,
      handlingCost,
      processingCost,
      netProceeds,
      breakdown: {
        gross: grossRevenue,
        processing: -processingCost,
        handling: -handlingCost,
        transport: 0,
        net: netProceeds,
      },
      range: {
        low: Math.round(netProceeds * 0.88),
        expected: netProceeds,
        high: Math.round(netProceeds * 1.12),
      },
    };
  }

  /**
   * Calculate Model B: FARMER_PROCESSED (On-Farm Biochar)
   */
  calculateBiocharNRV({ quantityTons, costParams }) {
    const qty = Math.max(0.1, Number(quantityTons));

    const conversionRatio = Number(costParams.biochar_conversion_ratio || 0.25);
    const marketPrice = Number(costParams.biochar_local_market_price_per_ton || 12000);
    const kilnProcessingCost = Number(costParams.biochar_kiln_processing_cost_per_ton || 1500);
    const handlingRate = Number(costParams.loading_handling_cost_per_ton || 150);

    const outputTonnes = parseFloat((qty * conversionRatio).toFixed(2));
    const grossRevenue = Math.round(outputTonnes * marketPrice);
    const processingCost = Math.round(qty * kilnProcessingCost);
    const handlingCost = Math.round(qty * handlingRate);
    const transportCost = 0;

    const netProceeds = Math.round(grossRevenue - processingCost - handlingCost);

    return {
      outputTonnes,
      grossRevenue,
      qualityDeduction: 0,
      transportCost,
      handlingCost,
      processingCost,
      netProceeds,
      breakdown: {
        gross: grossRevenue,
        processing: -processingCost,
        handling: -handlingCost,
        transport: 0,
        net: netProceeds,
      },
      range: {
        low: Math.round(netProceeds * 0.85),
        expected: netProceeds,
        high: Math.round(netProceeds * 1.15),
      },
    };
  }

  /**
   * Calculate Break-Even Transport Distance (D_be in km)
   * The distance where direct sale profit equals on-farm composting profit.
   */
  calculateBreakEvenDistance({
    quantityTons,
    offeredPricePerTon,
    condition = 'FRESH',
    compostNetProceeds,
    costParams,
  }) {
    const qty = Math.max(0.1, Number(quantityTons));
    const price = Number(offeredPricePerTon);
    const fixedTransport = Number(costParams.fixed_transport_base_fee || 500);
    const variableTransport = Number(costParams.variable_transport_per_ton_km || 25);
    const balingCost = Number(costParams.baling_cost_per_ton || 400);
    const handlingRate = Number(costParams.loading_handling_cost_per_ton || 150);

    const gross = qty * price;
    let qualityMul = 1.0;
    if (condition === 'WEATHERED') qualityMul = 0.90;
    else if (condition === 'PARTIAL_DECAY') qualityMul = 0.75;

    const netBeforeTransport = (gross * qualityMul) - (qty * (balingCost + handlingRate));
    const allowableTransportExpense = netBeforeTransport - compostNetProceeds;

    if (allowableTransportExpense <= fixedTransport) {
      return 0; // Already worse than compost even at 0 km
    }

    const roadFactor = 1.3;
    const breakEvenKm = (allowableTransportExpense - fixedTransport) / (roadFactor * qty * variableTransport);
    return Math.max(0, Math.round(breakEvenKm));
  }
}

module.exports = new ValuationService();
