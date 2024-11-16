import React, { useState } from "react";
import { Col, Form } from "react-bootstrap";
import { Order } from "../models/Order";
import { addresses } from "../context/AddressesGLS";
import SearchComponent from "./SearchComponent";

interface AddressSelectorProps {
  order: Order;
  setOrder: (order: Order) => void;
}

function AddressSelector({ order, setOrder }: AddressSelectorProps) {
  const [state, setState] = useState<string>(order.address?.state || "");
  const [locality, setLocality] = useState<string>(
    order.address?.locality || ""
  );
  const [street, setStreet] = useState<string>(order.address?.street || "");
  const [localities, setLocalities] = useState<string[]>([]);
  const [streets, setStreets] = useState<string[]>([]);

  function getUniqueValues(inputArray: string[]): string[] {
    return Array.from(new Set(inputArray));
  }

  function onSelectState(currentState: string): void {
    setState(currentState);
    setLocality("");
    setLocalities(
      getUniqueValues(
        addresses
          .filter((address) => address.Judet === currentState)
          .map((address) => address.Localitate)
      )
    );
    setStreets([]);
    setStreet("");
    const newOrder: Order = {
      ...order,
      address: {
        ...order.address,
        state: currentState,
        locality: "",
        street: "",
        zipcode: "",
      },
    };
    setOrder(newOrder);
  }

  function onSelectLocality(currentLocality: string): void {
    setLocality(currentLocality);
    const filteredStreets = getUniqueValues(
      addresses
        .filter(
          (address) =>
            address.Judet === state && address.Localitate === currentLocality
        )
        .map((address) => address.Strada)
    );
    console.log("Filtered streets ", filteredStreets);
    setStreets(filteredStreets);
    setStreet("");
    const zipcode =
      filteredStreets.length === 1
        ? addresses.find(
            (address) =>
              address.Judet === state && address.Localitate === currentLocality
          )?.Codpostal || ""
        : "";
    const newOrder: Order = {
      ...order,
      address: {
        ...order.address,
        locality: currentLocality,
        street: "",
        zipcode,
      },
    };
    setOrder(newOrder);
  }

  function onSelectStreet(currentStreet: string): void {
    setStreet(currentStreet);
    if (streets.length > 1) {
      const zipcode =
        addresses.find(
          (address) =>
            address.Judet === state &&
            address.Localitate === locality &&
            address.Strada === currentStreet
        )?.Codpostal || "";
      const newOrder: Order = {
        ...order,
        address: { ...order.address, street: currentStreet, zipcode },
      };
      setOrder(newOrder);
    } else {
      const newOrder: Order = {
        ...order,
        address: { ...order.address, street: currentStreet },
      };
      setOrder(newOrder);
    }
  }

  return (
    <>
      <Col md={2}>
        <Form.Label>State</Form.Label>
        <SearchComponent
          addresses={getUniqueValues(addresses.map((a) => a.Judet))}
          onSelectAddress={onSelectState}
          exactMatch={true}
          fieldValue={state}
        />
      </Col>
      <Col md={2}>
        <Form.Label>Locality</Form.Label>
        <SearchComponent
          addresses={localities}
          onSelectAddress={onSelectLocality}
          exactMatch={true}
          fieldValue={locality}
        />
      </Col>
      <Col md={4}>
        <Form.Label>Street</Form.Label>
        <SearchComponent
          addresses={streets}
          onSelectAddress={onSelectStreet}
          exactMatch={true}
          fieldValue={street}
        />
      </Col>
      <Col md={2}>
        <Form.Label htmlFor="inputStreetNr">Street Nr.</Form.Label>
        <Form.Control
          type="text"
          id="inputStreetNr"
          value={order.address?.streetNr || ""}
          onChange={(e) => {
            const newOrder: Order = {
              ...order,
              address: { ...order.address, streetNr: e.target.value },
            };
            setOrder(newOrder);
          }}
        />
      </Col>
      <Col md={2}>
        <Form.Label htmlFor="inputZipcode">ZipCode</Form.Label>
        <Form.Control
          type="text"
          id="inputZipcode"
          value={order.address?.zipcode || ""}
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input)) {
              const newOrder: Order = {
                ...order,
                address: { ...order.address, zipcode: input },
              };
              setOrder(newOrder);
            }
          }}
        />
      </Col>
    </>
  );
}

export default AddressSelector;
