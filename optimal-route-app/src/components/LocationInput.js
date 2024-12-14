import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { MapPin, Car, Train, Footprints } from "lucide-react";
import {
  isLocationValid,
  getLocationRangeMessage,
} from "../utils/locationValidator";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const LocationInput = ({ onSubmit, availableModes, city }) => {
  const [startLocation, setStartLocation] = useState({
    address: "",
    coordinates: null,
  });
  const [transportMode, setTransportMode] = useState(availableModes[0]);
  const [error, setError] = useState("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const startLocationRef = useRef(null);
  const autocompleteRef = useRef(null);

  const loadGoogleMapsScript = () => {
    if (window.google?.maps?.places) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setGoogleMapsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setGoogleMapsLoaded(false);
    };

    document.head.appendChild(script);
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && window.google?.maps?.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        startLocationRef.current,
        {
          types: ["geocode"],
          fields: ["address_components", "formatted_address", "geometry"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const coordinates = [
            place.geometry.location.lat(),
            place.geometry.location.lng(),
          ];
          const validationResult = isLocationValid(coordinates, city);
          if (!validationResult.isValid) {
            setError(validationResult.message);
            setStartLocation({ address: "", coordinates: null });
            return;
          }
          setStartLocation({ address: place.formatted_address, coordinates });
          setError("");
        }
      });
    }
  }, [googleMapsLoaded, city]);

  const handleInputChange = (e) => {
    setStartLocation({ ...startLocation, address: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startLocation.coordinates) {
      setError("Please select a start location");
      return;
    }
    onSubmit({
      start_location_name: startLocation.address,
      start_location_coords: startLocation.coordinates,
      transport_mode: transportMode,
    });
  };

  return (
    <Container
      className="mt-4 p-4 rounded shadow-sm"
      style={{ background: "linear-gradient(135deg, #f8f9fa, #e9ecef)" }}
    >
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        <Alert variant="info" className="mb-3">
          {getLocationRangeMessage(city)}
        </Alert>

        <Row className="mb-4">
          <Col md={12}>
            <Form.Group controlId="startLocation">
              <Form.Label className="fw-bold text-dark">
                <MapPin size={20} className="me-2 text-primary" />
                Start Location
              </Form.Label>
              <Form.Control
                type="text"
                ref={startLocationRef}
                placeholder="Enter start location"
                required
                value={startLocation.address}
                onChange={handleInputChange}
                className="shadow-sm"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Group controlId="transportMode">
              <Form.Label className="fw-bold text-dark">
                Transport Mode
              </Form.Label>
              <div className="d-flex justify-content-between gap-2 flex-wrap">
                {availableModes.map((mode) => (
                  <Button
                    key={mode}
                    variant={
                      transportMode === mode ? "primary" : "outline-secondary"
                    }
                    onClick={() => setTransportMode(mode)}
                    className="d-flex align-items-center flex-grow-1 p-2 shadow-sm"
                  >
                    {mode === "driving" && <Car className="me-2" />}
                    {mode === "transit" && <Train className="me-2" />}
                    {mode === "walking" && <Footprints className="me-2" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="success" type="submit" className="w-100 shadow-sm">
          Plan My Tour
        </Button>
      </Form>
    </Container>
  );
};

export default LocationInput;
