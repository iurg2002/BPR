import { db } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { Product } from "../models/Product";
import { FirebaseCollections } from "../models/FirebaseCollections";

const productsRef = collection(db, FirebaseCollections.Products); // Reference to the "products" collection

// Add a new product to Firestore
export const addProduct = async (productData: Omit<Product, "id">): Promise<Product> => {
  try {
    const productWithTimestamp = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(productsRef, productWithTimestamp);
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// Fetch all products from Firestore
export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Update an existing product in Firestore
export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(productsRef, productId);
    const updatedData = { ...productData, updatedAt: serverTimestamp() };
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product from Firestore
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const docRef = doc(productsRef, productId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Fetch a single product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(productsRef, productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      return null; // Product not found
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
