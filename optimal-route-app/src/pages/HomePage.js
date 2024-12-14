import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  const navigate = useNavigate();

  const handleCitySelection = (city) => {
    navigate(`/explore/${city}`);
  };

  return (
    <div className="min-h-screen d-flex flex-column bg-light">
      {/* Hero Banner */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow-1 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <h2 className="mb-4">Choose Your Destination</h2>
              <Row className="justify-content-center">
                <Col xs={6} className="mb-4">
                  <Button
                    variant="outline-primary"
                    className="rounded-circle w-100 p-4 text-center"
                    onClick={() => handleCitySelection("san_francisco")}
                    style={{ height: "150px", fontSize: "18px" }}
                  >
                    San Francisco
                  </Button>
                </Col>
                <Col xs={6} className="mb-4">
                  <Button
                    variant="outline-primary"
                    className="rounded-circle w-100 p-4 text-center"
                    onClick={() => handleCitySelection("seoul")}
                    style={{ height: "150px", fontSize: "18px" }}
                  >
                    Seoul
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
