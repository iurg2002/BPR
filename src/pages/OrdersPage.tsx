import React, { useState } from 'react';
import { Table, Spinner, Container, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { useData } from '../context/DataContext';
import { formatFirestoreTimestampToDate } from '../utils/Utils';
import { OrderStatus } from '../models/OrderStatus';
import { updateOrder } from '../services/orderService';
import { Order } from '../models/Order';
import { Timestamp } from 'firebase/firestore';

const OrdersPage: React.FC = () => {
  const { orders, loading } = useData();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [callCountFilter, setCallCountFilter] = useState<number | ''>('');

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  // Filtered orders based on status and call count
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesCallCount =
      callCountFilter !== '' ? order.callCount === Number(callCountFilter) : true;
    return matchesStatus && matchesCallCount;
  }).sort((a, b) => {
    // Handle different possible types of orderTime
    const timeA = a.orderTime instanceof Timestamp
      ? a.orderTime.toDate().getTime()
      : (a.orderTime as Date).getTime(); // If it's already a Date
    const timeB = b.orderTime instanceof Timestamp
      ? b.orderTime.toDate().getTime()
      : (b.orderTime as Date).getTime();
    return timeB - timeA; // Sort by orderTime from newest to oldest
  });

  const setStatusPending = (order: Order) => async () => {
    // Update the order with a null assigned operator
    await updateOrder(order.id, { ...order, assignedOperator: null, status: OrderStatus.Pending });
  };

  return (
    <>
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <Form.Group controlId="filterStatus">
              <Form.Label>Filter by Status</Form.Label>
              <Form.Control
                as="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                {/* iterate through each OrderStatus */}
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="filterCallCount">
              <Form.Label>Filter by Call Count</Form.Label>
              <Form.Control
                type="number"
                value={callCountFilter}
                onChange={(e) => setCallCountFilter(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter Call Count"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <h2>Orders <Badge>{filteredOrders.length}</Badge></h2>
          </Col>
        
        </Row>

        <Table striped bordered hover className="mt-5">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Assigned Operator</th>
              <th>Call Count</th>
              <th>Discount</th>
              <th>Order Time</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.id}</td>
                <td>{order.orderId}</td>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.status == OrderStatus.Pending && <Badge bg='warning'>{order.status}</Badge>}
                {order.status == OrderStatus.Confirmed && <Badge bg='success'>{order.status}</Badge>}
                {order.status == OrderStatus.CallLater && <Badge bg='light'>{order.status}</Badge>}
                {order.status == OrderStatus.Cancelled && <Badge bg='danger'>{order.status}</Badge>}
                {order.status == OrderStatus.InProgress && <Badge bg='primary'>{order.status}</Badge>}</td>
                <td>{order.assignedOperator || 'N/A'}</td>
                <td>{order.callCount}</td>
                <td>{order.discount}</td>
                <td>{formatFirestoreTimestampToDate(order.orderTime)}</td>
                <td>{order.type}</td>
                <td>{order.status == OrderStatus.InProgress || order.status == OrderStatus.CallLater  && <Button onClick={setStatusPending(order)}>Clear Status</Button>}
               </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default OrdersPage;
