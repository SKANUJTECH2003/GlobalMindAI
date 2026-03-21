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

const DB_NAME = 'EduFlowDB';
const DB_VERSION = 1;

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
};
