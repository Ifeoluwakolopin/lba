// src/utils/locationValidator.js

// Define a bounding box for Northern/Central California
// This is a rough approximation that covers the main drivable areas from SF
const CA_BOUNDS = {
  north: 42.009518, // Oregon border
  south: 35.002085, // roughly Bakersfield
  west: -124.409591, // Pacific Coast
  east: -120.005469, // roughly Sierra Nevada
};

// Additional constraint for reasonable driving distance from SF
const SF_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

// Maximum reasonable driving distance from SF (roughly 200 miles or ~320 km)
const MAX_DISTANCE_FROM_SF = 320; // kilometers

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if coordinates are within acceptable range for SF tour
 * @param {[number, number]} coordinates - [latitude, longitude]
 * @returns {{isValid: boolean, message: string}} Validation result and message
 */
export const isLocationValid = (coordinates) => {
  if (!coordinates || coordinates.length !== 2) {
    return {
      isValid: false,
      message: "Invalid coordinates format",
    };
  }

  const [lat, lng] = coordinates;

  // Check if within California bounding box
  if (
    lat < CA_BOUNDS.south ||
    lat > CA_BOUNDS.north ||
    lng < CA_BOUNDS.west ||
    lng > CA_BOUNDS.east
  ) {
    return {
      isValid: false,
      message: "Location must be within California",
    };
  }

  // Check distance from SF
  const distanceFromSF = calculateDistance(
    lat,
    lng,
    SF_CENTER.lat,
    SF_CENTER.lng
  );

  if (distanceFromSF > MAX_DISTANCE_FROM_SF) {
    return {
      isValid: false,
      message:
        "Location is too far from San Francisco for a day tour (maximum 200 miles)",
    };
  }

  return {
    isValid: true,
    message: "Location is valid",
  };
};

/**
 * Get a friendly message about valid location range
 * @returns {string} User-friendly message about valid locations
 */
export const getLocationRangeMessage = () => {
  return "Please select a location in Northern/Central California, within 200 miles of San Francisco.";
};
