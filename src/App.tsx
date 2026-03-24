import { useState, useEffect } from 'react';
import { initSDK } from './runanywhere';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatInterface } from './components/ChatInterface';
import { AnalysisPanel } from './components/AnalysisPanel';
import { DocumentUpload } from './components/DocumentUpload';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToasterProvider } from './components/Toaster';
import { Settings } from './components/Settings';
import './styles/App.css';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (sdkError) {
    return (
      <div className="loading-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Failed to Initialize</h2>
          <p>{sdkError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="logo-animation">
            <div className="orbit"></div>
            <div className="orbit orbit-2"></div>
            <div className="orbit orbit-3"></div>
            <div className="core">🎓</div>
          </div>
          <h1 className="loading-title">EduFlow AI</h1>
          <p className="loading-subtitle">Initializing your AI study companion...</p>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToasterProvider>
        <div className="eduflow-app">
          {/* Animated Background */}
          <div className="background-gradient">
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
          </div>

          {/* Main Header */}
          <header className="app-header">
            <div className="header-content">
              <div className="logo-section">
                <div className="logo-icon">🎓</div>
                <div className="logo-text">
                  <h1>EduFlow AI</h1>
                  <p>Your Personal Study Companion</p>
                </div>
              </div>
              
              <div className="header-actions">
                <button 
                  className={`mode-toggle ${!showAnalysis ? 'active' : ''}`}
                  onClick={() => setShowAnalysis(false)}
                  title="Chat with AI"
                >
                  💬 Chat
                </button>
                <button 
                  className={`mode-toggle ${showAnalysis ? 'active' : ''}`}
                  onClick={() => setShowAnalysis(true)}
                  title="Analyze documents"
                >
                  📊 Analysis
                </button>
                <button 
                  className="settings-button"
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="app-content">
            <ErrorBoundary>
              {!showAnalysis ? (
                <ChatInterface />
              ) : (
                <div className="analysis-layout">
                  <DocumentUpload />
                  <AnalysisPanel />
                </div>
              )}
            </ErrorBoundary>
          </main>

          {/* Floating Help Button */}
          <button className="floating-help" title="How to use EduFlow AI">
            <span>?</span>
          </button>

          {/* Settings Modal */}
          <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
      </ToasterProvider>
    </ThemeProvider>
  );
}
