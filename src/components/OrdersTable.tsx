// src/components/OrdersTable.tsx
import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

const OrdersTable: React.FC = () => {
  const { orders, loading } = useData();

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
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
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.orderId}</td>
            <td>{order.name}</td>
            <td>{order.phone}</td>
            <td>{order.status}</td>
            <td>{order.assignedOperator || "N/A"}</td>
            <td>{order.callCount}</td>
            <td>{order.discount}</td>
            <td>{order.orderTime.toLocaleString()}</td>
            <td>{order.type}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrdersTable;
