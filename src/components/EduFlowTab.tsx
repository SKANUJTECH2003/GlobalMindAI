import { useState, useRef, useCallback } from 'react';
import { sessionStorage, type StudyDocument } from '../services/sessionStorage';
import { documentAnalysis } from '../services/documentAnalysis';
import { logger } from '../services/logger';
import { FILE_CONFIG } from '../constants/config';
import { DocumentViewer } from './EduFlow/DocumentViewer';
import { AIOutputPanel } from './EduFlow/AIOutputPanel';
import { DoubtDestroyer } from './EduFlow/DoubtDestroyer';
import { ActiveRecall } from './EduFlow/ActiveRecall';
import './EduFlowTab.css';

type ViewMode = 'workspace' | 'doubt-destroyer' | 'active-recall' | 'flashcards';
type AnalysisType = 'summary' | 'quiz' | 'topics' | 'mindmap' | 'flashcards';

export function EduFlowTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('workspace');
  const [currentDocument, setCurrentDocument] = useState<StudyDocument | null>(null);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summary');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisInProgressRef = useRef<boolean>(false); // Guard against multiple calls

  // Initialize storage on mount
  useState(() => {
    sessionStorage.initialize().then(() => {
      loadDocuments();
    });
  });

  const loadDocuments = async () => {
    try {
      const docs = await sessionStorage.getAllDocuments();
      logger.info('Documents loaded', { count: docs.length });
      
      // Log document types for debugging (only in development)
      if (import.meta.env.DEV) {
        docs.forEach(doc => {
          logger.debug(`Document: ${doc.name}`, { 
            type: doc.type, 
            contentLength: doc.content?.length || 0,
            hasImageData: !!doc.imageData 
          });
        });
      }
      
      setDocuments(docs);
    } catch (error) {
      logger.error('Failed to load documents', error);
    }
  };

  // Handle file upload (PDF, images, text)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileType = file.type;

    let doc: StudyDocument;

    if (fileType === 'application/pdf') {
      // For PDF: Show preview but note that text extraction is limited
      doc = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'pdf',
        uploadedAt: Date.now(),
        content: 'PDF files require manual text input. Please copy-paste the text content into a .txt file for analysis.',
      };
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        doc.imageData = e.target?.result as string;
        await sessionStorage.saveDocument(doc);
        setCurrentDocument(doc);
        await loadDocuments();
      };
      reader.readAsDataURL(file);
    } else if (fileType.startsWith('image/')) {
      // For images: Store as base64 but note limitation
      doc = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'image',
        uploadedAt: Date.now(),
        content: 'Image analysis requires VLM support. Currently, please use the "Doubt Destroyer" tab for image analysis, or convert image text to .txt file for document analysis.',
      };
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        doc.imageData = e.target?.result as string;
        await sessionStorage.saveDocument(doc);
        setCurrentDocument(doc);
        await loadDocuments();
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'text/plain') {
      // For text files: Store content directly
      doc = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'text',
        uploadedAt: Date.now(),
      };
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        doc.content = e.target?.result as string;
        await sessionStorage.saveDocument(doc);
        setCurrentDocument(doc);
        await loadDocuments();
      };
      reader.readAsText(file);
    } else {
      alert('Unsupported file type. Please upload .txt, .pdf, or image files.');
      return;
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Safe content extraction - ensures only text content is used
  const getSafeTextContent = (doc: StudyDocument): string | null => {
    // Only extract content from text documents
    if (doc.type !== 'text') {
      logger.warn('Attempted to get text content from non-text document', { type: doc.type });
      return null;
    }
    
    // Ensure content exists and is a string
    if (!doc.content || typeof doc.content !== 'string') {
      logger.warn('Document content is missing or invalid');
      return null;
    }
    
    // Remove any potential binary data or image references
    const cleanContent = doc.content
      .replace(/data:image\/[^;]+;base64,[^\s]+/g, '') // Remove base64 images
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
      .replace(/<img[^>]*>/g, '') // Remove HTML img tags
      .trim();
    
    return cleanContent;
  };

  // Analyze current document
  const handleAnalyze = async () => {
    // CRITICAL GUARD: Prevent multiple simultaneous analysis calls
    if (analysisInProgressRef.current) {
      logger.warn('Analysis already in progress, ignoring duplicate call');
      return;
    }

    if (!currentDocument) {
      logger.warn('No document selected for analysis');
      return;
    }

    logger.info('Starting analysis', { 
      documentName: currentDocument.name, 
      documentType: currentDocument.type, 
      analysisType: analysisType 
    });

    // CRITICAL: Block image and PDF analysis - these require VLM, not LLM
    if (currentDocument.type === 'image') {
      setAnalysisResult({ 
        type: 'error', 
        message: '🚫 Image Analysis Not Supported Here\n\n📸 Images require Vision Language Model (VLM) for analysis.\n\n✅ To analyze this image:\n• Use "Doubt Destroyer" tab → Upload or capture image → Get AI explanation\n• Use "Vision" tab → Live camera analysis\n\n💡 Or convert image text to .txt file for document analysis here.' 
      });
      setIsAnalyzing(false);
      return;
    }

    if (currentDocument.type === 'pdf') {
      setAnalysisResult({ 
        type: 'error', 
        message: '🚫 PDF Analysis Not Supported Here\n\n📑 PDF text extraction is limited in browser.\n\n✅ To analyze PDF content:\n• Convert PDF to .txt file and upload here\n• Take screenshots and use "Doubt Destroyer" tab\n• Copy-paste text content into a .txt file\n\n💡 For best results, use plain text (.txt) files.' 
      });
      setIsAnalyzing(false);
      return;
    }

    // Check if document has actual text content
    if (!currentDocument.content || currentDocument.content.length < 50) {
      setAnalysisResult({ 
        type: 'error', 
        message: '⚠️ No Text Content Found\n\nThis document does not have enough text content to analyze.\n\n✅ Please upload a .txt file with your study material (minimum 50 characters).' 
      });
      setIsAnalyzing(false);
      return;
    }

    // Only proceed if document is text type
    if (currentDocument.type !== 'text') {
      setAnalysisResult({ 
        type: 'error', 
        message: '⚠️ Unsupported Document Type\n\nOnly .txt files can be analyzed here.\n\nPlease upload a plain text file.' 
      });
      setIsAnalyzing(false);
      return;
    }

    // Extract safe text content
    const safeContent = getSafeTextContent(currentDocument);
    if (!safeContent) {
      setAnalysisResult({ 
        type: 'error', 
        message: '⚠️ Cannot Extract Text Content\n\nFailed to extract valid text from this document.\n\n✅ Solutions:\n• Re-upload the file\n• Ensure it\'s a valid .txt file\n• Check file is not corrupted' 
      });
      setIsAnalyzing(false);
      return;
    }

    console.log('Safe content extracted, length:', safeContent.length);

    // SET GUARD - Prevent duplicate calls
    analysisInProgressRef.current = true;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisProgress('Loading AI model... (first time may take 2-5 minutes)');

    try {
      console.log('Analysis type:', analysisType);
      console.log('Document object:', {
        id: currentDocument.id,
        name: currentDocument.name,
        type: currentDocument.type,
        contentLength: currentDocument.content?.length,
        hasImageData: !!currentDocument.imageData,
        imageDataLength: currentDocument.imageData?.length
      });

      // CRITICAL CHECK: Ensure we're not passing imageData accidentally
      if (currentDocument.imageData) {
        console.error('⚠️ WARNING: Document has imageData field! This should not be analyzed.');
        setAnalysisResult({ 
          type: 'error', 
          message: '⚠️ Document Corruption Detected\n\nThis document contains image data that cannot be analyzed with text models.\n\n✅ Solutions:\n• Delete this document and re-upload as .txt file\n• Clear browser storage and start fresh\n• Use a different text file' 
        });
        return;
      }

      switch (analysisType) {
        case 'summary':
          setAnalysisProgress('Generating comprehensive summary...');
          const summary = await documentAnalysis.generateSummary(
            safeContent,
            'detailed'
          );
          setAnalysisResult({ type: 'summary', content: summary });
          
          // Defer storage to not block UI
          setTimeout(async () => {
            await sessionStorage.saveSummary({
              id: crypto.randomUUID(),
              documentId: currentDocument.id,
              content: summary,
              createdAt: Date.now(),
            });
          }, 0);
          break;

        case 'quiz':
          setAnalysisProgress('Creating quiz questions...');
          const quiz = await documentAnalysis.generateQuiz(
            safeContent,
            5,
            'medium'
          );
          setAnalysisResult({ type: 'quiz', questions: quiz });
          
          // Defer storage to not block UI
          setTimeout(async () => {
            await sessionStorage.saveQuiz({
              id: crypto.randomUUID(),
              documentId: currentDocument.id,
              questions: quiz,
              createdAt: Date.now(),
            });
          }, 0);
          break;

        case 'topics':
          setAnalysisProgress('Extracting important topics...');
          const topics = await documentAnalysis.extractImportantTopics(
            safeContent
          );
          setAnalysisResult({ type: 'topics', topics });
          
          // Defer storage to not block UI - batch the saves
          setTimeout(async () => {
            for (const topic of topics) {
              await sessionStorage.saveTopic({
                id: crypto.randomUUID(),
                documentId: currentDocument.id,
                topic: topic.topic,
                explanation: topic.explanation,
                createdAt: Date.now(),
              });
              // Yield every save to prevent blocking
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }, 0);
          break;

        case 'mindmap':
          setAnalysisProgress('Building mind map structure...');
          const mindmap = await documentAnalysis.generateMindMap(
            safeContent
          );
          setAnalysisResult({ type: 'mindmap', nodes: mindmap });
          
          // Defer storage to not block UI
          setTimeout(async () => {
            await sessionStorage.saveMindMap({
              id: crypto.randomUUID(),
              documentId: currentDocument.id,
              nodes: mindmap,
              createdAt: Date.now(),
            });
          }, 0);
          break;

        case 'flashcards':
          setAnalysisProgress('Creating flashcards...');
          const flashcards = await documentAnalysis.generateFlashcards(
            safeContent,
            10
          );
          setAnalysisResult({ type: 'flashcards', flashcards });
          
          // Defer storage to not block UI - batch the saves
          setTimeout(async () => {
            for (const card of flashcards) {
              await sessionStorage.saveFlashcard({
                id: crypto.randomUUID(),
                documentId: currentDocument.id,
                ...card,
                createdAt: Date.now(),
              });
              // Yield every save to prevent blocking
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }, 0);
          break;
      }
      
      logger.info('Analysis completed successfully', { type: analysisType });
    } catch (error) {
      logger.error('Analysis error', error);
      
      // Check if error is from model rejecting image input
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('image') || errorMessage.includes('Cannot read')) {
        setAnalysisResult({ 
          type: 'error', 
          message: '❌ Model Error\n\nThe AI model encountered an issue processing this content.\n\n✅ Solutions:\n• Ensure file is a valid .txt file with text content\n• Remove any image references or binary data\n• Try with a different text file\n\nIf problem persists, refresh the page and try again.' 
        });
      } else {
        setAnalysisResult({ 
          type: 'error', 
          message: '❌ Analysis Failed\n\nThere was an error analyzing your document.\n\nError: ' + errorMessage + '\n\nPlease try again or refresh the page.' 
        });
      }
    } finally {
      // ALWAYS release guard and reset state
      analysisInProgressRef.current = false;
      setIsAnalyzing(false);
      setAnalysisProgress('');
      logger.info('Analysis cleanup complete');
    }
  };

  // Export flashcards to Anki format
  const handleExportFlashcards = async () => {
    if (!currentDocument) return;
    
    const ankiCsv = await sessionStorage.exportFlashcardsToAnki(currentDocument.id);
    
    // Create download link
    const blob = new Blob([ankiCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${currentDocument.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete document handler
  const handleDeleteDocument = async (docId: string, docName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent document selection
    
    const confirmed = window.confirm(`Delete "${docName}"?\n\nThis will remove the document and all associated data (summaries, quizzes, flashcards, etc.)`);
    
    if (confirmed) {
      await sessionStorage.deleteDocument(docId);
      
      // If deleted document was selected, clear selection
      if (currentDocument?.id === docId) {
        setCurrentDocument(null);
        setAnalysisResult(null);
      }
      
      // Reload document list
      await loadDocuments();
      
      console.log('✅ Document deleted:', docName);
    }
  };

  return (
    <div className="eduflow-tab">
      <div className="eduflow-header">
        <h2>EduFlow Local - Privacy-First Study Assistant</h2>
        <div className="view-mode-selector">
          <button
            className={viewMode === 'workspace' ? 'active' : ''}
            onClick={() => setViewMode('workspace')}
          >
            Workspace
          </button>
          <button
            className={viewMode === 'doubt-destroyer' ? 'active' : ''}
            onClick={() => setViewMode('doubt-destroyer')}
          >
            Doubt Destroyer
          </button>
          <button
            className={viewMode === 'active-recall' ? 'active' : ''}
            onClick={() => setViewMode('active-recall')}
          >
            Active Recall
          </button>
          <button
            className={viewMode === 'flashcards' ? 'active' : ''}
            onClick={() => setViewMode('flashcards')}
          >
            Flashcards
          </button>
        </div>
      </div>

      {viewMode === 'workspace' && (
        <div className="workspace-layout">
          <div className="workspace-sidebar">
            <div className="upload-section">
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📄 Upload .txt File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem', textAlign: 'center' }}>
                ✅ Only .txt files for analysis
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem', textAlign: 'center' }}>
                📸 Images/PDFs → Use "Doubt Destroyer" tab
              </p>
            </div>

            <div className="documents-list">
              <h3>Your Documents ({documents.length})</h3>
              {documents.length === 0 ? (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#888', 
                  padding: '2rem 1rem',
                  fontSize: '0.9rem'
                }}>
                  📁 No documents yet<br/>
                  Upload a .txt file to start
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`document-item ${currentDocument?.id === doc.id ? 'active' : ''}`}
                    onClick={() => setCurrentDocument(doc)}
                    onMouseEnter={() => setHoveredDocId(doc.id)}
                    onMouseLeave={() => setHoveredDocId(null)}
                  >
                    <span className="doc-icon">
                      {doc.type === 'pdf' ? '📄' : doc.type === 'image' ? '🖼️' : '📝'}
                    </span>
                    <span className="doc-name">{doc.name}</span>
                    <button
                      className="delete-doc-btn"
                      onClick={(e) => handleDeleteDocument(doc.id, doc.name, e)}
                      title="Delete document"
                      style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        fontSize: '1.2rem',
                        opacity: hoveredDocId === doc.id ? 1 : 0,
                        pointerEvents: hoveredDocId === doc.id ? 'auto' : 'none',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="workspace-content">
            <div className="document-panel">
              <DocumentViewer document={currentDocument} />
            </div>

            <div className="ai-panel">
              <div className="analysis-controls">
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                  disabled={!currentDocument || isAnalyzing}
                >
                  <option value="summary">Summary & Notes</option>
                  <option value="quiz">Generate Quiz</option>
                  <option value="topics">Important Topics</option>
                  <option value="mindmap">Mind Map</option>
                  <option value="flashcards">Flashcards</option>
                </select>

                <button
                  onClick={handleAnalyze}
                  disabled={
                    !currentDocument || 
                    isAnalyzing || 
                    currentDocument?.type === 'image' || 
                    currentDocument?.type === 'pdf'
                  }
                  className="analyze-btn"
                  title={
                    currentDocument?.type === 'image' 
                      ? 'Images require VLM - use Doubt Destroyer tab'
                      : currentDocument?.type === 'pdf'
                      ? 'PDFs not supported - convert to .txt file'
                      : isAnalyzing
                      ? 'Analysis in progress...'
                      : 'Analyze document'
                  }
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>

                {/* Warning message for unsupported file types */}
                {currentDocument && (currentDocument.type === 'image' || currentDocument.type === 'pdf') && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#ef4444'
                  }}>
                    {currentDocument.type === 'image' 
                      ? '⚠️ Image analysis requires VLM. Use "Doubt Destroyer" tab instead.'
                      : '⚠️ PDF analysis not supported. Convert to .txt file or use Doubt Destroyer.'}
                  </div>
                )}

                {analysisResult?.type === 'flashcards' && (
                  <button
                    onClick={handleExportFlashcards}
                    className="export-btn"
                  >
                    Export to Anki
                  </button>
                )}
              </div>

              {isAnalyzing && (
                <div className="analysis-progress">
                  <div className="spinner" />
                  <p>{analysisProgress}</p>
                </div>
              )}

              <AIOutputPanel result={analysisResult} />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'doubt-destroyer' && (
        <DoubtDestroyer />
      )}

      {viewMode === 'active-recall' && (
        <ActiveRecall currentDocument={currentDocument} />
      )}

      {viewMode === 'flashcards' && (
        <div className="flashcards-view">
          <p>Flashcard player coming soon...</p>
        </div>
      )}
    </div>
  );
}
