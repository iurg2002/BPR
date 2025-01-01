import React, { useState } from "react";
import { Order } from "../models/Order";
import { useData } from "../context/DataContext"; // Use DataContext
import {
  Card,
  Col,
  Row,
  Button,
  Alert,
  Container,
  Form,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {formatFirestoreTimestampToDate} from "../utils/Utils";
import { addLog } from "../services/loggerService";
import { LogActions } from "../models/LogModel";

const SearchOrders: React.FC<{ setCurrentOrder: (order: Order | null) => void, currentUser: string }> = ({ setCurrentOrder, currentUser }) => {
  const { orders } = useData(); // Access the data context
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const results = orders.filter((order) =>
      order.name.toLowerCase().includes(term.toLowerCase()) ||
      order.phone.toString().includes(term) ||
      order.orderId.toString().includes(term)
    );
    setFilteredOrders(results);
  };

  const selectOrder = (order: Order) => {
    addLog({action: LogActions.Search, user: currentUser})
    setCurrentOrder(order);
    setSearchTerm(""); // Clear the search term
    setFilteredOrders([]); // Clear the dropdown
  };

  return (
    <Container>
      <Row className="mt-3">
        <Col>
              <Form>
                <div style={{ position: "relative" }}>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, phone, or order ID"
                    autoComplete="off"
                  />
                  {searchTerm && filteredOrders.length > 0 && (
                    <ListGroup
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 1050, // Ensure it hovers above other components
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredOrders.map((order) => (
                        <ListGroup.Item
                          key={order.id}
                          action
                          onClick={() => selectOrder(order)}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>Order ID:</strong> {order.orderId} |
                            <strong> Name:</strong> {order.name} |
                            <strong> Phone:</strong> {order.phone} |
                            <strong> Status:</strong> {order.status} |
                            <strong> Order Time:</strong> {formatFirestoreTimestampToDate(order.orderTime)}
                            {order.assignedOperator && (
                              <Badge bg="primary" className="ms-2">
                                Assigned Operator: {order.assignedOperator} 
                              </Badge>
                            )}
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchOrders;
