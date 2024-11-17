// src/services/userService.ts
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser as authDeleteUser } from "firebase/auth";
import { User } from "../models/User";
import { FirebaseCollections } from "../models/FirebaseCollections";

const usersRef = collection(db, FirebaseCollections.Users);

// Add a new user to Firestore and Authentication
export const addUser = async (
  email: string,
  password: string,
  role: 'admin' | 'operator' | null,
  displayName: string
): Promise<User> => {
  // Create the user in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const newUser = userCredential.user;

  // Add the user details to Firestore
  const firestoreUser: Omit<User, 'id'> = {
    email,
    displayName,
    role,
    lastLogin: new Date(),
  };
  const docRef = await addDoc(usersRef, firestoreUser);

  return { id: docRef.id, ...firestoreUser };
};

// Get all users from Firestore
export const getUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
};

// Update a user role in Firestore
export const updateUserRole = async (id: string, role: 'admin' | 'operator') => {
  const docRef = doc(usersRef, id);
  await updateDoc(docRef, { role });
};

// Delete a user from both Firestore and Firebase Authentication
export const deleteUser = async (userId: string) => {
  // Delete the user from Firestore
  const userDocRef = doc(usersRef, userId);
  await deleteDoc(userDocRef);

  // Delete the user from Firebase Authentication
  const user = auth.currentUser; // Get the currently authenticated user
  if (user && user.uid === userId) {
    await authDeleteUser(user);
  }
};
