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

  const buttonStyle = {
    aspectRatio: "1/1",
    fontSize: "1.5rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  };

  const cityButtons = [
    {
      id: "san_francisco",
      name: "San Francisco",
      gradient:
        "linear-gradient(135deg, rgba(33, 147, 176, 0.85) 0%, rgba(109, 213, 237, 0.85) 100%)",
      hoverGradient:
        "linear-gradient(135deg, rgba(28, 122, 148, 0.9) 0%, rgba(90, 184, 204, 0.9) 100%)",
    },
    {
      id: "seoul",
      name: "Seoul",
      gradient:
        "linear-gradient(135deg, rgba(238, 9, 121, 0.75) 0%, rgba(255, 106, 0, 0.75) 100%)",
      hoverGradient:
        "linear-gradient(135deg, rgba(211, 8, 108, 0.85) 0%, rgba(230, 95, 0, 0.85) 100%)",
    },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />

      <main className="flex-grow-1 d-flex align-items-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} className="text-center">
              <h2 className="mb-5">Choose Your Destination</h2>
              <Row className="justify-content-center g-4">
                {cityButtons.map((city) => (
                  <Col key={city.id} xs={6} sm={5}>
                    <Button
                      className="rounded-circle w-100 d-flex align-items-center justify-content-center text-white fw-bold"
                      onClick={() => handleCitySelection(city.id)}
                      style={{
                        ...buttonStyle,
                        background: city.gradient,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = city.hoverGradient;
                        e.currentTarget.style.boxShadow =
                          "0 6px 12px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = city.gradient;
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {city.name}
                    </Button>
                  </Col>
                ))}
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
