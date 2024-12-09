import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { RefreshCw, Clock } from "lucide-react";
import RouteItem from "./RouteItem";

const RouteList = ({ routes, transportMode, onRecalculate }) => {
  const [visitedLocations, setVisitedLocations] = useState([]);

  const handleLocationVisited = (location) => {
    setVisitedLocations((prev) => {
      if (prev.includes(location)) {
        return prev.filter((loc) => loc !== location);
      }
      return [...prev, location].sort(
        (a, b) => routes.indexOf(a) - routes.indexOf(b)
      );
    });
  };

  const handleRecalculate = () => {
    const furthestVisited = visitedLocations.reduce((latest, current) => {
      return routes.indexOf(current) > routes.indexOf(latest)
        ? current
        : latest;
    }, visitedLocations[0]);

    onRecalculate({
      visited_locations: visitedLocations,
      current_location: furthestVisited,
      transport_mode: transportMode,
    });
  };

  if (!routes || routes.length === 0) {
    return (
      <Card>
        <Card.Body>
          <p className="text-center mb-0">No locations to display.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="route-list">
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

      {routes.map((location, index) => (
        <RouteItem
          key={location}
          location={location}
          index={index}
          isVisited={visitedLocations.includes(location)}
          onVisitToggle={handleLocationVisited}
        />
      ))}
    </div>
  );
};

export default RouteList;
