// src/components/OrderForm.tsx
import React, { useState } from "react";
import { addOrder } from "../services/orderService";
import { Order } from "../models/Order";

const OrderForm: React.FC = () => {
  const [order, setOrder] = useState<Omit<Order, "id" | "createdAt" | "updatedAt">>({
    customerName: "",
    phoneNumber: "",
    status: "pending",
    amount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOrder(order);
    alert("Order created successfully!");
    setOrder({ customerName: "", phoneNumber: "", status: "pending", amount: 0 });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="customerName"
        placeholder="Customer Name"
        value={order.customerName}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phoneNumber"
        placeholder="Phone Number"
        value={order.phoneNumber}
        onChange={handleChange}
        required
      />
      <select name="status" value={order.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={order.amount}
        onChange={handleChange}
        required
      />
      <button type="submit">Create Order</button>
    </form>
  );
};

export default OrderForm;
