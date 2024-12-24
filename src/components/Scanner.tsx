import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { Html5QrcodeScanner } from "html5-qrcode";

const Scanner = () => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannerInstance, setScannerInstance] = useState<Html5QrcodeScanner | null>(null);

  // Function to initialize the scanner
  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    const scanner = new Html5QrcodeScanner("scanner-container", config, false);
    scanner.render(
      (decodedText) => {
        setScannedValue(decodedText);
        setError(null);
        scanner.clear(); // Stop the scanner after a successful scan
      },
      (err) => {
        setError("Error scanning QR code or barcode. Please try again.");
        console.error(err);
      }
    );

    setScannerInstance(scanner);
  };

  // Initialize the scanner on component mount
  useEffect(() => {
    initializeScanner();

    // Cleanup on unmount
    return () => {
      if (scannerInstance) {
        scannerInstance.clear();
      }
    };
  }, []);

  // Reset scanner and state
  const handleReset = () => {
    setScannedValue(null);
    setError(null);

    if (scannerInstance) {
      scannerInstance.clear(); // Clear the existing scanner instance
      initializeScanner(); // Reinitialize the scanner
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col xs={12} className="text-center">
          <h2>QR/Barcode Scanner</h2>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {scannedValue && (
            <Alert variant="success" className="mt-3">
              Scanned Value: {scannedValue}
            </Alert>
          )}
          <div id="scanner-container" className="mt-4" style={{ width: "100%" }} />
          <Button
            variant="secondary"
            className="mt-3"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Scanner;
