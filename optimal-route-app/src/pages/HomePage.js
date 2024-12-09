import React, { useState } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { MapPin, Navigation2 } from "lucide-react";
import LocationInput from "../components/LocationInput";

const TRAVEL_FACTS = [
  {
    icon: MapPin,
    color: "blue",
    title: "SF Attractions Tour",
    description:
      "Visit the most iconic locations in San Francisco with our optimized route planning.",
  },
  {
    icon: Navigation2,
    color: "green",
    title: "Flexible Travel",
    description:
      "Choose your preferred mode of transport - drive, take public transit, or walk through the city.",
  },
];

const HomePage = () => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRouteSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/calculate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to optimize route");
      }

      const result = await response.json();
      setOptimizedRoute(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column bg-light">
      {/* Header */}
      <header className="bg-primary text-white py-4 shadow-sm">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="d-flex align-items-center gap-2 mb-0">
                <MapPin size={32} />
                San Francisco Tour Planner
              </h1>
              <p className="mb-0 mt-2 text-white-50">
                Let us plan your perfect day touring San Francisco's top
                attractions
              </p>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 py-4">
        <Container>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <LocationInput onSubmit={handleRouteSubmit} />
            </Card.Body>
          </Card>

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-2 text-muted">Optimizing your route...</p>
            </div>
          )}

          {optimizedRoute && (
            <Card className="shadow-sm">
              <Card.Body>
                <h3 className="mb-4">Your Optimized Route</h3>

                <div className="mb-4">
                  <h5 className="text-primary">Stops in Order:</h5>
                  <ol className="list-group list-group-numbered">
                    {optimizedRoute.route.map((location, index) => (
                      <li key={index} className="list-group-item">
                        {location}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">Estimated Duration:</h5>
                  <p className="ms-3">
                    {Math.floor(optimizedRoute.total_time / 3600)} hours{" "}
                    {Math.floor((optimizedRoute.total_time % 3600) / 60)}{" "}
                    minutes
                  </p>
                </div>

                <div>
                  <h5 className="text-primary">Detailed Directions:</h5>
                  <div className="bg-light p-3 rounded">
                    {optimizedRoute.directions
                      .split("\n")
                      .map((line, index) => (
                        <p
                          key={index}
                          className={
                            line.startsWith("---")
                              ? "fw-bold mt-3 mb-2"
                              : "ms-3 mb-2"
                          }
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {!optimizedRoute && !loading && (
            <Row className="mt-4">
              {TRAVEL_FACTS.map((fact, index) => (
                <Col md={6} key={index} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div
                        className={`bg-${fact.color}-100 rounded-circle p-3 d-inline-flex mb-3`}
                      >
                        <fact.icon
                          size={24}
                          className={`text-${fact.color}-600`}
                        />
                      </div>
                      <h4>{fact.title}</h4>
                      <p className="text-muted mb-0">{fact.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white-50 py-3 mt-auto">
        <Container>
          <small className="d-block text-center">
            © {new Date().getFullYear()} SF Tour Planner. All rights reserved.
          </small>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
