import React from 'react';
import { Table, Spinner, Col, Row, Form  } from 'react-bootstrap';
import { Order } from '../models/Order';
import { useState } from 'react';
import { addresses } from '../context/AddressesGLS';
import SearchComponent from './SearchComponent';
import AddressSelector from './AddressSelector';

interface OrderPersonInfoProps {
    order: Order;
    setOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  }

export function OrderPersonInfo({ order, setOrder }: OrderPersonInfoProps) {
  return (
    <>
    <Row className='mt-1'>
        <Col>
            <Form.Label htmlFor="inputName">Name</Form.Label>
            <Form.Control
                  type="text"
                  id="inputText"
                  value={order?.name || ""}
                  onChange={(e) => {
                    const newOrder = { ...order, name: e.target.value };
                    setOrder(newOrder);
                  }}
                />
        </Col>
        <Col>
            <Form.Label htmlFor="inputPhone">Phone</Form.Label>
            <Form.Control
                  type="text"
                  id="inputText"
                  value={order?.phone || ""}
                  onChange={(e) => {
                    const newOrder = { ...order, phone: e.target.value };
                    setOrder(newOrder);
                  }}
                />
        </Col>
    </Row>
    <Row className='mt-2'>
        <Col>
            <Form.Label htmlFor="inputCustomerAddress">Address</Form.Label>
            <Form.Control
                  type="text"
                  id="inputText"
                  value={order?.customerAddress || ""}
                  onChange={(e) => {
                    const newOrder = { ...order, customerAddress: e.target.value };
                    setOrder(newOrder);
                  }}
                />
        </Col>
    </Row>
    <Row className='mt-2'>
        <AddressSelector order={order} setOrder={setOrder} />
    </Row>
    </>
    );

}



