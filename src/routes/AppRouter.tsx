// src/routes/AppRouter.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import OrdersTable from "../components/OrdersTable";
import UserList from "../components/UserList";
// import OrderForm from "../components/OrderForm";
import OperatorRoom from "../pages/OperatorRoom";
import ProtectedRoute from "./ProtectedRoute";
import NavBar from "../components/NavBar";
import Scanner from "../components/Scanner";
import CreateOrder from "../pages/CreateOrder";
import UsersPage from "../pages/UsersPage";
import ProductsPage from "../pages/ProductsPage";
import OrdersPage from "../pages/OrdersPage";
import LogsPage from "../pages/LogsPage";

const AppRouter = () => (
  <Router>
    <NavBar />
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/scanner" element={<Scanner />} />;
        <Route path="/logs" element={<LogsPage />} />;
        {/* <Route path="/create-order" element={<OrderForm />} /> */}
        <Route path="/operator" element={<OperatorRoom />} />
        <Route path="/create-order" element={<CreateOrder />} />
      </Route>

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;
