// src/components/UserList.tsx
import React, { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { Navigate } from "react-router-dom";
import { Table, Alert, Spinner } from 'react-bootstrap';

const UserList: React.FC = () => {
  const { users, currentUserRole, loading } = useData(); // Access data from context
  const [isRoleChecked, setIsRoleChecked] = useState(false); // Track role checking state

  useEffect(() => {
    console.log("Users:", users); // Log fetched users
    console.log("Current User Role:", currentUserRole); // Log role
    console.log("Loading:", loading); // Log loading state

    // Wait until users are loaded, then check role
    if (!loading && users.length > 0) {
      setIsRoleChecked(true); // Role is now checked
    }
  }, [users, currentUserRole, loading]);

  // Show loading indicator while fetching users or checking role
  if (loading || !isRoleChecked) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  // Redirect if the user is not an admin
  if (currentUserRole !== "admin") {
    console.warn("Access denied: Not an admin."); // Log warning
    return <Alert variant="danger">You do not have permission to view this page.</Alert>;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Email</th>
          <th>Display Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.displayName || 'N/A'}</td>
            <td>{user.role}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default UserList;
