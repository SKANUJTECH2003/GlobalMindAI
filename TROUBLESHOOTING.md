# 🐛 Troubleshooting Guide

Common issues and their solutions.

---

## ⚠️ Page Unresponsiveness Issues

### Issue: "Page Unresponsive" Dialog During Analysis
**Status**: ✅ **FIXED in latest update**

**What happens:**
- Browser shows "Page is unresponsive" dialog
- Options: "Wait" or "Exit page"
- Page freezes for 5-60 seconds during AI operations

**Root cause (RESOLVED):**
- Previous: Tight token consumption loops blocked UI thread
- Now: Streaming uses browser yields every 50ms

**What to do if still occurs:**
1. Click **"Wait"** - The app will recover
2. Check browser console for errors (F12)
3. Refresh if needed
4. Report on GitHub if still happening

**Prevention:**
- Use latest version (check `package.json`)
- Don't have too many browser tabs open
- Close other heavy applications
- Use updated browser

---

## 🎯 Model & Loading Issues

### Issue: Models Stuck on "Loading"
**Symptoms**: "Models are loading..." message never disappears

**Solutions (in order):**
1. **Wait longer** (first download can take 30-60 seconds)
2. **Check internet** - Do a speed test
3. **Clear browser cache**
   - DevTools → Application → Storage → Clear Site Data
   - Close browser completely
   - Reopen and refresh
4. **Try incognito mode** (Private browsing)
5. **Use different browser** (Chrome → Firefox, etc.)
6. **Restart computer** and try again

**Why it happens:**
- First model download is 500MB
- Slow internet connection
- Browser cache corruption
- Insufficient disk space

---

### Issue: Specific Model Won't Download
**Symptoms**: Download fails midway, or specific model shows error

**Solutions:**
1. **Check available space** - Need ~2GB free
2. **Check internet speed** - Minimum 5 Mbps recommended
3. **Try a different network** (WiFi → Mobile hotspot)
4. **Clear cache & restart browser**
5. **Wait 5 minutes** and refresh (server may be overloaded)

**Fallback:**
- Use alternative model in Settings
- Some models have backups available

---

### Issue: "Model Not Found" Error
**Symptoms**: App loads but shows error about missing model

**Solutions:**
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear ServiceWorker cache**
   - DevTools → Application → Service Workers → Unregister
3. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Try incognito mode** to isolate issues

---

## 📁 File Upload Issues

### Issue: File Upload Fails Silently
**Symptoms**: Click upload button → Nothing happens

**Solutions:**
1. **Check file size**
   - Maximum: 50MB
   - Recommended: Under 10MB
   - Actual size (right-click Properties)

2. **Check file format**
   - Supported: PDF, JPG, PNG, WEBP, TXT
   - Not supported: DOCX (convert to PDF first), GIF

3. **Check browser storage**
   - Some mobile browsers limit storage
   - Try desktop browser
   - Clear cache to free space

4. **Check file permissions**
   - Ensure file is readable
   - Try different file
   - Try re-downloading the file

---

### Issue: "File Too Large" Error
**Symptoms**: Error when uploading even small files

**Solutions:**
1. **Check actual file size** - Use file properties
2. **Compress the file**
   - Images: Reduce resolution/quality
   - PDFs: Use PDF compressor online
   - Crop unnecessary pages
3. **Split into smaller files** - Upload in parts
4. **Try different file** - Same content, different format

**Prevention:**
- Use OCR to extract text from images (reduces size)
- CompressPDF.online for getting under limit
- Take screenshots of key pages instead of full PDF

---

### Issue: File Format Not Recognized
**Symptoms**: Upload succeeds but analysis shows no content

**Solutions:**
1. **Verify file format** - .pdf not .pdf.bak
2. **Try converting first** - DOCX → PDF (Word/Drive)
3. **Check file integrity** - Try opening in normal app
4. **Try different file** - Same material, different format
5. **Use OCR** - Scan or convert to image first

---

### Issue: Analysis Results Are Wrong/Incomplete
**Symptoms**: Summary doesn't match document, or produces garbage

**Solutions:**
1. **Check file format** - Is it really readable?
2. **Re-upload same file** - Might be random glitch
3. **Try different analysis type**
   - Quiz instead of Summary
   - Flashcards instead of Topics
4. **Reduce file size** - Very long docs sometimes fail
5. **Check file content** - Make sure it's readable text

---

## 💬 Chat & Conversation Issues

### Issue: Chat Not Responding
**Symptoms**: Send message → Nothing happens (no response)

**Solutions:**
1. **Give it time**
   - First response: 10-30 seconds
   - Subsequent: 5-15 seconds
   - Very long topics: 30-60 seconds
2. **Check model loaded** - "Models Ready" should show
3. **Refresh page** if models aren't loaded
4. **Try simpler question** - Very complex ones might timeout
5. **Clear chat history** - Very long conversations might slow down

