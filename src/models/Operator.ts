export interface Operator {
    id: string;           // Firestore document ID
    name: string;
    assignedOrders: string[];  // Array of order IDs assigned to the operator
    active: boolean;
  }
  