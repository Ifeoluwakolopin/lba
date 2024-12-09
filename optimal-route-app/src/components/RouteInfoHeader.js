import React from "react";
import { Card, Button } from "react-bootstrap";
import { RefreshCw, Clock } from "lucide-react";

const RouteInfoHeader = ({
  visitedLocations,
  onRecalculate,
  routes,
  transportMode,
  currentLocation,
}) => {
  const handleRecalculate = () => {
    onRecalculate({
      visited_locations: visitedLocations,
      current_location: currentLocation,
      transport_mode: transportMode,
    });
  };

  return (
    <Card className="mb-4 border-primary border-2">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Clock size={24} className="text-primary me-2" />
            <div>
              <h5 className="mb-0">Recommended Visit Time</h5>
              <p className="text-muted mb-0">
                Plan to spend 20-30 minutes at each location
              </p>
            </div>
          </div>
          {visitedLocations.length > 0 && (
            <Button
              variant="primary"
              onClick={handleRecalculate}
              className="d-flex align-items-center"
            >
              <RefreshCw size={18} className="me-2" />
              Update Route
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RouteInfoHeader;
