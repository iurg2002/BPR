
export interface User {
    id: string;           // Firebase Authentication UID
    email: string;
    displayName: string;  // Optional name
    role: 'admin' | 'operator' | 'packer'| null;
    lastLogin: Date;
  }
  