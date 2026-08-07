import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { validateImageFile, uploadAvatarToStorage, deleteAvatarFromStorage } from '../../services/storage/avatarStorageService';
import { useAuth } from '../../context/AuthContext';

export const AvatarUploader = ({ userName = 'User', currentPhotoURL = '', onPhotoChange, onRemovePhoto }) => {
  const { currentUser } = useAuth();

  // Mode Selection: 'file' | 'url'
  const [activeTab, setActiveTab] = useState('file');

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Online URL States
  const [urlInput, setUrlInput] = useState('');

  // Status & Validation Alert State
  const [alert, setAlert] = useState({ text: '', type: '' });

  const fileInputRef = useRef(null);

  // Clear Alert Message
  const showAlert = (text, type = 'error') => {
    setAlert({ text, type });
  };
  const clearAlert = () => setAlert({ text: '', type: '' });

  // Handle Local File Selection
  const handleFileSelect = (file) => {
    clearAlert();
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showAlert(validation.error, 'error');
      setSelectedFile(null);
      setFilePreview('');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Drag & Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Clear Selected File Draft
  const handleClearFileDraft = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview('');
    }
    clearAlert();
  };

  // Save Uploaded Device File to Firebase Storage / Data URL
  const handleUploadFile = async () => {
    if (!selectedFile) {
      showAlert('Please select an image file first.', 'error');
      return;
    }

    if (!currentUser) {
      showAlert('You must be logged in to upload profile photos.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    clearAlert();

    try {
      // 1. Delete old storage avatar if user previously uploaded one
      if (currentPhotoURL) {
        await deleteAvatarFromStorage(currentPhotoURL);
      }

      // 2. Upload file (or local compressed Data URL fallback)
      const { downloadURL } = await uploadAvatarToStorage(
        currentUser.uid,
        selectedFile,
        (progress) => setUploadProgress(Math.max(25, progress))
      );

      setUploadProgress(100);

      // 3. Update profile state (real-time header sync)
      onPhotoChange(downloadURL);
      showAlert('Profile picture updated successfully!', 'success');
      handleClearFileDraft();
    } catch (err) {
      console.error('Upload Avatar Error:', err);
      showAlert(err.message || 'Failed to update avatar image.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Save Online Image URL
  const handleSaveUrl = (e) => {
    e.preventDefault();
    clearAlert();

    const trimmed = urlInput.trim();
    if (!trimmed) {
      showAlert('Please enter an image URL.', 'error');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      showAlert('Invalid URL format. Please start with http:// or https://', 'error');
      return;
    }

    onPhotoChange(trimmed);
    setUrlInput('');
    showAlert('Image URL updated successfully!', 'success');
  };

  // Remove Photo Action (Deletes from Storage and resets to Initials)
  const handleRemovePhoto = async () => {
    clearAlert();
    try {
      if (currentPhotoURL) {
        await deleteAvatarFromStorage(currentPhotoURL);
      }
      onRemovePhoto();
      handleClearFileDraft();
      showAlert('Profile picture removed. Restored initials avatar.', 'success');
    } catch (err) {
      console.error('Remove Avatar Error:', err);
      onRemovePhoto(); // Fallback anyway
    }
  };

  return (
    <div className="space-y-5">
      {/* Current Avatar Header Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <UserAvatar
            name={userName}
            src={filePreview || currentPhotoURL}
            size="2xl"
          />
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{userName}</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filePreview
                  ? 'Preview Draft'
                  : currentPhotoURL
                  ? 'Custom Photo'
                  : 'Initials Avatar'}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentPhotoURL
                ? 'Custom avatar active across dashboard.'
                : 'Showing auto-generated initials avatar.'}
            </p>
          </div>
        </div>

        {currentPhotoURL && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all text-xs font-bold cursor-pointer flex items-center justify-center space-x-1.5"
            title="Delete photo and restore initials avatar"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* Alert Banner */}
      {alert.text && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{alert.text}</span>
          </div>
          <button type="button" onClick={clearAlert} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Mode Selector Tabs */}
      <div className="flex items-center space-x-2 p-1 rounded-xl bg-[#171928] border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveTab('file');
            clearAlert();
          }}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'file'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            clearAlert();
          }}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </button>
      </div>

      {/* TAB 1: DEVICE FILE UPLOAD & DRAG/DROP ZONE */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/15 scale-[1.01]'
                  : 'border-white/15 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Drag and drop your image here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPG, JPEG, PNG, WEBP • Max size: 5MB
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={filePreview}
                    alt="Local Draft Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/40 border border-white/10"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-48 sm:max-w-xs">
                      {selectedFile.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearFileDraft}
                  disabled={isUploading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Cancel selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Uploading & processing avatar...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleUploadFile}
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Avatar...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Upload & Save Avatar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearFileDraft}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ONLINE IMAGE URL */}
      {activeTab === 'url' && (
        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="Paste public image URL (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-[#171928] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Apply Image URL</span>
          </button>
        </form>
      )}
    </div>
  );
};
