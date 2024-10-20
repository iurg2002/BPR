// src/components/OrdersTable.tsx
import React from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

const OrdersTable: React.FC = () => {
  const { orders, loading } = useData();

  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer Name</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.customerName}</td>
            <td>{order.phoneNumber}</td>
            <td>{order.status}</td>
            <td>{order.amount}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrdersTable;
