// IndexedDB Service for persisting study materials locally
// All data stays on the user's device - 100% privacy guaranteed

interface StudyDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  uploadedAt: number;
  content?: string; // For text documents
  imageData?: string; // Base64 for images
}

interface Summary {
  id: string;
  documentId: string;
  content: string;
  createdAt: number;
}

interface Quiz {
  id: string;
  documentId: string;
  questions: QuizQuestion[];
  createdAt: number;
}

interface QuizQuestion {
  type: 'mcq' | 'descriptive';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ
  expectedPoints?: string[]; // For descriptive
}

interface ImportantTopic {
  id: string;
  documentId: string;
  topic: string;
  explanation: string;
  createdAt: number;
}

interface Flashcard {
  id: string;
  documentId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
  lastReviewed?: number;
  nextReview?: number;
}

interface MindMap {
  id: string;
  documentId: string;
  nodes: MindMapNode[];
  createdAt: number;
}

interface MindMapNode {
  id: string;
  label: string;
  children: string[]; // IDs of child nodes
  level: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  documentId?: string;
  documentName?: string;
}

const DB_NAME = 'EduFlowDB';
const DB_VERSION = 2;

class StudyStorageService {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('summaries')) {
          const summaryStore = db.createObjectStore('summaries', { keyPath: 'id' });
          summaryStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('topics')) {
          const topicStore = db.createObjectStore('topics', { keyPath: 'id' });
          topicStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('flashcards')) {
          const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          flashcardStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('mindmaps')) {
          const mindmapStore = db.createObjectStore('mindmaps', { keyPath: 'id' });
          mindmapStore.createIndex('documentId', 'documentId', { unique: false });
        }
        if (!db.objectStoreNames.contains('chatSessions')) {
          const sessionStore = db.createObjectStore('chatSessions', { keyPath: 'id' });
          sessionStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('chatMessages')) {
          const messageStore = db.createObjectStore('chatMessages', { keyPath: 'id' });
          messageStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };
    });
  }

  // Document operations
  async saveDocument(doc: StudyDocument): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    await store.put(doc);
  }

  async getDocument(id: string): Promise<StudyDocument | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDocuments(): Promise<StudyDocument[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('documents', 'readwrite');
    const store = tx.objectStore('documents');
    await store.delete(id);
  }

  // Summary operations
  async saveSummary(summary: Summary): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('summaries', 'readwrite');
    const store = tx.objectStore('summaries');
    await store.put(summary);
  }

  async getSummariesForDocument(documentId: string): Promise<Summary[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('summaries', 'readonly');
      const store = tx.objectStore('summaries');
      const index = store.index('documentId');
      const request = index.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Quiz operations
  async saveQuiz(quiz: Quiz): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('quizzes', 'readwrite');
    const store = tx.objectStore('quizzes');
    await store.put(quiz);
  }

  async getQuizzesForDocument(documentId: string): Promise<Quiz[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('quizzes', 'readonly');
      const store = tx.objectStore('quizzes');
      const index = store.index('documentId');
      const request = index.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Important Topics operations
  async saveTopic(topic: ImportantTopic): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('topics', 'readwrite');
    const store = tx.objectStore('topics');
    await store.put(topic);
  }

  async getTopicsForDocument(documentId: string): Promise<ImportantTopic[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('topics', 'readonly');
      const store = tx.objectStore('topics');
      const index = store.index('documentId');
      const request = index.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Flashcard operations
  async saveFlashcard(flashcard: Flashcard): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('flashcards', 'readwrite');
    const store = tx.objectStore('flashcards');
    await store.put(flashcard);
  }

  async getFlashcardsForDocument(documentId: string): Promise<Flashcard[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('flashcards', 'readonly');
      const store = tx.objectStore('flashcards');
      const index = store.index('documentId');
      const request = index.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mind Map operations
  async saveMindMap(mindmap: MindMap): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('mindmaps', 'readwrite');
    const store = tx.objectStore('mindmaps');
    await store.put(mindmap);
  }

  async getMindMapsForDocument(documentId: string): Promise<MindMap[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('mindmaps', 'readonly');
      const store = tx.objectStore('mindmaps');
      const index = store.index('documentId');
      const request = index.getAll(documentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export flashcards to Anki format
  async exportFlashcardsToAnki(documentId: string): Promise<string> {
    const flashcards = await this.getFlashcardsForDocument(documentId);
    
    // Generate Anki-compatible CSV
    let csv = 'Front,Back,Tags\n';
    for (const card of flashcards) {
      const front = card.front.replace(/"/g, '""');
      const back = card.back.replace(/"/g, '""');
      csv += `"${front}","${back}","eduflow ${card.difficulty}"\n`;
    }
    
    return csv;
  }

  // ============ CHAT PERSISTENCE METHODS ============

  // Save chat session
  async saveChatSession(session: ChatSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('chatSessions', 'readwrite');
    const store = tx.objectStore('chatSessions');
    await store.put(session);
  }

  // Get all chat sessions sorted by most recent
  async getAllChatSessions(): Promise<ChatSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chatSessions', 'readonly');
      const store = tx.objectStore('chatSessions');
      const index = store.index('updatedAt');
      const request = index.getAll();
      request.onsuccess = () => {
        const results: ChatSession[] = request.result;
        results.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get single chat session
  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chatSessions', 'readonly');
      const store = tx.objectStore('chatSessions');
      const request = store.get(sessionId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete chat session and all its messages
  async deleteChatSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Delete session
    let tx = this.db.transaction('chatSessions', 'readwrite');
    let store = tx.objectStore('chatSessions');
    await store.delete(sessionId);

    // Delete all messages for this session
    tx = this.db.transaction('chatMessages', 'readwrite');
    store = tx.objectStore('chatMessages');
    const index = store.index('sessionId');
    const range = IDBKeyRange.only(sessionId);
    const request = index.openCursor(range);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Save chat message
  async saveChatMessage(message: ChatMessage): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction('chatMessages', 'readwrite');
    const store = tx.objectStore('chatMessages');
    await store.put(message);
  }

  // Get all messages for a session
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    if (!this.db) throw new Error('Database not initialized');
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('chatMessages', 'readonly');
      const store = tx.objectStore('chatMessages');
      const index = store.index('sessionId');
      const request = index.getAll(sessionId);
      request.onsuccess = () => {
        const results: ChatMessage[] = request.result;
        results.sort((a, b) => a.timestamp - b.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all chat data
  async clearAllChatData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    let tx = this.db.transaction('chatSessions', 'readwrite');
    let store = tx.objectStore('chatSessions');
    await store.clear();

    tx = this.db.transaction('chatMessages', 'readwrite');
    store = tx.objectStore('chatMessages');
    await store.clear();
  }
}

// Singleton instance
export const studyStorage = new StudyStorageService();

// Export types
export type {
  StudyDocument,
  Summary,
  Quiz,
  QuizQuestion,
  ImportantTopic,
  Flashcard,
  MindMap,
  MindMapNode,
  ChatMessage,
  ChatSession,
};
