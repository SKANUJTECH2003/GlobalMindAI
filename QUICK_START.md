# ⚡ Quick Start Guide

Get GlobalMindAI running in 5 minutes!

---

## 📋 Prerequisites

- **Node.js**: 16.0.0 or higher
- **npm**: 8.0.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Disk Space**: ~2GB for AI models (downloaded on first use)
- **Internet**: Required for initial model download

---

## 🎯 Installation

### Step 1: Clone or Download
```bash
# If cloning
git clone https://github.com/yourusername/GlobalMindAI.git
cd GlobalMindAI

# Or extract downloaded zip
unzip GlobalMindAI.zip
cd GlobalMindAI
```

### Step 2: Install Dependencies
```bash
npm install
```
*This takes 1-2 minutes*

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Visit: **http://localhost:5174/**

**That's it! ✅**

---

## 🎮 First Use

### First Time Setup (30-60 seconds)
When you first open the app, it will:
1. Download AI models (~500MB)
2. Load WebAssembly components
3. Initialize the interface

**Wait for "Models Ready" message** ✓

### Try These Features

#### 1️⃣ Chat with AI
- Type a question in the **Chat** tab
- Watch real-time streaming response
- Ask follow-up questions

**Example Questions:**
- "Explain Newton's laws of motion"
- "What is photosynthesis?"
- "Help me understand quantum computing"

#### 2️⃣ Upload a Document
- Click **"Upload Document"**
- Select a PDF or image
- Get instant analysis:
  - ✅ Summary
  - ✅ Key topics
  - ✅ Quiz questions
  - ✅ Flashcards

**Supported Formats:**
- PDF files
- Images (.jpg, .png, .webp)
- Text documents
- Max size: 50MB

#### 3️⃣ Use EduFlow Study Mode
1. Go to **EduFlow** tab
2. Upload study material
3. Try **Active Recall** - test yourself
4. Try **Doubt Destroyer** - get explanations
5. Generate **Mind Maps** - visualize concepts

#### 4️⃣ Use Response Feedback System ✨ NEW
When the AI responds to your questions:
- **📋 Copy** - Click to copy response to clipboard
- **👍 Like** - Rate helpful responses (goes green)
- **👎 Dislike** - Rate unhelpful responses (goes red)
- **⋮ More Options** - Flag inappropriate content (goes amber)
- **🔉 Listen** - Hear the response read aloud
- **🔄 Regenerate** - Get a different response

**Try it:**
1. Ask a question in Chat
2. Get a response
3. Try clicking the feedback buttons below it
4. Your feedback helps improve responses!

#### 5️⃣ Voice Interaction (Optional)
- Click microphone icon
- Speak your question
- Get audio response
- See transcript in chat

---

## 🛠️ Common Tasks

### Change Model
```
Settings → Select Model → Choose different model
```

### Clear Chat History
```
Chat tab → Clear History button
```

### Download Quiz Results
```
EduFlow → Quiz → Export Results
```

### Adjust Settings
```
Settings modal:
- Model selection
- Temperature (creativity)
- Response length
- Voice/Speech options
```

---

## ⚠️ Troubleshooting

### "Page Unresponsive" During Analysis
✅ **This is fixed!** The app now yields to the browser every 50ms during long operations.
- If it happens, click **"Wait"** in the dialog
- Progress updates show what the AI is doing

### Model Download Stuck
- Check internet speed (needs 5+ Mbps)
- Clear browser cache (DevTools → Storage → Clear All)
- Try different browser
- Restart the app

### File Upload Fails
- File size must be under 50MB
- Format must be supported (PDF, images, text)
- Try a different file
- Check browser storage permissions

### Chat Not Responding
- Give AI 2-5 seconds to generate response
- Check if model is still loading
- Refresh the page
- Clear cache and reload

---

## 🚀 Next Steps

### Learn More
📖 Read full documentation:
- [Architecture](ARCHITECTURE.md) - How it works
- [Features](FEATURES.md) - All capabilities
- [API Reference](API.md) - Technical docs
- [Deployment](DEPLOYMENT.md) - Go to production

### Build for Production
```bash
# Create optimized build
npm run build

# Test production build locally
npm run preview

# Deploy to Vercel or your server
```

### Customize
- Edit theme colors in `src/styles/App.css`
- Change models in `src/constants/config.ts`
- Adjust timeouts and limits in config

---

## 💡 Tips & Tricks

✨ **Fast Tips:**
- Use 🔍 Search in chat history to find old conversations
- Create flashcards for memorization - swipe to flip
- Use Mind Maps to visualize complex topics
- Export quiz results for tracking progress
- Voice input is faster for longer questions

⚙️ **Performance:**
- Start with smaller files (under 5MB) for fastest processing
- Clear chat history occasionally for better performance
- Close unused browser tabs for more memory
- Use latest browser version for best compatibility

🎓 **Learning:**
- Active Recall is most effective 24 hours after learning
- Create multiple flashcard sets for different topics
- Use quiz results to identify weak areas
- Read explanations in Doubt Destroyer for deeper understanding

---

## 📚 Resources

| Resource | Link |
|----------|------|
| **Main Documentation** | [README.md](README.md) |
| **Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **API Docs** | [API.md](API.md) |
| **Help** | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| **Deploy** | [DEPLOYMENT.md](DEPLOYMENT.md) |

---

## ❓ FAQ

**Q: Do I need an internet connection?**  
A: Only for first model download. After that, models run locally.

**Q: Is my data private?**  
A: Yes! Everything runs in your browser. No data sent to servers.

**Q: Can I use on mobile?**  
A: Works on tablet browsers. Mobile UI not optimized yet.

**Q: How big are the AI models?**  
A: ~500MB total for all models. Downloaded once, then cached.

**Q: What if model download fails?**  
A: Clear cache and reload. Or try a different browser.

---

## 🎉 Ready?

You're all set! Start learning with GlobalMindAI:

```bash
npm run dev
```

Then visit: **http://localhost:5174/**

**Happy Learning! 🚀📚**
