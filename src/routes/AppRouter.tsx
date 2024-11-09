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

const AppRouter = () => (
  <Router>
    <NavBar />
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/orders" element={<OrdersTable />} />
        <Route path="/users" element={<UserList />} />
        {/* <Route path="/create-order" element={<OrderForm />} /> */}
        <Route path="/operator" element={<OperatorRoom />} />
      </Route>

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;
