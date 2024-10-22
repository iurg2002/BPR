// src/routes/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { User } from "../models/User";
import { Spinner } from "react-bootstrap";

const ProtectedRoute: React.FC = () => {
  const [authUser, loading] = useAuthState(auth);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [roleLoading, setRoleLoading] = useState<boolean>(true); // Loading state for role check

  // Fetch all users and match the authenticated user's email
  useEffect(() => {
    const fetchAndCheckUserRole = async () => {
      if (loading || !authUser) return; // Wait for auth to load

      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => doc.data() as User);

        // Find the user with the same email as the authenticated user
        const matchingUser = users.find((user) => user.email === authUser.email);

        if (matchingUser && (matchingUser.role === "admin" || matchingUser.role === "operator")) {
          setAuthorized(true); // User is authorized
          console.log(matchingUser.role, "role authorized.");
        } else {
          console.error("Unauthorized role or no matching user found.");
          setAuthorized(false); // Unauthorized or no match found
        }
      } catch (error) {
        console.error("Error fetching users from Firestore:", error);
        setAuthorized(false);
      } finally {
        setRoleLoading(false); // Stop loading after role check
      }
    };

    fetchAndCheckUserRole();
  }, [authUser, loading]);

  if (roleLoading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>; // Display loading indicator
  }

  return authorized ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
