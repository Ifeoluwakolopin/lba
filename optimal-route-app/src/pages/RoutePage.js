import React, { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import RouteList from "../components/RouteList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TripDetails from "../components/TripDetails";

const RoutePage = () => {
  const location = useLocation();
  const [routeData, setRouteData] = useState(location.state?.routeData);
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // If no route data, redirect back to home
  if (!routeData) {
    return <Navigate to="/" replace />;
  }

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleRecalculate = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/recalculate-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_location_name: data.current_location,
          visited_locations: data.visited_locations,
          transport_mode: data.transport_mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recalculate route");
      }

      const result = await response.json();

      setRouteData((prevData) => {
        const updatedRoute = [
          ...data.visited_locations,
          ...result.route.filter(
            (location) => !data.visited_locations.includes(location)
          ),
        ];

        return {
          ...prevData,
          route: updatedRoute,
          remaining_locations: result.remaining_locations,
          total_time: result.total_time,
        };
      });

      setVisitedLocations(data.visited_locations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitToggle = (location) => {
    setVisitedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((loc) => loc !== location);
      }
      return [...prev, location].sort(
        (a, b) => routeData.route.indexOf(a) - routeData.route.indexOf(b)
      );
    });
  };

  const currentLocation =
    visitedLocations.length > 0
      ? visitedLocations[visitedLocations.length - 1]
      : routeData.route[0];

  return (
    <div className="min-h-screen d-flex flex-column bg-light">
      <Header
        title="Your San Francisco Tour Route"
        subtitle={`Estimated duration: ${Math.floor(
          routeData.total_time / 3600
        )} hours ${Math.floor((routeData.total_time % 3600) / 60)} minutes`}
      />

      {/* Display Current Time */}
      <div className="text-center py-2">
        <p className="text-muted">Current Time: {currentTime}</p>
      </div>

      {/* Main Content */}
      <main className="flex-grow-1 py-4">
        <Container>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-2 text-muted">Updating your route...</p>
            </div>
          )}

          <Row>
            <Col md={8}>
              <RouteList
                routes={routeData.route}
                transportMode={routeData.transport_mode}
                visitedLocations={visitedLocations}
                onVisitToggle={handleVisitToggle}
                onRecalculate={handleRecalculate}
              />
            </Col>
            <Col md={4}>
              <TripDetails
                startingPoint={routeData.route[0]}
                currentLocation={currentLocation}
                transportMode={routeData.transport_mode}
                totalStops={routeData.route.length - 1}
                stopsRemaining={
                  routeData.route.length - 1 - visitedLocations.length
                }
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
