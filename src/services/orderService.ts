// src/services/orderService.ts
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import { Order } from "../models/Order";
import { FirebaseCollections } from "../models/FirebaseCollections";
import { OrderStatus } from "../models/OrderStatus";

const ordersRef = collection(db, FirebaseCollections.Orders);

// Add a new order with specific document ID
export const addOrder = async (id: string, order: Order): Promise<void> => {
  const docRef = doc(ordersRef, id);
  await setDoc(docRef, order);
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(ordersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

// Get all pending orders
export const getPendingOrders = async (): Promise<Order[]> => {
  try {
    const q = query(ordersRef, where("status", "==", OrderStatus.Pending));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
  } catch (error) {
    console.error("Error fetching pending orders: ", error);
    return [];
  }
};

// Query orders by phone number
export const getOrdersByPhone = async (phoneNumber: string): Promise<Order[]> => {
  const q = query(ordersRef, where("phoneNumber", "==", phoneNumber));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

// Update an order (partial update)
export const updateOrder = async (id: string, data: Partial<Order>): Promise<void> => {
  const docRef = doc(ordersRef, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  const docRef = doc(ordersRef, id);
  await deleteDoc(docRef);
};

// Assign an order to an operator and mark it as 'in_progress'
export const assignOrderToOperator = async (
  orderId: string,
  operatorId: string
): Promise<void> => {
  const orderRef = doc(ordersRef, orderId);

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists()) {
      throw new Error('Order not found.');
    }

    const order = orderDoc.data() as Order;
    if (order.status !== 'pending') {
      throw new Error('Order is not available for assignment.');
    }

    transaction.update(orderRef, {
      status: OrderStatus.InProgress,
      assignedOperator: operatorId,
      updatedAt: new Date(),
    });
  });
};


// Update order status to cancelled
export const cancelOrder = async (orderId: string, operatorId: string): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.Cancelled, assignedOperator: operatorId });
};

// Update order status to call later
export const callLater = async (orderId: string, operatorId: string): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.CallLater, assignedOperator: operatorId });
}

// Update order status to confirmed
export const confirmOrder = async (orderId: string, operatorId: string): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.Confirmed, assignedOperator: operatorId });
}

// Update the order status (confirm, cancel, call later)
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus.Confirmed | OrderStatus.Cancelled | OrderStatus.CallLater | OrderStatus.InProgress,
  operatorId: string | null = null
): Promise<void> => {
  const orderRef = doc(ordersRef, orderId);

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists()) {
      throw new Error('Order not found.');
    }

    const updates: Partial<Order> = {
      status
    };

    if (status !== 'in_progress') {
      updates.assignedOperator = operatorId;
    }

    transaction.update(orderRef, updates);
  });
};

// Release an order (set back to pending)
export const releaseOrder = async (orderId: string): Promise<void> => {
  const orderRef = doc(ordersRef, orderId);

  await updateDoc(orderRef, {
    status: 'pending',
    assignedOperator: '',
    updatedAt: new Date(),
  });
};

