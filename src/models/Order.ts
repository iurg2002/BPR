import { Product } from "./Product";

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
    totalPrice: number;
    
  }


  interface Address{
    state: string;
    locality: string;
    street: string;
    streetNr: string;
    zipcode: string;
  }