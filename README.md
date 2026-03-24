# 🧠 GlobalMindAI - Intelligent Study Platform

An advanced AI-powered educational platform that transforms how students learn with personalized study tools, intelligent document analysis, and adaptive learning mechanisms.

**Status**: ✅ Production Ready | 🚀 Deployed | 💨 Fully Optimized

---

## 🎯 Overview

GlobalMindAI is a comprehensive educational technology platform built with modern web technologies and advanced AI models. It provides:

✨ **Intelligent Document Analysis** - Extract insights from any study material
📝 **AI-Powered Quiz Generation** - Create adaptive quizzes automatically
🎓 **EduFlow Learning System** - Interactive study methodology with active recall
💬 **Smart Chat Interface** - Real-time AI assistance
🎨 **Visual Processing** - Analyze diagrams and handwritten notes
🎤 **Voice Support** - Speech-to-text and text-to-speech

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5174/`

---

## 🏗️ Technology Stack

### Frontend
- **React 19.0.0** - Modern UI framework
- **TypeScript 5.6.0** - Type-safe development
- **Vite 6.0.0** - Lightning-fast bundler
- **CSS3** - Responsive styling

### AI & Machine Learning
- **RunAnywhere Web SDK 0.1.0-beta.10** - Browser-based AI runtime
- **LLMs**
  - LFM2 350M model for text generation
  - LFM2-VL 450M for vision-language tasks
- **Speech**
  - Whisper Tiny for STT (Speech-to-Text)
  - Piper for TTS (Text-to-Speech)
- **Backends**
  - llama.cpp - Optimized inference
  - ONNX Runtime - Model execution

### Storage
- **Session Storage** - In-memory storage for current sessions
- **IndexedDB Support** - Browser persistent storage (available)

### Build & Deployment
- **Vite** - Production bundler
- **TypeScript Compiler** - Type checking and compilation
- **Vercel** - Deployment platform

---

## 📂 Project Structure

```
GlobalMindAI/
├── src/
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx  # Main chat interface
│   │   ├── AnalysisPanel.tsx  # Document analysis results
│   │   ├── EduFlowTab.tsx      # Study methodology interface
│   │   ├── DocumentUpload.tsx  # File upload handler
│   │   ├── VisionTab.tsx       # Image analysis
│   │   ├── VoiceTab.tsx        # Speech interaction
│   │   └── EduFlow/            # Advanced study tools
│   ├── services/              # Business logic
│   │   ├── documentAnalysis.ts # AI analysis orchestration
│   │   ├── modelManager.ts     # Model loading & management
│   │   ├── sessionStorage.ts   # Session management
│   │   ├── studyStorage.ts     # Data persistence
│   │   ├── logger.ts           # Centralized logging
│   │   └── errorHandler.ts     # Error boundary & handling
│   ├── utils/                  # Utilities
│   │   ├── streaming.ts        # Browser-yield streaming
│   │   └── sanitization.ts     # XSS protection
│   ├── hooks/                  # React hooks
│   │   └── useModelLoader.ts   # Model loading hook
│   ├── constants/              # Configuration
│   │   └── config.ts           # App configuration
│   ├── workers/                # Web workers
│   │   └── vlm-worker.ts       # Vision model worker
│   ├── styles/                 # Global styles
│   └── App.tsx                 # Root component
├── dist/                       # Production build
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── index.html                  # Entry HTML
```

---

## ✨ Key Features

### 1. **Smart Document Analysis**
- Extract key topics automatically
- Generate summaries (brief, detailed, bullet-points)
- Create flashcards for memorization
- Generate quiz questions dynamically

### 2. **EduFlow Learning System**
- **Active Recall** - Test knowledge retrieval
- **Doubt Destroyer** - Get instant explanations
- **Mind Mapping** - Visualize concept relationships
- **Concept Explanation** - Deep dive into topics

### 3. **Conversational AI Chat**
- Real-time streaming responses
- Context-aware discussions
- Model switching capability
- Responsive during all operations
- **Response Feedback System** - Like/dislike, copy, and flag responses
- Response regeneration for alternative answers
- Text-to-speech for responses

### 4. **Vision & Image Processing**
- OCR (Optical Character Recognition)
- Diagram analysis
- Handwritten note recognition
- Educational material extraction

### 5. **Voice Interaction**
- Speech-to-text input
- Text-to-speech output
- Natural conversation flow
- Accessibility support

### 6. **Performance Optimizations**
- Browser-aware streaming with yields
- Debounced UI updates
- Efficient memory management
- Timeout protection for operations
- Gzipped bundle: 4.72KB (main JS)

---

## 🎮 Usage Guide

### Document Analysis
1. Click **"Upload Document"** button
2. Select PDF, document image, or text file
3. Choose analysis type (Summary, Quiz, Flashcards, etc.)
4. Get AI-powered results instantly

### Chat Interface
1. Type your question in the chat box
2. Watch real-time streaming responses
3. Follow-up questions are supported
4. Download conversation history

### EduFlow Study Mode
1. Upload study material
2. Use **Active Recall** to test yourself
3. Use **Doubt Destroyer** for instant help
4. Generate **flashcards** and **mind maps**
5. Review with **interactive quizzes**

### Voice Interaction
1. Click microphone icon
2. Speak your question
3. Get audio response
4. Continue conversation

---

## 🔧 Configuration

Edit `src/constants/config.ts` to customize:

```typescript
export const MODEL_CONFIG = {
  LLM_MODEL_ID: 'Xenova/LFM2-350M',
  VLM_MODEL_ID: 'Xenova/LFM2-VL-450M',
  WHISPER_MODEL: 'Xenova/whisper-tiny',
  PIPER_MODEL: 'en_US-hfc_female-medium',
  TIMEOUT_MS: 180000,
  MAX_FILE_SIZE: 52428800, // 50MB
}
```

---

## 📊 Performance Metrics

- **Build Time**: ~4 seconds
- **Bundle Size**: 15.03 KB (gzipped)
- **Model Loading**: ~10-30 seconds (first load)
- **Response Time**: 2-30 seconds (depends on content)
- **UI Responsiveness**: Maintained during all operations
- **Memory Usage**: ~500MB - 1GB during heavy operations

---

## 🐛 Troubleshooting

### Page Unresponsive During Analysis
✅ **Fixed** - Uses browser-yield streaming
- Operations now yield every 50ms
- UI remains responsive
- Progress feedback displayed

### Model Loading Fails
- Check internet connection
- Clear browser cache
- Refresh the page
- Check available disk space

### Large File Processing
- Maximum file size: 50MB
- Recommended: Under 10MB for best performance
- Text files work fastest

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.

---

## 🚀 Deployment

### Production Build
```bash
npm run build    # Creates optimized dist/ folder
npm run preview  # Test production build locally
```

### Vercel Deployment
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push

# Vercel auto-deploys from main branch
# Configure in vercel.json
```

View deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🏆 What's New

### Latest Updates
- ✅ **Response Feedback System** - Users can like, dislike, copy, and flag AI responses
- ✅ Copy entire responses to clipboard with one click
- ✅ Rate responses with like/dislike for quality feedback
- ✅ Flag responses for moderation with dropdown menu
- ✅ Feedback metadata stored with chat history
- ✅ Fixed page unresponsiveness during AI operations
- ✅ Implemented browser-yield streaming for all text generation
- ✅ Added progress callbacks for long operations
- ✅ Enhanced error handling and logging
- ✅ Improved XSS protection with sanitization
- ✅ Fixed VLM race conditions
- ✅ Optimized memory management
- ✅ Added comprehensive error boundaries

### Recent Improvements
- Response interaction buttons with visual feedback (green for likes, red for dislikes, amber for flags)
- Streaming utilities prevent UI freezing
- Timeout protection against hung streams
- Debounced state updates reduce re-renders
- Comprehensive error logging
- TypeScript strict mode compliance
- Persistent feedback across chat sessions

---

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - Get running in 5 minutes
- [Architecture](ARCHITECTURE.md) - System design & components
- [Features](FEATURES.md) - Detailed feature documentation
- [API Reference](API.md) - Service APIs and usage
- [Deployment Guide](DEPLOYMENT.md) - Production setup
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues & fixes

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev

# Build and verify
npm run build

# Commit and push
git push origin feature/your-feature
```

---

## 📄 License

This project is part of the GlobalMindAI initiative for educational advancement.

---

## 📞 Support

- 📧 Email: support@globalmindai.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Docs: See documentation files

---

## 🙏 Acknowledgments

Built with modern web technologies and powerful AI models to make education accessible and effective for everyone.

**Happy Learning! 🎓✨**
