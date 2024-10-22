import React, { useState } from 'react';
import { Order } from '../models/Order';
import { useData } from '../context/DataContext'; // Use DataContext
import { updateOrder, releaseOrder, assignOrderToOperator } from '../services/orderService';
import { OrderStatus } from '../models/OrderStatus';

const OperatorRoom: React.FC = () => {
  const { orders, currentUser, currentUserRole, loading, users } = useData(); // Access the data context
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Order>>({});

  // Get the authenticated operator's user object
  const operator = users.find((user) => user.email === currentUser?.email);

  if (!operator) {
    return <div>Error: No operator found.</div>;
  }

// Fetch the next available order and assign it to the operator
const fetchNextOrder = async () => {
  try {
    // 1. Check if the operator already has an active order (in_progress).
    const activeOrders = orders.filter(
      (order) => order.assignedOperator === operator.displayName && order.status === OrderStatus.InProgress
    );

    if (activeOrders.length > 0) {
      alert('You already have an active order. Please complete or release it before taking a new one.');
      setCurrentOrder(activeOrders[0]); // Show the active order
      setFormData(activeOrders[0]); // Populate form with the active order data
      return;
    }

    // 2. If no active orders, fetch the next pending order
    const pendingOrders = orders.filter((order) => order.status === OrderStatus.Pending);
    if (pendingOrders.length > 0) {
      const nextOrder = pendingOrders[0];

      // Assign the order to the operator
      await assignOrderToOperator(nextOrder.id, operator.displayName);
      setCurrentOrder(nextOrder);
      setFormData(nextOrder); // Initialize form with the order data
    } else {
      alert('No pending orders available.');
    }
  } catch (error) {
    console.error('Error fetching next order:', error);
  }
};


  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes to the order
  const saveOrder = async () => {
    if (currentOrder) {
      try {
        await updateOrder(currentOrder.id, formData);
        alert('Order updated successfully.');
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  };

  // Release the current order and make it available again
  const releaseCurrentOrder = async () => {
    if (currentOrder) {
      try {
        await releaseOrder(currentOrder.id);
        alert('Order released.');
        setCurrentOrder(null);
      } catch (error) {
        console.error('Error releasing order:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  if (currentUserRole !== 'operator') {
    return <div>Access denied. This page is only for operators.</div>;
  }

  return (
    <div>
      <h1>Operator Room</h1>
      {currentOrder ? (
        <div>
          <h2>Order ID: {currentOrder.id}</h2>
          <div>
            <label>Customer Name: </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Phone Number: </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Amount: </label>
            <input
              type="number"
              name="amount"
              value={formData.amount || 0}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label>Status: </label>
            <input
              type="text"
              name="status"
              value={formData.status || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div>
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && <button onClick={saveOrder}>Save</button>}
            <button onClick={releaseCurrentOrder}>Release Order</button>
          </div>
        </div>
      ) : (
        <button onClick={fetchNextOrder}>Next Order</button>
      )}
    </div>
  );
};

export default OperatorRoom;
