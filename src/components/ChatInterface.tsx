import { useState, useRef, useEffect, useCallback } from 'react';
import { documentAnalysis } from '../services/documentAnalysis';
import { sessionStorage, type ChatMessage, type ChatSession } from '../services/sessionStorage';
import { ModelManager } from '../services/modelManager';
import { logger } from '../services/logger';
import { exportChat } from '../utils/export';
import { createEnhancedPrompt, formatResponse } from '../utils/responseFormatter';
import { Tooltip } from './Tooltip';
import { PerformanceMetrics, trackResponseTime } from './PerformanceMetrics';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { MessageFormatter } from './MessageFormatter';
import './ChatInterface.css';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Helper function to deduplicate messages by ID
  const deduplicateMessages = (msgs: ChatMessage[]): ChatMessage[] => {
    const seen = new Set<string>();
    return msgs.filter(msg => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Toggle microphone listening
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      logger.error('Speech recognition not available');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setInput(''); // Clear for fresh input
        recognitionRef.current.start();
      } catch (error) {
        logger.error('Failed to start speech recognition:', error);
      }
    }
  };

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Load chat history from session storage (with persistence)
  const loadChatHistory = useCallback(async () => {
    // Initialize persistent storage on first load
    await sessionStorage.initialize();
    
    const sessions = sessionStorage.getAllChatSessions();
    setChatSessions(sessions);
    
    if (sessions.length === 0) {
      // Create initial session with welcome message
      const sessionId = sessionStorage.createChatSession();
      const welcomeMsg: ChatMessage = {
        id: '1',
        type: 'system',
        content: '👋 Welcome to EduFlow AI Chat!\n\n💬 You can:\n• Ask general questions anytime\n• Upload a .txt document for document-specific Q&A\n• Switch between general and document chat\n\n✨ Model loading... Ready in 2-5 minutes (first time)',
        timestamp: Date.now(),
      };
      sessionStorage.addMessage(welcomeMsg);
      setMessages([welcomeMsg]);
      setCurrentSessionId(sessionId);
      setChatSessions([sessionStorage.getCurrentSession()]);
    } else {
      // Load most recent session with deduplication
      const currentSession = sessionStorage.getCurrentSession();
      setMessages(deduplicateMessages(currentSession.messages));
      setCurrentSessionId(currentSession.id);
      
      // Restore uploaded document if exists
      if (currentSession.documentId) {
        sessionStorage.getDocument(currentSession.documentId).then(doc => {
          if (doc) setUploadedDoc(doc);
        });
      }
    }
  }, [deduplicateMessages]);

  // Switch to different chat session
  const switchSession = useCallback((sessionId: string) => {
    sessionStorage.setCurrentSession(sessionId);
    const session = sessionStorage.getCurrentSession();
    setMessages(deduplicateMessages(session.messages));
    setCurrentSessionId(sessionId);
    
    // Restore document context
    if (session.documentId) {
      sessionStorage.getDocument(session.documentId).then(doc => {
        if (doc) setUploadedDoc(doc);
      });
    } else {
      setUploadedDoc(null);
    }
  }, [deduplicateMessages]);

  // Create new chat session
  const createNewSession = useCallback(() => {
    const sessionId = sessionStorage.createChatSession(uploadedDoc?.id, uploadedDoc?.name);
    loadChatHistory();
    switchSession(sessionId);
  }, [uploadedDoc, loadChatHistory, switchSession]);

  // Delete chat session
  const deleteSession = useCallback((sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const confirmed = window.confirm(`Delete chat: "${session.title}"?`);
    if (confirmed) {
      sessionStorage.deleteChatSession(sessionId);
      loadChatHistory();
      
      // Load current session after deletion
      const currentSession = sessionStorage.getCurrentSession();
      setMessages(deduplicateMessages(currentSession.messages));
      setCurrentSessionId(currentSession.id);
    }
  }, [chatSessions, loadChatHistory, deduplicateMessages]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    const confirmed = window.confirm('Clear current chat history?\n\nThis will remove all messages from this conversation.');
    if (confirmed) {
      sessionStorage.clearCurrentChat();
      loadChatHistory();
      setMessages([]);
    }
  }, [loadChatHistory]);

  // Set up keyboard shortcuts (after functions are defined)
  useEffect(() => {
    // This effect runs after all functions are defined, no need to use the hook wrapper
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && event.key !== 'Enter') return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'enter':
            event.preventDefault();
            if (input.trim() && modelStatus === 'ready') {
              const button = document.querySelector('[data-send-button]') as HTMLButtonElement;
              button?.click();
            }
            break;
          case 'l':
            event.preventDefault();
            clearCurrentChat();
            break;
          case '/':
            event.preventDefault();
            setShowShortcutsHelp(true);
            break;
          case 'n':
            event.preventDefault();
            createNewSession();
            break;
          case 's':
            event.preventDefault();
            const currentSession = sessionStorage.getCurrentSession();
            exportChat(currentSession.messages, 'json', `EduFlow-${Date.now()}`);
            break;
          case 't':
            event.preventDefault();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            break;
          case 'b':
            event.preventDefault();
            setShowSidebar(!showSidebar);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, modelStatus, showSidebar, clearCurrentChat, createNewSession]);

  // Cancel ongoing generation
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
      logger.info('Generation cancelled by user');
      
      const cancelMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '⚠️ Generation cancelled by user.',
        timestamp: Date.now(),
      };
      sessionStorage.addMessage(cancelMsg);
      setMessages(prev => deduplicateMessages([...prev, cancelMsg]));
    }
  };

  // Cleanup function for AbortController
  const cleanupAbortController = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (err) {
        logger.debug('Error aborting controller during cleanup:', err);
      }
      abortControllerRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAbortController();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Preload model on mount
  useEffect(() => {
    const preload = async () => {
      const loadingMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '⏳ Loading AI model... (2-5 min first time)',
        timestamp: Date.now(),
      };
      sessionStorage.addMessage(loadingMsg);
      setMessages(prev => deduplicateMessages([...prev, loadingMsg]));

      try {
        await ModelManager.ensureModelLoaded();
        
        const readyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: '✅ AI ready! Upload document and start chatting.',
          timestamp: Date.now(),
        };
        sessionStorage.addMessage(readyMsg);
        setMessages(prev => deduplicateMessages([...prev, readyMsg]));
        setModelStatus('ready');
        loadChatHistory(); // Refresh to get updated messages
      } catch (error) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: '❌ Failed to load. Refresh and try again.',
          timestamp: Date.now(),
        };
        sessionStorage.addMessage(errorMsg);
        setMessages(prev => deduplicateMessages([...prev, errorMsg]));
        setModelStatus('error');
      }
    };
    
    // Only preload if this is first load
    if (messages.length === 0 || !messages.some(m => m.content.includes('Loading AI model'))) {
      preload();
    }
  }, []);

  const handleSend = async () => {
    // Allow sending even without document - for general questions
    if (!input.trim() || modelStatus !== 'ready') return;

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // Add to session storage
    sessionStorage.addMessage(userMessage);
    setMessages(prev => deduplicateMessages([...prev, userMessage]));
    setChatSessions(sessionStorage.getAllChatSessions());
    
    const userQuestion = input;
    setInput('');
    setIsTyping(true);

    // Create AI message placeholder for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessagePlaceholder: ChatMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '', // Will be updated progressively
      timestamp: Date.now(),
    };
    
    setMessages(prev => deduplicateMessages([...prev, aiMessagePlaceholder]));

    try {
      let fullResponse = '';

      if (uploadedDoc && uploadedDoc.type === 'text' && uploadedDoc.content) {
        // Document-specific chat
        logger.info('Using document context for chat', { documentName: uploadedDoc.name });
        
        const response = await documentAnalysis.explainConcept(
          userQuestion, 
          uploadedDoc.content
        );
        
        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Cancelled');
        }
        
        fullResponse = response;
        
        // Update message with full response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      } else {
        // General chat with STREAMING
        logger.debug('General chat mode with streaming');
        
        const basePrompt = `You are EduFlow AI. Answer clearly with structure:\n\nQuestion: ${userQuestion}`;
        const generalPrompt = createEnhancedPrompt(basePrompt);
        
        const { TextGeneration } = await import('@runanywhere/web-llamacpp');
        const { stream } = await TextGeneration.generateStream(generalPrompt, {
          maxTokens: 300, // Reduced from 500 for faster responses
          temperature: 0.7,
        });

        // STREAMING: Update UI FREQUENTLY with proper browser yields + TIMEOUT
        let tokenCount = 0;
        let lastUIUpdate = Date.now();
        const UI_UPDATE_INTERVAL = 50; // More frequent updates (50ms instead of 100ms)
        const STREAM_TIMEOUT = 30000; // 30 second timeout to prevent infinite hangs
        const streamStartTime = Date.now();
        
        for await (const token of stream) {
          // Safety: Check timeout
          if (Date.now() - streamStartTime > STREAM_TIMEOUT) {
            logger.warn('Stream timeout - stopping generation');
            throw new Error('Response generation timed out. Please try again.');
          }
          
          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Cancelled');
          }
          
          fullResponse += token;
          tokenCount++;
          
          // Update UI more frequently - every 3 tokens OR every 50ms
          // This keeps the UI responsive while not causing excessive re-renders
          const now = Date.now();
          if (now - lastUIUpdate >= UI_UPDATE_INTERVAL || tokenCount % 3 === 0) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiMessageId 
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
            lastUIUpdate = now;
            
            // CRITICAL: MORE AGGRESSIVE browser yield to prevent UI freeze
            // 10ms yield allows browser to process events and React renders
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        // Final update with complete response
        const formattedResponse = formatResponse(fullResponse);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: formattedResponse.trim() }
              : msg
          )
        );
      }
      
      // Defer storage write to not block UI
      setTimeout(() => {
        const formattedResponse = formatResponse(fullResponse);
        const finalMessage: ChatMessage = {
          id: aiMessageId,
          type: 'ai',
          content: formattedResponse.trim(),
          timestamp: Date.now(),
        };
        sessionStorage.addMessage(finalMessage);
        setChatSessions(sessionStorage.getAllChatSessions());
      }, 0);
      
    } catch (error: any) {
      logger.error('Chat error', error);
      
      // Remove placeholder
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
      
      // Don't show error if cancelled
      if (error.message !== 'Cancelled') {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: '❌ Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        };
        sessionStorage.addMessage(errorMessage);
        setMessages(prev => deduplicateMessages([...prev, errorMessage]));
      }
    } finally {
      setIsTyping(false);
      cleanupAbortController();
    }
  };

  // Handle user feedback on AI responses
  const handleFeedback = (messageId: string, feedback: any) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback }
          : msg
      )
    );

    // Defer storage to not block UI
    setTimeout(() => {
      const updatedMessage = messages.find(m => m.id === messageId);
      if (updatedMessage) {
        sessionStorage.addMessage({ ...updatedMessage, feedback });
      }
    }, 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    logger.debug('Chat: File selected', { fileName: file.name, fileType: file.type });

    // CRITICAL: Chat ONLY supports text files
    // Images and PDFs require VLM which is not loaded in chat mode
    if (file.type !== 'text/plain') {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `❌ Unsupported File Type: ${file.name}\n\n🚫 Chat only supports .txt files!\n\nWhy?\n• Chat uses text-only LLM model\n• Images/PDFs need Vision Language Model (VLM)\n\n✅ Solutions:\n• For images → Use "Doubt Destroyer" tab\n• For PDFs → Convert to .txt file first\n• Upload plain text (.txt) files only`,
        timestamp: Date.now(),
      };
      setMessages(prev => deduplicateMessages([...prev, errorMsg]));
      
      // Clear file input
      if (e.target) e.target.value = '';
      return;
    }

    // File size limit: 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '⚠️ File too large! Please upload files smaller than 10MB.',
        timestamp: Date.now(),
      };
      setMessages(prev => deduplicateMessages([...prev, errorMsg]));
      if (e.target) e.target.value = '';
      return;
    }

    // Handle text files ONLY
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      
      // Validate content
      if (!content || content.trim().length < 10) {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          type: 'system',
          content: '⚠️ File appears to be empty or too small. Please upload a file with actual text content (minimum 10 characters).',
          timestamp: Date.now(),
        };
        setMessages(prev => deduplicateMessages([...prev, errorMsg]));
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
      setUploadedDoc(doc);

      const uploadMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Document Loaded: ${file.name} (${Math.round(content.length / 1024)}KB)\n\n💬 Now I can answer questions about this document!\n💡 Or continue asking general questions.`,
        timestamp: Date.now(),
      };
      setMessages(prev => deduplicateMessages([...prev, uploadMsg]));
    };
    
    reader.onerror = () => {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: '❌ Failed to read file. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => deduplicateMessages([...prev, errorMsg]));
    };
    
    reader.readAsText(file);

    if (e.target) e.target.value = '';
  };

  // Quick actions - mix of document-specific and general
  const documentActions = [
    { icon: '📝', label: 'Summarize', prompt: 'Please summarize the key points from my document.', needsDoc: true },
    { icon: '❓', label: 'Quiz Me', prompt: 'Generate 5 quiz questions to test my understanding.', needsDoc: true },
    { icon: '🎯', label: 'Key Topics', prompt: 'What are the most important topics I should focus on?', needsDoc: true },
    { icon: '💡', label: 'Explain', prompt: 'Explain the main concepts in simple terms.', needsDoc: true },
  ];

  const generalActions = [
    { icon: '🌟', label: 'Study Tips', prompt: 'Give me 5 effective study tips for better learning.', needsDoc: false },
    { icon: '🧠', label: 'Memory', prompt: 'How can I improve my memory and retention?', needsDoc: false },
    { icon: '📚', label: 'Learn Better', prompt: 'What are the best techniques for active learning?', needsDoc: false },
    { icon: '⏰', label: 'Time Mgmt', prompt: 'Help me create an effective study schedule.', needsDoc: false },
  ];

  const quickActions = uploadedDoc ? documentActions : generalActions;

  const canSend = input.trim() && modelStatus === 'ready' && !isTyping; // Document is optional now

  return (
    <div className="chat-interface">
      {/* Chat History Sidebar */}
      <div className={`chat-sidebar ${showSidebar ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>💬 Chat History</h3>
          <button 
            className="new-chat-btn"
            onClick={createNewSession}
            title="New Chat"
          >
            ➕ New
          </button>
        </div>

        <div className="chat-sessions-list">
          {chatSessions.length === 0 ? (
            <div className="no-sessions">
              <p>No chat history yet</p>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>Start a conversation!</p>
            </div>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.id}
                className={`chat-session-item ${currentSessionId === session.id ? 'active' : ''}`}
                onClick={() => switchSession(session.id)}
              >
                <div className="session-content">
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-time">
                      {new Date(session.updatedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="session-count">
                      {session.messages.length} msgs
                    </span>
                  </div>
                  {session.documentName && (
                    <div className="session-doc">📄 {session.documentName}</div>
                  )}
                </div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => deleteSession(session.id, e)}
                  title="Delete chat"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button 
            className="clear-chat-btn"
            onClick={clearCurrentChat}
            disabled={messages.length === 0}
            title="Clear current chat"
          >
            🧹 Clear Chat
          </button>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setShowSidebar(!showSidebar)}
        title={showSidebar ? "Hide history" : "Show history"}
      >
        {showSidebar ? '◀' : '▶'}
      </button>

      <div className="chat-container">
        {modelStatus === 'loading' && (
          <div className="model-loading-banner">
            <div className="loading-spinner-small"></div>
            <span>Loading AI... Please wait</span>
          </div>
        )}
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'user' ? '👤' : msg.type === 'ai' ? '🤖' : 'ℹ️'}
              </div>
              <div className="message-content">
                {msg.type === 'ai' ? (
                  <MessageFormatter 
                    content={msg.content} 
                    messageId={msg.id} 
                    isAI={true}
                    onFeedback={(feedback) => handleFeedback(msg.id, feedback)}
                    initialFeedback={msg.feedback}
                  />
                ) : (
                  <p>{msg.content}</p>
                )}
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message message-ai typing-indicator">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <button 
                  className="cancel-generation-btn"
                  onClick={cancelGeneration}
                  title="Cancel generation"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #ef4444',
                    borderRadius: '6px',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  ⏹️ Cancel
                </button>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 3 && modelStatus === 'ready' && !input.trim() && (
          <div className="quick-actions">
            <h3>{uploadedDoc ? '📄 Document Actions' : '💬 Quick Start'}</h3>
            <div className="actions-grid">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="action-card"
                  onClick={() => {
                    setInput(action.prompt);
                  }}
                  disabled={action.needsDoc && !uploadedDoc}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
            {!uploadedDoc ? (
              <p className="upload-hint">💡 Upload a document for document-specific analysis</p>
            ) : (
              <p className="upload-hint">📁 {uploadedDoc.name} loaded</p>
            )}
          </div>
        )}

        <div className="input-area">
          {/* Document indicator badge */}
          {uploadedDoc && (
            <div style={{
              position: 'absolute',
              top: '-35px',
              left: '50px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(59, 130, 246, 0.9))',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
              zIndex: 10
            }}>
              <span>📄</span>
              <span>{uploadedDoc.name}</span>
              <button 
                onClick={() => setUploadedDoc(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: 'white'
                }}
                title="Remove document"
              >
                ×
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <button 
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title={uploadedDoc ? "Replace document" : "Upload document (optional)"}
            disabled={modelStatus === 'loading'}
          >
            <Tooltip 
              content={uploadedDoc ? "Replace document (Ctrl+U)" : "Upload .txt document (Ctrl+U)"}
              position="top"
            >
              📁
            </Tooltip>
          </button>

          <button
            className={`voice-input-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleMicrophone}
            title={isListening ? "Listening... (Click to stop)" : "Speak to input text"}
            disabled={modelStatus !== 'ready'}
          >
            <Tooltip
              content={isListening ? "🎤 Listening..." : "Speak (🎤)"}
              position="top"
            >
              {isListening ? '🎤' : '🎙️'}
            </Tooltip>
          </button>

          <input
            type="text"
            className="message-input"
            placeholder={
              modelStatus === 'loading' 
                ? "⏳ Loading AI..." 
                : uploadedDoc 
                ? `💬 Ask about "${uploadedDoc.name}" or anything else...`
                : "💬 Ask me anything..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && canSend && handleSend()}
            disabled={modelStatus !== 'ready'}
          />

          <button 
            className="send-btn"
            onClick={handleSend}
            disabled={!canSend}
            data-send-button
          >
            <Tooltip 
              content="Send message (Ctrl+Enter)"
              position="top"
            >
              ✈️
            </Tooltip>
          </button>

          {messages.length > 1 && (
            <button 
              className="export-btn"
              onClick={() => exportChat(messages, 'json', 'EduFlow-Chat')}
              title="Export chat history as JSON"
            >
              <Tooltip 
                content="Export chat (Ctrl+S)"
                position="top"
              >
                💾
              </Tooltip>
            </button>
          )}
        </div>

        {uploadedDoc && (
          <div className="active-document">
            📄 Active: <strong>{uploadedDoc.name}</strong>
            <button onClick={() => setUploadedDoc(null)}>✕</button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />

      {/* Keyboard Shortcuts Toggle Button */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '12px' }}>
        <Tooltip content="Keyboard shortcuts (Ctrl+/)" position="left">
          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(124, 58, 237, 0.1)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent';
            }}
          >
            ⌨️
          </button>
        </Tooltip>
      </div>

      {/* Performance Metrics */}
      {showMetrics && <PerformanceMetrics isOpen={showMetrics} />}
    </div>
  );
}

