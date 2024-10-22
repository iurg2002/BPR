export interface Product {
    id: string;                // Firestore document ID or external ID
    name: string;               // Product name
    description: string;        // Detailed description of the product
    price: number;              // Price of the product in the appropriate currency
    stock: number;              // Available stock quantity
    category: string;           // Category to which the product belongs
    imageUrl: string;           // URL to the product image
    createdAt: Date;            // Timestamp for when the product was created
    updatedAt: Date;            // Timestamp for the last product update
    isActive: boolean;          // Determines if the product is active or discontinued
    tags?: string[];            // Optional tags or keywords for the product
    discount?: number;          // Optional discount percentage
  }
  