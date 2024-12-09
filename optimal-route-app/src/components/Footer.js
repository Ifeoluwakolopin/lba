import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
  return (
    <footer className="bg-dark text-white-50 py-3 mt-auto">
      <Container>
        <small className="d-block text-center">
          © {new Date().getFullYear()} CS164 LBA 2025. All rights reserved.
        </small>
      </Container>
    </footer>
  );
};

export default Footer;
