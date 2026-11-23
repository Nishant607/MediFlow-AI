/**
 * Name sanitization and formatting helpers for MediFlow AI
 * Prevents duplicate "Dr. Dr." prefixes across the app.
 */

export const formatDoctorName = (name, fallback = 'Specialist') => {
  if (!name || typeof name !== 'string') return `Dr. ${fallback}`;
  let clean = name.trim();
  if (!clean) return `Dr. ${fallback}`;

  // Continuously remove any leading "dr.", "dr", or "doctor" (case-insensitive)
  while (/^(dr\.?|doctor)\s+/i.test(clean)) {
    clean = clean.replace(/^(dr\.?|doctor)\s+/i, '').trim();
  }

  // Also handle cases where someone entered just "Dr." or "Dr"
  if (!clean) return `Dr. ${fallback}`;

  return `Dr. ${clean}`;
};

export const getDoctorGreeting = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'Dr. Doctor';
  const cleanDoc = formatDoctorName(fullName);
  const withoutPrefix = cleanDoc.replace(/^Dr\.\s+/i, '').trim();
  const firstWord = withoutPrefix.split(' ')[0] || 'Doctor';
  return `Dr. ${firstWord}`;
};

export const formatUserName = (name, role) => {
  if (role === 'doctor') {
    return formatDoctorName(name);
  }
  return name || 'User';
};
