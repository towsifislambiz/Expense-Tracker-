import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const getProfileDocRef = (uid) => {
  if (!uid) throw new Error('User UID is required for profile operations.');
  return doc(db, 'users', uid, 'profile', 'info');
};

const getMainDocRef = (uid) => {
  if (!uid) throw new Error('User UID is required for profile operations.');
  return doc(db, 'users', uid);
};

/**
 * Get user profile from Firestore: reads users/{uid}/profile/info first, then users/{uid}
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const infoRef = getProfileDocRef(uid);
    const snap = await getDoc(infoRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    const mainRef = getMainDocRef(uid);
    const mainSnap = await getDoc(mainRef);
    if (mainSnap.exists()) {
      return { id: mainSnap.id, ...mainSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Firestore getUserProfile Error:', error);
    return null;
  }
};

/**
 * Create or update user profile in Firestore.
 * Updates both users/{uid}/profile/info AND users/{uid} for single-source-of-truth consistency.
 */
export const updateUserProfile = async (uid, profileData = {}) => {
  if (!uid) throw new Error('User UID is required to update profile.');

  const infoRef = getProfileDocRef(uid);
  const mainRef = getMainDocRef(uid);

  const payload = {
    uid,
    updatedAt: serverTimestamp(),
  };

  if (profileData.displayName !== undefined) {
    payload.displayName = profileData.displayName;
    payload.fullName = profileData.displayName;
  }
  if (profileData.photoURL !== undefined) {
    payload.photoURL = profileData.photoURL;
  }
  if (profileData.email !== undefined) {
    payload.email = profileData.email;
  }
  if (profileData.timezone !== undefined) {
    payload.timezone = profileData.timezone;
  }
  if (profileData.language !== undefined) {
    payload.language = profileData.language;
  }
  if (profileData.createdAt !== undefined) {
    payload.createdAt = profileData.createdAt;
  }

  // Non-blocking writes to both profile info subcollection and root user document
  await Promise.all([
    setDoc(infoRef, payload, { merge: true }),
    setDoc(mainRef, payload, { merge: true }),
  ]);

  return payload;
};
