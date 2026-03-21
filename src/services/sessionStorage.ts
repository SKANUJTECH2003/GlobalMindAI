// Session-based Storage Service
// All data stays in memory - clears on page refresh/server restart
// NO persistent storage - fresh start every session

interface StudyDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  uploadedAt: number;
  content?: string;
  imageData?: string;
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
  questions: any[];
  createdAt: number;
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
}

interface MindMap {
  id: string;
  documentId: string;
  nodes: any[];
  createdAt: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  documentId?: string;
  documentName?: string;
}

// In-memory storage - cleared on page refresh
class SessionStorageService {
  private documents: Map<string, StudyDocument> = new Map();
  private summaries: Map<string, Summary> = new Map();
  private quizzes: Map<string, Quiz> = new Map();
  private topics: Map<string, ImportantTopic> = new Map();
  private flashcards: Map<string, Flashcard> = new Map();
  private mindmaps: Map<string, MindMap> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private currentSessionId: string | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    console.log('📦 Session Storage initialized - data will clear on page refresh');
    this.initialized = true;
  }

  // Documents
  async saveDocument(doc: StudyDocument): Promise<void> {
    console.log('💾 Saving document to session:', doc.name);
    this.documents.set(doc.id, doc);
  }

  async getDocument(id: string): Promise<StudyDocument | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<StudyDocument[]> {
    return Array.from(this.documents.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  async deleteDocument(id: string): Promise<void> {
    console.log('🗑️ Deleting document from session:', id);
    this.documents.delete(id);
    
    // Also delete related data
    Array.from(this.summaries.values())
      .filter(s => s.documentId === id)
      .forEach(s => this.summaries.delete(s.id));
    
    Array.from(this.quizzes.values())
      .filter(q => q.documentId === id)
      .forEach(q => this.quizzes.delete(q.id));
    
    Array.from(this.topics.values())
      .filter(t => t.documentId === id)
      .forEach(t => this.topics.delete(t.id));
    
    Array.from(this.flashcards.values())
      .filter(f => f.documentId === id)
      .forEach(f => this.flashcards.delete(f.id));
    
    Array.from(this.mindmaps.values())
      .filter(m => m.documentId === id)
      .forEach(m => this.mindmaps.delete(m.id));
  }

  // Summaries
  async saveSummary(summary: Summary): Promise<void> {
    this.summaries.set(summary.id, summary);
  }

  async getSummariesByDocument(documentId: string): Promise<Summary[]> {
    return Array.from(this.summaries.values())
      .filter(s => s.documentId === documentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Quizzes
  async saveQuiz(quiz: Quiz): Promise<void> {
    this.quizzes.set(quiz.id, quiz);
  }

  async getQuizzesByDocument(documentId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values())
      .filter(q => q.documentId === documentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Topics
  async saveTopic(topic: ImportantTopic): Promise<void> {
    this.topics.set(topic.id, topic);
  }

  async getTopicsByDocument(documentId: string): Promise<ImportantTopic[]> {
    return Array.from(this.topics.values())
      .filter(t => t.documentId === documentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Flashcards
  async saveFlashcard(flashcard: Flashcard): Promise<void> {
    this.flashcards.set(flashcard.id, flashcard);
  }

  async getFlashcardsByDocument(documentId: string): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values())
      .filter(f => f.documentId === documentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async deleteFlashcard(id: string): Promise<void> {
    this.flashcards.delete(id);
  }

  // Mind Maps
  async saveMindMap(mindmap: MindMap): Promise<void> {
    this.mindmaps.set(mindmap.id, mindmap);
  }

  async getMindMapsByDocument(documentId: string): Promise<MindMap[]> {
    return Array.from(this.mindmaps.values())
      .filter(m => m.documentId === documentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Export flashcards to Anki CSV format
  async exportFlashcardsToAnki(documentId: string): Promise<string> {
    const cards = await this.getFlashcardsByDocument(documentId);
    
    let csv = 'Front,Back,Difficulty\n';
    for (const card of cards) {
      const front = card.front.replace(/"/g, '""');
      const back = card.back.replace(/"/g, '""');
      csv += `"${front}","${back}","${card.difficulty}"\n`;
    }
    
    return csv;
  }

  // Clear all data (useful for manual reset)
  async clearAll(): Promise<void> {
    console.log('🧹 Clearing all session data');
    this.documents.clear();
    this.summaries.clear();
    this.quizzes.clear();
    this.topics.clear();
    this.flashcards.clear();
    this.mindmaps.clear();
    this.chatSessions.clear();
    this.currentSessionId = null;
  }

  // Get storage stats
  getStats() {
    return {
      documents: this.documents.size,
      summaries: this.summaries.size,
      quizzes: this.quizzes.size,
      topics: this.topics.size,
      flashcards: this.flashcards.size,
      mindmaps: this.mindmaps.size,
      chatSessions: this.chatSessions.size,
    };
  }

  // ============ CHAT HISTORY METHODS ============

  // Create new chat session
  createChatSession(documentId?: string, documentName?: string): string {
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    
    const session: ChatSession = {
      id: sessionId,
      title: documentName ? `Chat about ${documentName}` : `Chat ${new Date().toLocaleTimeString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      documentId,
      documentName,
    };
    
    this.chatSessions.set(sessionId, session);
    this.currentSessionId = sessionId;
    console.log('💬 New chat session created:', sessionId);
    
    return sessionId;
  }

  // Get or create current session
  getCurrentSession(): ChatSession {
    if (this.currentSessionId && this.chatSessions.has(this.currentSessionId)) {
      return this.chatSessions.get(this.currentSessionId)!;
    }
    
    // Create new session if none exists
    const sessionId = this.createChatSession();
    return this.chatSessions.get(sessionId)!;
  }

  // Set current session
  setCurrentSession(sessionId: string): boolean {
    if (this.chatSessions.has(sessionId)) {
      this.currentSessionId = sessionId;
      console.log('💬 Switched to session:', sessionId);
      return true;
    }
    return false;
  }

  // Add message to current session
  addMessage(message: ChatMessage): void {
    const session = this.getCurrentSession();
    session.messages.push(message);
    session.updatedAt = Date.now();
    
    // Update title based on first user message
    if (message.type === 'user' && session.messages.filter(m => m.type === 'user').length === 1) {
      session.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
    }
  }

  // Get current session messages
  getCurrentMessages(): ChatMessage[] {
    return this.getCurrentSession().messages;
  }

  // Get all chat sessions
  getAllChatSessions(): ChatSession[] {
    return Array.from(this.chatSessions.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Delete chat session
  deleteChatSession(sessionId: string): void {
    this.chatSessions.delete(sessionId);
    
    if (this.currentSessionId === sessionId) {
      // Switch to most recent session or create new one
      const sessions = this.getAllChatSessions();
      if (sessions.length > 0) {
        this.currentSessionId = sessions[0].id;
      } else {
        this.createChatSession();
      }
    }
    
    console.log('🗑️ Chat session deleted:', sessionId);
  }

  // Clear current chat (keep session, clear messages)
  clearCurrentChat(): void {
    const session = this.getCurrentSession();
    session.messages = [];
    session.updatedAt = Date.now();
    console.log('🧹 Current chat cleared');
  }

  // Update session document context
  updateSessionDocument(sessionId: string, documentId?: string, documentName?: string): void {
    const session = this.chatSessions.get(sessionId);
    if (session) {
      session.documentId = documentId;
      session.documentName = documentName;
      session.updatedAt = Date.now();
      
      if (documentName && session.messages.length === 0) {
        session.title = `Chat about ${documentName}`;
      }
    }
  }
}

// Export singleton instance
export const sessionStorage = new SessionStorageService();

// Export types
export type {
  StudyDocument,
  Summary,
  Quiz,
  ImportantTopic,
  Flashcard,
  MindMap,
  ChatMessage,
  ChatSession,
};
