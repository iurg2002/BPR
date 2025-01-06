import { Product } from "./Product";
import { Timestamp } from "firebase/firestore";

export interface Order {
    id: string;           // Firestore document ID
    orderId: number;
    name: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'call_later' | 'in_progress';
    assignedOperator: string | null;
    callCount: number;
    comment: string;
    discount: number;
    orderTime: Date;
    products: Product[];
    type: string;
    address: Address;
    customerAddress:string;
    deliveryPrice: number;
    deliveryDate: Timestamp | null;
    totalPrice: number;
    
  }


  interface Address{
    state: string;
    locality: string;
    street: string;
    streetNr: string;
    zipcode: string;
  }


 export interface SentOrder{
    id: string;           // Firestore document ID
    orderId: number;
    name: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'call_later' | 'in_progress';
    assignedOperator: string | null;
    callCount: number;
    comment: string;
    discount: number;
    orderTime: Date;
    products: Product[];
    type: string;
    address: Address;
    customerAddress:string;
    deliveryPrice: number;
    deliveryDate: Timestamp | null;
    totalPrice: number;
    AWB: string;
    updatedAt: Date;
    awbStatus: 'delivered' | 'returned' | 'in_progress' | null;
  }