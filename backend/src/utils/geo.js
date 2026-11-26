const parseCoordinates = (loc) => {
  if (!loc) return { latitude: 16.7050, longitude: 74.2433 };
  if (typeof loc === 'object' && loc.latitude !== undefined && loc.longitude !== undefined) {
    return loc;
  }
  const str = String(loc);
  const match = str.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }
  return { latitude: 16.7050, longitude: 74.2433 };
};

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 15.0; // fallback standard 15 km
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

module.exports = {
  parseCoordinates,
  haversineDistanceKm,
};
