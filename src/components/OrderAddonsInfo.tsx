import React from "react";
import { Table, Spinner, Col, Row, Form, InputGroup } from "react-bootstrap";
import { Order } from "../models/Order";
import { useState } from "react";
import { addresses } from "../context/AddressesGLS";
import SearchComponent from "./SearchComponent";
import AddressSelector from "./AddressSelector";
import { Timestamp } from "firebase/firestore";

interface OrderAddonsInfoProps {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order | null>>;
}

export function OrderAddonsInfo({ order, setOrder }: OrderAddonsInfoProps) {
  return (
    <>
      <Row className="mt-1">
        <Col>
          <Form.Label htmlFor="inputName">Comment</Form.Label>
          <Form.Control
            type="text"
            id="inputText"
            value={order?.comment || ""}
            onChange={(e) => {
              const newOrder = { ...order, comment: e.target.value };
              setOrder(newOrder);
            }}
          />
        </Col>
        <Col>
          <Form.Label htmlFor="inputPhone">Delivery Price</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              id="inputText"
              value={order?.deliveryPrice ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === "" ? 0 : parseFloat(value);

                const newOrder = {
                  ...order,
                  deliveryPrice: !isNaN(parsedValue) ? parsedValue : 0,
                };
                setOrder(newOrder);
              }}
            />

            <InputGroup.Text>RON</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col>
          <Form.Label htmlFor="inputPhone">Discount</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              id="inputText"
              value={order?.discount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === "" ? 0 : parseFloat(value);

                const newOrder = {
                  ...order,
                  discount: !isNaN(parsedValue) ? parsedValue : 0,
                };
                setOrder(newOrder);
              }}
            />

            <InputGroup.Text>RON</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col>
          <Form.Label htmlFor="date">Delivery Date</Form.Label>
          <Form.Control
            type="date"
            id="date"
            value={
              order?.deliveryDate
                ? order.deliveryDate.toDate().toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
                const newValue = e.target.value;
                const newOrder = {
                    ...order,
                    deliveryDate: newValue ? Timestamp.fromDate(new Date(newValue)) : null,
                  };
                  setOrder(newOrder);
            }}
          />
        </Col>
      </Row>
    </>
  );
}
