# LuxeFinance — Premium Personal Expense Tracker & Financial Intelligence Platform

LuxeFinance is a production-ready personal finance management SaaS built with React, Vite, Tailwind CSS, Framer Motion, Recharts, and Firebase Authentication + Cloud Firestore.

---

## 🌟 Key Features & Systems

1. **Phase 1: Production Authentication**
   * Email/Password registration, Login, Google OAuth, Email verification banners, and Password Reset.
2. **Phase 2 & 3: Firestore Transaction System**
   * Non-blocking background writes with immediate local optimistic UI state updates.
   * Multi-user isolated Firestore schema (`users/{uid}/transactions/{id}`).
3. **Phase 4 & 7: Dynamic Financial Analytics Engine**
   * Algorithmic **Financial Health Score** (0–100 score).
   * Income vs Expense monthly trend area charts and Category spending donut charts.
   * Day-by-day interactive Expense Calendar.
4. **Phase 5: Advanced Transaction Ledger**
   * Debounced real-time search across Title, Category, and Notes.
   * Multi-filters (Type, Category, Date Range) and 6-mode sorting engine.
   * Multi-select bulk checkbox selection and Firestore batch deletion (`writeBatch()`).
   * One-click CSV downloads (`.csv`) and printable PDF executive report generator.
5. **Phase 6: Budget Management System**
   * User-specific budget thresholds (`users/{uid}/budgets/{id}`) for Overall and Category limits.
   * Live progress bars with color status indicators (<80% Emerald, 80-99% Amber, ≥100% Rose).
   * Automated spending alert banners (80% warning / 100% exceeded).
6. **Phase 8: Profile & Settings System**
   * Avatar uploader supporting preset avatars and custom URLs.
   * Regional settings: Currency (USD $, BDT ৳, EUR €, GBP £), Date Formats (`MM/DD/YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`), and Number Formats.
   * Personal finance JSON backup download (`exportJSONBackup`).
7. **Phase 9 & 10: Production Optimization, Security & PWA**
   * `React.lazy()` route code-splitting with `Suspense` fallbacks.
   * `ErrorBoundary` crash recovery screens.
   * Strict Firestore & Storage security rules (`request.auth.uid == uid`).
   * PWA web app manifest (`manifest.json`) and service worker offline asset caching.

---

## 🛠 Tech Stack

* **Frontend**: React 18, Vite 6, Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
* **Backend / Database**: Firebase Authentication, Cloud Firestore, Firebase Storage.
* **Architecture**: Context API providers (`AuthProvider`, `TransactionProvider`, `ExpenseProvider`, `BudgetProvider`, `SettingsProvider`, `ThemeProvider`).

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/expense-tracker-dashboard.git
cd expense-tracker-dashboard
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and enter your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔒 Firebase Security Rules Deployment

Deploy Firestore and Storage security rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

---

## 📦 Production Build & Hosting

Build minified production bundle:
```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```
