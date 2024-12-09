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
  const directionsRendererRef = useRef(null);

  // Function to create marker element based on status
  const createMarkerElement = (position, name, index, isVisited, isCurrent) => {
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
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    `;

    markerDiv.style.cssText = markerStyle;
    markerDiv.innerHTML = `${index + 1}`;
    markerDiv.title = name;

    return new window.google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerDiv,
      title: name,
    });
  };

  // Function to create info window content
  const createInfoWindowContent = (
    locationName,
    index,
    isVisited,
    isCurrent
  ) => {
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
            Stop ${index + 1} - ${isVisited ? "Visited" : "Not Visited"}
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
      center: { lat: 37.7749, lng: -122.4194 },
      mapId: process.env.REACT_APP_GOOGLE_MAPS_ID,
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

    // Initialize DirectionsRenderer
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll handle markers ourselves
      preserveViewport: true,
      polylineOptions: {
        strokeColor: "#2196F3",
        strokeOpacity: 0.8,
        strokeWeight: 4,
      },
    });

    directionsRendererRef.current.setMap(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current = null;
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!mapInstanceRef.current || !routes.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => (marker.map = null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers = [];

    // Create markers
    routes.forEach((route, index) => {
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

      const isVisited = visitedLocations.includes(route.name);
      const isCurrent = route.name === currentLocation;

      const marker = createMarkerElement(
        position,
        route.name,
        index,
        isVisited,
        isCurrent
      );
      marker.map = mapInstanceRef.current;

      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(
          route.name,
          index,
          isVisited,
          isCurrent
        ),
      });

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

    // Calculate route using DirectionsService
    const directionsService = new window.google.maps.DirectionsService();

    // Create waypoints from all locations except first and last
    const waypoints = routes.slice(1, -1).map((route) => ({
      location: { lat: route.coordinates[0], lng: route.coordinates[1] },
      stopover: true,
    }));

    directionsService.route(
      {
        origin: {
          lat: routes[0].coordinates[0],
          lng: routes[0].coordinates[1],
        },
        destination: {
          lat: routes[routes.length - 1].coordinates[0],
          lng: routes[routes.length - 1].coordinates[1],
        },
        waypoints: waypoints,
        travelMode: transportMode.toUpperCase(),
        optimizeWaypoints: false,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRendererRef.current.setDirections(response);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );

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
    };
  }, [routes, visitedLocations, currentLocation, onVisitToggle, transportMode]);

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
