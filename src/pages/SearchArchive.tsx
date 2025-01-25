// src/pages/SearchOrderByPhone.tsx

import React, { useState } from "react";
import { getOrdersFromArchiveByPhone } from "../services/orderService";
import { Table, Form, Button, Alert, Container, Card } from "react-bootstrap";
import { Order, SentOrder } from "../models/Order";
import { formatFirestoreTimestampToDate } from "../utils/Utils";
import { useData } from "../context/DataContext";

const SearchArchive: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<SentOrder[]>([]);
  const [error, setError] = useState("");
  const {country } = useData();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrders([]);

    if (!phone) {
      setError("Please enter a phone number.");
      return;
    }

    try {
      const results = await getOrdersFromArchiveByPhone(phone, country);
      if (results.length === 0) {
        setError("No orders found for this phone number.");
      } else {
        setOrders(results);
      }
    } catch (err) {
      setError("Error retrieving orders. Please try again.");
    }
  };

  return (
    <Container>
      <h2 className="my-4">Search Order by Phone Number</h2>
      <Form onSubmit={handleSearch}>
        <Form.Group controlId="phone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Search
        </Button>
      </Form>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

      <div className="mt-4">
      {orders.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-around">
          {orders.map((order) => (
            <Card key={order.id} style={{ width: '18rem', margin: '10px' }}>
              <Card.Body>
                <Card.Title>Order ID: {order.orderId}</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {order.name} <br />
                  <strong>Phone:</strong> {order.phone} <br />
                  <strong>Status:</strong> {order.status} <br />
                  <strong>Order Time:</strong> {formatFirestoreTimestampToDate(order.orderTime)} <br />
                  <strong>Total Price:</strong> {order.totalPrice}<br />
                  <strong>AWB:</strong> {order.awb} <br />
                  <strong>AWB Status:</strong> {order.awbStatus} <br />
                  <strong>Assigned Operator:</strong> {order.assignedOperator || 'N/A'} <br />
                  <strong>Call Count:</strong> {order.callCount} <br />
                  <strong>Comment:</strong> {order.comment || 'No comments'} <br />
                  <strong>Discount:</strong> {order.discount} <br />
                  <strong>Delivery Price:</strong> {order.deliveryPrice}<br />
                  <strong>Address:</strong> {order.address.state + ', ' + order.address.locality + ', ' + order.address.street} <br />
                  <strong>AWB Status:</strong> {order.awbStatus || 'N/A'} <br />
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <p>No orders available.</p>
      )}
    </div>
    </Container>
  );
};

export default SearchArchive;
