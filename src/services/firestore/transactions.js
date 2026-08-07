import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

/**
 * Get user transactions collection reference: users/{uid}/transactions
 */
const getTransactionsRef = (uid) => {
  if (!uid) throw new Error('User UID is required for Firestore transaction operations.');
  return collection(db, 'users', uid, 'transactions');
};

/**
 * Helper to parse month and year from ISO date string YYYY-MM-DD
 */
const parseDateMetadata = (dateString) => {
  if (typeof dateString === 'string' && dateString.includes('-')) {
    const parts = dateString.split('-').map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { month: parts[1] - 1, year: parts[0] };
    }
  }
  const d = dateString ? new Date(dateString) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }
  return { month: d.getMonth(), year: d.getFullYear() };
};

/**
 * Create a new transaction document in Firestore (Enterprise Production Pattern)
 */
export const createTransaction = async (uid, transactionData) => {
  const activeAuthUser = auth.currentUser;
  const effectiveUid = uid || activeAuthUser?.uid;

  if (!effectiveUid) {
    throw new Error('Authentication required: No authenticated user session found for Firestore transaction creation.');
  }

  const finalUid = activeAuthUser?.uid || effectiveUid;

  const title = (transactionData.title || '').trim();
  if (!title) {
    throw new Error('Transaction title is required.');
  }

  const amt = parseFloat(transactionData.amount);
  if (isNaN(amt) || amt <= 0) {
    throw new Error('Amount must be a positive number greater than 0.');
  }

  const type = String(transactionData.type || 'expense').toLowerCase().trim();
  if (type !== 'income' && type !== 'expense') {
    throw new Error('Transaction type must be either income or expense.');
  }

  const category = String(transactionData.category || (type === 'income' ? 'salary' : 'food')).toLowerCase().trim();
  if (!category) {
    throw new Error('Category is required.');
  }

  const date = transactionData.date || new Date().toISOString().split('T')[0];
  const { month, year } = parseDateMetadata(date);
  const status = transactionData.status || 'completed';

  const payload = {
    title,
    amount: amt,
    type,
    category,
    status,
    date,
    month,
    year,
    createdBy: finalUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    note: transactionData.note || transactionData.notes || '',
    isRecurring: !!transactionData.isRecurring,
  };

  const colRef = getTransactionsRef(finalUid);
  const docRef = await addDoc(colRef, payload);

  return {
    id: docRef.id,
    ...payload,
    notes: payload.note,
  };
};

/**
 * Fetch all transactions for a user once
 */
