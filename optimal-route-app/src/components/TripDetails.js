import React from "react";
import { Card } from "react-bootstrap";
import { MapPin, Map, List, Activity, Compass } from "lucide-react";

const TripDetails = ({
  startingPoint,
  currentLocation,
  transportMode,
  totalStops,
  stopsRemaining,
}) => {
  return (
    <Card
      className="shadow-sm sticky-top text-white"
      style={{
        top: "1rem",
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        border: "none",
      }}
    >
      <Card.Body>
        <h5 className="text-center mb-4" style={{ fontWeight: "600" }}>
          Trip Details
        </h5>
        <hr
          className="my-3"
          style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
        />
        <div className="d-flex align-items-center mb-3">
          <MapPin size={20} className="me-3 text-light" />
          <div>
            <small>Starting Point</small>
            <div style={{ fontWeight: "500" }}>{startingPoint}</div>
          </div>
        </div>
        <div className="d-flex align-items-center mb-3">
          <Map size={20} className="me-3 text-light" />
          <div>
            <small>Current Location</small>
            <div style={{ fontWeight: "500" }}>{currentLocation}</div>
          </div>
        </div>
        <div className="d-flex align-items-center mb-3">
          <Compass size={20} className="me-3 text-light" />
          <div>
            <small>Transport Mode</small>
            <div style={{ fontWeight: "500" }}>
              {transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center mb-3">
          <List size={20} className="me-3 text-light" />
          <div>
            <small>Total Stops</small>
            <div style={{ fontWeight: "500" }}>{totalStops}</div>
          </div>
        </div>
        <div className="d-flex align-items-center mb-4">
          <Activity size={20} className="me-3 text-light" />
          <div>
            <small>Stops Remaining</small>
            <div style={{ fontWeight: "500" }}>{stopsRemaining}</div>
          </div>
        </div>
        <hr
          className="my-3"
          style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
        />
        <p
          className="text-center small mb-0"
          style={{ opacity: 0.85, fontSize: "0.85rem" }}
        >
          Update your route at any time for a new optimized path.
        </p>
      </Card.Body>
    </Card>
  );
};

export default TripDetails;
