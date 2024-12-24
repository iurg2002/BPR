import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { FirebaseCollections } from "../models/FirebaseCollections";
import { Log } from "../models/LogModel";

const logsRef = collection(db, FirebaseCollections.Logs);

// Add a new log
export const addLog = async (log: Partial<Log>): Promise<void> => {
  log.actionDate = new Date();
  try {
    await addDoc(logsRef, log);
  } catch (e) {
    console.error("Error in Add Log: " + e);
  }
};

// Get logs within a time interval for a specific user
export const getLogsByUserAndInterval = async (
  user: string,
  startTime: Date,
  endTime: Date
): Promise<Log[]> => {
  try {
    const logsQuery = query(
      logsRef,
      where("user", "==", user),
      where("actionDate", ">=", startTime),
      where("actionDate", "<=", endTime)
    );

    const querySnapshot = await getDocs(logsQuery);
    const logs: Log[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          action: data.action,
          user: data.user,
          actionDate: (data.actionDate?.toDate() || data.actionDate) as Date, // Convert Firestore Timestamp to Date
        };
      });

    return logs;
  } catch (e) {
    console.error("Error fetching logs: " + e);
    throw e;
  }
};
