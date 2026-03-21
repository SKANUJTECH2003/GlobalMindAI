# 🏗️ Architecture Overview

Deep dive into GlobalMindAI's system design and technical architecture.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Frontend Layer                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  React 19 UI Components (TypeScript)                    ││
│  │  ├─ ChatInterface        (Chat & streaming)             ││
│  │  ├─ AnalysisPanel       (Results display)              ││
│  │  ├─ EduFlowTab          (Study methodology)            ││
│  │  ├─ DocumentUpload      (File handling)                ││
│  │  └─ Vision/Voice Tabs   (Multimodal input)            ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Service Layer (Orchestration & Business Logic)         ││
│  │  ├─ documentAnalysis.ts (AI operations)                ││
│  │  ├─ modelManager.ts     (Model lifecycle)              ││
│  │  ├─ sessionStorage.ts   (Session management)           ││
│  │  ├─ logger.ts          (Centralized logging)           ││
│  │  └─ errorHandler.ts    (Error handling)                ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Utilities & Helpers                                     ││
│  │  ├─ streaming.ts       (Browser-yield streaming)        ││
│  │  ├─ sanitization.ts    (XSS protection)                ││
│  │  └─ config.ts          (Configuration)                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓ (IPC via MessagePort)
┌─────────────────────────────────────────────────────────────┐
│           Web Workers / Background Processing               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  vlm-worker.ts - Vision Language Model operations      ││
│  │  (Offloads heavy computation from main thread)         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓ (WebAssembly)
┌─────────────────────────────────────────────────────────────┐
│             RunAnywhere Web SDK / AI Runtime                 │
│  ┌──────────────────────┬──────────────────────────────────┐│
│  │   Text Generation    │   Vision Language Model           ││
│  │  (LFM2 350M LLM)     │   (LFM2-VL 450M)                ││
│  │                      │                                  ││
│  │  Engine: llama.cpp   │   Engine: ONNX Runtime          ││
│  │  Backend: WebGPU/    │   Backend: WebGPU/             ││
│  │           WebAssembly│            WebAssembly          ││
│  └──────────────────────┴──────────────────────────────────┘│
│  ┌──────────────────────┬──────────────────────────────────┐│
│  │   Speech-to-Text     │   Text-to-Speech                 ││
│  │  (Whisper Tiny)      │   (Piper TTS)                   ││
│  │                      │                                  ││
│  │  Engine: ONNX        │   Engine: ONNX                  ││
│  └──────────────────────┴──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓ (Browser APIs)
┌─────────────────────────────────────────────────────────────┐
│              Browser Local Storage & APIs                    │
│  ├─ Session Storage     (In-memory chat/analysis data)      │
│  ├─ IndexedDB           (Persistent document storage)       │
│  ├─ LocalStorage        (Preferences & settings)            │
│  └─ Filesystem API      (File access)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Chat Operation Flow
```
User Input
    ↓
ChatInterface Component
    ↓
validateInput() → sanitizeInput()
    ↓
TextGeneration.generateStream()
    ├─ Model loaded? (if not, load)
    ├─ Create request
    └─ Stream response
    ↓
consumeStreamWithYields()
    ├─ For each token:
    │   ├─ Accumulate token
    │   ├─ Every 50ms or 5 tokens: yield to browser
    │   └─ Allow React to render updates
    ├─ On complete: save to SessionStorage
    └─ Return full response
    ↓
React State Update
    ├─ renderMessage(fullResponse)
    ├─ updateChatHistory()
    └─ Display in UI
    ↓
User sees complete response
```

### Document Analysis Flow
```
User uploads document (.pdf, .jpg, .png, .txt)
    ↓
DocumentUpload Component
    ├─ validateFileSize() → max 50MB
    ├─ validateFileType()
    └─ validateContent()
    ↓
documentAnalysis Service (Main Thread)
    ├─ For image files:
    │   └─ Send to VLMWorkerBridge (offload to worker)
    │       └─ Run Vision Language Model
    │           └─ Return OCR/analysis
    │
    ├─ For text files:
    │   └─ Parse content
    │       └─ Generate analysis
    │
    └─ For all documents:
        ├─ generateSummary()
        ├─ extractImportantTopics()
        ├─ generateQuiz()
        ├─ generateFlashcards()
        ├─ generateMindMap()
        └─ explainConcept()
    ↓
Each operation:
    ├─ Call TextGeneration.generateStream()
    ├─ Use consumeStreamWithYields() for responsiveness
    ├─ Parse/format response
    └─ Store in sessionStorage
    ↓
AnalysisPanel displays results
```

