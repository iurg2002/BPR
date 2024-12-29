import React, { useEffect, useState, useMemo } from "react";
import { Order } from "../models/Order";
import { useData } from "../context/DataContext"; // Use DataContext
import {
  updateOrder,
  releaseOrder,
  assignOrderToOperator,
  cancelOrder,
  addOrder,
} from "../services/orderService";
import { OrderStatus, OrderType } from "../models/OrderStatus";
import {
  Card,
  Col,
  Row,
  Button,
  Alert,
  Container,
  Badge,
} from "react-bootstrap";
import { OrderPersonInfo } from "../components/OrderPersonInfo";
import ProductSelector from "../components/ProductSelector";
import OrderPriceCard from "../components/OrderPriceCard";
import { OrderAddonsInfo } from "../components/OrderAddonsInfo";
import { Form } from "react-bootstrap";

const CreateOrder: React.FC = () => {
    const { orders, products, currentUser, loading, users, country } = useData();
    const [newOrder, setNewOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        console.log("Order Updated:", newOrder);
      }, [newOrder]);
    // Calculate the total price of the order
    const totalPrice = useMemo(() => {
        if (!newOrder) return 0;
        const productTotal = newOrder.products.reduce(
          (sum, product) => sum + product.price + (product.upsell || 0),
          0
        );
        const discountAmount = newOrder.discount || 0;
        return productTotal + newOrder.deliveryPrice - discountAmount;
      }, [newOrder]);
  
    const operator = users.find((user) => user.email === currentUser?.email);
  
    if (!operator) {
      return <div>Error: No operator found.</div>;
    }

    function getOrderId(): number {
        let orderId = orders[orders.length-1].orderId + 999000000;
        // cehck if the order id is already taken
        while(orders.find(order => order.orderId === orderId)){
            orderId = orderId * 10;
        }
        return orderId;
    }
  
    function createEmptyOrder(): Order{
        let orderId = getOrderId()
        return{
      orderId: orderId,
      id: orderId.toString(),
      name: "",
      phone: "",
      status: "pending",
      assignedOperator: null,
      callCount: 0,
      comment: "",
      discount: 0,
      orderTime: new Date(),
      products: [],
      type: OrderType.Success,
      address: {
        state: "",
        locality: "",
        street: "",
        streetNr: "",
        zipcode: "",
      },
      customerAddress: "",
      deliveryPrice: 0,
      deliveryDate: null,
      totalPrice: 0,
    }
}
  

  
    const saveOrder = async () => {
      if (checkForErrors()) return;
  
      try {
        console.log("Saving order:", newOrder);
        // Proceed with saving logic (e.g., Firestore integration)
        if(newOrder == null) throw new Error("No order selected.");
        await addOrder(newOrder.id, newOrder, country);
        setNewOrder(null);
      } catch (error) {
        console.error("Error saving order:", error);
        setError("Failed to save order. Please try again.");
      }
    };
  
    const checkForErrors = (): boolean => {
      setError(null);
      if (!newOrder) {
        setError("No order selected.");
        return true;
      }
      if (!newOrder.name) {
        setError("Name is missing.");
        return true;
      }
      if (!newOrder.phone) {
        setError("Phone is missing.");
        return true;
      }
      if (!newOrder.products || newOrder.products.length === 0) {
        setError("No products selected.");
        return true;
      }
      if (
        !newOrder.address ||
        !newOrder.address.street ||
        !newOrder.address.streetNr ||
        !newOrder.address.locality ||
        !newOrder.address.state ||
        !newOrder.address.zipcode
      ) {
        setError("Address is incomplete.");
        return true;
      }
      return false;
    };
  
    if (loading) return <div>Loading...</div>;
  
    return (
      <Container>
        <Row className="mt-3">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h2>Operator Room</h2>
                <h3>
                  {operator.displayName} -{" "}
                  <Badge bg="primary">Order ID: {newOrder?.orderId || "N/A"}</Badge>
                {newOrder && (
                  <Form.Select
                    className="mt-2"
                    aria-label="Select order status"
                    onChange={(e) => {
                      const status = e.target.value as OrderStatus;
                      if (newOrder) {
                        setNewOrder({ ...newOrder, status });
                      }
                    }}
                    >
                        {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </Form.Select>
                )}
                    
                </h3>
              </Card.Header>
              {newOrder ? (
                <Card.Body>
                  <OrderPersonInfo order={newOrder} setOrder={setNewOrder} />
                  <ProductSelector products={products} order={newOrder} setOrder={setNewOrder} />
                  <OrderAddonsInfo order={newOrder} setOrder={setNewOrder} />
                </Card.Body>
              ) : (
                <Card.Body>
                  <Alert variant="info">No order selected.</Alert>
                  <Button
                    className="btn-primary"
                    onClick={() => setNewOrder(createEmptyOrder())}
                  >
                    Create New Order
                  </Button>
                </Card.Body>
              )}
            </Card>
          </Col>
          <Col>
            {newOrder ? (
              <OrderPriceCard order={{ ...newOrder, totalPrice }} />
            ) : (
              <Alert variant="info">No order selected.</Alert>
            )}
          </Col>
        </Row>
        <Row className="mt-3 justify-content-center">
          <Col xs="auto">
            <Button className="btn-success" onClick={saveOrder}>
              Save Order
            </Button>
          </Col>
        </Row>
        {error && (
          <Row className="mt-5">
            <Alert variant="danger">{error}</Alert>
          </Row>
        )}
      </Container>
    );
  };
  
  export default CreateOrder;
  
