import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { MapPin, Navigation, Car, Train, Footprints } from "lucide-react";

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
  const [destinations, setDestinations] = useState([]);
  const [currentDestination, setCurrentDestination] = useState("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const startLocationRef = useRef(null);
  const endLocationRef = useRef(null);

  // Improved Google Maps script loading
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleMapsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle script loading
    script.onload = () => {
      setGoogleMapsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setGoogleMapsLoaded(false);
    };

    // Append script to document
    document.body.appendChild(script);

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Google Places Autocomplete setup
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
          setLocation({
            address: place.formatted_address,
            coordinates: coordinates,
          });
        }
      });
    }
  };

  // Initialize autocomplete when Google Maps is loaded
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

  // Add destination
  const handleAddDestination = () => {
    if (currentDestination && !destinations.includes(currentDestination)) {
      setDestinations([...destinations, currentDestination]);
      setCurrentDestination("");
    }
  };

  // Remove destination
  const handleRemoveDestination = (dest) => {
    setDestinations(destinations.filter((d) => d !== dest));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startLocation.coordinates) {
      alert("Please select a start location");
      return;
    }

    onSubmit({
      start_location_name: startLocation.address,
      start_location_coords: startLocation.coordinates,
      end_location_name: endLocation.address || undefined,
      end_location_coords: endLocation.coordinates || undefined,
      destinations: destinations,
      transport_mode: transportMode,
    });
  };

  // Render loading state if Google Maps is not yet loaded
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
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
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
          <Col md={6}>
            <Form.Group controlId="destinations">
              <Form.Label>Destinations</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={currentDestination}
                  onChange={(e) => setCurrentDestination(e.target.value)}
                  placeholder="Add destination"
                />
                <Button
                  variant="secondary"
                  onClick={handleAddDestination}
                  className="ms-2"
                >
                  Add
                </Button>
              </div>
              <div className="mt-2">
                {destinations.map((dest) => (
                  <Button
                    key={dest}
                    variant="info"
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => handleRemoveDestination(dest)}
                  >
                    {dest} ✕
                  </Button>
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="success" type="submit" className="w-100">
          Optimize Route
        </Button>
      </Form>
    </Container>
  );
};

export default LocationInput;
