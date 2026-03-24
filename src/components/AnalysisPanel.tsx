import { useState } from 'react';
import { documentAnalysis } from '../services/documentAnalysis';
import { studyStorage } from '../services/studyStorage';
import './AnalysisPanel.css';

type AnalysisMode = 'summary' | 'quiz' | 'topics' | 'mindmap' | 'flashcards';

export function AnalysisPanel() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [mode, setMode] = useState<AnalysisMode>('summary');
  const [result, setResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  const loadDocuments = async () => {
    const docs = await studyStorage.getAllDocuments();
    setDocuments(docs);
  };

  const handleDeleteDocument = async (docId: string, docName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = window.confirm(`Delete "${docName}"?\n\nThis cannot be undone.`);
    if (confirmed) {
      try {
        await studyStorage.deleteDocument(docId);
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
          setResult(null);
        }
        await loadDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  useState(() => {
    studyStorage.initialize().then(() => loadDocuments());
  });

  const handleAnalyze = async () => {
    if (!selectedDoc?.content) return;

    setIsAnalyzing(true);
    setResult(null);
    setProgress('Loading AI model...');

    try {
      switch (mode) {
        case 'summary':
          setProgress('Generating summary...');
          const summary = await documentAnalysis.generateSummary(selectedDoc.content, 'detailed');
          setResult({ type: 'summary', content: summary });
          break;

        case 'quiz':
          setProgress('Creating quiz questions...');
          const quiz = await documentAnalysis.generateQuiz(selectedDoc.content, 5, 'medium');
          setResult({ type: 'quiz', questions: quiz });
          break;

        case 'topics':
          setProgress('Extracting key topics...');
          const topics = await documentAnalysis.extractImportantTopics(selectedDoc.content);
          setResult({ type: 'topics', topics });
          break;

        case 'mindmap':
          setProgress('Building mind map...');
          const mindmap = await documentAnalysis.generateMindMap(selectedDoc.content);
          setResult({ type: 'mindmap', nodes: mindmap });
          break;

        case 'flashcards':
          setProgress('Generating flashcards...');
          const flashcards = await documentAnalysis.generateFlashcards(selectedDoc.content, 10);
          setResult({ type: 'flashcards', flashcards });
          break;
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Analysis failed. Please try again.' });
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  const analysisTypes = [
    { id: 'summary', icon: '📝', label: 'Summary', desc: 'Get condensed notes' },
    { id: 'quiz', icon: '❓', label: 'Quiz', desc: 'Test your knowledge' },
    { id: 'topics', icon: '🎯', label: 'Topics', desc: 'Extract key concepts' },
    { id: 'mindmap', icon: '🗺️', label: 'Mind Map', desc: 'Visual structure' },
    { id: 'flashcards', icon: '🎴', label: 'Flashcards', desc: 'Study cards' },
  ];

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h2>Document Analysis</h2>
        <p>Select a document and choose an analysis type</p>
      </div>

      <div className="analysis-types">
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            className={`analysis-type-card ${mode === type.id ? 'active' : ''}`}
            onClick={() => setMode(type.id as AnalysisMode)}
          >
            <span className="type-icon">{type.icon}</span>
            <div className="type-info">
              <h4>{type.label}</h4>
              <p>{type.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedDoc && (
        <div className="selected-document-card">
          <div className="doc-info">
            <span className="doc-icon">📄</span>
            <div>
              <h4>{selectedDoc.name}</h4>
              <p>{Math.round(selectedDoc.content.length / 1024)}KB • {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button 
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '✨ Analyze'}
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="progress-card">
          <div className="progress-spinner"></div>
          <p>{progress}</p>
        </div>
      )}

      {result && (
        <div className="result-card">
          {result.type === 'summary' && (
            <div className="summary-result">
              <h3>📝 Summary</h3>
              <div className="result-content">{result.content}</div>
            </div>
          )}

          {result.type === 'quiz' && (
            <div className="quiz-result">
              <h3>❓ Quiz Questions</h3>
              {result.questions.map((q: any, i: number) => (
                <div key={i} className="quiz-question">
                  <h4>Question {i + 1}</h4>
                  <p>{q.question}</p>
                  {q.options && (
                    <div className="quiz-options">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className="option">{String.fromCharCode(65 + j)}) {opt}</div>
                      ))}
                    </div>
                  )}
                  <div className="quiz-answer">✅ Answer: {q.correctAnswer}</div>
                </div>
              ))}
            </div>
          )}

          {result.type === 'topics' && (
            <div className="topics-result">
              <h3>🎯 Important Topics</h3>
              <div className="topics-grid">
                {result.topics.map((topic: any, i: number) => (
                  <div key={i} className="topic-card">
                    <h4>{topic.topic}</h4>
                    <p>{topic.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === 'flashcards' && (
            <div className="flashcards-result">
              <h3>🎴 Flashcards</h3>
              <div className="flashcards-grid">
                {result.flashcards.map((card: any, i: number) => (
                  <div key={i} className="flashcard">
                    <div className="flashcard-front">
                      <strong>Q:</strong> {card.front}
                    </div>
                    <div className="flashcard-back">
                      <strong>A:</strong> {card.back}
                    </div>
                    <span className={`difficulty difficulty-${card.difficulty}`}>
                      {card.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.type === 'error' && (
            <div className="error-result">
              <h3>❌ Error</h3>
              <p>{result.message}</p>
            </div>
          )}
        </div>
      )}

      {!selectedDoc && documents.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Documents Yet</h3>
          <p>Upload a document to start analyzing</p>
        </div>
      )}

      {!selectedDoc && documents.length > 0 && (
        <div className="documents-list">
          <h3>Your Documents</h3>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="document-item-wrapper"
              onMouseEnter={() => setHoveredDocId(doc.id)}
              onMouseLeave={() => setHoveredDocId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
            >
              <button
                className="document-item"
                onClick={() => setSelectedDoc(doc)}
                style={{ flex: 1 }}
              >
                <span className="doc-icon">📄</span>
                <div className="doc-details">
                  <h4>{doc.name}</h4>
                  <p>{Math.round(doc.content?.length / 1024 || 0)}KB</p>
                </div>
              </button>
              <button
                className="delete-doc-btn"
                onClick={(e) => handleDeleteDocument(doc.id, doc.name, e)}
                title="Delete document"
                style={{
                  opacity: hoveredDocId === doc.id ? 1 : 0,
                  pointerEvents: hoveredDocId === doc.id ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease',
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '0.4rem 0.6rem',
                  fontSize: '1.1rem',
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
