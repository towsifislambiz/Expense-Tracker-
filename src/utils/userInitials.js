/**
 * Utility to extract clean, uppercase initials from a user's display name.
 * 
 * Rules:
 * - "Towsif Islam" -> "TI"
 * - "John Doe" -> "JD"
 * - "Olivia Bennett" -> "OB"
 * - "Alex" -> "AL"
 * - "A" -> "A"
 * - "  john   doe  " -> "JD"
 * - null/undefined/empty -> "U"
 */
export const getUserInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';

  const cleanName = name.trim().replace(/\s+/g, ' ');
  if (!cleanName) return 'U';

  const parts = cleanName.split(' ');

  if (parts.length >= 2) {
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  // Single word name (e.g. "Alex" -> "AL", "A" -> "A")
  const singleWord = parts[0];
  if (singleWord.length >= 2) {
    return singleWord.slice(0, 2).toUpperCase();
  }
  return singleWord.charAt(0).toUpperCase();
};
