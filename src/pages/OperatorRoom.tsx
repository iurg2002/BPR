import React, { useEffect, useState, useMemo } from "react";
import { Order } from "../models/Order";
import { useData } from "../context/DataContext"; // Use DataContext
import {
  updateOrder,
  releaseOrder,
  assignOrderToOperator,
  cancelOrder,
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
  Form,
  Table,
} from "react-bootstrap";
import { OrderPersonInfo } from "../components/OrderPersonInfo";
import ProductSelector from "../components/ProductSelector";
import OrderPriceCard from "../components/OrderPriceCard";
import { OrderAddonsInfo } from "../components/OrderAddonsInfo";
import SearchOrders from "../components/SearchOrder";
import { Log, LogActions } from "../models/LogModel";
import { addLog } from "../services/loggerService";
import { formatFirestoreTimestampToDate } from '../utils/Utils';
import { Timestamp } from 'firebase/firestore';
import { ProductInstance } from "../models/Product";



const OperatorRoom: React.FC = () => {
  const { orders, products, currentUser, loading, users } = useData(); // Access the data context
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [callCountFilter, setCallCountFilter] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
      const matchesType = typeFilter ? order.type === typeFilter : true;
      const matchesStatus = OrderStatus.Pending ? order.status === OrderStatus.Pending : true;
      const matchesCallCount =
        callCountFilter !== '' ? order.callCount === Number(callCountFilter) : true;
      return matchesType && matchesCallCount && matchesStatus;
    }).sort((a, b) => {
      // Handle different possible types of orderTime
      const timeA = a.orderTime instanceof Timestamp
        ? a.orderTime.toDate().getTime()
        : (a.orderTime as Date).getTime(); // If it's already a Date
      const timeB = b.orderTime instanceof Timestamp
        ? b.orderTime.toDate().getTime()
        : (b.orderTime as Date).getTime();
      return timeA - timeB; // Sort by orderTime from oldest to newest
    });

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
    setError(null);
    try {
      let lastOrder = currentOrder;
      if (currentOrder) {
        const newOrder = {
          ...currentOrder,
          callCount: currentOrder.callCount + 1,
        };
        await updateOrder(currentOrder.id, newOrder);
        await releaseOrder(currentOrder.id);
        setCurrentOrder(null);
        // createa a one second pause
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      const activeOrders = orders.filter(
        (order) =>
          order.assignedOperator === operator.displayName &&
          order.status === OrderStatus.InProgress
      );


      if (activeOrders.length > 0) {
        if(lastOrder && lastOrder.id === activeOrders[0].id && activeOrders.length === 1){} else {
        setError("You already have an active order. Please complete or release it before taking a new one.");
        const validatedOrder = validateAndSetOrder(activeOrders[0]);
        setCurrentOrder(validatedOrder);
        return;
      }}

      // const pendingOrders = orders.filter(
        // (order) => order.status === OrderStatus.Pending && order.type === typeFilter &&  order.callCount === callCountFilter);
      if (filteredOrders.length > 0) {
        const nextOrder = filteredOrders[0];
        await assignOrderToOperator(nextOrder.id, operator.displayName);
        const validatedOrder = validateAndSetOrder(nextOrder);
        setCurrentOrder(validatedOrder);
          
      } else {
        setError("No pending orders available.");
      }
      await addLog({ action: LogActions.Next, user: operator.email });
    } catch (error) {
      console.error("Error fetching next order:", error);
    }
  };

  const validateAndSetOrder = (order: Order | null) => {
    if (!order) return order;
  
    if (order.products && order.products.length > 0) {
      const updatedProducts = order.products.map((product, index) => {
        const foundProduct = products.find((p) => p.productId === product.productId);
  
        // Ensure each product has a unique instanceId
        const instanceId = product.instanceId || `${Date.now()}-${index}`;
  
        return foundProduct
          ? { ...foundProduct, instanceId } // Use the found product and add instanceId
          : { ...product, instanceId }; // Keep original product and add instanceId
      });
  
      return { ...order, products: updatedProducts };
    }
  
    return order;
  };
  
  

  // Save changes to the order
  const saveOrder = async () => {
    if (currentOrder) {
      try {
        await updateOrder(currentOrder.id, { ...currentOrder, totalPrice });
        await addLog({ action: LogActions.Save, user: operator.email });
        setError(null);
      } catch (error) {
        console.error("Error updating order:", error);
        alert(error);
      }
    }
  };

  const handleSetCurrentOrder = async (order: Order | null) => {
    try {
      if (currentOrder) {
        const newOrder = {
          ...currentOrder,
          callCount: currentOrder.callCount + 1,
        };
        await updateOrder(currentOrder.id, newOrder);
        await releaseOrder(currentOrder.id);
        setCurrentOrder(null);
      }
      if (order) {
        await assignOrderToOperator(order.id, operator.displayName);
        const validatedOrder = validateAndSetOrder(order);
        setCurrentOrder(validatedOrder);
      }
    } catch (e) {
      alert("Error Selecting order: " + e);
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
    setError(null);
    if (currentOrder && operator) {
      // Ensure a comment is present for cancellation
    if (status === OrderStatus.Cancelled || status === OrderStatus.CallLater && (!currentOrder.comment || !currentOrder.comment.trim())) {
      setError("A comment is required.");
      return;
    }

    // Ensure a comment is present for cancellation
    if (status === OrderStatus.Confirmed && (!currentOrder.address.state || !currentOrder.address.state.trim())
    || (!currentOrder.address.locality || !currentOrder.address.locality.trim())
    || (!currentOrder.address.street || !currentOrder.address.street.trim())
    || (!currentOrder.address.streetNr || !currentOrder.address.streetNr.trim())
    || (!currentOrder.address.zipcode || !currentOrder.address.zipcode.trim())) {
      setError("Please fill in the address to confirm the order.");
      return;
    }

    if (status === OrderStatus.Confirmed && currentOrder.products.length === 0) {
      setError("Please add products to confirm the order.");
      return;
    }
      try {
        await updateOrder(currentOrder.id, {
          ...currentOrder,
          status,
          assignedOperator: operator.displayName,
          totalPrice,
        });
        await addLog({ action: status, user: operator.email });
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
          <SearchOrders
            setCurrentOrder={handleSetCurrentOrder}
            currentUser={operator.email}
          />
        </Row>
        <Row className="mt-4 mb-3">
          <Col>
            <Form.Group controlId="filterStatus">
              <Form.Label>Filter by Status</Form.Label>
              <Form.Control
                as="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All</option>
                {/* iterate through each OrderStatus */}
                {Object.values(OrderType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="filterCallCount">
              <Form.Label>Filter by Call Count</Form.Label>
              <Form.Control
                type="number"
                value={callCountFilter}
                onChange={(e) => setCallCountFilter(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Enter Call Count"
              />
            </Form.Group>
          </Col>
        </Row>
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
          <Col xs="auto">
            <Button
              className="btn-secondary"
              onClick={() => {
                saveOrder();
                releaseCurrentOrder();
              }}
            >
              Save & Close
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              className="btn-danger"
              onClick={() => {
                changeOrderStatus(OrderStatus.Cancelled);
              }}
            >
              Cancel Order
            </Button>
          </Col>

          <Col xs="auto">
            <Button
              className="btn-warning"
              onClick={() => {
                changeOrderStatus(OrderStatus.CallLater);
              }}
            >
              Call Later
            </Button>
          </Col>

          <Col xs="auto">
            <Button
              onClick={() => {
                fetchNextOrder();
              }}
            >
              Next Order
            </Button>
          </Col>

          <Col xs="auto">
            <Button
              className="btn-success"
              onClick={() => {
                changeOrderStatus(OrderStatus.Confirmed);
              }}
            >
              Confirm
            </Button>
          </Col>
        </Row>
        <Row className="mt-3 justify-content-center">
        <Alert variant="danger" show={error !== null}>
          {error}
        </Alert>
        </Row>
        <Row className="mt-3 justify-content-center">
        <Table striped bordered hover className="mt-5">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Call Count</th>
              <th>Order Time</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.callCount}</td>
                <td>{formatFirestoreTimestampToDate(order.orderTime)}</td>
                <td>{order.type}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </Row>
      </Container>
    </>
  );
};

export default OperatorRoom;
