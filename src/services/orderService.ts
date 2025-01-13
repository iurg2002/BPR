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
import { Order, SentOrder } from "../models/Order";
import { FirebaseCollections } from "../models/FirebaseCollections";
import { OrderStatus } from "../models/OrderStatus";
import { Country } from "../models/Countries";

// const ordersRef = collection(db, FirebaseCollections.Orders);

// Add a new order with specific document ID
export const addOrder = async (id: string, order: Order, country:Country): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const docRef = doc(ordersRef, id);
  await setDoc(docRef, order);
};

// Add Order to archive
export const archiveOrder = async (order: Order, country: Country): Promise<void> => {
  const archiveRef = collection(db, country === Country.MD ? FirebaseCollections.ArchiveMD : FirebaseCollections.Archive);
  // const archiveRef = collection(db, FirebaseCollections.Archive);
  const docRef = doc(archiveRef, order.orderId.toString());
  await setDoc(docRef, { ...order, updatedAt: new Date() });
};


export const getOrderFromArchiveByAWB = async (awb: string, country: Country): Promise<Order | null> => {
  const archiveRef = collection(db, country === Country.MD ? FirebaseCollections.ArchiveMD : FirebaseCollections.Archive);
  // const archiveRef = collection(db, FirebaseCollections.Archive);
  const q = query(archiveRef, where("awb", "==", awb));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    console.log("Order found in archive.");
    const orderData = querySnapshot.docs[0].data();
    console.log("Order data: ", orderData);
    return orderData as Order;
  }

  return null;
}




export const getOrdersFromArchiveByPhone = async (phone: string, country: Country): Promise<SentOrder[]> => {
  const archiveRef = collection(db, country === Country.MD ? FirebaseCollections.ArchiveMD : FirebaseCollections.Archive);
  // const archiveRef = collection(db, FirebaseCollections.Archive);
  const q = query(archiveRef, where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  const orders: SentOrder[] = [];
  querySnapshot.forEach((doc) => {
    orders.push(doc.data() as SentOrder);
  });

  return orders;
};


// Get all orders
export const getOrders = async (country: Country): Promise<Order[]> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const snapshot = await getDocs(ordersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};


// Get all pending orders
export const getPendingOrders = async (country:Country): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
    const q = query(ordersRef, where("status", "==", OrderStatus.Pending));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
  } catch (error) {
    console.error("Error fetching pending orders: ", error);
    return [];
  }
};

// Query orders by phone number
export const getOrdersByPhone = async (phoneNumber: string, country: Country): Promise<Order[]> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const q = query(ordersRef, where("phoneNumber", "==", phoneNumber));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};


// Update an order (partial update)
export const updateOrder = async (id: string, data: Partial<Order>, country: Country): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const docRef = doc(ordersRef, id);
  await updateDoc(docRef, { ...data, updatedAt: new Date() });
};

// Delete an order
export const deleteOrder = async (id: string, country:Country): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const docRef = doc(ordersRef, id);
  await deleteDoc(docRef);
};

// Assign an order to an operator and mark it as 'in_progress'
export const assignOrderToOperator = async (
  orderId: string,
  operatorId: string,
  country: Country
): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const orderRef = doc(ordersRef, orderId);

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists()) {
      throw new Error('Order not found.');
    }

    const order = orderDoc.data() as Order;
    if (order.status !== OrderStatus.Pending && order.status !== OrderStatus.CallLater  && order.status !== OrderStatus.Cancelled) {
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
export const cancelOrder = async (orderId: string, operatorId: string, country: Country): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.Cancelled, assignedOperator: operatorId }, country);
};

// Update order status to call later
export const callLater = async (orderId: string, operatorId: string, country: Country): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.CallLater, assignedOperator: operatorId }, country);
}

// Update order status to confirmed
export const confirmOrder = async (orderId: string, operatorId: string,  country: Country): Promise<void> => {
  await updateOrder(orderId, { status: OrderStatus.Confirmed, assignedOperator: operatorId }, country);
}

// Update the order status (confirm, cancel, call later)
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus.Confirmed | OrderStatus.Cancelled | OrderStatus.CallLater | OrderStatus.InProgress,
  operatorId: string | null = null,
  country: Country
): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
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
export const releaseOrder = async (orderId: string, country: Country): Promise<void> => {
  const ordersRef = collection(db, country === Country.MD ? FirebaseCollections.OrdersMD : FirebaseCollections.Orders);
  const orderRef = doc(ordersRef, orderId);

  await updateDoc(orderRef, {
    status: 'pending',
    assignedOperator: '',
    updatedAt: new Date(),
  });
};



// Get logs within a time interval for a specific user
export const getArchiveOrdersByUserAndInterval = async (
  user: string,
  startTime: Date,
  endTime: Date,
  country: Country
): Promise<SentOrder[]> => {
  const archiveRef = collection(db, country === Country.MD ? FirebaseCollections.ArchiveMD : FirebaseCollections.Archive);
  try {
    let archivesQuery
    if(user === "all"){
      archivesQuery = query(
        archiveRef,
        where("updatedAt", ">=", startTime),
        where("updatedAt", "<=", endTime)
      );
    }
    else{
    archivesQuery = query(
      archiveRef,
      where("assignedOperator", "==", user),
      where("updatedAt", ">=", startTime),
      where("updatedAt", "<=", endTime)
    );
  }

    const archiveOrders: SentOrder[] = [];

    const querySnapshot = await getDocs(archivesQuery);

      querySnapshot.forEach((doc) => {
        archiveOrders.push(doc.data() as SentOrder);
      });

    return archiveOrders;
  } catch (e) {
    console.error("Error fetching logs: " + e);
    throw e;
  }
};
