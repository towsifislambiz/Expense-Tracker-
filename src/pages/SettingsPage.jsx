import React, { useState, useEffect } from 'react';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Globe,
  Download,
  Trash2,
  CheckCircle2,
  Mail,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useSettings } from '../context/SettingsContext';
import { CURRENCIES, getCurrencyByCode } from '../constants/currencies';
import { deleteUserAccountData } from '../services/firestore/settingsService';
import { auth } from '../firebase/firebaseConfig';
import { AvatarUploader } from '../components/profile/AvatarUploader';
import { SettingsSection } from '../components/settings/SettingsSection';
import { ResetTrackerModal } from '../components/modals/ResetTrackerModal';
import { exportToCSV } from '../utils/exportTransactions';
import { parseAuthError } from '../utils/firebaseErrors';

export const SettingsPage = ({ initialTab = 'profile' }) => {
  const { currentUser, displayName, photoURL, updateProfileData, logoutUser } = useAuth();
  const { transactions, stats, showToast, resetTracker } = useExpenses();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const {
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
    numberFormat,
    setNumberFormat,
    notifications,
    setNotifications,
    formatCurrency,
  } = useSettings();

  const [activeTab, setActiveTab] = useState(initialTab || 'profile');
  const [currencyToast, setCurrencyToast] = useState('');

  // Profile Form States
  const [inputDisplayName, setInputDisplayName] = useState(displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  // Keep inputDisplayName synced if displayName changes externally
  useEffect(() => {
    if (displayName) setInputDisplayName(displayName);
  }, [displayName]);

  // Security Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  // Social Identity Provider Detection (Google / GitHub)
  const isGoogleUser = currentUser?.providerData?.some((p) => p.providerId === 'google.com');
  const isGithubUser = currentUser?.providerData?.some((p) => p.providerId === 'github.com');
  const isSocialAuthUser = isGoogleUser || isGithubUser;

  // Currency Selection Handler with Toast Feedback
  const handleCurrencyChange = (code) => {
    setCurrency(code);
    const currObj = getCurrencyByCode(code);
    setCurrencyToast(`Currency changed to ${currObj.name} (${currObj.symbol})`);
    setTimeout(() => setCurrencyToast(''), 4000);
  };

  // Profile Save Handler (Single Source of Truth)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    if (!inputDisplayName.trim()) {
      setProfileMsg({ text: 'Display name cannot be empty.', type: 'error' });
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfileData({
        displayName: inputDisplayName.trim(),
        photoURL,
      });
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      if (showToast) showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setProfileMsg({ text: parseAuthError(err), type: 'error' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password Change Handler with Strict Re-Authentication & Firebase Auth Updates
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (!currentPassword) {
      setPassMsg({ text: 'Please enter your current password to verify identity.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (currentPassword === newPassword) {
      setPassMsg({ text: 'New password must be different from current password.', type: 'error' });
      return;
    }

    setIsSavingPass(true);
    try {
      const user = auth.currentUser || currentUser;
      if (!user || !user.email) {
        throw new Error('User authentication session invalid. Please log in again.');
      }

      // 1. Re-authenticate user with Current Password to satisfy Firebase Auth security rules
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 2. Update password in Firebase Authentication
      await updatePassword(user, newPassword);

      // 3. Clear form and provide success feedback
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassMsg({ text: 'Password updated successfully! Next login will require your new password.', type: 'success' });
      if (showToast) showToast('Password updated in Firebase Authentication.', 'success');
    } catch (err) {
      console.error('Change password error:', err);
      setPassMsg({ text: parseAuthError(err), type: 'error' });
    } finally {
      setIsSavingPass(false);
    }
  };

  // Export Personal Finance JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      profile: {
        uid: currentUser?.uid,
        email: currentUser?.email,
        displayName,
        photoURL,
      },
      settings: {
        currency,
        dateFormat,
        numberFormat,
        notifications,
      },
      stats: stats || {},
      transactionsCount: (transactions || []).length,
      transactions: transactions || [],
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finance-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you sure you want to delete all transaction ledgers and reset your account data? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      if (currentUser) {
        await deleteUserAccountData(currentUser.uid);
      }
      alert('Account data cleared successfully.');
      if (logoutUser) await logoutUser();
    } catch (err) {
      alert('Failed to delete account data: ' + err.message);
    }
  };

  const safeTransactionsCount = (transactions || []).length;
  const safeTotalBalance = stats?.totalBalance || 0;
  const safeMonthlyIncome = stats?.monthlyIncome || 0;
  const safeMonthlyExpenses = stats?.monthlyExpenses || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification Banner */}
      {currencyToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{currencyToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="card-locked p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2.5">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <span>Profile & App Settings</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile, currency preferences, notifications, and security settings.
          </p>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'general', label: 'App Preferences', icon: Globe },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security & Backup', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Avatar & Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <SettingsSection title="Profile Details" subtitle="Update your public name and avatar photo">
              <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                {profileMsg.text && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                {/* Avatar Uploader */}
                <AvatarUploader
                  userName={displayName}
                  currentPhotoURL={photoURL}
                  onPhotoChange={(url) => updateProfileData({ photoURL: url })}
                  onRemovePhoto={() => updateProfileData({ photoURL: '' })}
                />

                {/* Display Name Field */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={inputDisplayName}
                    onChange={(e) => setInputDisplayName(e.target.value)}
                    className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </SettingsSection>
          </div>

          {/* Right Column: Profile Statistics Card */}
          <div className="lg:col-span-5 space-y-6">
            <SettingsSection title="Account Financial Summary" subtitle="Live statistics compiled from your ledger">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                  <span className="text-slate-400">Total Transactions</span>
                  <p className="text-lg font-bold text-white">{safeTransactionsCount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                  <span className="text-slate-400">Net Balance</span>
                  <p className={`text-lg font-bold ${safeTotalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency ? formatCurrency(safeTotalBalance) : safeTotalBalance}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                  <span className="text-slate-400">Total Income</span>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency ? formatCurrency(safeMonthlyIncome) : safeMonthlyIncome}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                  <span className="text-slate-400">Total Expense</span>
                  <p className="text-lg font-bold text-rose-400">{formatCurrency ? formatCurrency(safeMonthlyExpenses) : safeMonthlyExpenses}</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                <span className="font-bold text-indigo-300">Account Security Status</span>
                <p className="text-slate-300 text-[11px]">
                  Email Verified: <strong className={currentUser?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}>{currentUser?.emailVerified ? 'Verified ✓' : 'Unverified ⚠'}</strong>
                </p>
              </div>
            </SettingsSection>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL APP PREFERENCES */}
      {activeTab === 'general' && (
        <div className="max-w-3xl space-y-6">
          <SettingsSection title="Currency & Regional Settings" subtitle="Configure currency symbols and numeric formatting">
            <div className="space-y-4 text-xs">
              {/* Multi-Currency Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Currency</label>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Date Display Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/05/2026)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 05/08/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-05)</option>
                </select>
              </div>

              {/* Number Format */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Number Formatting Style</label>
                <select
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="international">Standard Full ($10,000.00 / ৳10,000.00)</option>
                  <option value="compact">Compact Format ($10k / ৳10k)</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-6">
          <SettingsSection title="Notification Preferences" subtitle="Manage automated alerts and email summaries">
            <div className="space-y-3 text-xs">
              {[
                { key: 'budgetAlert', title: 'Budget Limit Warnings', desc: 'Notify when spending reaches 80% or exceeds target' },
                { key: 'monthlyReport', title: 'Monthly Expense Reports', desc: 'Receive automated monthly solvency report summaries' },
                { key: 'savingReminder', title: 'Saving Goal Reminders', desc: 'Reminders to allocate savings towards active goals' },
                { key: 'transactionReminder', title: 'Daily Transaction Logging Reminders', desc: 'Prompts to record daily expenses' },
              ].map((item) => (
                <div key={item.key} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">{item.title}</span>
                    <span className="text-slate-400 text-[11px]">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications?.[item.key])}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </SettingsSection>
        </div>
      )}

      {/* TAB 4: SECURITY & BACKUP */}
      {activeTab === 'security' && (
        <div className="max-w-3xl space-y-6">
          {/* Security Password Change */}
          <SettingsSection title="Security & Credentials" subtitle="Update account authentication details">
            {isSocialAuthUser ? (
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Social Provider Authentication Active</h4>
                    <span className="text-[11px] font-semibold text-indigo-300">
                      {isGoogleUser ? 'Google Account' : 'GitHub Account'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your account is authenticated using <strong>{isGoogleUser ? 'Google Sign-In' : 'GitHub OAuth'}</strong>. Password changes are managed securely through your social identity provider settings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                {passMsg.text && (
                  <div
                    className={`p-3 rounded-xl border flex items-center space-x-2 ${
                      passMsg.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    {passMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to verify identity"
                    className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-[#171928] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPass}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSavingPass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </SettingsSection>

          {/* Data Export & Backup */}
          <SettingsSection title="Data Management & Backup" subtitle="Download data exports or clear account history">
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Download Finance Backup (JSON)</span>
                  <span className="text-slate-400 text-[11px]">Full backup of profile, settings, transactions, and budgets</span>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Export CSV Ledger</span>
                  <span className="text-slate-400 text-[11px]">Download all transaction history as CSV</span>
                </div>
                <button
                  onClick={() => exportToCSV(transactions || [])}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-rose-300 block">Reset All Financial Data</span>
                  <span className="text-rose-400/80 text-[11px]">Permanently purge all transactions, budgets, daily expenses, and goals without deleting your account</span>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Tracker
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Reset Tracker Modal */}
          <ResetTrackerModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirmReset={async (onProgress) => {
              await resetTracker(onProgress);
              setIsResetModalOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
