import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import RouteList from "../components/RouteList";
import MapView from "../components/MapView";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripDetails from "../components/TripDetails";
import RouteInfoHeader from "../components/RouteInfoHeader";

const RoutePage = () => {
  const location = useLocation();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [viewMode, setViewMode] = useState("list");

  const [routeState, setRouteState] = useState({
    routeData: location.state?.routeData || null,
    visitedLocations: [],
    currentLocation: location.state?.routeData?.route[0]?.name || null,
    loading: false,
    error: null,
  });

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  const handleRecalculate = useCallback(
    (data) => {
      setRouteState((prev) => ({ ...prev, loading: true, error: null }));

      fetch(`${API_BASE_URL}/recalculate-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_location_name: data.current_location,
          visited_locations: data.visited_locations,
          transport_mode: data.transport_mode,
          city: location.state?.routeData?.city, // Include city
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.error || "Failed to recalculate route");
            });
          }
          return response.json();
        })
        .then((result) => {
          setRouteState((prev) => {
            const filteredResultRoute = result.route.filter(
              (location, index, array) => {
                return location.name !== array[0].name || index === 0;
              }
            );

            const combinedRoute = [
              ...prev.routeData.route.filter((location) =>
                data.visited_locations.includes(location.name)
              ),
              ...filteredResultRoute.filter(
                (location) => !data.visited_locations.includes(location.name)
              ),
            ];

            return {
              ...prev,
              routeData: {
                ...prev.routeData,
                route: combinedRoute,
                directions: result.directions,
                total_time: result.total_time,
                transport_mode: result.transport_mode,
              },
              visitedLocations: prev.visitedLocations,
              currentLocation: data.current_location,
              loading: false,
            };
          });
        })
        .catch((err) => {
          setRouteState((prev) => ({
            ...prev,
            error: err.message || "An error occurred",
            loading: false,
          }));
        });
    },
    [API_BASE_URL, location.state?.routeData?.city]
  );

  const handleVisitToggle = useCallback((locationName) => {
    setRouteState((prev) => {
      const newVisitedLocations = prev.visitedLocations.includes(locationName)
        ? prev.visitedLocations.filter((loc) => loc !== locationName)
        : [...prev.visitedLocations, locationName].sort(
            (a, b) =>
              prev.routeData.route.findIndex((r) => r.name === a) -
              prev.routeData.route.findIndex((r) => r.name === b)
          );

      return {
        ...prev,
        visitedLocations: newVisitedLocations,
        currentLocation:
          newVisitedLocations.length > 0
            ? newVisitedLocations[newVisitedLocations.length - 1]
            : prev.routeData.route[0].name,
      };
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!routeState.routeData) {
    return <Navigate to="/" replace />;
  }

  const totalLocations = routeState.routeData.route.length - 1;
  const visitedLocationsCount = routeState.visitedLocations.filter(
    (location) => location !== routeState.routeData.route[0].name
  ).length;
  const remainingStops = Math.max(0, totalLocations - visitedLocationsCount);

  const totalTime = routeState.routeData.total_time;

  return (
    <div className="min-h-screen d-flex flex-column bg-light">
      <Header />

      <div className="text-center py-3 bg-light shadow-sm">
        <Container>
          <Row>
            <Col>
              <h3>
                Your{" "}
                {routeState.routeData.city
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}{" "}
                Tour Route
              </h3>

              <p className="text-muted">
                Estimated duration: {Math.floor(totalTime / 3600)} hours{" "}
                {Math.floor((totalTime % 3600) / 60)} minutes
              </p>
              <p className="text-muted">Current Time: {currentTime}</p>
            </Col>
          </Row>
        </Container>
      </div>

      <main className="flex-grow-1 py-4">
        <Container>
          {routeState.error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() =>
                setRouteState((prev) => ({ ...prev, error: null }))
              }
            >
              {routeState.error}
            </Alert>
          )}

          {routeState.loading && (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-2 text-muted">Updating your route...</p>
            </div>
          )}

          <Row>
            <Col md={8}>
              <div className="mb-3">
                <ButtonGroup className="w-100">
                  <ToggleButton
                    id="view-list"
                    type="radio"
                    variant="outline-primary"
                    name="view"
                    value="list"
                    checked={viewMode === "list"}
                    onChange={(e) => setViewMode(e.currentTarget.value)}
                  >
                    List View
                  </ToggleButton>
                  <ToggleButton
                    id="view-map"
                    type="radio"
                    variant="outline-primary"
                    name="view"
                    value="map"
                    checked={viewMode === "map"}
                    onChange={(e) => setViewMode(e.currentTarget.value)}
                  >
                    Map View
                  </ToggleButton>
                </ButtonGroup>
              </div>

              <RouteInfoHeader
                visitedLocations={routeState.visitedLocations}
                onRecalculate={handleRecalculate}
                routes={routeState.routeData.route.map((r) => r.name)}
                transportMode={routeState.routeData.transport_mode}
                currentLocation={routeState.currentLocation}
                city={routeState.routeData.city} // Pass city to RouteInfoHeader
              />

              {viewMode === "list" ? (
                <RouteList
                  routes={routeState.routeData.route.map((r) => r.name)}
                  transportMode={routeState.routeData.transport_mode}
                  visitedLocations={routeState.visitedLocations}
                  onVisitToggle={handleVisitToggle}
                  directions={routeState.routeData.directions}
                />
              ) : (
                <MapView
                  routes={routeState.routeData.route}
                  visitedLocations={routeState.visitedLocations}
                  onVisitToggle={handleVisitToggle}
                  currentLocation={routeState.currentLocation}
                  transportMode={routeState.routeData.transport_mode}
                  directionsRaw={routeState.routeData.directions_raw}
                />
              )}
            </Col>
            <Col md={4}>
              <TripDetails
                startingPoint={routeState.routeData.route[0].name}
                currentLocation={routeState.currentLocation}
                transportMode={routeState.routeData.transport_mode}
                totalStops={totalLocations}
                stopsRemaining={remainingStops}
              />
            </Col>
          </Row>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default RoutePage;
