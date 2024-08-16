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
  where,
} from 'firebase/firestore';
import { db, auth } from './firebase';  // Ensure auth is correctly imported

// Helper function to get the current user
function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

// Function to add a new month with empty accounts
async function addNewMonth(monthName) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated
    const monthData = {
      month: monthName,
      accounts: [],
      createdAt: Timestamp.now(),  // Add Firestore timestamp
      userId: user.uid,  // Associate data with the authenticated user
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
    const user = getCurrentUser();  // Ensure the user is authenticated

    const monthsQuery = query(
      collection(db, 'months'),
      where('userId', '==', user.uid),  // Fetch only data for the current user
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(monthsQuery);

    const months = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      months.push({
        id: doc.id,
        month: data.month,
        accounts: data.accounts,
        createdAt: data.createdAt.toDate(),
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
    const user = getCurrentUser();  // Ensure the user is authenticated

    const monthRef = doc(db, 'months', monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    if (monthData.userId !== user.uid) {
      throw new Error('Unauthorized access to this month data');
    }

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
    const user = getCurrentUser();  // Ensure the user is authenticated

    const monthRef = doc(db, 'months', monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    if (monthData.userId !== user.uid) {
      throw new Error('Unauthorized access to this month data');
    }

    await updateDoc(monthRef, {
      accounts: arrayUnion(account),  // Use arrayUnion to add the account to the array
    });
  } catch (e) {
    console.error('Error adding account to month:', e);
    throw new Error('Failed to add account');
  }
}

// Function to delete an account from a specific month in Firestore
async function deleteAccountFromMonth(monthId, accountId) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const monthRef = doc(db, 'months', monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    if (monthData.userId !== user.uid) {
      throw new Error('Unauthorized access to this month data');
    }

    const accountToDelete = monthData.accounts.find(acc => acc.id === accountId);

    if (accountToDelete) {
      await updateDoc(monthRef, {
        accounts: arrayRemove(accountToDelete),  // Use arrayRemove to delete the account
      });
    }
  } catch (e) {
    console.error('Error deleting account from month:', e);
    throw new Error('Failed to delete account');
  }
}

// Function to update the amount of a specific account in a specific month
async function updateAccountAmount(monthId, accountId, newAmount) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const monthRef = doc(db, 'months', monthId);
    const monthSnap = await getDoc(monthRef);

    if (!monthSnap.exists()) {
      throw new Error('Month not found');
    }

    const monthData = monthSnap.data();
    if (monthData.userId !== user.uid) {
      throw new Error('Unauthorized access to this month data');
    }

    const updatedAccounts = monthData.accounts.map((account) => {
      if (account.id === accountId) {
        return { ...account, amount: newAmount };
      }
      return account;
    });

    await updateDoc(monthRef, {
      accounts: updatedAccounts,
    });
  } catch (e) {
    console.error('Error updating account amount:', e);
    throw new Error('Failed to update account amount');
  }
}

export { addNewMonth, fetchMonths, fetchMonthById, addAccountToMonth, deleteAccountFromMonth, updateAccountAmount };
