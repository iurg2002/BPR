// src/pages/SearchOrderByPhone.tsx

import React, { useState } from "react";
import { getOrdersFromArchiveByPhone } from "../services/orderService";
import { Table, Form, Button, Alert, Container } from "react-bootstrap";
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

      {orders.length > 0 && (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Order Time</th>
              <th>Total Price</th>
              <th>AWB</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderId}</td>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.status}</td>
                <td>{formatFirestoreTimestampToDate(order.orderTime)}</td>
                <td>{order.totalPrice}</td>
                <td>{order.AWB}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SearchArchive;
