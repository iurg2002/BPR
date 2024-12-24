import React, { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Container,
  Form,
  Row,
  Col,
  Button,
  Badge,
} from "react-bootstrap";
import { Log } from "../models/LogModel";
import { getLogsByUserAndInterval } from "../services/loggerService";
import { useData } from "../context/DataContext";

const LogsPage: React.FC = () => {
  const { users, loading } = useData(); // Fetch users from context

  // Helper function to format Date as 'YYYY-MM-DDTHH:mm'
  const formatDateToInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get today's start and end time
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

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>(
    formatDateToInput(startOfDay)
  ); // Today at 00:00
  const [endTime, setEndTime] = useState<string>(formatDateToInput(endOfDay)); // Today at 23:59
  const [logs, setLogs] = useState<Log[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]?.id || null); // Set default user
    }
  }, [users, loading]);

  const getTimeDifferenceInMinutes = (date1: Date, date2: Date): number => {
    return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60));
  };

  const getBadge = (currentLog: Log, previousLog: Log | null): JSX.Element => {
    if (!previousLog) {
      return <Badge bg="secondary">New Entry</Badge>; // Default badge for the first log
    }

    const timeDifference = getTimeDifferenceInMinutes(
      new Date(currentLog.actionDate),
      new Date(previousLog.actionDate)
    );

    if (currentLog.action === "confirm" && timeDifference > 7) {
      return <Badge bg="danger">High Priority</Badge>; // Red badge for "confirm" actions with > 7 mins
    }

    if (currentLog.action !== "confirm" && timeDifference > 3) {
      return <Badge bg="warning">Moderate Priority</Badge>; // Yellow badge for other actions with > 3 mins
    }

    return <Badge bg="success">On Time</Badge>; // Green badge for logs meeting the criteria
  };

  const handleFetchLogs = async () => {
    if (!selectedUser || !startTime || !endTime) {
      alert("Please select a user and specify a valid time interval.");
      return;
    }

    setIsFetching(true);

    try {
      const logsData = await getLogsByUserAndInterval(
        selectedUser,
        new Date(startTime),
        new Date(endTime)
      );
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Container>
      <Row className="mt-4 mb-3">
        <Col>
          <Form.Group controlId="selectUser">
            <Form.Label>Select User</Form.Label>
            <Form.Select
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.displayName || user.email}
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
          <Button onClick={handleFetchLogs} disabled={isFetching}>
            {isFetching ? "Fetching..." : "Fetch Logs"}
          </Button>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const previousLog = logs[index - 1] || null;

                return (
                  <tr key={index}>
                    <td>{log.action}</td>
                    <td>
                      {new Date(log.actionDate).toLocaleString()} -{" "}
                      {getBadge(log, previousLog)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default LogsPage;
