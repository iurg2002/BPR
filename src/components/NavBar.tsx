// src/components/NavBar.tsx
import React from 'react';
import { Navbar, Nav, Container, Button, Form, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import { useData } from '../context/DataContext';
import { Country } from '../models/Countries';
import { OrderStatus } from '../models/OrderStatus';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUserRole, country, updateCountry, orders, currentUser } = useData(); // Assuming updateCountry exists in context

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = event.target.value as Country;
  
    // Check if the current user has active orders
    const activeOrders = orders.filter(
            (order) =>
              currentUser && order.assignedOperator === currentUser.displayName &&
              order.status === OrderStatus.InProgress
          );
  
    if (activeOrders.length > 0) {
      alert("Error: You have active orders. Please complete them before switching countries.");
      return; // Exit the function early if there are active orders
    }
  
    // Update the country if there are no active orders
    updateCountry(selectedCountry);
  };
  

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">CRM Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/orders')}>Orders</Nav.Link>
            {currentUserRole == "admin" &&  <NavDropdown title="Users" id="basic-nav-dropdown">
              {currentUserRole == "admin" &&  <NavDropdown.Item onClick={() => navigate('/users')}>Manage Users</NavDropdown.Item>}
              {currentUserRole == "admin" &&  <NavDropdown.Item onClick={() => navigate('/operator-manager')}>Operator Manager</NavDropdown.Item>}
            </NavDropdown>}
            {/* {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/users')}>Users</Nav.Link>} */}
            {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/logs')}>Logs</Nav.Link>}
            {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/products')}>Products</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "operator") && <Nav.Link onClick={() => navigate('/operator')}>Room</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "operator") && <Nav.Link onClick={() => navigate('/create-order')}>Create Order</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "packer") && <Nav.Link onClick={() => navigate('/scanner')}>Scanner</Nav.Link>}
            <Nav.Link onClick={() => navigate('/search-archive')}>Archive</Nav.Link>
          </Nav>
          <Form.Select
            className="me-2"
            value={country}
            onChange={handleCountryChange}
            style={{ width: '150px' }}
          >
            <option value={Country.RO}>Romania</option>
            <option value={Country.MD}>Moldova</option>
          </Form.Select>
          <Button variant="outline-light" onClick={() => {logoutUser()
            navigate('/')
          }}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
