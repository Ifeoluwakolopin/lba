import React, { useState, useRef, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { LoadScript } from "@react-google-maps/api";

const libraries = ["places"];

function Input({ onSubmit }) {
  const [startingLocation, setStartingLocation] = useState(null);
  const [endingLocation, setEndingLocation] = useState(null);
  const [transportMode, setTransportMode] = useState("driving");
  const [visitedLocations, setVisitedLocations] = useState([]);
  const startInputRef = useRef(null);
  const endInputRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    // Initialize Autocomplete for Starting Location
    const startAutocomplete = new window.google.maps.places.Autocomplete(
      startInputRef.current
    );
    startAutocomplete.addListener("place_changed", () => {
      const place = startAutocomplete.getPlace();
      if (place.geometry) {
        setStartingLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    // Initialize Autocomplete for Ending Location
    const endAutocomplete = new window.google.maps.places.Autocomplete(
      endInputRef.current
    );
    endAutocomplete.addListener("place_changed", () => {
      const place = endAutocomplete.getPlace();
      if (place.geometry) {
        setEndingLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      startingLocation,
      endingLocation,
      transportMode,
      visitedLocations,
    });
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="startingLocation">
          <Form.Label>Starting Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your starting location"
            ref={startInputRef}
            required
          />
        </Form.Group>
        <Form.Group controlId="endingLocation">
          <Form.Label>Ending Location (optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your ending location"
            ref={endInputRef}
          />
        </Form.Group>
        <Form.Group controlId="transportMode">
          <Form.Label>Transport Mode</Form.Label>
          <Form.Control
            as="select"
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
          >
            <option value="driving">Driving</option>
            <option value="walking">Walking</option>
            <option value="transit">Transit</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="visitedLocations">
          <Form.Label>Visited Locations (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter locations (e.g., Chinatown, Pier 39)"
            value={visitedLocations}
            onChange={(e) => setVisitedLocations(e.target.value.split(","))}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Find Optimal Route
        </Button>
      </Form>
    </LoadScript>
  );
}

export default Input;
