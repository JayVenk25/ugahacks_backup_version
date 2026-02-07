// Cauley Creek Park approximate coordinates (Duluth, Georgia)
const PARK_CENTER_LAT = 33.9784;
const PARK_CENTER_LNG = -84.1315;
const PARK_RADIUS_KM = 0.5; // 500 meter radius

// Calculate distance between two coordinates in kilometers
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Check if coordinates are within the park
export function isInPark(lat, lng) {
  const distance = calculateDistance(lat, lng, PARK_CENTER_LAT, PARK_CENTER_LNG);
  return distance <= PARK_RADIUS_KM;
}

// Find closest parking lot to user's location
export function findClosestParkingLot(userLat, userLng) {
  // Only Main Parking Lot exists
  return { id: 'lot1', name: 'Main Parking Lot', lat: 33.9784, lng: -84.1315 };
}

