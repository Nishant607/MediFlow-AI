import { useState, useEffect, useCallback } from 'react';

/**
 * useProfilePhoto — shared hook for all 3 roles
 * Stores profile photo as base64 in localStorage, scoped to email.
 * No backend needed — fully frontend persistent.
 *
 * Usage:
 *   const { photoUrl, uploading, handlePhotoChange, removePhoto } = useProfilePhoto(email);
 */
const useProfilePhoto = (email) => {
  const storageKey = `mediflow_avatar_${email || 'default'}`;

  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Load saved photo on mount
  useEffect(() => {
    if (!email) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setPhotoUrl(saved);
    } catch (e) {
      console.error('Failed to load profile photo', e);
    }
  }, [storageKey, email]);

  // Handle file input change — converts to base64
  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed (JPG, PNG, WEBP).');
      return;
    }

    // Validate file size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5 MB.');
      return;
    }

    setUploadError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64 = reader.result;
        localStorage.setItem(storageKey, base64);
        setPhotoUrl(base64);
      } catch (err) {
        setUploadError('Could not save photo. Storage might be full.');
        console.error(err);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // Clear input so same file can be re-selected
    e.target.value = '';
  }, [storageKey]);

  // Remove photo
  const removePhoto = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setPhotoUrl(null);
      setUploadError('');
    } catch (err) {
      console.error('Failed to remove photo', err);
    }
  }, [storageKey]);

  return { photoUrl, uploading, uploadError, handlePhotoChange, removePhoto };
};

export default useProfilePhoto;
