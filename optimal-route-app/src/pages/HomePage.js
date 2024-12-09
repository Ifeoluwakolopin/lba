import React, { useState } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { MapPin, Clock, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../components/LocationInput";
import Footer from "../components/Footer";
import Header from "../components/Header";

const FEATURES = [
  {
    icon: MapPin,
    color: "blue",
    title: "Curated SF Attractions",
    description:
      "Visit the city's most iconic locations including Chinatown, Pier 39, Palace of Fine Arts, and more.",
  },
  {
    icon: Compass,
    color: "green",
    title: "Smart Route Planning",
    description:
      "Our algorithm finds the most efficient route to help you make the most of your time.",
  },
  {
    icon: Clock,
    color: "purple",
    title: "Flexible Travel Options",
    description:
      "Choose between driving, public transit, or walking based on your preferences.",
  },
];

const HomePage = () => {
  const navigate = useNavigate();
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
      navigate("/route", { state: { routeData: result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen d-flex flex-column">
      {/* Hero Section */}
      <Header
        title="San Francisco Tour Planner"
        subtitle="Let us plan your perfect day touring San Francisco's top attractions"
      />

      {/* Main Content */}
      <main className="flex-grow-1 py-5 bg-light">
        <Container>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row className="justify-content-center mb-5">
            <Col lg={10}>
              <Card className="shadow-lg border-0">
                <Card.Body className="p-4">
                  <h2 className="text-center mb-4">Plan Your Tour</h2>
                  <LocationInput onSubmit={handleRouteSubmit} />
                  {loading && (
                    <div className="text-center mt-4">
                      <Spinner
                        animation="border"
                        role="status"
                        variant="primary"
                      />
                      <p className="mt-2 text-muted">
                        Creating your perfect route...
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="mb-4">Why Use Our Tour Planner?</h2>
            </Col>
          </Row>

          <Row className="justify-content-center">
            {FEATURES.map((feature, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                  <Card.Body className="text-center p-4">
                    <div
                      className={`bg-${feature.color}-100 rounded-circle p-3 d-inline-flex mb-4`}
                    >
                      <feature.icon
                        size={24}
                        className={`text-${feature.color}-600`}
                      />
                    </div>
                    <h4 className="mb-3">{feature.title}</h4>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
