import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

function RouteMap({ route }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);

  useEffect(() => {
    if (isLoaded && route?.length > 1) {
      const fetchDirections = async () => {
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = route
          .slice(1, -1)
          .map((location) => ({ location, stopover: true }));

        const result = await directionsService.route({
          origin: route[0],
          destination: route[route.length - 1],
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        setDirectionsResponse(result);
      };

      fetchDirections();
    }
  }, [isLoaded, route]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      center={{ lat: 37.7749, lng: -122.4194 }} // Default center
      zoom={12}
      mapContainerStyle={{ width: "100%", height: "400px" }}
    >
      {directionsResponse && (
        <DirectionsRenderer directions={directionsResponse} />
      )}
      {route?.map((location, idx) => (
        <Marker key={idx} position={location} label={String(idx + 1)} />
      ))}
    </GoogleMap>
  );
}

export default RouteMap;
