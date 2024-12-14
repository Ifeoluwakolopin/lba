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
      className={`mb-3 rounded border-0 ${
        isVisited ? "border-success" : "border-light"
      }`}
      style={{
        background: "#f9f9f9",
        cursor: "pointer",
      }}
      onClick={handleCardClick}
    >
      <Card.Header
        className="d-flex align-items-center justify-content-between py-3 px-4"
        style={{
          background: isVisited ? "#e8f5e9" : "#f1f1f1",
        }}
      >
        <div className="d-flex align-items-center flex-grow-1">
          <Form.Check
            type="checkbox"
            checked={isVisited}
            onChange={handleCheckboxClick}
            id={`visit-check-${index}`}
            className="me-3"
          />
          <MapPin size={20} className="text-primary me-2" />
          <div>
            <h6 className="mb-0 fw-bold">
              {index + 1}. {location}
            </h6>
            <small className="text-muted">Tap to view details</small>
          </div>
        </div>
        {isVisited && (
          <Badge bg="success" className="me-3">
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
            <div className="mb-3">
              <Info size={20} className="me-2 text-primary" />
              <strong>About this Location</strong>
            </div>
            <p className="text-muted">{details.description}</p>

            {details.images.length > 0 && (
              <Row className="mb-3 g-2">
                {details.images.map((img, idx) => (
                  <Col key={idx} xs={12} sm={6} md={4}>
                    <img
                      src={img}
                      alt={`${location} view ${idx + 1}`}
                      className="img-fluid rounded"
                      style={{ width: "100%", objectFit: "cover" }}
                    />
                  </Col>
                ))}
              </Row>
            )}

            <div className="mb-2">
              <Star size={20} className="me-2 text-warning" />
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
