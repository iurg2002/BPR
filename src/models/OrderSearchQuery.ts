// src/models/OrderSearchQuery.ts
export interface OrderSearchQuery {
    phoneNumber: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'call_later';  // Optional filter by status
  }
  