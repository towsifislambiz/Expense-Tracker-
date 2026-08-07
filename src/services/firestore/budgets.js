import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const getBudgetsRef = (uid) => {
  if (!uid) throw new Error('User UID is required for Firestore budget operations.');
  return collection(db, 'users', uid, 'budgets');
};

/**
 * Create a new budget document in Firestore (Non-blocking ShopT pattern)
 */
export const createBudget = async (uid, budgetData) => {
  if (!uid) throw new Error('User not authenticated');

  if (!budgetData.name || !budgetData.name.trim()) {
    throw new Error('Budget name is required.');
  }
  const amt = parseFloat(budgetData.amount);
  if (isNaN(amt) || amt <= 0) {
    throw new Error('Budget amount must be a positive number greater than 0.');
  }

  const colRef = getBudgetsRef(uid);
  const now = new Date();
  const payload = {
    name: budgetData.name.trim(),
    type: budgetData.type || 'overall', // 'overall' | 'category'
    category: budgetData.category || 'others',
    amount: amt,
    period: budgetData.period || 'monthly', // 'weekly' | 'monthly' | 'yearly'
    month: budgetData.month !== undefined ? budgetData.month : now.getMonth(),
    year: budgetData.year || now.getFullYear(),
    rolloverEnabled: Boolean(budgetData.rolloverEnabled),
    deleted: false,
  };

  // Firestore background write
  addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((error) => {
    console.error('Firestore createBudget background write failed:', error);
  });

  return { id: 'temp-budget-' + Date.now(), ...payload };
};

/**
 * Fetch all active budgets for a user
 */
export const getBudgets = async (uid) => {
  try {
    const colRef = getBudgetsRef(uid);
    const q = query(colRef, where('deleted', '==', false), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
      };
    });
  } catch (error) {
    console.error('Firestore getBudgets Error:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time budget updates for a user
 */
export const subscribeBudgets = (uid, callback, onError) => {
  if (!uid) return () => {};

  try {
    const colRef = getBudgetsRef(uid);
    const q = query(colRef);

    return onSnapshot(
      q,
      (snapshot) => {
        const budgetsList = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || null,
            };
          })
          .filter((b) => !b.deleted);

        callback(budgetsList);
      },
      (error) => {
        console.error('Firestore subscribeBudgets Error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Firestore subscribeBudgets Setup Error:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Update an existing budget document in Firestore
 */
export const updateBudget = async (uid, budgetId, updatedFields) => {
  if (!uid || !budgetId) throw new Error('UID and Budget ID are required for update.');

  if (updatedFields.name !== undefined && !updatedFields.name.trim()) {
    throw new Error('Budget name cannot be empty.');
  }
  if (updatedFields.amount !== undefined) {
    const amt = parseFloat(updatedFields.amount);
    if (isNaN(amt) || amt <= 0) {
      throw new Error('Budget amount must be a positive number greater than 0.');
    }
  }

  const docRef = doc(db, 'users', uid, 'budgets', budgetId);
  const payload = {
    ...updatedFields,
    amount: updatedFields.amount !== undefined ? parseFloat(updatedFields.amount) : undefined,
  };

  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  }).catch((error) => {
    console.error('Firestore updateBudget background write failed:', error);
  });
};

/**
 * Soft delete a budget document in Firestore
 */
export const deleteBudget = async (uid, budgetId) => {
  if (!uid || !budgetId) throw new Error('UID and Budget ID are required for deletion.');

  const docRef = doc(db, 'users', uid, 'budgets', budgetId);

  updateDoc(docRef, {
    deleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch((error) => {
    console.error('Firestore soft deleteBudget background write failed:', error);
  });
};
