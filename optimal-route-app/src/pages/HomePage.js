import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  const navigate = useNavigate();

  const handleCitySelection = (city) => {
    navigate(`/explore/${city}`);
  };

  const buttonStyle = {
    aspectRatio: "1 / 1", // Maintains circular aspect ratio
    fontSize: "1.5rem", // Adjusted font size for better fit
    fontWeight: "700", // Bold text
    transition: "all 0.3s ease",
    boxShadow: "0 6px 10px rgba(0, 0, 0, 0.15)", // Enhanced shadow
    border: "none",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    color: "#fff",
    width: "150px", // Fixed button size (circle)
    height: "150px",
    borderRadius: "50%", // Makes the button circular
    zIndex: 2, // Ensure it's above the video
    display: "flex", // Center text inside
    justifyContent: "center", // Center text horizontally
    alignItems: "center", // Center text vertically
    overflow: "hidden", // Prevents text from overflowing
    textAlign: "center", // Aligns multiline text in center
    whiteSpace: "normal", // Allows text to wrap
  };

  const cityButtons = [
    {
      id: "san_francisco",
      name: "San Francisco",
      gradient:
        "linear-gradient(135deg, rgba(33, 147, 176, 1) 0%, rgba(109, 213, 237, 1) 100%)",
      hoverGradient:
        "linear-gradient(135deg, rgba(28, 122, 148, 1) 0%, rgba(90, 184, 204, 1) 100%)",
    },
    {
      id: "seoul",
      name: "Seoul",
      gradient:
        "linear-gradient(135deg, rgba(238, 9, 121, 1) 0%, rgba(255, 106, 0, 1) 100%)",
      hoverGradient:
        "linear-gradient(135deg, rgba(211, 8, 108, 1) 0%, rgba(230, 95, 0, 1) 100%)",
    },
  ];

  return (
    <>
      <Header />
      <div
        style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
      >
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0, // Behind all content
          }}
        >
          <source src="/videos/gg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay to Dim */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent overlay
            zIndex: 1, // Above video
          }}
        ></div>

        {/* Content Overlay */}
        <div
          style={{
            position: "relative",
            zIndex: 2, // Ensure content is above the overlay and video
            color: "#fff",
            textAlign: "center",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "4rem", // Prevent overlap with header
            paddingBottom: "4rem", // Prevent overlap with footer
          }}
        >
          <h1
            style={{
              marginBottom: "3rem",
              fontSize: "3rem", // Larger headline size
              fontWeight: "700",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Choose Your Destination
          </h1>
          <Container>
            <Row className="g-4 justify-content-center">
              {cityButtons.map((city) => (
                <Col
                  key={city.id}
                  xs={6}
                  sm={4}
                  md={3} // Adjust grid size for better layout
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    onClick={() => handleCitySelection(city.id)}
                    style={{
                      ...buttonStyle,
                      background: city.gradient,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = city.hoverGradient;
                      e.currentTarget.style.boxShadow =
                        "0 8px 16px rgba(0, 0, 0, 0.2)";
                      e.currentTarget.style.transform = "scale(1.1)"; // Slightly enlarge on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = city.gradient;
                      e.currentTarget.style.boxShadow =
                        "0 6px 10px rgba(0, 0, 0, 0.15)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {city.name}
                  </Button>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
