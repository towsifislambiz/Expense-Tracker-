import { collection, doc, getDoc, setDoc, deleteDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const getDailyExpensesRef = (uid) => {
  if (!uid) throw new Error('User UID is required for daily expenses.');
  return collection(db, 'users', uid, 'daily_expenses');
};

/**
 * Fetch daily expenses record for a specific date: users/{uid}/daily_expenses/{dateStr}
 */
export const getDailyExpensesByDate = async (uid, dateStr) => {
  if (!uid || !dateStr) return null;

  try {
    const docRef = doc(db, 'users', uid, 'daily_expenses', dateStr);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { date: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.error('Error fetching daily expenses:', err);
    throw err;
  }
};

/**
 * Save daily expenses directly to users/{uid}/daily_expenses/{dateStr}.
 * SINGLE SOURCE OF TRUTH: No writes to transactions collection!
 */
export const saveDailyExpensesService = async (uid, dateStr, categoriesData, grandTotal) => {
  if (!uid || !dateStr) {
    throw new Error('User authentication and date selection are required.');
  }

  // Future Date Protection: Do NOT save to Firestore if dateStr is in the future
  const now = new Date();
  const todayLocalStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (dateStr > todayLocalStr) {
    throw new Error('Future dates are not allowed for Daily Expense entries. Please select today or a previous date.');
  }

  try {
    const dailyDocRef = doc(db, 'users', uid, 'daily_expenses', dateStr);
    const payload = {
      date: dateStr,
      categoriesData,
      grandTotal: Number(grandTotal) || 0,
      updatedAt: serverTimestamp(),
    };

    // SINGLE WRITE OPERATION ONLY TO daily_expenses
    await setDoc(dailyDocRef, payload, { merge: true });

    return payload;
  } catch (err) {
    console.error('Error saving daily expenses service:', err);
    throw err;
  }
};

/**
 * Real-time subscription to users/{uid}/daily_expenses
 */
export const subscribeDailyExpenses = (uid, callback, onError) => {
  if (!uid) return () => {};

  try {
    const colRef = getDailyExpensesRef(uid);
    const q = query(colRef);

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => ({
          date: docSnap.id,
          ...docSnap.data(),
        }));
        callback(docs);
      },
      (error) => {
        console.error('Firestore subscribeDailyExpenses Error:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.error('Firestore subscribeDailyExpenses Setup Error:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Helper to extract flat itemized expense entries from daily_expenses collection documents
 */
export const extractExpenseEntriesFromDailyDocs = (dailyDocs = []) => {
  const list = [];
  if (!Array.isArray(dailyDocs)) return list;

  dailyDocs.forEach((docData) => {
    const dateStr = docData.date || docData.id;
    if (!dateStr) return;

    const catData = docData.categoriesData || {};
    Object.entries(catData).forEach(([catId, catInfo]) => {
      const items = catInfo.items || [];
      items.forEach((it) => {
        const amt = Number(it.amount) || 0;
        if (amt > 0 && it.description && String(it.description).trim() !== '') {
          list.push({
            id: it.id || `daily_${dateStr}_${catId}_${Math.random().toString(36).substring(2, 6)}`,
            title: it.description.trim(),
            amount: amt,
            type: 'expense',
            category: String(catId).toLowerCase().trim(),
            date: dateStr,
            isDailyEntry: true,
            rawDocId: dateStr,
          });
        }
      });
    });
  });

  return list;
};
