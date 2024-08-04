// firestoreMethods.js
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Function to add a new month with empty accounts
async function addNewMonth(monthName) {
  try {
    const monthData = {
      month: monthName,
      accounts: [],
      createdAt: Timestamp.now(),  // Add Firestore timestamp
    };

    const docRef = await addDoc(collection(db, 'months'), monthData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add month');
  }
}

export { addNewMonth };

// Function to fetch all months from Firestore, ordered by the creation timestamp
async function fetchMonths() {
  try {
    // Create a query to order by 'createdAt' in descending order
    const monthsQuery = query(collection(db, 'months'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(monthsQuery);

    const months = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      months.push({
        id: doc.id,
        month: data.month,
        accounts: data.accounts,
        createdAt: data.createdAt.toDate(), // Convert Firestore timestamp to JS Date
      });
    });

    return months;
  } catch (e) {
    console.error('Error fetching documents: ', e);
    return [];
  }
}

export { fetchMonths }; // Export the method