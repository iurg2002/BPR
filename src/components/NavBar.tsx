// src/components/NavBar.tsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/authService';

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">CRM Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/orders')}>Orders</Nav.Link>
            <Nav.Link onClick={() => navigate('/users')}>Users</Nav.Link>
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