**Why it happens:**
- Model still loading in background
- Complex question needs longer processing
- Browser low on memory
- Network latency

---

### Issue: Chat Response Cut Off or Incomplete
**Symptoms**: AI response ends abruptly mid-sentence

**Solutions:**
1. **Increase response length**
   - Settings → Advanced → Max Response Length
   - Increase value and try again
2. **Ask the question again** - Might be browser glitch
3. **Check timeout settings** - May be exceeding limits
4. **Clear chat** and start fresh
5. **Try with Voice disabled** - Sometimes it helps

---

### Issue: Wrong or Weird Responses
**Symptoms**: AI gives incorrect answer or nonsense

**Solutions:**
1. **Rephrase your question**
   - Be more specific
   - Provide more context
   - Use simpler words
2. **Lower temperature** setting
   - Settings → Temperature
   - Set to 0.3-0.5 for factual answers
3. **Try different model** - Some models better for certain topics
4. **Provide reference material**
   - Upload relevant documents
   - Include in question
5. **Check if topic is in training data** - Very new topics might be unknown

---

## 🎓 EduFlow & Study Features

### Issue: Quiz Shows No Questions
**Symptoms**: Choose Quiz → Nothing appears

**Solutions:**
1. **Ensure document uploaded**
   - Go to Document Viewer
   - Should show your document
2. **Try different document** - Might be incompatible
3. **Use different analysis type** first (Summary) to verify doc works
4. **Refresh page** and retry
5. **Check browser console** for errors (F12)

---

### Issue: Answer Evaluation Incorrect
**Symptoms**: AI says answer is wrong when it's actually correct

**Solutions:**
1. **Check exact wording** - Might need to be more specific
2. **Try different phrasing** - Same ideas, different words
3. **Click "Appeal"** (coming soon) to challenge
4. **Report incorrect grading** via feedback button
5. **Review correct answer** - AI's version of correct response

**Note**: AI scoring is approximate. Use for practice, not final grades.

---

### Issue: Mind Map Not Displaying
**Symptoms**: Click "Generate Mind Map" → Nothing shows

**Solutions:**
1. **Wait longer** - Complex mind maps take 20-30 seconds
2. **Reduce document size** - Very large docs might fail
3. **Reload page** and try again
4. **Try with simpler document** - Short, focused material
5. **Check browser console** - May show specific error

---

### Issue: Flashcards Have Errors
**Symptoms**: Flashcards have typos or wrong answers

**Solutions:**
1. **Edit flashcards manually**
   - Click on card
   - Click edit
   - Fix front/back
   - Save changes
2. **Regenerate flashcards**
   - Delete current set
   - Generate new ones
   - Might be better quality
3. **Report poor quality** - Help improve the system
4. **Use another format** - Try Quiz or Summary instead

---

## 🎤 Voice & Audio Issues

### Issue: Microphone Not Working
**Symptoms**: Click microphone → Nothing happens

**Solutions:**
1. **Check browser permissions**
   - URL bar → Lock icon → Microphone
   - Allow microphone access
   - Refresh page
2. **Check device microphone** - Test in voice call apps
3. **Restart browser** - Sometimes permission cache issues
4. **Try different browser** - Firefox if Chrome fails
5. **Check microphone cable** - Physical issues
6. **Disable browser extensions** - Some blocks microphone

**Windows users:**
- Settings → Privacy → Microphone → Allow apps
- Check if browser is listed

**Mac users:**
- System Preferences → Security & Privacy → Microphone
- Grant permission to browser

---

### Issue: Speech-to-Text Inaccurate
**Symptoms**: Spoken words transcribed incorrectly

**Solutions:**
1. **Speak clearly** and slowly for first word
2. **Reduce background noise** - Find quiet location
3. **Use better microphone** - Built-in mics quality varies
4. **Edit transcript before sending** - Fix mistakes manually
5. **Try English (US)** if English variant available
6. **Shorter phrases** - Break into multiple recordings

---

### Issue: Text-to-Speech Not Playing
**Symptoms**: Enable voice output → No audio

**Solutions:**
1. **Check system volume** - Windows/Mac volume not muted
2. **Check browser volume** - Check browser controls
3. **Check speaker** - Is it connected? Working?
4. **Refresh page** - Might help
5. **Try different browser** - Audio API differences

---

## 🖥️ Browser & Device Issues

### Issue: Site Won't Load
**Symptoms**: Blank page or "Cannot reach server"

**Solutions:**
1. **Check internet connection** - Open another website
2. **Try different browser** - Rules out browser issues
3. **Clear cache & cookies**
   - Settings → Clear Browsing Data → Select All
   - Restart browser
