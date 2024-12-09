import React, { useState } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { MapPin, Navigation2 } from "lucide-react";
import LocationInput from "../components/LocationInput";

const HomePage = () => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRouteSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/optimize-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header Section */}
      <div className="bg-blue-600 text-white py-8 shadow-lg mb-8">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="text-4xl font-bold mb-2">
                <Navigation2 className="inline-block me-2" />
                Route Optimizer
              </h1>
              <p className="text-xl text-blue-100">
                Plan your perfect journey through San Francisco's attractions
              </p>
            </Col>
            <Col md={4} className="text-end d-none d-md-block">
              <MapPin size={48} className="text-blue-200" />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="mb-8">
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <Row>
          <Col lg={12}>
            <Card className="shadow-lg border-0 rounded-lg">
              <Card.Body className="p-4">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Plan Your Route
                </h2>
                <LocationInput onSubmit={handleRouteSubmit} />

                {loading && (
                  <div className="text-center mt-4">
                    <p>Optimizing your route...</p>
                  </div>
                )}

                {optimizedRoute && (
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-3">
                      Optimized Route
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Route Order:</h4>
                      <ol className="list-decimal pl-4">
                        {optimizedRoute.route.map((location, index) => (
                          <li key={index} className="mb-2">
                            {location}
                          </li>
                        ))}
                      </ol>

                      <h4 className="font-semibold mt-4 mb-2">Total Time:</h4>
                      <p>
                        {Math.round(optimizedRoute.total_time / 60)} minutes
                      </p>

                      <h4 className="font-semibold mt-4 mb-2">Directions:</h4>
                      <div className="bg-white p-3 rounded border">
                        {optimizedRoute.directions
                          .split("\n")
                          .map((line, index) => (
                            <p
                              key={index}
                              className={
                                line.startsWith("---")
                                  ? "font-semibold mt-3"
                                  : "ml-4"
                              }
                            >
                              {line}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        {!optimizedRoute && (
          <Row className="mt-8">
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Card.Body className="p-4">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Smart Navigation
                  </h3>
                  <p className="text-gray-600">
                    Optimize your route using advanced algorithms to find the
                    most efficient path between destinations.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Card.Body className="p-4">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Navigation2 className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Multiple Transport Options
                  </h3>
                  <p className="text-gray-600">
                    Choose between driving, transit, or walking to suit your
                    travel preferences.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Card.Body className="p-4">
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <MapPin className="text-purple-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    Popular Destinations
                  </h3>
                  <p className="text-gray-600">
                    Explore San Francisco's most iconic locations with our
                    curated list of destinations.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6 mt-auto">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0">
                © {new Date().getFullYear()} Route Optimizer. Plan your perfect
                San Francisco adventure.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default HomePage;
