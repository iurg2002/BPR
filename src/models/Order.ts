export interface Order {
    id: string;           // Firestore document ID
    customerName: string;
    phoneNumber: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'call_later' | 'in_progress';
    assignedOperator: string | null;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
  }
  