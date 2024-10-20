// src/services/authService.ts
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { AuthCredentials } from "../models/AuthCredentials";

// Register a new user
export const registerUser = async (credentials: AuthCredentials): Promise<UserCredential> => {
  const { email, password } = credentials;
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Login user
export const loginUser = async (credentials: AuthCredentials): Promise<UserCredential> => {
  const { email, password } = credentials;
  return await signInWithEmailAndPassword(auth, email, password);
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};
