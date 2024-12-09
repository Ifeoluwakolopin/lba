import React, { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import RouteList from "../components/RouteList";
import Header from "../components/Header";
import Footer from "../components/Footer";

const RoutePage = () => {
  const location = useLocation();
  const [routeData, setRouteData] = useState(location.state?.routeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If no route data, redirect back to home
  if (!routeData) {
    return <Navigate to="/" replace />;
  }

  const handleRecalculate = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/recalculate-route", {
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

      // Update the route data while preserving the visited locations
      setRouteData((prevData) => ({
        ...prevData,
        route: [
          prevData.route[0], // Start location
          ...data.visited_locations,
          ...result.route.filter(
            (location) => !data.visited_locations.includes(location)
          ),
        ],
        remaining_locations: result.remaining_locations,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column bg-light">
      <Header
        title="Your San Francisco Tour Route"
        subtitle={`Estimated duration: ${Math.floor(
          routeData.total_time / 3600
        )} hours ${Math.floor((routeData.total_time % 3600) / 60)} minutes`}
      />

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
                onRecalculate={handleRecalculate}
              />
            </Col>
            <Col md={4}>
              <Card className="shadow-sm sticky-top" style={{ top: "1rem" }}>
                <Card.Body>
                  <h5>Trip Details</h5>
                  <hr />
                  <p>
                    <strong>Starting Point:</strong>
                    <br />
                    {routeData.route[0]}
                  </p>
                  <p>
                    <strong>Transport Mode:</strong>
                    <br />
                    {routeData.transport_mode.charAt(0).toUpperCase() +
                      routeData.transport_mode.slice(1)}
                  </p>
                  <p>
                    <strong>Total Stops:</strong>
                    <br />
                    {routeData.route.length - 2}
                  </p>

                  <hr />
                  <p className="text-muted small mb-0">
                    You can mark locations as visited and update your route at
                    any time to get a new optimized path.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default RoutePage;
