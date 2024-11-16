import React, { useEffect, useState, useMemo } from "react";
import { Order } from "../models/Order";
import { useData } from "../context/DataContext"; // Use DataContext
import {
  updateOrder,
  releaseOrder,
  assignOrderToOperator,
  cancelOrder,
} from "../services/orderService";
import { OrderStatus } from "../models/OrderStatus";
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

const OperatorRoom: React.FC = () => {
  const { orders, products, currentUser, loading, users } = useData(); // Access the data context
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Calculate the total price of the order
  const totalPrice = useMemo(() => {
    if (!currentOrder) return 0;
    const productTotal = currentOrder.products.reduce(
      (sum, product) => sum + product.price + (product.upsell || 0),
      0
    );
    const discountAmount = currentOrder.discount || 0;
    return productTotal + currentOrder.deliveryPrice - discountAmount;
  }, [currentOrder]);

  useEffect(() => {
    console.log("Order Updated:", currentOrder);
  }, [currentOrder]);

  // Get the authenticated operator's user object
  const operator = users.find((user) => user.email === currentUser?.email);

  if (!operator) {
    return <div>Error: No operator found.</div>;
  }

  // Fetch the next available order and assign it to the operator
  const fetchNextOrder = async () => {
    try {
      if(currentOrder){
        const newOrder = {...currentOrder, callCount: currentOrder.callCount + 1}
        await updateOrder(currentOrder.id, newOrder);
        await releaseOrder(currentOrder.id);
        setCurrentOrder(null);
      }
      const activeOrders = orders.filter(
        (order) =>
          order.assignedOperator === operator.displayName &&
          order.status === OrderStatus.InProgress
      );

      if (activeOrders.length > 0) {
        alert(
          "You already have an active order. Please complete or release it before taking a new one."
        );
        setCurrentOrder(activeOrders[0]);
        return;
      }

      const pendingOrders = orders.filter(
        (order) => order.status === OrderStatus.Pending
      );
      if (pendingOrders.length > 0) {
        const nextOrder = pendingOrders[0];
        await assignOrderToOperator(nextOrder.id, operator.displayName);
        setCurrentOrder(nextOrder);
      } else {
        alert("No pending orders available.");
      }
    } catch (error) {
      console.error("Error fetching next order:", error);
    }
  };

  // Save changes to the order
  const saveOrder = async () => {
    if (currentOrder) {
      try {
        await updateOrder(currentOrder.id, { ...currentOrder, totalPrice });
        alert("Order updated successfully.");
      } catch (error) {
        console.error("Error updating order:", error);
        alert(error);
      }
    }
  };

  // Release the current order and make it available again
  const releaseCurrentOrder = async () => {
    if (currentOrder) {
      try {
        await releaseOrder(currentOrder.id);
        setCurrentOrder(null);
      } catch (error) {
        console.error("Error releasing order:", error);
        alert(error);
      }
    }
  };

  // Change status of the order to the selected status
  const changeOrderStatus = async (status: OrderStatus) => {
    if (currentOrder && operator) {
      try {
        await updateOrder(currentOrder.id, { ...currentOrder, status, assignedOperator: operator.displayName });
        alert(`Order status changed to ${status}.`);
        setCurrentOrder(null);
      } catch (error) {
        console.error("Error changing order status:", error);
      }
    }
  };




  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Container>
        <Row className="mt-3">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h2>Operator Room</h2>
                <h3>
                  {operator.displayName} -{" "}
                  <Badge bg="primary">Order ID: {currentOrder?.orderId}</Badge>
                </h3>
              </Card.Header>
              {currentOrder ? (
                <Card.Body>
                  <OrderPersonInfo
                    order={currentOrder}
                    setOrder={setCurrentOrder}
                  />
                  <ProductSelector
                    products={products}
                    order={currentOrder}
                    setOrder={setCurrentOrder}
                  />
                  <OrderAddonsInfo
                    order={currentOrder}
                    setOrder={setCurrentOrder}
                  />
                </Card.Body>
              ) : (
                <Card.Body>
                  <Alert variant="info">No order selected.</Alert>
                </Card.Body>
              )}
            </Card>
          </Col>
          <Col>
            {currentOrder ? (
              <OrderPriceCard order={{ ...currentOrder, totalPrice }} />
            ) : (
              <Alert variant="info">No order selected.</Alert>
            )}
          </Col>
        </Row>
        <Row className="mt-3 justify-content-center">
          <Col  xs="auto">
            <Button className="btn-secondary" onClick={() =>
              {
                saveOrder();
                releaseCurrentOrder();
              }
            }>Save & Close</Button>
          </Col>
          <Col xs="auto">
            <Button className="btn-danger" onClick={()=> {
              changeOrderStatus(OrderStatus.Cancelled);
            }}>Cancel Order</Button>
          </Col>

          <Col xs="auto">
          <Button className="btn-warning" onClick={()=>{
            changeOrderStatus(OrderStatus.CallLater)
            }}>Call Later</Button>
          </Col>

          <Col xs="auto">
          <Button onClick={()=>{
            fetchNextOrder()}}>Next Order</Button>
          </Col>

          <Col xs="auto">
          <Button className="btn-success" onClick={()=>{
            changeOrderStatus(OrderStatus.Confirmed)
            }}>Confirm</Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default OperatorRoom;
