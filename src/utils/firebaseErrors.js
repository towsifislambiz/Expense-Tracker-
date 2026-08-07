export const parseAuthError = (error) => {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  if (
    code.includes('api-key-not-valid') ||
    message.includes('api-key-not-valid') ||
    code.includes('invalid-api-key') ||
    message.includes('invalid-api-key')
  ) {
    return 'Firebase API Key is invalid or missing. Please verify credentials.';
  }

  if (
    code === 'permission-denied' ||
    message.includes('insufficient permissions') ||
    message.includes('Missing or insufficient permissions')
  ) {
    return 'Access Denied: You must be logged in to modify transaction data, or your input violates security validation rules.';
  }

  switch (code) {
    case 'auth/user-not-found':
      return 'No registered account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify and try again.';
    case 'auth/invalid-credential':
      return 'Incorrect email or password credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Access blocked due to multiple failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup window was closed before completion.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in your Firebase Console.';
    case 'auth/email-not-verified':
      return 'Your email address has not been verified yet. Please verify your email before logging in.';
    default:
      return message || 'Authentication or database request failed. Please try again.';
  }
};
