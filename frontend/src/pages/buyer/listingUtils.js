function numericValue(value) {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getListingPrice(listing) {
  return numericValue(listing.price);
}

export function filterListings(listings, filters = {}) {
  const {
    search = '',
    crop = '',
    condition = '',
    minPrice = '',
    maxPrice = '',
  } = filters;
  const query = search.trim().toLowerCase();
  const normalizedCrop = crop.trim().toLowerCase();

  return listings.filter((listing) => {
    const matchesSearch = !query || [
      listing.crop,
      listing.farmer,
      listing.location,
      listing.condition,
      listing.storageForm,
      ...(listing.uses || []),
    ].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesCrop = !normalizedCrop || listing.crop.toLowerCase().includes(normalizedCrop);
    const matchesCondition = !condition || listing.condition === condition;
    const price = getListingPrice(listing);
    const matchesMinPrice = minPrice === '' || price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= Number(maxPrice);

    return matchesSearch && matchesCrop && matchesCondition && matchesMinPrice && matchesMaxPrice;
  });
}

export function sortListings(listings, sort) {
  const sorted = [...listings];

  if (sort === 'newest') {
    return sorted.sort((a, b) => numericValue(a.postedDays) - numericValue(b.postedDays));
  }
  if (sort === 'price_asc') {
    return sorted.sort((a, b) => getListingPrice(a) - getListingPrice(b));
  }
  if (sort === 'price_desc') {
    return sorted.sort((a, b) => getListingPrice(b) - getListingPrice(a));
  }
  if (sort === 'distance') {
    return sorted.sort((a, b) => numericValue(a.distance) - numericValue(b.distance));
  }
  if (sort === 'qty_desc') {
    return sorted.sort((a, b) => numericValue(b.qty) - numericValue(a.qty));
  }

  return sorted;
}
