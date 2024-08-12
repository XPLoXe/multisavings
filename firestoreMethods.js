// firestoreMethods.js
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

// Function to add a new month with empty accounts
async function addNewMonth(monthName) {
  try {
    const monthData = {
      month: monthName,
      accounts: [],
      createdAt: Timestamp.now(), // Add Firestore timestamp
    };

    const docRef = await addDoc(collection(db, 'months'), monthData);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add month');
  }
}

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

// Function to fetch month data by ID
async function fetchMonthById(monthId) {
  try {
    const monthRef = doc(collection(db, 'months'), monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    return {
      id: monthSnap.id,
      month: monthData.month,
      accounts: monthData.accounts || [],
      createdAt: monthData.createdAt.toDate(),
    };
  } catch (e) {
    console.error('Error fetching month by ID:', e);
    throw new Error('Failed to fetch month');
  }
}

// Function to add an account to a specific month in Firestore
async function addAccountToMonth(monthId, account) {
  try {
    const monthRef = doc(collection(db, 'months'), monthId);
    await updateDoc(monthRef, {
      accounts: arrayUnion(account), // Use arrayUnion to add the account to the array
    });
  } catch (e) {
    console.error('Error adding account to month:', e);
    throw new Error('Failed to add account');
  }
}

// Function to delete an account from a specific month in Firestore
async function deleteAccountFromMonth(monthId, accountId) {
  try {
    const monthRef = doc(db, 'months', monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    const accountToDelete = monthData.accounts.find(acc => acc.id === accountId);

    if (accountToDelete) {
      await updateDoc(monthRef, {
        accounts: arrayRemove(accountToDelete), // Use arrayRemove to delete the account
      });
    }
  } catch (e) {
    console.error('Error deleting account from month:', e);
    throw new Error('Failed to delete account');
  }
}

export { addNewMonth, fetchMonths, fetchMonthById, addAccountToMonth, deleteAccountFromMonth };
