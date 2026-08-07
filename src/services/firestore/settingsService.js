import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const getSettingsDocRef = (uid) => doc(db, 'users', uid, 'settings', 'config');
const getNotificationsDocRef = (uid) => doc(db, 'users', uid, 'notifications', 'config');

/**
 * Get user settings preference from Firestore
 */
export const getUserSettings = async (uid) => {
  try {
    const snap = await getDoc(getSettingsDocRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Firestore getUserSettings Error:', error);
    return null;
  }
};

/**
 * Update user settings preference in Firestore
 */
export const updateUserSettings = async (uid, settingsData) => {
  if (!uid) return;
  const docRef = getSettingsDocRef(uid);
  const snap = await getDoc(docRef);

  const payload = {
    currency: settingsData.currency || 'USD',
    dateFormat: settingsData.dateFormat || 'MM/DD/YYYY',
    numberFormat: settingsData.numberFormat || 'international',
    theme: settingsData.theme || 'dark',
    language: settingsData.language || 'en',
    timezone: settingsData.timezone || 'UTC',
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    payload.createdAt = serverTimestamp();
    await setDoc(docRef, payload);
  } else {
    await updateDoc(docRef, payload);
  }
};

/**
 * Get notification preferences from Firestore
 */
export const getNotificationPreferences = async (uid) => {
  try {
    const snap = await getDoc(getNotificationsDocRef(uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Firestore getNotificationPreferences Error:', error);
    return null;
  }
};

/**
 * Update notification preferences in Firestore
 */
export const updateNotificationPreferences = async (uid, preferences) => {
  if (!uid) return;
  const docRef = getNotificationsDocRef(uid);
  const snap = await getDoc(docRef);

  const payload = {
    budgetAlert: Boolean(preferences.budgetAlert),
    monthlyReport: Boolean(preferences.monthlyReport),
    savingReminder: Boolean(preferences.savingReminder),
    transactionReminder: Boolean(preferences.transactionReminder),
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    payload.createdAt = serverTimestamp();
    await setDoc(docRef, payload);
  } else {
    await updateDoc(docRef, payload);
  }
};

/**
 * Delete all user account data from Firestore (Transactions, Budgets, Profile, Settings)
 */
export const deleteUserAccountData = async (uid) => {
  if (!uid) return;

  const batch = writeBatch(db);

  // 1. Transactions
  const txSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
  txSnap.docs.forEach((d) => batch.delete(d.ref));

  // 2. Budgets
  const budgetSnap = await getDocs(collection(db, 'users', uid, 'budgets'));
  budgetSnap.docs.forEach((d) => batch.delete(d.ref));

  // 3. Profile, Settings, Notifications
  batch.delete(getProfileDocRef(uid));
  batch.delete(getSettingsDocRef(uid));
  batch.delete(getNotificationsDocRef(uid));

  await batch.commit();
};

const getProfileDocRef = (uid) => doc(db, 'users', uid, 'profile', 'info');
