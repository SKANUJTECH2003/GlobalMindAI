/**
 * Global Configuration Constants
 * Centralized configuration for timeouts, limits, and magic numbers
 */

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MIN_TEXT_LENGTH: 50, // Minimum characters for text analysis
  MAX_TEXT_LENGTH: 1000000, // 1MB of text
  SUPPORTED_FORMATS: {
    TEXT: ['text/plain'],
    IMAGE: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
    PDF: ['application/pdf'],
  },
  ERROR_CLEAR_DELAY: 5000, // Clear error message after 5 seconds
};

// AI Model Configuration
export const MODEL_CONFIG = {
  LLM_MODEL_ID: 'lfm2-350m-q4_k_m',
  VLM_MODEL_ID: 'lfm2-vl-450m-q4_0',
  STT_MODEL_ID: 'whisper-tiny',
  TTS_MODEL_ID: 'piper',
  
  // Generation parameters
  SUMMARY_MAX_TOKENS: 1000,
  QUIZ_MAX_TOKENS: 1500,
  EXPLANATION_MAX_TOKENS: 800,
  DEFAULT_TEMPERATURE: 0.7,
  SUMMARY_TEMPERATURE: 0.3, // Lower for focused summaries
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  DEFAULT_QUESTION_COUNT: 5,
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 20,
  DIFFICULTIES: ['easy', 'medium', 'hard'] as const,
  MCQ_OPTIONS_COUNT: 4,
  DEFAULT_DIFFICULTY: 'medium' as const,
};

// Analysis Configuration
export const ANALYSIS_CONFIG = {
  FLASHCARD_COUNT: 10,
  TOPICS_COUNT: 8,
  MIND_MAP_DEPTH: 4,
};

// Timeout Configuration (in milliseconds)
export const TIMEOUTS = {
  MODEL_LOAD: 300000, // 5 minutes for model loading
  ANALYSIS_OPERATION: 120000, // 2 minutes for analysis
  FILE_OPERATION: 30000, // 30 seconds for file operations
  API_CALL: 60000, // 1 minute for API calls
  CAMERA_STREAM: 10000, // 10 seconds to establish camera stream
};

// Storage Configuration
export const STORAGE_CONFIG = {
  DB_NAME: 'EduFlowDB',
  DB_VERSION: 1,
  STORES: {
    DOCUMENTS: 'documents',
    SUMMARIES: 'summaries',
    QUIZZES: 'quizzes',
    TOPICS: 'topics',
    FLASHCARDS: 'flashcards',
    MINDMAPS: 'mindmaps',
    CHAT_SESSIONS: 'chatSessions',
  },
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  SCROLL_SMOOTH: 'smooth' as const,
  MESSAGE_DISPLAY_TIME: 5000, // milliseconds
};

// Feature Flags
export const FEATURES = {
  PERSISTENT_STORAGE: true, // Use IndexedDB for persistence
  VOICE_SUPPORT: true, // Enable STT/TTS
  VLM_SUPPORT: true, // Enable Vision Language Model
  OFFLINE_MODE: true, // Support offline functionality
  PWA_SUPPORT: false, // Progressive Web App support (future)
};
