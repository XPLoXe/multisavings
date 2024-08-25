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
  setDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import CryptoJS from 'crypto-js';

// Helper function to get the current user
function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

// Generate a 256-bit AES key
function generateEncryptionKey() {
  return CryptoJS.lib.WordArray.random(32).toString();
}

// Store the encryption key in the "users" collection
async function storeEncryptionKeyForUser(userId, encryptionKey) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { encryptionKey }, { merge: true });
}

// Retrieve the encryption key from Firestore
async function getEncryptionKeyForUser(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data().encryptionKey;
  } else {
    throw new Error('User does not exist or encryption key is missing');
  }
}

// Ensure encryption key is generated and stored for the user
async function ensureEncryptionKey(userId) {
  const encryptionKey = await getEncryptionKeyForUser(userId).catch(async () => {
    const newKey = generateEncryptionKey();
    await storeEncryptionKeyForUser(userId, newKey);
    return newKey;
  });

  return encryptionKey;
}

// Encryption and Decryption Functions Using User's Encryption Key
async function encryptDataForUser(data, userId) {
  const secretKey = await ensureEncryptionKey(userId);
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

async function decryptDataForUser(encryptedData, userId) {
  const secretKey = await ensureEncryptionKey(userId);
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Helper Functions to Encrypt/Decrypt Account Data
async function encryptAccounts(accounts, userId) {
  const encryptedAccounts = await Promise.all(accounts.map(async (account) => ({
    ...account,
    name: await encryptDataForUser(account.name, userId),
    amount: await encryptDataForUser(account.amount.toString(), userId),
  })));
  return encryptedAccounts;
}

async function decryptAccounts(accounts, userId) {
  const decryptedAccounts = await Promise.all(accounts.map(async (account) => ({
    ...account,
    name: await decryptDataForUser(account.name, userId),
    amount: parseFloat(await decryptDataForUser(account.amount, userId)),
  })));
  return decryptedAccounts;
}

// Function to add a new period with copied accounts (encrypted)
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

      // Decrypt accounts data before copying
      previousPeriodData.accounts = await decryptAccounts(previousPeriodData.accounts, user.uid);
    }

    // Encrypt accounts data using the user's encryption key before storing them in the new period
    const encryptedAccounts = await encryptAccounts(previousPeriodData.accounts, user.uid);

    // Prepare the new period data by copying the accounts from the previous period
    const periodData = {
      period: periodName,
      accounts: encryptedAccounts,  // Store encrypted accounts
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


// Function to fetch all periods from Firestore (decrypted)
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
    for (const doc of querySnapshot.docs) {
      const data = doc.data();

      // Decrypt accounts data
      const decryptedAccounts = await decryptAccounts(data.accounts, user.uid);

      periods.push({
        id: doc.id,
        period: data.period,
        accounts: decryptedAccounts,
        createdAt: data.createdAt.toDate(),
      });
    }

    return periods;
  } catch (e) {
    console.error('Error fetching documents:', e);
    return [];
  }
}

// Function to fetch the last created period for the authenticated user (decrypted)
async function fetchLastCreatedPeriod() {
  try {
    const user = getCurrentUser();  // Ensure the user is authenticated

    // Query to get the last created period for the current user
    const periodsQuery = query(
      collection(db, 'periods'),
      where('userId', '==', user.uid),  // Only fetch periods for the current user
      orderBy('createdAt', 'desc'),     // Order by creation date (most recent first)
      limit(1)                          // Limit to the most recent one
    );

    const querySnapshot = await getDocs(periodsQuery);

    if (!querySnapshot.empty) {
      const lastCreatedPeriodDoc = querySnapshot.docs[0];
      const periodData = lastCreatedPeriodDoc.data();

      // Decrypt accounts data
      const decryptedAccounts = await decryptAccounts(periodData.accounts, user.uid);
      
      return {
        id: lastCreatedPeriodDoc.id,
        period: periodData.period,
        accounts: decryptedAccounts,
        createdAt: periodData.createdAt.toDate(),  // Convert Firestore timestamp to JS Date
      };
    } else {
      console.log('No periods found for this user.');
      return null;
    }
  } catch (e) {
    console.error('Error fetching last created period:', e);
    throw new Error('Failed to fetch last created period');
  }
}

// Function to fetch period data by ID (decrypted)
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

    // Decrypt accounts data
    const decryptedAccounts = await decryptAccounts(periodData.accounts, user.uid);

    return {
      id: periodSnap.id,
      period: periodData.period,
      accounts: decryptedAccounts,
      createdAt: periodData.createdAt.toDate(),
    };
  } catch (e) {
    console.error('Error fetching period by ID:', e);
    throw new Error('Failed to fetch period');
  }
}

// Function to add an account to a specific period in Firestore (encrypt data)
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

    // Encrypt account data before storing
    const encryptedAccount = (await encryptAccounts([account], user.uid))[0];  // Encrypt single account

    await updateDoc(periodRef, {
      accounts: arrayUnion(encryptedAccount),  // Use arrayUnion to add the encrypted account to the array
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

// Function to update the amount of a specific account in a specific period (encrypt data)
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

    const updatedAccounts = await Promise.all(periodData.accounts.map(async (account) => {
      if (account.id === accountId) {
        return { ...account, amount: await encryptDataForUser(newAmount.toString(), user.uid) };
      }
      return account;
    }));

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

export { addNewPeriod, fetchPeriods, fetchPeriodById, addAccountToPeriod, deleteAccountFromPeriod, updateAccountAmount, deletePeriodById, fetchLastCreatedPeriod };