4. **Disable extensions** - Disable all browser extensions
5. **Try incognito mode** - Isolates problematic extensions
6. **Check firewall** - Corporate networks might block

---

### Issue: App Runs Very Slowly
**Symptoms**: Typing lags, UI feels sluggish

**Solutions:**
1. **Close other browser tabs** - Especially video/music
2. **Close other applications** - Free up RAM
3. **Disable browser extensions** - Especially ad blockers
4. **Try different browser** - Different efficiency levels
5. **Restart browser** - Clear memory
6. **Clear browser cache** - Old data might slow down

**Check resources:**
- DevTools → Performance → Record → Interact → Check bottlenecks

---

### Issue: Mobile/Tablet Display Issues
**Symptoms**: Layout broken or interface doesn't fit

**Note**: Mobile UI not fully optimized yet.

**Workarounds:**
1. **Use desktop/laptop** - Better experience
2. **Use landscape mode** - Wider screen
3. **Zoom out** - Pinch zoom in browser
4. **Use Firefox Mobile** - Sometimes better layout
5. **Report issues** - Help us improve mobile

---

## 🔄 Data & Persistence Issues

### Issue: Chat History Lost After Refresh
**Symptoms**: Reload page → Conversation gone

**Current behavior**: Uses session storage (resets on page refresh)

**Solutions:**
1. **Export chat before closing**
   - Download as PDF
   - Copy to notes app
   - Take screenshots
2. **Don't close browser tab** - Keep tabopen (uses session storage)
3. **Request feature**: Persistent storage (planned update)

---

### Issue: Settings Not Saved
**Symptoms**: Change settings → Revert after refresh

**Solutions:**
1. **Settings are session-based** - They're temporary by design
2. **Re-apply after refresh** - Takes 10 seconds
3. **Request persistent settings** - GitHub issues
4. **Use localStorage workaround** (technical users)

---

## 📊 Performance Issues

### Issue: Slow Analysis or Quiz Generation
**Symptoms**: Taking 60+ seconds for summary or quiz

**Expected times:**
- Summary: 10-20 seconds
- Quiz: 15-30 seconds
- Flashcards: 10-20 seconds
- Mind map: 20-30 seconds

**If taking longer:**
1. **Check internet** - Network speed affecting model
2. **Reduce file size** - Very long docs take longer
3. **Try smaller operation** - Summary instead of quiz
4. **Check system performance** - High CPU/RAM usage
5. **Report if consistent** - Might be service issue

---

## 🔐 Privacy & Security

### Issue: Unsure About Data Privacy
**The good news:**
✅ All processing happens in your browser
✅ No data sent to any server
✅ No accounts needed
✅ No tracking
✅ No ads

**Your data:**
- Chat: Stored in browser session only
- Files: Processed locally, not uploaded
- Models: Downloaded locally, cached
- Nothing persisted server-side by default
- You can delete any time

---

### Issue: Concerned About Model Quality
**AI limitations:**
- Models not perfect - can make mistakes
- Biased training data can affect responses
- Not good at math/very complex problems
- Some knowledge cutoff (models trained on specific date)
- Use for learning, not critical decisions

**Mitigations:**
- Always verify important answers
- Supplement with textbooks
- Cross-check multiple sources
- Understand AI limitations

---

## 🆘 When Nothing Helps

### Nuclear Options (Last Resort)

**Option 1: Hard Reset**
```javascript
// In DevTools Console:
localStorage.clear()
sessionStorage.clear()
// Or in Chrome:
Settings → Clear Browsing Data → Select ALL → Clear
```
Then:
- Close browser completely
- Reopen
- Go to site again

**Option 2: Different Browser**
- Google Chrome → Firefox
- Microsoft Edge → Safari
- Try fresh installation

**Option 3: Different Device**
- Mobile iPhone → Desktop
- Tablet → Laptop
- Another computer

**Option 4: Report Issue**
If nothing works:
1. Note exact steps to reproduce
2. Check browser version (DevTools → Three dots → About)
3. Note error message exactly
4. Report on GitHub issues
5. Include screenshot/console errors

---

## 🎧 Getting Help

### Resources
- 📖 Read [Features Guide](FEATURES.md)
- 📚 Read [Architecture](ARCHITECTURE.md)
- 🚀 Read [Quick Start](QUICK_START.md)
- 💬 GitHub Discussions
- 🐛 GitHub Issues (for bugs)

### Before Reporting Issue
- [ ] Read this Troubleshooting guide
- [ ] Try different browser
- [ ] Check browser console (F12)
- [ ] Clear cache and retry
- [ ] Check GitHub issues (might already be known)

---

**Still stuck?** Open an issue on GitHub with:
- ✅ Steps to reproduce
- ✅ Browser name and version
- ✅ Operating system
- ✅ Screenshot of error
- ✅ Browser console errors (F12 → Console)

We're here to help! 🙏
