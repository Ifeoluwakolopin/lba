import React, { useEffect, useRef } from "react";
import { Card } from "react-bootstrap";
import { Map as MapIcon } from "lucide-react";

const MapView = ({
  routes = [],
  visitedLocations = [],
  onVisitToggle,
  transportMode,
  currentLocation,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Function to create marker element based on status
  const createMarkerElement = (position, name, isVisited, isCurrent) => {
    const markerDiv = document.createElement("div");

    // Style for circular marker
    const markerStyle = `
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: ${
        isCurrent ? "#FFA500" : isVisited ? "#4CAF50" : "#FF5252"
      };
      border: 2px solid white;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    markerDiv.style.cssText = markerStyle;
    markerDiv.title = name;

    return new window.google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerDiv,
      title: name,
    });
  };

  // Function to create info window content
  const createInfoWindowContent = (locationName, isVisited, isCurrent) => {
    return `
      <div style="padding: 8px; min-width: 150px;">
        <h6 style="margin-bottom: 8px; font-weight: bold;">${locationName}</h6>
        <div style="display: flex; gap: 4px;">
          <span style="
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            background-color: ${isVisited ? "#4CAF50" : "#6c757d"};
            color: white;
          ">
            ${isVisited ? "Visited" : "Not Visited"}
          </span>
          ${
            isCurrent
              ? `
            <span style="
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              background-color: #FFA500;
              color: white;
            ">
              Current
            </span>
          `
              : ""
          }
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!window.google || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco center
      mapId: "YOUR_MAP_ID", // Optional: Add if you have a custom map style
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    return () => {
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route line
  useEffect(() => {
    if (!mapInstanceRef.current || !routes.length) return;

    // Clear existing markers and polyline
    markersRef.current.forEach((marker) => (marker.map = null));
    if (polylineRef.current) polylineRef.current.setMap(null);

    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers = [];
    const path = [];

    routes.forEach((route) => {
      if (
        !route.coordinates ||
        !Array.isArray(route.coordinates) ||
        route.coordinates.length !== 2
      ) {
        console.error("Invalid coordinates for route:", route);
        return;
      }

      const [lat, lng] = route.coordinates;
      const position = { lat, lng };
      bounds.extend(position);
      path.push(position);

      const isVisited = visitedLocations.includes(route.name);
      const isCurrent = route.name === currentLocation;

      // Create marker
      const marker = createMarkerElement(
        position,
        route.name,
        isVisited,
        isCurrent
      );
      marker.map = mapInstanceRef.current;

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(route.name, isVisited, isCurrent),
      });

      // Add click listeners
      marker.addListener("click", () => {
        onVisitToggle(route.name);
      });

      let openInfoWindowTimeout;
      marker.addListener("mouseenter", () => {
        openInfoWindowTimeout = setTimeout(() => {
          infoWindow.open(mapInstanceRef.current, marker);
        }, 200);
      });

      marker.addListener("mouseleave", () => {
        clearTimeout(openInfoWindowTimeout);
        infoWindow.close();
      });

      newMarkers.push(marker);
    });

    // Create polyline
    polylineRef.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#2196F3",
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapInstanceRef.current,
    });

    // Fit bounds with padding
    mapInstanceRef.current.fitBounds(bounds, {
      padding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    });

    markersRef.current = newMarkers;

    // Cleanup
    return () => {
      newMarkers.forEach((marker) => (marker.map = null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [routes, visitedLocations, currentLocation, onVisitToggle]);

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <MapIcon className="me-2" size={20} />
          <span className="fw-bold">Map View</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle me-1"
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#4CAF50",
              }}
            />
            <small>Visited</small>
          </div>
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle me-1"
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#FF5252",
              }}
            />
            <small>Not Visited</small>
          </div>
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle me-1"
              style={{
                width: 12,
                height: 12,
                backgroundColor: "#FFA500",
              }}
            />
            <small>Current</small>
          </div>
        </div>
      </Card.Header>
      <div ref={mapRef} style={{ height: "500px" }} className="w-full" />
      <Card.Footer className="bg-white text-muted">
        <small>
          Click on markers to toggle visited status • Hover over markers for
          details
        </small>
      </Card.Footer>
    </Card>
  );
};

export default MapView;