export const getTransactions = async (uid) => {
  if (!uid) return [];
  try {
    const colRef = getTransactionsRef(uid);
    const q = query(colRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const { month, year } = parseDateMetadata(data.date);
      return {
        id: docSnap.id,
        ...data,
        month: data.month !== undefined ? data.month : month,
        year: data.year !== undefined ? data.year : year,
        notes: data.note || data.notes || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
      };
    });
  } catch (error) {
    console.error('Firestore getTransactions Error:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time transaction updates for a user (onSnapshot)
 */
export const subscribeTransactions = (uid, callback, onError) => {
  if (!uid) return () => {};

  try {
    const colRef = getTransactionsRef(uid);
    const q = query(colRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const transactionsList = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const { month, year } = parseDateMetadata(data.date);
          return {
            id: docSnap.id,
            ...data,
            month: data.month !== undefined ? data.month : month,
            year: data.year !== undefined ? data.year : year,
            notes: data.note || data.notes || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
          };
        });
        callback(transactionsList);
      },
      (error) => {
        console.error('Firestore subscribeTransactions Error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Firestore subscribeTransactions Setup Error:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Restore Income Transaction if none exists for active user
 */
export const ensureValidIncomeTransactions = async (uid) => {
  if (!uid) return;
  try {
    const colRef = getTransactionsRef(uid);
    const snapshot = await getDocs(colRef);

    const hasIncome = snapshot.docs.some(
      (docSnap) => String(docSnap.data().type || '').toLowerCase().trim() === 'income'
    );

    if (!hasIncome) {
      console.log(`[Firestore Restorer] No income transaction found for UID: ${uid}. Restoring default Salary income...`);
      const todayStr = new Date().toISOString().split('T')[0];
      await createTransaction(uid, {
        title: 'Monthly Salary / Income',
        amount: 150000,
        type: 'income',
        category: 'salary',
        date: todayStr,
        status: 'completed',
        notes: 'Primary Income Source',
      });
      console.log(`[Firestore Restorer] Successfully restored Income transaction (৳150,000).`);
    }
  } catch (err) {
    console.error('ensureValidIncomeTransactions error:', err);
  }
};

/**
 * Update an existing transaction document in Firestore
 */
export const updateTransaction = async (uid, transactionId, updatedFields) => {
  if (!uid || !transactionId) throw new Error('UID and Transaction ID are required for update.');

  const docRef = doc(db, 'users', uid, 'transactions', transactionId);

  const payload = {
    ...updatedFields,
    amount: updatedFields.amount !== undefined ? parseFloat(updatedFields.amount) : undefined,
    type: updatedFields.type !== undefined ? String(updatedFields.type).toLowerCase().trim() : undefined,
    category: updatedFields.category !== undefined ? String(updatedFields.category).toLowerCase().trim() : undefined,
    note: updatedFields.note !== undefined ? updatedFields.note : (updatedFields.notes !== undefined ? updatedFields.notes : undefined),
    updatedAt: serverTimestamp(),
  };

  if (updatedFields.date) {
    const { month, year } = parseDateMetadata(updatedFields.date);
    payload.month = month;
    payload.year = year;
  }

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  await updateDoc(docRef, payload);
};

/**
 * Delete a transaction document from Firestore
 */
export const deleteTransaction = async (uid, transactionId) => {
  if (!uid || !transactionId) throw new Error('UID and Transaction ID are required for deletion.');

  const docRef = doc(db, 'users', uid, 'transactions', transactionId);
  await deleteDoc(docRef);
};

/**
 * Bulk delete transaction documents from Firestore using writeBatch
 */
export const bulkDeleteTransactionsFromFirestore = async (uid, transactionIds = []) => {
  if (!uid || !Array.isArray(transactionIds) || transactionIds.length === 0) return;

  const batch = writeBatch(db);
  transactionIds.forEach((id) => {
    const docRef = doc(db, 'users', uid, 'transactions', id);
    batch.delete(docRef);
  });

  await batch.commit();
};

/**
 * Automatically inspect and purge legacy invalid budget proxy transactions from users/{uid}/transactions
 */
export const cleanupLegacyBudgetTransactions = async (uid) => {
  if (!uid) return;
  try {
    const colRef = getTransactionsRef(uid);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return;

    const invalidDocIds = [];

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const titleLower = String(data.title || '').toLowerCase().trim();
      const catLower = String(data.category || '').toLowerCase().trim();
      const notesStr = String(data.note || data.notes || '').trim();
      const amt = Number(data.amount) || 0;

      const typeStr = String(data.type || '').toLowerCase().trim();

      // Income, Refund, and Transfer documents are strictly preserved and NEVER deleted
      if (typeStr === 'income' || typeStr === 'refund' || typeStr === 'transfer') {
        return;
      }

      // Identify budget proxy transactions explicitly marked in early legacy tests
      const isExplicitBudgetProxy =
        Boolean(data.isBudgetProxy) ||
        titleLower.includes('monthly budget target limit') ||
        titleLower.includes('legacy_budget_proxy');

      if (isExplicitBudgetProxy) {
        invalidDocIds.push(docSnap.id);
      }
    });

    if (invalidDocIds.length > 0) {
      console.log(`[Firestore Migration] Found ${invalidDocIds.length} invalid budget proxy transactions to purge:`, invalidDocIds);
      await bulkDeleteTransactionsFromFirestore(uid, invalidDocIds);
      console.log(`[Firestore Migration] Successfully purged ${invalidDocIds.length} invalid budget proxy transactions.`);
    }
  } catch (err) {
    console.error('cleanupLegacyBudgetTransactions error:', err);
  }
};

/**
 * Delete ALL transaction documents for a user from Firestore using writeBatch
 */
export const deleteAllTransactionsFromFirestore = async (uid) => {
  if (!uid) throw new Error('User UID is required to delete all transactions.');

  const colRef = getTransactionsRef(uid);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) return;

  const docs = snapshot.docs;
  const BATCH_SIZE = 500;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
};

// Aliases for backwards compatibility
export const updateTransactionInFirestore = updateTransaction;
export const deleteTransactionFromFirestore = deleteTransaction;
