import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  Button,
  Alert,
} from "react-bootstrap";
import { loginUser, registerUser } from "../services/authService"; // Replace with your services
import { useNavigate } from "react-router-dom";
import { addUser , addUserAuth} from "../services/userService";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and signup
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous error

    try {
      if (isSignUp) {
        // Register user
        // await registerUser({ email, password }); // Ensure name is included for registration
        await addUserAuth(email, password);
      } else {
        // Log in user
        await loginUser({ email, password });
      }
      navigate("/orders"); // Redirect after successful login or signup
    } catch (err) {
      alert(err);
      setError(
        isSignUp
          ? "Failed to register. Please try again."
          : "Invalid email or password."
      );
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
    >
      <Row className="w-100">
        <Col xs={12} md={6} lg={4} className="mx-auto p-4 shadow bg-white rounded">
          <h2 className="text-center mb-4">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} className="mt-3">
            {isSignUp && (
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Full Name</Form.Label>
                <FormControl
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <FormControl
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <FormControl
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-100 mt-3"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </Form>
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-3 d-block w-100 text-center"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
