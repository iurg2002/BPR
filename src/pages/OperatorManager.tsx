import React, { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Container,
  Form,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { SentOrder } from "../models/Order";
import { getArchiveOrdersByUserAndInterval } from "../services/orderService";
import { useData } from "../context/DataContext";
import { formatFirestoreTimestampToDate } from "../utils/Utils";

const OperatorManager: React.FC = () => {
  const { users, loading, country } = useData(); // Fetch operators from context
  const [operators, setOperators] = useState(users);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [SentOrders, setSentOrders] = useState<SentOrder[]>([]);

  
  useEffect(() => {
    const groupedData = groupSentOrders(SentOrders);
    setGroupedData(groupedData);
    console.log('Grouped data:', groupedData);
    }, [SentOrders]);

  useEffect(() => {
    if (!loading && users.length > 0) {
        const operators = users.filter((user) => user.role === "operator");
      setOperators(operators);
    }
  }, [users, loading]);

  const formatDateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59
  );

  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>(
    formatDateToInput(startOfDay)
  );
  const [endTime, setEndTime] = useState<string>(formatDateToInput(endOfDay));
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && operators.length > 0 && !selectedOperator) {
      setSelectedOperator(operators[0]?.id || null); // Set default operator
    }
  }, [operators, loading]);

  useEffect(() => {
    console.log("Selected operator:", selectedOperator);
    console.log('Sent orders:', SentOrders);
    }, [selectedOperator, SentOrders]);

  const handleFetchArchivedLogs = async () => {
    if (!selectedOperator || !startTime || !endTime) {
      alert("Please select an operator and specify a valid time interval.");
      return;
    }

    setIsFetching(true);

    try {
      const archivedLogsData = await getArchiveOrdersByUserAndInterval(
        selectedOperator,
        new Date(startTime),
        new Date(endTime),
        country
      );
      setSentOrders(archivedLogsData);
    } catch (error) {
      console.error("Failed to fetch archived logs:", error);
    } finally {
      setIsFetching(false);
    }
  };

  type GroupedData = {
    date: string; // Grouped by date
    operator: string | null; // Operator name
    ordersInArchive: number; // Total orders
    deliveredOrders: number; // Orders with awbStatus "delivered"
    upsellTotal: number; // Total upsell amount
    upsellAvg: number; // Total upsell amount
    upsellCount: number; // Total upsell amount
    upsellProcent: number; // Total upsell procent amount
    crossSellTotal: number; // Total upsell amount
    crossSellAvg: number; // Total upsell amount
    crossSellCount: number; // Total upsell amount
    crossSellProdAmount: number; // Total upsell amount
    crossSellProcent: number; // Total upsell procent amount
    extraSellCount: number; // Total upsell amount
    extraSellProcents: number; // Total upsell procent amount
  };
  
  function groupSentOrders(orders: SentOrder[]): GroupedData[] {
    // Create a map to store grouped data
    const groupedData = new Map<string, GroupedData>();
  
    orders.forEach((order) => {
      const date = formatFirestoreTimestampToDate(order.updatedAt).split(' ')[0]; // Extract date from updatedAt
      console.log('Raw updatedAt:', order.updatedAt);
      console.log('Formatted date:', formatFirestoreTimestampToDate(order.updatedAt));
      const operator = order.assignedOperator || 'Unassigned';
      const key = `${date}_${operator}`;
  
      if (!groupedData.has(key)) {
        groupedData.set(key, {
          date,
          operator,
          ordersInArchive: 0,
          deliveredOrders: 0,
          upsellTotal: 0,
          upsellAvg: 0,
          upsellCount: 0,
          upsellProcent: 0,
          crossSellTotal: 0,
          crossSellAvg: 0,
          crossSellCount: 0,
          crossSellProdAmount: 0,
          crossSellProcent: 0,
          extraSellCount: 0,
          extraSellProcents: 0,
        });
      }
  
      const current = groupedData.get(key)!;
      current.ordersInArchive += 1;
      if (order.awbStatus === 'delivered') {
        current.deliveredOrders += 1;
      }
      
      // count upsell total
      let orderUpsell = order.products.reduce((total, product) => 
        {
            if(product.upsell){
            total += parseInt(product?.upsell.toString())
        }

            return total;
        }, 0);
      current.upsellTotal += orderUpsell
        // count upsell average
        current.upsellAvg = parseInt((current.upsellTotal / current.ordersInArchive).toFixed(4));

        // count upsell Count
        if(orderUpsell > 0){current.upsellCount += 1;}

        // count upsell procent
        current.upsellProcent = parseInt(((current.upsellCount / current.ordersInArchive) * 100).toFixed(2));

        // count cross sell total
        current.crossSellTotal += order.products.reduce((total, product, index) => 
        {
          if(index > 0){
            if(product.price){
              if(!product.productId.includes('cutie') && !product.productId.includes('garantie')){
            total += parseInt(product?.price.toString())
            }}
        }

            return total;
        }, 0);

        // count cross sell average
        current.crossSellAvg = parseInt((current.crossSellTotal / current.ordersInArchive).toFixed(4));

        // count cross sell Count
        let orderCrossSellsCount = order.products.reduce((total, product, index) => 
          {
            if(index > 0){
              if(product.price){
                if(!product.productId.includes('cutie') && !product.productId.includes('garantie')){
              total += 1
              }}
          }
              return total;
          }, 0);

        if(orderCrossSellsCount > 0){current.crossSellCount += 1;}

        // current.crossSellCount += orderCrossSellsCount

        // count cross sell product amount
        // current.crossSellProdAmount += order.products.length - 1;

        // count cross sell procent
        current.crossSellProcent = parseInt(((current.crossSellCount / current.ordersInArchive) * 100).toFixed(2));

        // count extra sell count (cross sell or upsell)
    

        if(orderCrossSellsCount > 0 || orderUpsell > 0){
          current.extraSellCount += 1;
        }

        // count extra sell procent
        current.extraSellProcents = parseInt(((current.extraSellCount / current.ordersInArchive) * 100).toFixed(2));



    });
  
    return Array.from(groupedData.values());
  }


  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <Form.Group controlId="selectOperator">
            <Form.Label>Select Operator</Form.Label>
            <Form.Select
              value={selectedOperator || "all"}
              onChange={(e) => setSelectedOperator(e.target.value)}
            > <option value="all">All Operators</option>
              {operators.map((operator) => (
                <option key={operator.displayName} value={operator.displayName}>
                  {operator.displayName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="startTime">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="endTime">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={handleFetchArchivedLogs} disabled={isFetching}>
            {isFetching ? <Spinner animation="border" size="sm" /> : "Fetch Logs"}
          </Button>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Operator</th>
                <th>Confirmed</th>
                <th>Delivered</th>
                <th>Upsell Total</th>
                <th>Upsell Avg</th>
                <th>Upsell Count</th>
                <th>Upsell Procent</th>
                <th>Cross Sell Total</th>
                <th>Cross Sell Avg</th>
                <th>Cross Sell Count</th>
                {/* <th>Cross Sell Product Amount</th> */}
                <th>Cross Sell Procent</th>
                <th>Extra Sell Count</th>
                <th>Extra Sell Procent</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((log, index) => (
                <tr key={index}>
                  <td>{log.date}</td>
                  <td>{log.operator}</td>
                  <td>{log.ordersInArchive}</td>
                  <td>{log.deliveredOrders}</td>
                <td>{log.upsellTotal}</td>
                <td>{log.upsellAvg}</td>
                <td>{log.upsellCount}</td>
                <td>{log.upsellProcent}%</td>
                <td>{log.crossSellTotal}</td>
                <td>{log.crossSellAvg}</td>
                <td>{log.crossSellCount}</td>
                {/* <td>{log.crossSellProdAmount}</td> */}
                <td>{log.crossSellProcent}%</td>
                <td>{log.extraSellCount}</td>
                <td>{log.extraSellProcents}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default OperatorManager;
