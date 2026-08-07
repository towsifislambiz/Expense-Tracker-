import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthPage } from '../../pages/AuthPage';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State - Redirect to Auth Page / Login View
  if (!currentUser) {
    return <AuthPage initialMode="login" />;
  }

  // 3. Authenticated State - Render Children (Dashboard Layout Shell)
  return children;
};
