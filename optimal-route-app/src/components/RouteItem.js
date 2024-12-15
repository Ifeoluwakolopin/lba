import React, { useState } from "react";
import { Card, Form, Collapse, Row, Col, Badge } from "react-bootstrap";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle,
  Info,
  Star,
} from "lucide-react";
import locationDetails from "../locationDetails.json";

const RouteItem = ({ location, index, isVisited, onVisitToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const details = locationDetails[location] || {
    description: "Discover more about this amazing location.",
    images: [],
    tips: "No specific tips available for this location.",
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onVisitToggle(location);
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={`mb-3 shadow-sm transition-all duration-200`}
      style={{
        cursor: "pointer",
        background: isVisited
          ? "linear-gradient(to right, #e8f5e9, #c8e6c9)"
          : "linear-gradient(to right, #f8f9fa, #e9ecef)",
        border: "1px solid",
        borderColor: isVisited ? "#a5d6a7" : "#dee2e6",
      }}
      onClick={handleCardClick}
    >
      <Card.Header
        className="d-flex align-items-center justify-content-between py-3 px-4"
        style={{
          background: "transparent",
          border: "none",
        }}
      >
        <div className="d-flex align-items-center flex-grow-1">
          <div className="me-3">
            <Form.Check
              type="checkbox"
              checked={isVisited}
              onChange={handleCheckboxClick}
              id={`visit-check-${index}`}
              style={{
                transform: "scale(1.1)",
              }}
              className="border-2 custom-checkbox"
            />
          </div>
          <MapPin size={20} className="text-primary me-2" />
          <div>
            <h6 className="mb-0 fw-bold">
              {index + 1}. {location}
            </h6>
            <small className="text-muted">Tap to view details</small>
          </div>
        </div>
        {isVisited && (
          <Badge
            bg="success"
            className="me-3 d-flex align-items-center"
            style={{ padding: "8px 12px" }}
          >
            <CheckCircle size={16} className="me-1" />
            Visited
          </Badge>
        )}
        <div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </Card.Header>

      <Collapse in={isExpanded}>
        <div>
          <Card.Body className="px-4 py-3">
            <div className="d-flex align-items-center mb-3">
              <Info size={20} className="text-primary me-2" />
              <strong>About this Location</strong>
            </div>
            <p className="text-muted">{details.description}</p>

            {details.images && details.images.length > 0 && (
              <Row className="mb-3 g-2">
                {details.images.map((img, idx) => (
                  <Col key={idx} xs={12} sm={6} md={4}>
                    <img
                      src={img}
                      alt={`${location} view ${idx + 1}`}
                      className="img-fluid rounded"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}

            <div className="d-flex align-items-center mb-2">
              <Star size={20} className="text-warning me-2" />
              <strong>Visitor Tips</strong>
            </div>
            <p className="text-muted">{details.tips}</p>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};
export default RouteItem;
