import { Timestamp } from "firebase/firestore";

export const formatTimestampToDate = (timestamp: { seconds: number; nanoseconds: number }): string => {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  export const formatFirestoreTimestampToDate = (timestamp?: Timestamp | Date | null): string => {
    if (!timestamp) return "N/A"; // Handle null or undefined values
  
    // If timestamp is a Firestore Timestamp, convert to Date
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  
    // Extract and format day, month, and year
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    // Extract and format hours, minutes, and seconds
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Combine into a single string
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  
  };
  
  