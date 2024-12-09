import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { MapPin, Navigation, Car, Train, Footprints } from "lucide-react";
import {
  isLocationValid,
  getLocationRangeMessage,
} from "../utils/locationValidator";

const LocationInput = ({ onSubmit }) => {
  const [startLocation, setStartLocation] = useState({
    address: "",
    coordinates: null,
  });
  const [endLocation, setEndLocation] = useState({
    address: "",
    coordinates: null,
  });
  const [transportMode, setTransportMode] = useState("driving");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState("");

  const startLocationRef = useRef(null);
  const endLocationRef = useRef(null);

  // Improved Google Maps script loading - keeping your original code
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setGoogleMapsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setGoogleMapsLoaded(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Modified autocomplete setup to include validation
  const initAutocomplete = (inputElement, setLocation) => {
    if (window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputElement,
        {
          types: ["geocode"],
          fields: ["address_components", "formatted_address", "geometry"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const coordinates = [
            place.geometry.location.lat(),
            place.geometry.location.lng(),
          ];

          // Add validation here
          const validationResult = isLocationValid(coordinates);
          if (!validationResult.isValid) {
            setError(validationResult.message);
            setLocation({ address: "", coordinates: null });
            return;
          }

          setLocation({
            address: place.formatted_address,
            coordinates: coordinates,
          });
          setError(""); // Clear any existing error
        }
      });
    }
  };

  // Keep your original useEffect for initialization
  useEffect(() => {
    if (googleMapsLoaded) {
      if (startLocationRef.current) {
        initAutocomplete(startLocationRef.current, setStartLocation);
      }
      if (endLocationRef.current) {
        initAutocomplete(endLocationRef.current, setEndLocation);
      }
    }
  }, [googleMapsLoaded]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startLocation.coordinates) {
      setError("Please select a start location");
      return;
    }

    onSubmit({
      start_location_name: startLocation.address,
      start_location_coords: startLocation.coordinates,
      end_location_name: endLocation.address || undefined,
      end_location_coords: endLocation.coordinates || undefined,
      transport_mode: transportMode,
    });
  };

  if (!googleMapsLoaded) {
    return (
      <Container className="mt-4 text-center">
        <p>Loading Google Maps...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Alert variant="info" className="mb-3">
          {getLocationRangeMessage()}
        </Alert>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="startLocation">
              <Form.Label>
                <MapPin size={20} className="me-2" />
                Start Location
              </Form.Label>
              <Form.Control
                type="text"
                ref={startLocationRef}
                placeholder="Enter start location"
                required
                value={startLocation.address}
                onChange={(e) =>
                  setStartLocation({
                    ...startLocation,
                    address: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="endLocation">
              <Form.Label>
                <Navigation size={20} className="me-2" />
                End Location (Optional)
              </Form.Label>
              <Form.Control
                type="text"
                ref={endLocationRef}
                placeholder="Enter end location"
                value={endLocation.address}
                onChange={(e) =>
                  setEndLocation({ ...endLocation, address: e.target.value })
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="transportMode">
              <Form.Label>Transport Mode</Form.Label>
              <div className="d-flex justify-content-between">
                {["driving", "transit", "walking"].map((mode) => (
                  <Button
                    key={mode}
                    variant={
                      transportMode === mode ? "primary" : "outline-secondary"
                    }
                    onClick={() => setTransportMode(mode)}
                    className="d-flex align-items-center"
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

        <Button variant="success" type="submit" className="w-100">
          Plan My Tour
        </Button>
      </Form>
    </Container>
  );
};

export default LocationInput;
