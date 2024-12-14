import React, { useState } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LocationInput from "./LocationInput";
import Footer from "./Footer";
import Header from "./Header";

const LocationPage = ({ city, transportModes, title, subtitle, features }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleRouteSubmit = async (data) => {
    setLoading(true);
    setError(null);

    const requestData = { ...data, city };

    try {
      const response = await fetch(`${API_BASE_URL}/calculate-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
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
    <div className="min-h-screen d-flex flex-column bg-light">
      <Header title={title} subtitle={subtitle} />

      <main className="flex-grow-1 py-5">
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
                  <LocationInput
                    onSubmit={handleRouteSubmit}
                    availableModes={transportModes}
                    city={city}
                  />
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

          {features && features.length > 0 && (
            <>
              <Row className="mb-5">
                <Col className="text-center">
                  <h2 className="mb-4">Why Use Our Tour Planner?</h2>
                </Col>
              </Row>

              <Row className="justify-content-center">
                {features.map((feature, index) => (
                  <Col md={4} key={index} className="mb-4">
                    <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                      <Card.Body className="text-center p-4">
                        <div
                          className={`rounded-circle p-3 d-inline-flex mb-4`}
                          style={{
                            background: `linear-gradient(to right, ${feature.color[0]}, ${feature.color[1]})`,
                          }}
                        >
                          <feature.icon size={24} className="text-white" />
                        </div>
                        <h4 className="mb-3">{feature.title}</h4>
                        <p className="text-muted mb-0">{feature.description}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default LocationPage;
