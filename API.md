# 💻 API Reference

Technical documentation for GlobalMindAI services and utilities.

---

## 📋 Table of Contents

1. [Document Analysis Service](#document-analysis-service)
2. [Model Manager](#model-manager)
3. [Session Storage](#session-storage)
4. [Streaming Utilities](#streaming-utilities)
5. [Logger Service](#logger-service)
6. [Type Definitions](#type-definitions)

---

## 🔎 Document Analysis Service

Main service for AI operations. Located in `src/services/documentAnalysis.ts`

### Export
```typescript
export const documentAnalysis = new DocumentAnalysisService()
```

### Methods

#### `analyzeFULLDocument(content: string, imageUrl?: string): Promise<DocumentAnalysis>`
Comprehensive document analysis combining multiple analyses.

**Parameters:**
- `content` (string): Document text content
- `imageUrl` (optional string): Image URL for vision analysis

**Returns:** Promise<DocumentAnalysis>
```typescript
{
  ocr?: string;
  summary: string;
  topics: ImportantTopic[];
  quiz: Quiz;
  flashcards: Flashcard[];
  mindMap: MindMap;
}
```

**Example:**
```typescript
const analysis = await documentAnalysis.analyzeFULLDocument(
  "Chapter 1: Photosynthesis...",
  "https://example.com/diagram.jpg"
)
console.log(analysis.summary)
```

---

#### `generateSummary(content: string, summaryType?: 'brief' | 'detailed' | 'bullet-points'): Promise<string>`
Create text summary of content.

**Parameters:**
- `content` (string): Document text
- `summaryType` (optional): Type of summary (default: 'detailed')

**Returns:** Promise<string> - Summary text

**Timeouts:**
- Maximum: 120 seconds
- Average: 10-20 seconds

**Example:**
```typescript
const summary = await documentAnalysis.generateSummary(
  "Long document text...",
  'brief'
)
// Returns 2-3 sentence summary
```

---

#### `generateQuiz(content: string, numQuestions?: number): Promise<Quiz>`
Create quiz with auto-graded questions.

**Parameters:**
- `content` (string): Study material
- `numQuestions` (optional number): Questions to generate (default: 5)

**Returns:** Promise<Quiz>
```typescript
{
  id: "quiz-123";
  title: string;
  questions: QuizQuestion[];
  timestamp: number;
}
```

**Quiz Question Structure:**
```typescript
{
  id: string;
  question: string;
  type: 'mcq' | 'short-answer';
  options?: string[];        // For MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

**Timeouts:**
- Maximum: 180 seconds (complex)
- Average: 15-30 seconds

**Example:**
```typescript
const quiz = await documentAnalysis.generateQuiz(
  "Photosynthesis process...",
  5
)
quiz.questions.forEach(q => {
  console.log(q.question)
  console.log(q.options)
})
```

---

#### `extractImportantTopics(content: string): Promise<ImportantTopic[]>`
Extract key concepts and topics.

**Returns:** Promise<ImportantTopic[]>
```typescript
{
  topic: string;
  explanation: string;
  importance: 'high' | 'medium' | 'low';
  relatedConcepts?: string[];
}[]
```

**Example:**
```typescript
const topics = await documentAnalysis.extractImportantTopics(content)
topics.forEach(t => {
  console.log(`${t.topic}: ${t.explanation}`)
})
```

---

#### `generateFlashcards(content: string, numCards?: number): Promise<Flashcard[]>`
Create study flashcards.

**Parameters:**
- `content` (string): Study material
- `numCards` (optional number): Cards to generate (default: 10)

**Returns:** Promise<Flashcard[]>
```typescript
{
  id: string;
  front: string;           // Question/prompt
  back: string;            // Answer
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  timestamp: number;
}[]
```

**Example:**
```typescript
const cards = await documentAnalysis.generateFlashcards(content, 15)
cards.forEach(card => {
  console.log(`Q: ${card.front}`)
  console.log(`A: ${card.back}`)
})
```

---

#### `generateMindMap(content: string): Promise<MindMap>`
Create visual mind map structure.

**Returns:** Promise<MindMap>
```typescript
{
  id: string;
  title: string;
  centralConcept: string;
  nodes: MindMapNode[];  // Hierarchical structure
  connections: Connection[];
  timestamp: number;
}
```

**Mind Map Node:**
```typescript
{
  id: string;
  label: string;
  level: number;           // 0 = center, 1 = first branch, etc.
  children: string[];      // Child node IDs
  color?: string;
  description?: string;
}
```

**Example:**
```typescript
const mindMap = await documentAnalysis.generateMindMap(content)
console.log(`Central: ${mindMap.centralConcept}`)
mindMap.nodes.forEach(n => {
  console.log(`${'  '.repeat(n.level)}${n.label}`)
})
```

---

#### `explainConcept(concept: string, context?: string): Promise<string>`
Get detailed explanation of a topic.

**Parameters:**
- `concept` (string): Topic to explain
- `context` (optional string): Background context

**Returns:** Promise<string> - Explanation

**Example:**
```typescript
const explanation = await documentAnalysis.explainConcept(
  "Photosynthesis",
  "For 10th grade biology"
)
console.log(explanation)
```

---

#### `evaluateAnswer(question: string, studentAnswer: string, expectedAnswer: string): Promise<EvaluationResult>`
Score student's answer.

**Returns:**
```typescript
{
  feedback: string;        // Encouraging feedback
  score: number;           // 0-100
  followUp?: string;       // Follow-up question
}
```

**Example:**
```typescript
const result = await documentAnalysis.evaluateAnswer(
  "What is photosynthesis?",
  "Process where plants make food",
  "Process where plants convert light into chemical energy"
)
console.log(`Score: ${result.score}`)
console.log(`Feedback: ${result.feedback}`)
```

---

#### `generateFollowUpQuestion(topic: string, context: string): Promise<string>`
Generate follow-up question for deeper learning.

**Returns:** Promise<string> - Follow-up question

**Example:**
```typescript
const followUp = await documentAnalysis.generateFollowUpQuestion(
  "Photosynthesis",
  "Location: Chloroplasts, Uses: Light energy"
)
console.log(followUp)
```

---

## 🤖 Model Manager

Model lifecycle and management. Located in `src/services/modelManager.ts`

### Import
```typescript
import { ModelManager } from '@runanywhere/web'
```

### Methods

#### `ModelManager.loadModel(modelId: string): Promise<void>`
Load AI model into memory.

**Parameters:**
- `modelId` (string): Model identifier

**Throws:** Error if load fails

**Example:**
```typescript
try {
  await ModelManager.loadModel('Xenova/LFM2-350M')
} catch (error) {
  console.error('Model load failed:', error)
}
```

---

#### `ModelManager.getLoadedModel(): Model | null`
Get currently loaded model info.

**Returns:** Model object or null if none loaded

**Model object:**
```typescript
{
  id: string;
  name: string;
  type: 'text' | 'vision' | 'speech';
  size: number;
  quantization: string;
}
```

---

#### `ModelManager.unloadModel(): void`
Unload current model from memory.

**Example:**
```typescript
ModelManager.unloadModel()
```

---

## 💾 Session Storage

Session-based data management. Located in `src/services/sessionStorage.ts`

### Import
```typescript
import { sessionStorage } from '@/services/sessionStorage'
```

### Methods

#### `storeMessage(message: Message): void`
Save chat message.

```typescript
sessionStorage.storeMessage({
  id: 'msg-1',
  role: 'user',
  content: 'What is...',
  timestamp: Date.now()
})
```

---

#### `getMessages(): Message[]`
Retrieve all chat messages.

---

#### `storeDocument(doc: StoredDocument): void`
Save uploaded document.

```typescript
sessionStorage.storeDocument({
  id: 'doc-1',
  name: 'Chapter 1.pdf',
  type: 'pdf',
  content: '...',
  uploadedAt: Date.now()
})
```

---

#### `getDocuments(): StoredDocument[]`
Get all uploaded documents.

---

#### `clearSession(): void`
Delete all session data.

---

## 🌊 Streaming Utilities

Browser-responsive streaming. Located in `src/utils/streaming.ts`

### Import
```typescript
import { 
  consumeStreamWithYields,
  processBatchWithYields,
  createDebouncedUIUpdate,
  withTimeout
} from '@/utils/streaming'
```

### `consumeStreamWithYields(stream, options): Promise<string>`
Consume async token stream with browser yields.

**Parameters:**
```typescript
{
  stream: AsyncIterable<string>,      // Token stream
  options?: {
    timeoutMs?: number               // 120000
    yieldIntervalMs?: number         // 50
    maxTokensBeforeYield?: number   // 5
    onProgress?: (data) => void
  }
}
```

**Returns:** Promise<string> - Complete response

**Example:**
```typescript
const { stream } = await TextGeneration.generateStream(prompt)
const response = await consumeStreamWithYields(stream, {
  timeoutMs: 120000,
  onProgress: (data) => {
    console.log(`Generated ${data.tokensGenerated} tokens`)
  }
})
```

---

### `processBatchWithYields(items, processor): Promise<Result[]>`
Process array with browser yields.

**Parameters:**
```typescript
{
  items: T[],
  processor: (item: T) => Promise<Result>,
  yieldAfter?: number  // Items per batch (default: 5)
}
```

---

### `createDebouncedUIUpdate(callback, delayMs): Function`
Create debounced function for UI updates.

**Parameters:**
- `callback`: Function to debounce
- `delayMs`: Minimum delay (default: 100)

**Returns:** Debounced function

**Example:**
```typescript
const updateUI = createDebouncedUIUpdate(() => {
  setMessages([...messages]) // Expensive React update
}, 200)

// Call frequently
updateUI()  // Debounced, max once per 200ms
```

---

### `withTimeout(promise, timeoutMs, message): Promise<T>`
Race promise against timeout.

**Example:**
```typescript
try {
  const result = await withTimeout(
    longRunningOperation(),
    5000,
    'Operation timeout'
  )
} catch (error) {
  console.error(error.message)  // "Operation timeout"
}
```

---

## 📝 Logger Service

Centralized logging. Located in `src/services/logger.ts`

### Import
```typescript
import { logger } from '@/services/logger'
```

### Methods

#### `logger.info(message, data?)`
Log info level.

```typescript
logger.info('Models loaded', { modelId: 'LFM2-350M' })
```

---

#### `logger.warn(message, data?)`
Log warning level.

```typescript
logger.warn('Processing large file', { sizeInMB: 50 })
```

---

#### `logger.error(message, error?, data?)`
Log error level.

```typescript
logger.error('Analysis failed', error, { 
  documentID: 'doc-123' 
})
```

---

#### `logger.debug(message, data?)`
Log debug level (development only).

```typescript
logger.debug('Token received', { token: 'hello' })
```

---

## 📦 Type Definitions

### Message Type
```typescript
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  attachments?: Attachment[]
  metadata?: Record<string, any>
}
```

---

### QuizQuestion Type
```typescript
type QuizQuestion = {
  id: string
  question: string
  type: 'mcq' | 'short-answer' | 'fill-blank'
  options?: string[]        // Only for MCQ
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number        // In seconds
}
```

---

### Flashcard Type
```typescript
type Flashcard = {
  id: string
  front: string            // Question side
  back: string             // Answer side
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  imageUrl?: string
  tags?: string[]
  timestamp: number
  lastReviewed?: number
  nextReview?: number      // Spaced repetition
}
```

---

### ImportantTopic Type
```typescript
type ImportantTopic = {
  topic: string
  explanation: string
  importance: 'high' | 'medium' | 'low'
  relatedConcepts?: string[]
  frequency?: number       // Mentions in content
}
```

---

### MindMap Type
```typescript
type MindMap = {
  id: string
  title: string
  centralConcept: string
  nodes: MindMapNode[]
  connections: Connection[]
  timestamp: number
}

type MindMapNode = {
  id: string
  label: string
  level: number
  children: string[]
  color?: string
  description?: string
}

type Connection = {
  from: string   // Node ID
  to: string     // Node ID
  label?: string
}
```

---

### Quiz Type
```typescript
type Quiz = {
  id: string
  title: string
  questions: QuizQuestion[]
  totalPoints: number
  timeLimit?: number       // In minutes
  timestamp: number
}
```

---

### AnalysisResult Type
```typescript
type AnalysisResult = {
  type: 'summary' | 'quiz' | 'flashcards' | 'mindmap' | 'topics'
  content: any              // Type-specific content
  duration: number          // Milliseconds
  tokensUsed: number
  timestamp: number
}
```

---

## 🎯 Common Patterns

### Error Handling Pattern
```typescript
try {
  const analysis = await documentAnalysis.generateQuiz(content)
} catch (error) {
  logger.error('Quiz generation failed', error)
  // Show user-friendly error
}
```

---

### Streaming with Progress
```typescript
const { stream } = await TextGeneration.generateStream(prompt)

const response = await consumeStreamWithYields(stream, {
  timeoutMs: 120000,
  onProgress: (data) => {
    console.log(`Progress: ${data.tokensGenerated} tokens, ${data.totalTime}ms`)
  }
})
```

---

### Safe Model Operations
```typescript
async function ensureModelAndAnalyze(content) {
  try {
    // Ensure model loaded
    const loadedModel = ModelManager.getLoadedModel()
    if (!loadedModel) {
      await ModelManager.loadModel('Xenova/LFM2-350M')
    }
    
    // Proceed with analysis
    return await documentAnalysis.generateSummary(content)
  } catch (error) {
    logger.error('Analysis error', error)
    throw error
  }
}
```

---

### Debounced UI Updates
```typescript
const [analysis, setAnalysis] = useState(null)

const updateAnalysis = createDebouncedUIUpdate(() => {
  // Update UI in batch
  setAnalysis(newAnalysisResult)
}, 200)

// Called frequently
updateAnalysis()
```

---

## 🔗 Related Documentation

- [Architecture](ARCHITECTURE.md) - System design
- [Features](FEATURES.md) - Feature guide
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

---

## 📞 Support

Questions about the API?
- 📖 Check source code comments
- 🐛 Submit GitHub issue
- 💬 Join GitHub Discussions

**Happy coding!** 🚀
