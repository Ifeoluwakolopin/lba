import React, { useEffect, useRef, useState } from "react";
import { Card, Spinner } from "react-bootstrap";
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
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Initialize map only once when component mounts
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!window.google?.maps || !mapRef.current || mapInstanceRef.current)
        return false;

      try {
        // Initialize the map
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

        // Initialize directions renderer
        directionsRendererRef.current =
          new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: {
              strokeColor: "#2196F3",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            },
          });

        directionsRendererRef.current.setMap(mapInstanceRef.current);
        return true;
      } catch (error) {
        console.error("Map initialization error:", error);
        return false;
      }
    };

    const waitForGoogleMaps = async () => {
      const maxAttempts = 50; // 5 seconds maximum wait
      let attempts = 0;

      while (attempts < maxAttempts) {
        if (await initializeMap()) {
          if (isMounted) {
            setIsLoading(false);
          }
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (attempts >= maxAttempts && isMounted) {
        setMapError("Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    waitForGoogleMaps();

    return () => {
      isMounted = false;
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers and route whenever relevant props change
  useEffect(() => {
    if (!mapInstanceRef.current || !routes.length || isLoading) return;

    const updateMap = async () => {
      try {
        // Clear existing markers
        markersRef.current.forEach((marker) => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        markersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();
        const newMarkers = [];

        // Create markers
        for (const [index, route] of routes.entries()) {
          if (
            !route.coordinates ||
            !Array.isArray(route.coordinates) ||
            route.coordinates.length !== 2
          ) {
            console.error("Invalid coordinates for route:", route);
            continue;
          }

          const [lat, lng] = route.coordinates;
          const position = { lat, lng };
          bounds.extend(position);

          const isVisited = visitedLocations.includes(route.name);
          const isCurrent = route.name === currentLocation;

          // Create traditional marker instead of Advanced Marker
          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: route.name,
            label: {
              text: (index + 1).toString(),
              color: "white",
            },
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: isCurrent
                ? "#FFA500"
                : isVisited
                ? "#4CAF50"
                : "#FF5252",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
              scale: 12,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 150px;">
                <h6 style="margin-bottom: 8px; font-weight: bold;">${
                  route.name
                }</h6>
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
            `,
          });

          marker.addListener("click", () => {
            onVisitToggle(route.name);
          });

          let openInfoWindowTimeout;
          marker.addListener("mouseover", () => {
            openInfoWindowTimeout = setTimeout(() => {
              infoWindow.open(mapInstanceRef.current, marker);
            }, 200);
          });

          marker.addListener("mouseout", () => {
            clearTimeout(openInfoWindowTimeout);
            infoWindow.close();
          });

          newMarkers.push(marker);
        }

        // Calculate route
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = routes.slice(1, -1).map((route) => ({
          location: { lat: route.coordinates[0], lng: route.coordinates[1] },
          stopover: true,
        }));

        const request = {
          origin: {
            lat: routes[0].coordinates[0],
            lng: routes[0].coordinates[1],
          },
          destination: {
            lat: routes[routes.length - 1].coordinates[0],
            lng: routes[routes.length - 1].coordinates[1],
          },
          waypoints,
          travelMode: transportMode.toUpperCase(),
          optimizeWaypoints: false,
        };

        directionsService.route(request, (response, status) => {
          if (status === "OK" && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(response);
          } else {
            console.error("Directions request failed due to " + status);
          }
        });

        mapInstanceRef.current.fitBounds(bounds, {
          padding: { top: 50, right: 50, bottom: 50, left: 50 },
        });

        markersRef.current = newMarkers;
      } catch (error) {
        console.error("Map update error:", error);
        setMapError("Failed to update map markers and routes");
      }
    };

    updateMap();

    return () => {
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  }, [
    routes,
    visitedLocations,
    currentLocation,
    onVisitToggle,
    transportMode,
    isLoading,
  ]);

  if (mapError) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center text-danger">
            <p>{mapError}</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </Card.Body>
      </Card>
    );
  }

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
      <div className="position-relative">
        <div ref={mapRef} style={{ height: "500px" }} className="w-full" />
        {isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
          >
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading map...</span>
            </Spinner>
          </div>
        )}
      </div>
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
