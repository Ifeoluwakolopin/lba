import React from "react";
import { Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-primary text-white py-4 shadow-sm">
      <Container>
        <Row className="align-items-center">
          <Col>
            <h1 className="d-flex align-items-center gap-2 mb-0">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>Back to Home</Tooltip>}
              >
                <div
                  onClick={() => navigate("/")}
                  style={{ cursor: "pointer" }}
                  className="d-flex align-items-center hover-brighten"
                >
                  <MapPin size={32} />
                </div>
              </OverlayTrigger>
              {title}
            </h1>
            {subtitle && <p className="mb-0 mt-2 text-white-50">{subtitle}</p>}
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
