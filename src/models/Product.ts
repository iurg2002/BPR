export interface Product {
    id: string;
    productId: string; 
    name: string;               // Product name
    description: string;        // Detailed description of the product
    price: number;              // Price of the product in the appropriate currency
    imageUrl: string;               // URL to the product image
    personalization: string;      // Personalization options for the product
    upsell: number;             // Upsell price for product
    stock: number;              // Available stock quantity
    category: string;           // Category to which the product belongs
    instanceId?: string;
    // createdAt: Date;            // Timestamp for when the product was created
    // updatedAt: Date;            // Timestamp for the last product update
    // isActive: boolean;          // Determines if the product is active or discontinued
    // tags?: string[];            // Optional tags or keywords for the product
    // discount?: number;          // Optional discount percentage
  }

  export interface ProductInstance extends Product {
    instanceId: string; // Unique identifier for each product instance in the order
    personalization: string; // Personalization specific to this instance
  }
  