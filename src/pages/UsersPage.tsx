import React, { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { Table, Alert, Spinner, Container, Button, Modal, Form } from "react-bootstrap";
import { User } from "../models/User";
import { updateUser, addUserDetails, deleteUser } from "../services/userService";

const UsersPage: React.FC = () => {
  const { users, currentUserRole, loading } = useData();
  const [isRoleChecked, setIsRoleChecked] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatedUserData, setUpdatedUserData] = useState<Partial<User>>({
    displayName: "",
    role: null,
  });
  const [newUserData, setNewUserData] = useState({
    email: "",
    displayName: "",
    role: "",
  });

  useEffect(() => {
    if (!loading && users.length > 0) {
      setIsRoleChecked(true);
    }
  }, [users, loading]);

  if (loading || !isRoleChecked) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  }

  if (currentUserRole !== "admin") {
    return <Alert variant="danger">You do not have permission to view this page.</Alert>;
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUpdatedUserData({ displayName: user.displayName || "", role: user.role || null });
    setShowEditModal(true);
  };

  const handleSaveChanges = () => {
    if (selectedUser) {
      updateUser(selectedUser.id, updatedUserData);
      setShowEditModal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    try {
      await addUserDetails(newUserData.email, newUserData.role as 'admin' | 'operator' | null, newUserData.displayName);
      setNewUserData({ email: "", displayName: "", role: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  return (
    <Container>
      <Table striped bordered hover className="mt-5">
        <thead>
          <tr>
            <th>Email</th>
            <th>Display Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.displayName || "N/A"}</td>
              <td>{user.role}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" className="mt-3" onClick={() => setShowAddModal(true)}>
        Add User
      </Button>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formDisplayName">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                type="text"
                name="displayName"
                value={updatedUserData.displayName}
                onChange={handleInputChange}
                placeholder="Enter display name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRole">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={updatedUserData.role || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formNewEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newUserData.email}
                onChange={handleNewUserInputChange}
                placeholder="Enter email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formNewDisplayName">
              <Form.Label>Display Name</Form.Label>
              <Form.Control
                type="text"
                name="displayName"
                value={newUserData.displayName}
                onChange={handleNewUserInputChange}
                placeholder="Enter display name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formNewRole">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={newUserData.role}
                onChange={handleNewUserInputChange}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Add User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersPage;
