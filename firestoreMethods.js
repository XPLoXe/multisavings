import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  where,
  limit,
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

async function addNewPeriod(periodName) {
  try {
    const user = getCurrentUser(); // Ensure the user is authenticated

    // Fetch the most recent period for the user
    const periodsQuery = query(
      collection(db, 'periods'),
      where('userId', '==', user.uid),  // Only fetch periods for the current user
      orderBy('createdAt', 'desc'),
      limit(1)  // We only need the most recent one
    );

    const querySnapshot = await getDocs(periodsQuery);
    let previousPeriodData = {
      accounts: []
    };

    if (!querySnapshot.empty) {
      const previousPeriodDoc = querySnapshot.docs[0];
      previousPeriodData = previousPeriodDoc.data();
    }

    // Prepare the new period data by copying the accounts from the previous period
    const periodData = {
      period: periodName,
      accounts: previousPeriodData.accounts,  // Copy accounts from the most recent period
      createdAt: Timestamp.now(),  // Add Firestore timestamp
      userId: user.uid,  // Associate data with the authenticated user
    };

    const docRef = await addDoc(collection(db, 'periods'), periodData);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Failed to add period');
  }
}

// Function to fetch all periods from Firestore, ordered by the creation timestamp
async function fetchPeriods() {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodsQuery = query(
      collection(db, 'periods'),
      where('userId', '==', user.uid),  // Fetch only data for the current user
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(periodsQuery);

    const periods = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      periods.push({
        id: doc.id,
        period: data.period,
        accounts: data.accounts,
        createdAt: data.createdAt.toDate(),
      });
    });

    return periods;
  } catch (e) {
    console.error('Error fetching documents: ', e);
    return [];
  }
}

// Function to fetch period data by ID
async function fetchPeriodById(periodId) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodRef = doc(db, 'periods', periodId);
    const periodSnap = await getDoc(periodRef);

    if (!periodSnap.exists()) {
      throw new Error('Period not found');
    }

    const periodData = periodSnap.data();
    if (periodData.userId !== user.uid) {
      throw new Error('Unauthorized access to this period data');
    }

    return {
      id: periodSnap.id,
      period: periodData.period,
      accounts: periodData.accounts || [],
      createdAt: periodData.createdAt.toDate(),
    };
  } catch (e) {
    console.error('Error fetching period by ID:', e);
    throw new Error('Failed to fetch period');
  }
}

// Function to add an account to a specific period in Firestore
async function addAccountToPeriod(periodId, account) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodRef = doc(db, 'periods', periodId);
    const periodSnap = await getDoc(periodRef);

    if (!periodSnap.exists()) {
      throw new Error('Period not found');
    }

    const periodData = periodSnap.data();
    if (periodData.userId !== user.uid) {
      throw new Error('Unauthorized access to this period data');
    }

    await updateDoc(periodRef, {
      accounts: arrayUnion(account),  // Use arrayUnion to add the account to the array
    });
  } catch (e) {
    console.error('Error adding account to period:', e);
    throw new Error('Failed to add account');
  }
}

// Function to delete an account from a specific period in Firestore
async function deleteAccountFromPeriod(periodId, accountId) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodRef = doc(db, 'periods', periodId);
    const periodSnap = await getDoc(periodRef);

    if (!periodSnap.exists()) {
      throw new Error('Period not found');
    }

    const periodData = periodSnap.data();
    if (periodData.userId !== user.uid) {
      throw new Error('Unauthorized access to this period data');
    }

    const accountToDelete = periodData.accounts.find(acc => acc.id === accountId);

    if (accountToDelete) {
      await updateDoc(periodRef, {
        accounts: arrayRemove(accountToDelete),  // Use arrayRemove to delete the account
      });
    }
  } catch (e) {
    console.error('Error deleting account from period:', e);
    throw new Error('Failed to delete account');
  }
}

// Function to update the amount of a specific account in a specific period
async function updateAccountAmount(periodId, accountId, newAmount) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodRef = doc(db, 'periods', periodId);
    const periodSnap = await getDoc(periodRef);

    if (!periodSnap.exists()) {
      throw new Error('Period not found');
    }

    const periodData = periodSnap.data();
    if (periodData.userId !== user.uid) {
      throw new Error('Unauthorized access to this period data');
    }

    const updatedAccounts = periodData.accounts.map((account) => {
      if (account.id === accountId) {
        return { ...account, amount: newAmount };
      }
      return account;
    });

    await updateDoc(periodRef, {
      accounts: updatedAccounts,
    });
  } catch (e) {
    console.error('Error updating account amount:', e);
    throw new Error('Failed to update account amount');
  }
}

// Function to delete a period by ID
async function deletePeriodById(periodId) {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    const periodRef = doc(db, 'periods', periodId);
    const periodSnap = await getDoc(periodRef);

    if (!periodSnap.exists()) {
      throw new Error('Period not found');
    }

    const periodData = periodSnap.data();
    if (periodData.userId !== user.uid) {
      throw new Error('Unauthorized access to this period');
    }

    await deleteDoc(periodRef);  // Delete the period document from Firestore
    console.log(`Period with ID ${periodId} has been deleted`);
  } catch (e) {
    console.error('Error deleting period:', e);
    throw new Error('Failed to delete period');
  }
}

export { addNewPeriod, fetchPeriods, fetchPeriodById, addAccountToPeriod, deleteAccountFromPeriod, updateAccountAmount, deletePeriodById };
