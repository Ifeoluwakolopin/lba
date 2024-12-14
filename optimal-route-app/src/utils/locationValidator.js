const BOUNDS = {
  san_francisco: {
    north: 42.009518,
    south: 35.002085,
    west: -124.409591,
    east: -120.005469,
  },
  seoul: {
    north: 37.7019,
    south: 37.4286,
    west: 126.7642,
    east: 127.1836,
  },
};

const CITY_CENTERS = {
  san_francisco: { lat: 37.7749, lng: -122.4194 },
  seoul: { lat: 37.5665, lng: 126.978 },
};

const MAX_DISTANCES = {
  san_francisco: 320,
  seoul: 320,
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
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

export const isLocationValid = (coordinates, city) => {
  if (!coordinates || coordinates.length !== 2) {
    return {
      isValid: false,
      message: "Invalid coordinates format",
    };
  }

  const normalizedCity = city.toLowerCase();

  if (
    !BOUNDS[normalizedCity] ||
    !CITY_CENTERS[normalizedCity] ||
    !MAX_DISTANCES[normalizedCity]
  ) {
    return {
      isValid: false,
      message: "Invalid city specified for validation",
    };
  }

  const [lat, lng] = coordinates;
  const cityBounds = BOUNDS[normalizedCity];
  const cityCenter = CITY_CENTERS[normalizedCity];
  const maxDistance = MAX_DISTANCES[normalizedCity];

  if (
    lat < cityBounds.south ||
    lat > cityBounds.north ||
    lng < cityBounds.west ||
    lng > cityBounds.east
  ) {
    return {
      isValid: false,
      message: `Location must be within the boundaries of ${normalizedCity.replace(
        "_",
        " "
      )}`,
    };
  }

  const distanceFromCenter = calculateDistance(
    lat,
    lng,
    cityCenter.lat,
    cityCenter.lng
  );
  if (distanceFromCenter > maxDistance) {
    return {
      isValid: false,
      message: `Location is too far from ${normalizedCity.replace(
        "_",
        " "
      )} for a day tour (maximum ${maxDistance} km)`,
    };
  }

  return {
    isValid: true,
    message: "Location is valid",
  };
};

export const getLocationRangeMessage = (city) => {
  if (!city || !BOUNDS[city] || !CITY_CENTERS[city] || !MAX_DISTANCES[city]) {
    return "Invalid city specified for range message.";
  }

  const cityName = city.replace("_", " ");
  const maxDistance = MAX_DISTANCES[city];
  return `Please select a location within the valid range of ${cityName}, no more than ${maxDistance} kilometers from its center.`;
};
