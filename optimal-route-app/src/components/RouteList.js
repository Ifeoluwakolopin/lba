import React from "react";
import { Card } from "react-bootstrap";
import RouteItem from "./RouteItem";

const RouteList = ({ routes, visitedLocations, onVisitToggle }) => {
  if (!routes || routes.length === 0) {
    return (
      <Card className="mt-3" style={{ background: "#fafafa", border: "none" }}>
        <Card.Body>
          <p className="text-center mb-0 text-muted">
            No locations to display.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div
      className="route-list p-3 rounded"
      style={{
        background: "#f1f1f1",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      {routes.map((location, index) => (
        <RouteItem
          key={`${location}-${index}`}
          location={location}
          index={index}
          isVisited={visitedLocations.includes(location)}
          onVisitToggle={onVisitToggle}
        />
      ))}
    </div>
  );
};

export default RouteList;