### EduFlow Study Flow
```
Student uploads material
    ↓
EduFlowTab Component
    ├─ Store in sessionStorage.documents
    └─ Initialize study session
    ↓
Active Recall Mode
    ├─ documentAnalysis.generateQuiz()
    ├─ Display question to student
    ├─ Student answers
    ├─ documentAnalysis.evaluateAnswer()
    │   ├─ Score student response
    │   ├─ Provide feedback
    │   └─ Generate follow-up if needed
    └─ Display results & next question
    ↓
Doubt Destroyer Mode
    ├─ Student writes doubt/question
    ├─ documentAnalysis.explainConcept()
    ├─ AI provides detailed explanation
    └─ Generate follow-up questions
    ↓
Mind Map Generation
    ├─ documentAnalysis.generateMindMap()
    ├─ Parse hierarchical structure
    ├─ Render as visual graph
    └─ Allow navigation & exploration
```

---

## 🔧 Component Architecture

### Directory Structure & Responsibilities

#### **Components**
```
src/components/
├─ ChatInterface.tsx
│  └─ Handles chat UI, message input/output streaming
│
├─ AnalysisPanel.tsx
│  └─ Displays document analysis results
│
├─ DocumentUpload.tsx
│  └─ File upload, validation, processing
│
├─ EduFlowTab.tsx
│  └─ Main study mode interface
│
├─ VisionTab.tsx
│  └─ Image upload & visual analysis
│
├─ VoiceTab.tsx
│  └─ Speech recognition & TTS interface
│
├─ ChatTab.tsx, ToolsTab.tsx, ModelBanner.tsx
│  └─ Supporting UI components
│
└─ EduFlow/ (Study tools)
   ├─ ActiveRecall.tsx
   │  └─ Quiz generation & answer evaluation
   │
   ├─ DoubtDestroyer.tsx
   │  └─ Instant doubt resolution interface
   │
   ├─ DocumentViewer.tsx
   │  └─ Display uploaded study material
   │
   └─ AIOutputPanel.tsx
      └─ Results display for all operations
```

#### **Services (Business Logic)**
```
src/services/
├─ documentAnalysis.ts [🔴 CRITICAL - 600+ lines]
│  └─ Orchestrates all AI operations
│     ├─ generateSummary() - Create summaries
│     ├─ generateQuiz() - Create quiz questions
│     ├─ extractImportantTopics() - Find key concepts
│     ├─ generateFlashcards() - Create flashcards
│     ├─ generateMindMap() - Create visual maps
│     ├─ explainConcept() - Provide explanations
│     ├─ evaluateAnswer() - Score responses
│     ├─ generateFollowUpQuestion() - Deeper learning
│     └─ Private helpers (parsing, VLM prompts)
│
├─ modelManager.ts
│  └─ AI model lifecycle management
│     ├─ LoadModel()
│     ├─ UnloadModel()
│     ├─ GetLoadedModel()
│     └─ Model caching & recovery
│
├─ sessionStorage.ts
│  └─ Session data management
│     ├─ Store documents
│     ├─ Store chat history
│     ├─ Store quiz results
│     └─ Retrieve session data
│
├─ studyStorage.ts
│  └─ Type definitions and storage interfaces
│     ├─ Quiz, Flashcard, MindMap types
│     └─ Data structure definitions
│
├─ logger.ts [UTILITY]
│  └─ Centralized logging
│     ├─ logger.info()
│     ├─ logger.warn()
│     ├─ logger.error()
│     └─ Console + persistent logs
│
└─ errorHandler.ts [UTILITY]
   └─ Global error boundary
      ├─ Catch React errors
      ├─ Log errors
      └─ Show error UI
```

#### **Utilities**
```
src/utils/
├─ streaming.ts [⭐ CRITICAL FOR RESPONSIVENESS]
│  └─ Browser-aware stream processing
│     ├─ consumeStreamWithYields() ← Main function
│     │  └─ Yields every 50ms or 5 tokens
│     ├─ processBatchWithYields()
│     │  └─ Process arrays with yields
│     ├─ createDebouncedUIUpdate()
│     │  └─ Debounce React renders
│     └─ withTimeout()
│        └─ Timeout protection
│
├─ sanitization.ts
│  └─ XSS prevention
│     ├─ sanitizeHTML()
│     ├─ escapeText()
│     └─ validateURL()
│
└─ config.ts
   └─ Centralized configuration
      ├─ Model IDs
      ├─ Timeouts
      ├─ File limits
      └─ API endpoints
```

---

## 🔄 State Management

### React Component State
GlobalMindAI uses React hooks for state management (no Redux/Zustand):

```typescript
// In ChatInterface.tsx
const [messages, setMessages] = useState<Message[]>([])
const [isLoading, setIsLoading] = useState(false)
const [currentModel, setCurrentModel] = useState<ModelType>('text')

// In EduFlowTab.tsx
const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
const [studentAnswers, setStudentAnswers] = useState<Map<string, string>>()
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>()
```

