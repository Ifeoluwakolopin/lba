import React from "react";
import { Card } from "react-bootstrap";

const TripDetails = ({
  startingPoint,
  currentLocation,
  transportMode,
  totalStops,
  stopsRemaining,
}) => {
  return (
    <Card className="shadow-sm sticky-top" style={{ top: "1rem" }}>
      <Card.Body>
        <h5>Trip Details</h5>
        <hr />
        <p>
          <strong>Starting Point:</strong>
          <br />
          {startingPoint}
        </p>
        <p>
          <strong>Current Location:</strong>
          <br />
          {currentLocation}
        </p>
        <p>
          <strong>Transport Mode:</strong>
          <br />
          {transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}
        </p>
        <p>
          <strong>Total Stops:</strong>
          <br />
          {totalStops}
        </p>
        <p>
          <strong>Stops Remaining:</strong>
          <br />
          {stopsRemaining}
        </p>
        <hr />
        <p className="text-muted small mb-0">
          You can mark locations as visited and update your route at any time to
          get a new optimized path.
        </p>
      </Card.Body>
    </Card>
  );
};

export default TripDetails;
