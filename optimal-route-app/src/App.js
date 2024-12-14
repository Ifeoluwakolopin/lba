import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Spinner } from "react-bootstrap";
import HomePage from "./pages/HomePage";
import SanFranciscoPage from "./pages/SanFranciscoPage";
import SeoulPage from "./pages/SeoulPage";
import RoutePage from "./pages/RoutePage";
import { loadGoogleMaps } from "./utils/googleMapsLoader";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const App = () => {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load Google Maps:", error);
        setMapsError(error.message);
      });
  }, []);

  if (!mapsLoaded) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center">
        {mapsError ? (
          <div className="text-center text-danger">
            <p className="mb-0">Failed to load Google Maps</p>
            <small>Please check your internet connection and try again</small>
          </div>
        ) : (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading maps...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore/san_francisco" element={<SanFranciscoPage />} />
        <Route path="/explore/seoul" element={<SeoulPage />} />
        <Route path="/route" element={<RoutePage />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
