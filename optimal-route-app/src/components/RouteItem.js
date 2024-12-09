import React, { useState } from "react";
import { Card, Form, Collapse, Row, Col, Badge } from "react-bootstrap";
import { ChevronDown, ChevronUp, MapPin, Check } from "lucide-react";

const LOCATION_DETAILS = {
  "Chinatown San Francisco": {
    description:
      "The largest Chinatown outside of Asia and oldest in North America, featuring traditional architecture, authentic cuisine, and vibrant culture.",
    images: [
      "/images/chinatown1.jpg",
      "/images/chinatown2.jpg",
      "/images/chinatown3.jpg",
    ],
    tips: "Visit during lunch for the best food options. Don't miss the fortune cookie factory!",
  },
  "California Academy of Sciences": {
    description:
      "A world-class natural history museum, planetarium, and aquarium all under one living roof.",
    images: ["/images/cas1.jpg", "/images/cas2.jpg", "/images/cas3.jpg"],
    tips: "Thursday nights are adults-only NightLife events. Buy tickets online to avoid queues.",
  },
  // Add other locations...
};

const RouteItem = ({ location, index, isVisited, onVisitToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const details = LOCATION_DETAILS[location] || {
    description: "Explore this fascinating San Francisco location.",
    images: [],
    tips: "Check local guides for current visiting hours.",
  };

  return (
    <Card className={`mb-3 shadow-sm ${isVisited ? "border-success" : ""}`}>
      <Card.Header className="d-flex align-items-center justify-content-between bg-white py-3">
        <div className="d-flex align-items-center flex-grow-1">
          <div className="custom-checkbox me-3">
            <Form.Check
              type="checkbox"
              checked={isVisited}
              onChange={() => onVisitToggle(location)}
              id={`visit-check-${index}`}
              label=""
              className="border-2"
            />
          </div>
          <MapPin size={20} className="text-primary me-2" />
          <div>
            <h5 className="mb-0">
              {index + 1}. {location}
            </h5>
          </div>
        </div>
        <div className="d-flex align-items-center">
          {isVisited && (
            <Badge bg="success" className="me-3">
              <Check size={14} className="me-1" />
              Visited
            </Badge>
          )}
          <button
            className="btn btn-link p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </Card.Header>

      <Collapse in={isExpanded}>
        <div>
          <Card.Body>
            <h6 className="text-primary mb-3">About this Location</h6>
            <p>{details.description}</p>

            {details.images.length > 0 && (
              <Row className="mb-3">
                {details.images.map((img, idx) => (
                  <Col key={idx} md={4} className="mb-3">
                    <img
                      src={img}
                      alt={`${location} view ${idx + 1}`}
                      className="img-fluid rounded shadow-sm"
                    />
                  </Col>
                ))}
              </Row>
            )}

            <h6 className="text-primary mb-2">Visitor Tips</h6>
            <p className="mb-0">{details.tips}</p>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default RouteItem;
