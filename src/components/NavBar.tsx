// src/components/NavBar.tsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';
import { useData } from '../context/DataContext';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const {currentUserRole } = useData();
  

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">CRM Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/orders')}>Orders</Nav.Link>
            {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/users')}>Users</Nav.Link>}
            {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/logs')}>Logs</Nav.Link>}
            {currentUserRole == "admin" && <Nav.Link onClick={() => navigate('/products')}>Products</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "operator") && <Nav.Link onClick={() => navigate('/operator')}>Room</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "operator") && <Nav.Link onClick={() => navigate('/create-order')}>Create Order</Nav.Link>}
            {(currentUserRole == "admin" || currentUserRole == "packer") && <Nav.Link onClick={() => navigate('/scanner')}>Scanner</Nav.Link>}
          </Nav>
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
