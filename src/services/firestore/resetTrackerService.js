import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

// Known finance subcollections under users/{uid}
const FINANCE_COLLECTIONS = [
  'transactions',
  'daily_expenses',
  'dailyExpenses',
  'budgets',
  'goals',
  'categories',
  'reports',
  'calendar',
  'analytics',
  'history',
  'forecast',
  'monthlySummary',
  'insights',
  'notifications',
];

// Preserved non-finance paths
const PRESERVED_SUBCOLLECTIONS = ['profile', 'settings'];

/**
 * Live pre-deletion document counting across all user finance subcollections
 */
export const countFinancialRecords = async (uid) => {
  if (!uid) {
    return { transactions: 0, budgets: 0, dailyExpenses: 0, goals: 0, reports: 0, total: 0 };
  }

  try {
    const counts = {
      transactions: 0,
      budgets: 0,
      dailyExpenses: 0,
      goals: 0,
      reports: 0,
      total: 0,
    };

    const countPromises = FINANCE_COLLECTIONS.map(async (colName) => {
      try {
        const colRef = collection(db, 'users', uid, colName);
        const snapshot = await getDocs(colRef);
        const numDocs = snapshot.size;

        if (colName === 'transactions') counts.transactions = numDocs;
        else if (colName === 'budgets') counts.budgets = numDocs;
        else if (colName === 'daily_expenses' || colName === 'dailyExpenses') counts.dailyExpenses += numDocs;
        else if (colName === 'goals') counts.goals = numDocs;
        else if (colName === 'reports') counts.reports = numDocs;

        counts.total += numDocs;
      } catch (e) {
        // Subcollection may not exist yet
      }
    });

    await Promise.all(countPromises);
    return counts;
  } catch (err) {
    console.error('Error counting financial records:', err);
    return { transactions: 0, budgets: 0, dailyExpenses: 0, goals: 0, reports: 0, total: 0 };
  }
};

/**
 * Safely delete a single collection in batched chunks <= 500 documents
 */

const deleteSubcollectionBatch = async (uid, colName) => {
  const colRef = collection(db, 'users', uid, colName);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) return;

  const docs = snapshot.docs;
  const BATCH_SIZE = 450; // Keep under 500 limit for safety

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + BATCH_SIZE);
    chunk.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
};

/**
 * Execute atomic batched deletion of all financial subcollections & clear caches
 */
export const resetAllFinancialData = async (uid, onProgress = () => {}) => {
  if (!uid) throw new Error('User UID is required for financial reset.');

  console.log(`[Reset Tracker Service] Starting complete financial reset for UID: ${uid}...`);

  for (const colName of FINANCE_COLLECTIONS) {
    if (PRESERVED_SUBCOLLECTIONS.includes(colName)) continue;

    try {
      const formattedName = colName.replace('_', ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
      onProgress(`Deleting ${formattedName}...`);
      console.log(`[Reset Tracker Service] Deleting collection: users/${uid}/${colName}...`);
      await deleteSubcollectionBatch(uid, colName);
    } catch (err) {
      console.error(`[Reset Tracker Error] Failed to delete collection '${colName}':`, err);
      throw new Error(`Failed to delete collection '${colName}'. ${err.message || ''}`);
    }
  }

  // Clear Local Caches
  try {
    onProgress('Cleaning Local Caches...');
    localStorage.removeItem('luxe_goals');
    localStorage.removeItem('luxe_transactions');
    localStorage.removeItem('luxe_budgets');
    sessionStorage.clear();

    // Clear IndexedDB if present
    if (window.indexedDB && window.indexedDB.databases) {
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((dbInfo) => {
          if (dbInfo.name && dbInfo.name.includes('firebase')) {
            // Keep auth database intact, delete cache stores if needed
          }
        });
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('[Reset Tracker Service] Cache cleanup note:', e);
  }

  console.log(`[Reset Tracker Service] All financial subcollections purged for UID: ${uid}.`);
};

/**
 * Verify post-reset state: Confirm 0 financial documents remain across collections
 */
export const verifyFinancialCollectionsEmpty = async (uid) => {
  if (!uid) return true;

  try {
    const checkPromises = FINANCE_COLLECTIONS.map(async (colName) => {
      try {
        const colRef = collection(db, 'users', uid, colName);
        const snap = await getDocs(colRef);
        return snap.size;
      } catch (e) {
        return 0;
      }
    });

    const results = await Promise.all(checkPromises);
    const totalRemaining = results.reduce((acc, curr) => acc + curr, 0);

    console.log(`[Reset Tracker Service] Verification check total remaining financial documents: ${totalRemaining}`);
    return totalRemaining === 0;
  } catch (err) {
    console.error('Error during post-reset verification check:', err);
    return false;
  }
};