### Session Storage (In-Memory)
```javascript
// sessionStorage usage
sessionStorage.setItem('chatHistory', JSON.stringify(messages))
sessionStorage.setItem('uploadedDocuments', JSON.stringify(docs))
sessionStorage.setItem('analysisResults', JSON.stringify(results))
sessionStorage.setItem('quizResults', JSON.stringify(quizzes))
```

### IndexedDB (Persistent - Available)
```javascript
// For future use to persist data between sessions
// Currently using sessionStorage for simplicity
db.documents.store(docData)
db.quizResults.store(results)
db.preferences.store(settings)
```

---

## ⚙️ Critical Systems

### 1. Streaming System
**Problem**: Token consumption loops blocked UI thread → "Page Unresponsive"

**Solution** (`src/utils/streaming.ts`):
```typescript
await consumeStreamWithYields(stream, {
  timeoutMs: 120000,
  yieldIntervalMs: 50,    // Yield every 50ms
  maxTokensBeforeYield: 5,  // Or every 5 tokens
  onProgress: updateUI      // Progress callback
})
```

**Effect**: Browser can render updates and handle events during long operations✅

---

### 2. Error Handling
**Layers**:
1. **Component Level** - Error boundary wraps dangerous components
2. **Service Level** - Try-catch in documentAnalysis methods
3. **Global Level** - Window.onerror listener
4. **Logging** - All errors logged to console + storage

```typescript
// Error Boundary (src/components/ErrorBoundary.tsx)
<ErrorBoundary fallback={<ErrorUI />}>
  <App />
</ErrorBoundary>
```

---

### 3. Model Management
**Lifecycle**:
```
1. User opens app
   ↓
2. useModelLoader hook runs
   ↓
3. modelManager.LoadModel() called
   ↓
4. RunAnywhere SDK downloads model (if not cached)
   ↓
5. Model initialized and ready
   ↓
6. "Models Ready" banner shows
```

**Caching**: Models cached in browser storage after first download

---

### 4. Timeout Protection
Every AI operation has timeout:
```typescript
await withTimeout(
  TextGeneration.generateStream(...),
  timeoutMs,
  'Stream timeout'
)
```

Prevents infinite hangs from stalled streams or network issues.

---

## 📈 Performance Optimizations

| Optimization | Benefit |
|--------------|---------|
| **Streaming with yields** | Prevents 30+ second freezes |
| **Web Workers** | Offloads VLM from main thread |
| **Browser caching** | Models cached after first download |
| **Debounced updates** | Reduces unnecessary re-renders |
| **Lazy loading** | Components load on demand |
| **Code splitting** | Vite automatically chunks code |
| **WASM optimization** | llama.cpp & ONNX run efficiently |
| **Gzipped bundles** | Main JS: 4.72KB (gzipped) |

---

## 🔐 Security

| Security Feature | Implementation |
|-----------------|-----------------|
| **XSS Prevention** | Input sanitization via `sanitization.ts` |
| **CSRF Protection** | N/A - No server requests (local-first) |
| **Content Security** | HTML escaping before render |
| **Data Privacy** | All processing local in browser |
| **No Remote Data** | Models run entirely client-side |

---

## 🧪 Testing Architecture

The project includes:
```
tests/
├─ web-starter-app-test-suite.md
│  └─ Test cases and scenarios
│
└─ web-starter-app-bugs.md
   └─ Known issues and fixes
```

---

## 📚 Key Technologies Deep Dive

### RunAnywhere Web SDK
- **Browser Runtime**: JavaScript/TypeScript
- **Inference**: WebAssembly + WebGPU
- **Models**: GGUF format (quantized)
- **Offloading**: To Web Workers when needed

### llama.cpp
- **LLM Inference**: Optimized for edge devices
- **Quantization**: Reduces model size while maintaining quality
- **Performance**: Efficient token generation

### ONNX Runtime
- **Model Format**: Industry standard
- **VLM Support**: Vision language model inference
- **Execution**: CPU/GPU via WebAssembly

---

## 🚀 Future Architecture Improvements

Planned enhancements:
- [ ] IndexedDB persistent storage
- [ ] Larger context window support
- [ ] Multi-modal reasoning
- [ ] Fine-tuning capability
- [ ] Federated learning
- [ ] Advanced caching strategies
- [ ] Progressive streaming UI
- [ ] Offline mode enhancement

---

## 🔗 Related Documentation

- [README](README.md) - Project overview
- [Features](FEATURES.md) - Feature documentation
- [API Reference](API.md) - Service APIs
- [Deployment](DEPLOYMENT.md) - Production setup

