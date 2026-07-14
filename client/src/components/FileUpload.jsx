import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '@/lib/api';

export default function FileUpload({ label, accept = "image/*,.pdf", onUploadSuccess, currentFileUrl }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentFileUrl || null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signed upload credentials from our server (fast — no file sent)
      const { data: signData } = await api.get('/upload/sign');

      // Step 2: Upload DIRECTLY from browser to Cloudinary (no middleman server hop)
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const xhr = new XMLHttpRequest();

      // Track real upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          setPreviewUrl(result.secure_url);
          if (onUploadSuccess) onUploadSuccess(result.secure_url);
        } else {
          setError('Upload failed. Please try again.');
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError('Upload failed. Check your connection and try again.');
      };

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`);
      xhr.send(formData);

    } catch (err) {
      console.error('FileUpload error:', err);
      setUploading(false);
      setError('Could not start upload. Please try again.');
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUploadSuccess) onUploadSuccess(null);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </label>
      )}

      {/* Drop zone — shown when idle and no file uploaded */}
      {!previewUrl && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', padding: '24px', background: '#F4F6F8',
            border: '1px dashed rgba(0,0,0,0.14)', borderRadius: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.border = '1px dashed #6B7280'}
          onMouseLeave={e => e.currentTarget.style.border = '1px dashed rgba(0,0,0,0.14)'}
        >
          <UploadCloud size={24} color="#9CA3AF" style={{ marginBottom: 8 }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>Click to upload file</span>
          <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Max 10MB</span>
        </div>
      )}

      {/* Progress state */}
      {uploading && (
        <div style={{
          width: '100%', padding: '20px', background: '#F4F6F8',
          border: '1px solid #E5E7EB', borderRadius: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              width: 16, height: 16, border: '2px solid rgba(0,0,0,0.14)',
              borderTopColor: '#7C3AED', borderRadius: '50%',
              animation: 'spin 1s linear infinite', flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: '#111827' }}>
              Uploading {file?.name}... {progress}%
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: 4, background: '#E5E7EB', borderRadius: 4 }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
              borderRadius: 4, transition: 'width 0.2s ease',
            }} />
          </div>
        </div>
      )}

      {/* Success state */}
      {previewUrl && !uploading && (
        <div style={{
          width: '100%', padding: '12px 16px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#10B981" />
            <span style={{ fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
              {file?.name || 'File uploaded'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#EF4444', fontSize: 12 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
