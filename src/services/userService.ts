import { db, auth } from "../firebaseConfig";
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
import { 
  createUserWithEmailAndPassword, 
  deleteUser as authDeleteUser 
} from "firebase/auth";
import { User } from "../models/User";
import { FirebaseCollections } from "../models/FirebaseCollections";

const usersRef = collection(db, FirebaseCollections.Users);

export const addUserAuth = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    return { id: newUser.uid, email, displayName: "", role: null, lastLogin: new Date() };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error; // Propagate error to calling code
  }
}

// Add a new user to Firestore and Authentication
export const addUser = async (
  email: string,
  password: string,
  role: 'admin' | 'operator' | null,
  displayName: string
): Promise<User> => {
  try {
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
    const docRef = await addDoc(usersRef, { ...firestoreUser, createdAt: serverTimestamp() });

    return { id: docRef.id, ...firestoreUser };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error; // Propagate error to calling code
  }
};

// add user details

export const addUserDetails = async (
  email: string,
  role: 'admin' | 'operator' | null,
  displayName: string
): Promise<User> => {
  try {
    // Add the user details to Firestore
    const firestoreUser: Omit<User, 'id'> = {
      email,
      displayName,
      role,
      lastLogin: new Date(),
    };
    const docRef = await addDoc(usersRef, { ...firestoreUser, createdAt: serverTimestamp() });

    return { id: docRef.id, ...firestoreUser };
  } catch (error) {
    console.error("Error adding user:", error);
    throw error; // Propagate error to calling code
  }
}

// Update user details
export const updateUser = async (id: string, user: Partial<User>): Promise<void> => {
  try {
    const docRef = doc(usersRef, id);
    await updateDoc(docRef, { ...user, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Get all users from Firestore
export const getUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const userDocRef = doc(usersRef, id);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
      return null; // User not found
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// Update a user's role in Firestore
export const updateUserRole = async (id: string, role: 'admin' | 'operator') => {
  try {
    const docRef = doc(usersRef, id);
    await updateDoc(docRef, { role, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Delete a user from both Firestore and Firebase Authentication
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Delete the user from Firestore
    const userDocRef = doc(usersRef, userId);
    await deleteDoc(userDocRef);

    // Delete the user from Firebase Authentication
    // const user = auth.currentUser; // Get the currently authenticated user
    // if (user && user.uid === userId) {
    //   await authDeleteUser(user);
    // }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
