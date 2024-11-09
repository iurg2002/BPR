import React from 'react';
import { Table, Spinner, Col, Row, Form  } from 'react-bootstrap';
import { Order } from '../models/Order';
import { useState } from 'react';
import { addresses } from '../context/AddressesGLS';
import SearchComponent from './SearchComponent';

interface AddressSelectorProps {
    order: Order;
    setOrder: (order: Order) => void;
  }
  
  export function AddressSelector({ order, setOrder }: AddressSelectorProps) {
    const [localities, setLocalities] = useState<string[]>([]);
    const [streets, setStreets] = useState<string[]>([]);
  
    // Generic function to handle address field updates
    const handleAddressChange = (field: keyof Order['address'], value: string) => {
      const updatedAddress = { ...order.address, [field]: value };
      setOrder({ ...order, address: updatedAddress });
  
      // Set localities and streets based on selection
      if (field === 'state') {
        setLocalities(getUniqueValues(
          addresses.filter((addr) => addr.Judet === value).map((addr) => addr.Localitate)
        ));
        setStreets([]); // Clear streets when state changes
      } else if (field === 'locality') {
        setStreets(getUniqueValues(
          addresses.filter((addr) => addr.Judet === order.address.state && addr.Localitate === value).map((addr) => addr.Strada)
        ));
      }
  
      // Automatically set zipcode if it's unique for selected locality and street
      if (field === 'street') {
        const matchedAddress = addresses.find(
          (addr) =>
            addr.Judet === order.address.state &&
            addr.Localitate === order.address.locality &&
            addr.Strada === value
        );
        if (matchedAddress) {
          handleAddressChange('zipcode', matchedAddress.Codpostal);
        }
      }
    };
  
    const getUniqueValues = (array: string[]): string[] => Array.from(new Set(array));
  
    return (
      <>
        <Col md={2}>
          <Form.Label>State</Form.Label>
          <SearchComponent
            addresses={getUniqueValues(addresses.map((a) => a.Judet))}
            onSelectAddress={(state) => handleAddressChange('state', state)}
            exactMatch={true}
            fieldValue={order.address.state}
          />
        </Col>
        <Col md={2}>
          <Form.Label>Locality</Form.Label>
          <SearchComponent
            addresses={localities}
            onSelectAddress={(locality) => handleAddressChange('locality', locality)}
            exactMatch={true}
            fieldValue={order.address.locality}
          />
        </Col>
        <Col md={4}>
          <Form.Label>Street</Form.Label>
          <SearchComponent
            addresses={streets}
            onSelectAddress={(street) => handleAddressChange('street', street)}
            exactMatch={true}
            fieldValue={order.address.street}
          />
        </Col>
        <Col md={2}>
          <Form.Label htmlFor="inputStreetNr">Street Nr.</Form.Label>
          <Form.Control
            type="text"
            id="inputStreetNr"
            value={order.address.streetNr || ""}
            onChange={(e) => handleAddressChange('streetNr', e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label htmlFor="inputZipcode">ZipCode</Form.Label>
          <Form.Control
            type="text"
            id="inputZipcode"
            value={order.address.zipcode || ""}
            onChange={(e) => {
              const input = e.target.value;
              if (/^\d*$/.test(input)) handleAddressChange('zipcode', input);
            }}
          />
        </Col>
      </>
    );
  }
  
  export default AddressSelector;