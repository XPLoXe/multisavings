// firestoreMethods.js
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Function to add a new month with empty accounts
async function addNewMonth(monthName) {
  try {
    const monthData = {
      month: monthName,
      accounts: [],
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

async function fetchMonths() {
  try {
    const querySnapshot = await getDocs(collection(db, 'months'));
    const months = [];
    querySnapshot.forEach((doc) => {
      months.push(doc.data().month);
    });
    return months;
  } catch (e) {
    console.error('Error fetching documents: ', e);
    return [];
  }
}

export { fetchMonths }; // Export the method