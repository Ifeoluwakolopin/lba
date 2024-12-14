import React from "react";
import { Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header
      className="py-4 shadow-sm"
      style={{
        background: "linear-gradient(90deg, #6A11CB 0%, #2575FC 100%)",
        color: "white",
      }}
    >
      <Container>
        <Row className="align-items-center text-center text-md-start">
          <Col>
            <h1 className="d-flex align-items-center gap-3 mb-2 justify-content-center justify-content-md-start">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Back to Home</Tooltip>}
              >
                <div
                  onClick={() => navigate("/")}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                  className="d-flex align-items-center hover-brighten"
                >
                  <MapPin size={32} />
                </div>
              </OverlayTrigger>
              Minerva City Exploration Guide
            </h1>
            <p
              className="mb-0 mt-2 text-white-75"
              style={{ fontSize: "1rem", opacity: 0.85 }}
            >
              Discover and plan your routes in iconic cities effortlessly.
            </p>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
