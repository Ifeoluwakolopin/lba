import React, { useEffect, useRef } from "react";
import { Card } from "react-bootstrap";

const RouteMap = ({
  routes,
  visitedLocations,
  transportMode,
  currentLocation,
}) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    // Initialize map
    const initMap = () => {
      if (!routes || routes.length === 0) return;

      const bounds = new window.google.maps.LatLngBounds();
      const mapOptions = {
        zoom: 13,
        center: {
          lat: routes[0].coordinates[0],
          lng: routes[0].coordinates[1],
        },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      };

      googleMapRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Clear existing polyline
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }

      // Add markers for each location
      routes.forEach((location, index) => {
        const position = {
          lat: location.coordinates[0],
          lng: location.coordinates[1],
        };

        const isVisited = visitedLocations.includes(location.name);
        const isCurrent = location.name === currentLocation;

        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: location.name,
          label: `${index + 1}`,
          icon: {
            url: isCurrent
              ? "/current-location-marker.png"
              : isVisited
              ? "/visited-marker.png"
              : "/unvisited-marker.png",
            scaledSize: new window.google.maps.Size(30, 30),
          },
        });

        bounds.extend(position);
        markersRef.current.push(marker);

        // Add click listener to marker
        marker.addListener("click", () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${location.name}</strong></div>${
              isVisited ? "<div>✓ Visited</div>" : ""
            }`,
          });
          infoWindow.open(googleMapRef.current, marker);
        });
      });

      // Draw route path
      const path = routes.map((location) => ({
        lat: location.coordinates[0],
        lng: location.coordinates[1],
      }));

      polylineRef.current = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: googleMapRef.current,
      });

      // Fit map to bounds
      googleMapRef.current.fitBounds(bounds);
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      console.error("Google Maps not loaded");
    }
  }, [routes, visitedLocations, currentLocation]);

  return (
    <Card className="h-100">
      <Card.Body className="p-0">
        <div ref={mapRef} style={{ width: "100%", height: "600px" }} />
      </Card.Body>
    </Card>
  );
};

export default RouteMap;
