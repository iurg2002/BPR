// src/services/orderService.ts
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { Order } from "../models/Order";
import { FirebaseCollections } from "../models/FirebaseCollections";

const ordersRef = collection(db, FirebaseCollections.Orders);

// Add a new order
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
  const now = new Date();
  const docRef = await addDoc(ordersRef, { ...order, createdAt: now, updatedAt: now });
  return { id: docRef.id, ...order, createdAt: now, updatedAt: now };
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(ordersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

// Get all pending orders
export const getPendingOrders = async (): Promise<Order[]> => {
    try {
      const q = query(
        collection(db, FirebaseCollections.Orders),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      console.error("Error fetching pending orders: ", error);
      return [];
    }
  };

  
// Update an order
export const updateOrder = async (id: string, data: Partial<Order>) => {
  const docRef = doc(ordersRef, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

// Delete an order
export const deleteOrder = async (id: string) => {
  const docRef = doc(ordersRef, id);
  await deleteDoc(docRef);
};

// Query orders by phone number
export const getOrdersByPhone = async (phoneNumber: string): Promise<Order[]> => {
  const q = query(ordersRef, where("phoneNumber", "==", phoneNumber));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};
