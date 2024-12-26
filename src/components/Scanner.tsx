import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Table } from "react-bootstrap";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getOrderFromArchiveByAWB } from "../services/orderService";

const Scanner = () => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
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
      async (decodedText) => {
        setScannedValue(decodedText);
        setError(null);
        scanner.clear(); // Stop the scanner after a successful scan
        await checkOrderInArchive(decodedText); // Check the order in Firestore
      },
      (err) => {
        setError("Error scanning QR code or barcode. Please try again.");
        console.error(err);
      }
    );

    setScannerInstance(scanner);
  };

  // Function to check the Firestore archive collection
  const checkOrderInArchive = async (awb: string) => {
    try {
      const orderData = await getOrderFromArchiveByAWB(awb);

      if (orderData) {
        setOrder(orderData);
        console.log("Order found in archive2:", orderData);
      } else {
        setError("No order found with the provided AWB.");
        setOrder(null);
      }
    } catch (err) {
      console.error("Error checking order in Firestore:", err);
      setError("An error occurred while checking the order. Please try again.");
    }
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
    setOrder(null);
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
          {order && (
            <Alert variant="light" className="mt-3">
              <h5>Order Details:</h5>
              <p><strong>ID:</strong> {order.id}</p>
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Comment:</strong> {order.comment}</p>
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Personalization</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product: any, index: number) => (
                    <tr key={index}>
                      <td>{product.productId}</td>
                      <td>{product.personalization}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
