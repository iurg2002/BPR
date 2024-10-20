// src/pages/OperatorRoom.tsx
import React, { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import { Order } from "../models/Order";

const OperatorRoom: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders.filter((order) => order.status === "pending"));
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Operator Dashboard</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.customerName} - {order.amount} RON
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OperatorRoom;
