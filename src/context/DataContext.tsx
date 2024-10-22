// src/context/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { useAuthState } from "react-firebase-hooks/auth";

interface DataContextType {
  users: User[];
  currentUser: User | null;
  orders: Order[];
  currentUserRole: "admin" | "operator" | null;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "operator" | null>(null);
  const [authUser, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && authUser) {
      console.log("Authenticated User Email:", authUser.email); // Debug log

      const usersRef = collection(db, "users");
      const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(fetchedUsers);

        // Find the user matching the authenticated email
        const currentUser = fetchedUsers.find(
          (user) => user.email.trim().toLowerCase() === authUser.email?.trim().toLowerCase()
        );

        if (currentUser) {
          console.log("Current User Role:", currentUser.role); // Debug log
          setCurrentUser(currentUser);
          setCurrentUserRole(currentUser.role);
        } else {
          console.error("No matching user found in Firestore.");
          setCurrentUserRole(null);
        }
      });

      return () => unsubscribeUsers();
    }
  }, [authUser, loading]);

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      console.log("Fetched Orders:", fetchedOrders); // Debug log
      setOrders(fetchedOrders);
    });

    return () => unsubscribeOrders();
  }, []);

  return (
    <DataContext.Provider value={{ users, orders, currentUser, currentUserRole, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
