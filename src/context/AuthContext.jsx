import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateAuthProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/firebaseConfig';
import { updateUserProfile, getUserProfile } from '../services/firestore/profileService';
import { parseAuthError } from '../utils/firebaseErrors';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Initial app load loading only
  const [authError, setAuthError] = useState(null);

  // Set persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Auth persistence note:", err);
    });
  }, []);

  // Update User Profile Data across Firebase Auth, Firestore, and Context State
  const updateProfileData = async (fields = {}) => {
    const userToUpdate = currentUser || auth.currentUser;
    if (!userToUpdate) return;

    try {
      // 1. Update Firebase Auth user profile if displayName or photoURL changed
      const authUpdates = {};
      if (fields.displayName !== undefined) authUpdates.displayName = fields.displayName;
      if (fields.photoURL !== undefined) authUpdates.photoURL = fields.photoURL;

      if (Object.keys(authUpdates).length > 0 && auth.currentUser) {
        await updateAuthProfile(auth.currentUser, authUpdates).catch((err) => {
          console.warn("Firebase Auth updateProfile note:", err.message);
        });
      }

      // 2. Persist to Firestore (merge update to users/{uid} and users/{uid}/profile/info)
      await updateUserProfile(userToUpdate.uid, fields);

      // 3. Instant local context state update
      setUserProfile((prev) => ({
        ...(prev || {}),
        ...fields,
      }));
    } catch (err) {
      console.error("updateProfileData error:", err);
      throw err;
    }
  };

  // Re-read Firestore Profile manually if needed
  const refreshProfile = async () => {
    const userToRead = currentUser || auth.currentUser;
    if (!userToRead) return;

    try {
      const profile = await getUserProfile(userToRead.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (err) {
      console.warn("refreshProfile note:", err);
    }
  };

  // Auth State Listener (Real-time Firestore Profile Sync on page load/login)
  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Enforce email verification check for password users
        const isGoogleUser = user.providerData.some((p) => p.providerId === 'google.com');
        if (!user.emailVerified && !isGoogleUser) {
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setCurrentUser(user);

        // Real-time Firestore Profile Listener
        const profileDocRef = doc(db, 'users', user.uid, 'profile', 'info');

        unsubscribeProfile = onSnapshot(
          profileDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile(data);
            } else {
              // Create initial profile ONLY if document doesn't exist yet
              const initData = {
                uid: user.uid,
                fullName: user.displayName || 'User',
                displayName: user.displayName || 'User',
                email: user.email,
                photoURL: user.photoURL || '',
                createdAt: new Date().toISOString(),
              };
              await updateUserProfile(user.uid, initData);
              setUserProfile(initData);
            }
            setLoading(false);
          },
          (err) => {
            console.warn("Profile snapshot note:", err.message);
            setLoading(false);
          }
        );
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Register with Email & Password
  const registerWithEmail = async (email, password, fullName) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateAuthProfile(user, { displayName: fullName }).catch(() => {});
      sendEmailVerification(user).catch((e) => console.warn('Verification email note:', e));

      // Create initial Firestore profile
      const initProfile = {
        uid: user.uid,
        fullName,
        displayName: fullName,
        email: user.email,
        photoURL: '',
        createdAt: new Date().toISOString(),
      };
      await updateUserProfile(user.uid, initProfile);

      await signOut(auth);
      return user;
    } catch (error) {
      const msg = parseAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  // Login with Email & Password
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        const unverifiedErr = new Error('Please verify your email before signing in.');
        unverifiedErr.code = 'auth/email-not-verified';
        unverifiedErr.unverifiedUser = user;
        setAuthError('Please verify your email before signing in.');
        throw unverifiedErr;
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      if (error.code !== 'auth/email-not-verified') {
        const msg = parseAuthError(error);
        setAuthError(msg);
      }
      throw error;
    }
  };

  // Google Sign In
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);

      // Check existing profile or update
      const existing = await getUserProfile(user.uid);
      if (!existing) {
        await updateUserProfile(user.uid, {
          uid: user.uid,
          fullName: user.displayName || 'User',
          displayName: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
        });
      }
      return user;
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const msg = parseAuthError(error);
        setAuthError(msg);
      }
      throw error;
    }
  };

  // Instant Demo Account Login
  const loginAsDemoUser = async () => {
    setAuthError(null);
    const demoUser = {
      uid: 'demo-user-12345',
      email: 'demo@expensetracker.app',
      displayName: 'Demo Explorer',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      emailVerified: true,
      isDemo: true,
      providerData: [{ providerId: 'demo' }]
    };

    const demoProfile = {
      uid: 'demo-user-12345',
      fullName: 'Demo Explorer',
      displayName: 'Demo Explorer',
      email: 'demo@expensetracker.app',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      createdAt: new Date().toISOString(),
      isDemo: true,
    };

    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    setLoading(false);
    return demoUser;
  };

  // Forgot Password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const msg = parseAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      const msg = parseAuthError(error);
      setAuthError(msg);
      throw error;
    }
  };

  // Resend Email Verification
  const resendVerification = async (targetUser) => {
    const userToVerify = targetUser || currentUser || auth.currentUser;
    if (userToVerify) {
      await sendEmailVerification(userToVerify);
    }
  };

  // Derived Single Source of Truth Profile Properties
  const displayName = userProfile?.displayName || userProfile?.fullName || currentUser?.displayName || 'User';
  const photoURL = userProfile?.photoURL || currentUser?.photoURL || '';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        displayName,
        photoURL,
        loading,
        authError,
        updateProfileData,
        refreshProfile,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginAsDemoUser,
        resetPassword,
        logoutUser,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
