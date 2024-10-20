// src/services/operatorService.ts
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Operator } from "../models/Operator";
import { FirebaseCollections } from "../models/FirebaseCollections";

const operatorsRef = collection(db, FirebaseCollections.Operators);

// Get all operators
export const getOperators = async (): Promise<Operator[]> => {
  const snapshot = await getDocs(operatorsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Operator[];
};

// Update operator's active status
export const updateOperatorStatus = async (id: string, active: boolean) => {
  const docRef = doc(operatorsRef, id);
  await updateDoc(docRef, { active });
};
