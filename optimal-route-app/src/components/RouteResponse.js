import React, { useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Badge,
} from "react-bootstrap";
import { MapPin, Clock, Check, RefreshCw } from "lucide-react";

// Location images and details mapping
const LOCATION_DETAILS = {
  "Chinatown San Francisco": {
    images: [
      "/images/chinatown1.jpg",
      "/images/chinatown2.jpg",
      "/images/chinatown3.jpg",
    ],
    description:
      "San Francisco's Chinatown is the oldest in North America and the largest Chinese enclave outside Asia. Known for its authentic Chinese restaurants, traditional herb shops, and the famous Dragon's Gate.",
    tips: "Best time to visit is during lunch hours. Don't miss the Golden Gate Fortune Cookie Factory!",
  },
  "Pier 39": {
    images: [
      "/images/pier39-1.jpg",
      "/images/pier39-2.jpg",
      "/images/pier39-3.jpg",
    ],
    description:
      "A popular tourist destination featuring shopping, dining, street performances, and views of sea lions. Great views of Alcatraz and the Golden Gate Bridge.",
    tips: "Visit early morning to see the sea lions and avoid crowds. Sunset offers spectacular photo opportunities.",
  },
  // Add details for other locations...
};

const RouteResponse = ({ routeData, onRecalculateRoute }) => {
  const [visitedLocations, setVisitedLocations] = useState(new Set());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Format time from seconds to hours and minutes
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}min`;
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleMarkVisited = (location) => {
    const newVisited = new Set(visitedLocations);
    if (newVisited.has(location)) {
      newVisited.delete(location);
    } else {
      newVisited.add(location);
    }
    setVisitedLocations(newVisited);
  };

  const handleRecalculateRoute = () => {
    onRecalculateRoute({
      current_location_name: routeData.route[0],
      current_location_coords: routeData.start_location.coordinates,
      visited_locations: Array.from(visitedLocations),
      transport_mode: routeData.transport_mode,
    });
  };

  return (
    <Container className="py-5">
      {/* Route Summary */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Your Optimized Route</h2>
            <div className="d-flex align-items-center">
              <Clock size={20} className="me-2" />
              <span>Total Time: {formatTime(routeData.total_time)}</span>
            </div>
          </div>
          <p className="text-muted">
            Starting from: {routeData.start_location.name}
          </p>
        </Card.Body>
      </Card>

      {/* Locations List */}
      <Row>
        {routeData.route.slice(1, -1).map((location, index) => (
          <Col md={6} lg={4} className="mb-4" key={location}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={LOCATION_DETAILS[location]?.images[0]}
                alt={location}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">
                    {index + 1}. {location}
                  </h5>
                  {visitedLocations.has(location) && (
                    <Badge bg="success">Visited</Badge>
                  )}
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin size={16} className="me-1" />
                    View Details
                  </Button>
                  <Button
                    variant={
                      visitedLocations.has(location)
                        ? "success"
                        : "outline-success"
                    }
                    size="sm"
                    onClick={() => handleMarkVisited(location)}
                  >
                    <Check size={16} className="me-1" />
                    {visitedLocations.has(location)
                      ? "Visited"
                      : "Mark Visited"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recalculate Button */}
      {visitedLocations.size > 0 && (
        <div className="text-center mt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRecalculateRoute}
            className="d-flex align-items-center mx-auto"
          >
            <RefreshCw size={20} className="me-2" />
            Recalculate Route
          </Button>
        </div>
      )}

      {/* Location Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedLocation}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLocation && LOCATION_DETAILS[selectedLocation] && (
            <>
              <Row className="mb-4">
                {LOCATION_DETAILS[selectedLocation].images.map((img, idx) => (
                  <Col md={4} key={idx}>
                    <img
                      src={img}
                      alt={`${selectedLocation} ${idx + 1}`}
                      className="img-fluid rounded"
                    />
                  </Col>
                ))}
              </Row>
              <h5>About</h5>
              <p>{LOCATION_DETAILS[selectedLocation].description}</p>
              <h5>Tips</h5>
              <p>{LOCATION_DETAILS[selectedLocation].tips}</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RouteResponse;
