import { useState, useRef } from 'react';
import { sessionStorage } from '../services/sessionStorage';
import { documentAnalysis } from '../services/documentAnalysis';
import { FILE_CONFIG, TIMEOUTS } from '../constants/config';
import { logger } from '../services/logger';
import { validateFileContent } from '../utils/sanitization';
import './DocumentUpload.css';

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check if file type is supported
    const isText = file.type === 'text/plain';
    const isImage = file.type.startsWith('image/');
    
    if (!isText && !isImage) {
      setError('Please upload a .txt file or an image file (PNG, JPG, JPEG)');
      setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
      return;
    }

    // Validate file size
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed: ${(FILE_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
      setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
      logger.warn('File upload rejected: exceeds size limit', { fileName: file.name, size: file.size });
      return;
    }

    setUploading(true);
    setError('');
    setUploadStatus(isImage ? 'Uploading image...' : 'Uploading document...');

    try {
      if (isText) {
        // Handle text files
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string;
            
            // Validate content
            const validation = validateFileContent(content, FILE_CONFIG.MAX_TEXT_LENGTH);
            if (!validation.valid) {
              setError(validation.error || 'Invalid file content');
              setUploading(false);
              setUploadStatus('');
              setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
              return;
            }
            
            // Check minimum content length
            if (content.length < FILE_CONFIG.MIN_TEXT_LENGTH) {
              setError(`Document must have at least ${FILE_CONFIG.MIN_TEXT_LENGTH} characters`);
              setUploading(false);
              setUploadStatus('');
              setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
              return;
            }
            
            const doc = {
              id: crypto.randomUUID(),
              name: file.name,
              type: 'text' as const,
              content,
              uploadedAt: Date.now(),
            };

            await sessionStorage.saveDocument(doc);
            setUploadedFile(doc);
            setUploading(false);
            setUploadStatus('');
            logger.info('Text file uploaded successfully', { fileName: file.name, size: content.length });
          } catch (err) {
            logger.error('Error processing text file', err);
            setError('Failed to process file. Please try again.');
            setUploading(false);
            setUploadStatus('');
            setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
          }
        };
        reader.onerror = () => {
          setError('Failed to read text file');
          setUploading(false);
          setUploadStatus('');
          setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
          logger.error('FileReader error for text file', { fileName: file.name });
        };
        reader.readAsText(file);
      } else if (isImage) {
        // Handle image files - store as base64
        setUploadStatus('Processing image...');
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64Data = event.target?.result as string;
            
            const doc = {
              id: crypto.randomUUID(),
              name: file.name,
              type: 'image' as const,
              content: '✅ Image uploaded successfully!\n\n📸 To analyze this image:\n1. Go to "EduFlow" tab for document analysis\n2. Or use "Doubt Destroyer" tab for AI-powered image explanation\n3. Or use "Vision" tab for live camera analysis',
              imageData: base64Data,
              uploadedAt: Date.now(),
            };

            await sessionStorage.saveDocument(doc);
            setUploadedFile(doc);
            setUploading(false);
            setUploadStatus('');
            logger.info('Image file uploaded successfully', { fileName: file.name });
          } catch (err) {
            logger.error('Error processing image file', err);
            setError('Failed to process image. Please try again.');
            setUploading(false);
            setUploadStatus('');
            setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
          }
        };
        
        reader.onerror = () => {
          setError('Failed to read image file');
          setUploading(false);
          setUploadStatus('');
          setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
          logger.error('FileReader error for image file', { fileName: file.name });
        };
        
        reader.readAsDataURL(file);
      }
    } catch (err) {
      logger.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
      setUploading(false);
      setUploadStatus('');
      setTimeout(() => setError(''), FILE_CONFIG.ERROR_CLEAR_DELAY);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h2>Upload Document</h2>
        <p>Drag & drop or click to upload your study material</p>
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="upload-progress">
            <div className="upload-spinner"></div>
            <p>{uploadStatus || 'Uploading...'}</p>
          </div>
        ) : error ? (
          <div className="upload-error">
            <div className="error-icon">❌</div>
            <p>{error}</p>
            <button className="try-again" onClick={(e) => {
              e.stopPropagation();
              setError('');
            }}>
              Try Again
            </button>
          </div>
        ) : uploadedFile ? (
          <div className="upload-success">
            <div className="success-icon">✅</div>
            <h3>{uploadedFile.name}</h3>
            <p>
              {uploadedFile.type === 'text' 
                ? `${Math.round(uploadedFile.content.length / 1024)}KB uploaded`
                : uploadedFile.type === 'image'
                ? 'Image uploaded successfully'
                : 'File uploaded successfully'}
            </p>
            {uploadedFile.type === 'image' && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                💡 Use <strong>EduFlow</strong> or <strong>Doubt Destroyer</strong> tab to analyze this image
              </div>
            )}
            <button className="upload-another" onClick={(e) => {
              e.stopPropagation();
              setUploadedFile(null);
            }}>
              Upload Another
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📁</div>
            <h3>Drop your file here</h3>
            <p>or click to browse</p>
            <span className="file-types">Supports: .txt files and images (PNG, JPG, JPEG)</span>
          </div>
        )}
      </div>

      <div className="upload-tips">
        <h4>💡 Tips for best results:</h4>
        <ul>
          <li>Use plain text (.txt) files for text-based content</li>
          <li>Upload images (PNG, JPG) with clear text or diagrams</li>
          <li>Keep files between 1-50KB for optimal performance</li>
          <li>Well-structured content works best</li>
          <li>Include headings and paragraphs for text files</li>
        </ul>
      </div>

      <div className="sample-file-info">
        <p>
          📝 <strong>Try with sample:</strong> Use{' '}
          <code>sample-study-material.txt</code> to test all features
        </p>
      </div>
    </div>
  );
}
