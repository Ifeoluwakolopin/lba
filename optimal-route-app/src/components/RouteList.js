import React from "react";
import { Card } from "react-bootstrap";
import RouteItem from "./RouteItem";

const RouteList = ({ routes, visitedLocations, onVisitToggle }) => {
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
