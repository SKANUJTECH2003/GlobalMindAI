# 🤝 Contributing Guide

Help us improve GlobalMindAI! Here's how you can contribute.

---

## 🎯 Ways to Contribute

### 🐛 Report Bugs
Found a problem? Let us know!

**How to report:**
1. Check if bug already exists (search GitHub Issues)
2. Click **New Issue**
3. Use bug report template
4. Include:
   - Browser & OS
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/console errors

**Good bug report:**
```
Title: Chat stops responding after 60 seconds
Description: When typing long message, chat interface becomes unresponsive
Steps:
1. Open app
2. Type very long message (500+ chars)
3. Press send
Result: Page shows "unresponsive" dialog
Browser: Chrome 130.0 on Windows 11
```

---

### 💡 Suggest Features
Have an idea? Share it!

**Submit feature request:**
1. Click **New Issue** → **Feature Request**
2. Describe what you want
3. Explain why it's useful
4. Show mockup if possible

**Good feature request:**
```
Title: Dark mode support
Description: Add dark theme for night studying
Why: Reduces eye strain in low light
Mockup: [sketch description]
```

---

### 🔧 Contribute Code

### Prerequisites
- Node.js 16+
- Git
- Text editor (VS Code recommended)
- Basic React/TypeScript knowledge

### Setup Development Environment

```bash
# 1. Fork repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/GlobalMindAI.git
cd GlobalMindAI

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/GlobalMindAI.git

# 4. Install dependencies
npm install

# 5. Create feature branch
git checkout -b feature/my-feature

# 6. Start dev server
npm run dev
```

---

### Development Workflow

#### Step 1: Create Feature Branch
```bash
# Always create branch from latest main
git fetch upstream
git checkout -b feature/amazing-feature upstream/main
```

**Branch naming:**
- Features: `feature/feature-name`
- Bugfixes: `bugfix/issue-description`
- Docs: `docs/what-changed`
- Chores: `chore/maintenance-task`

#### Step 2: Make Changes
- Edit files in `src/`
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep functions small and focused

#### Step 3: Test Locally
```bash
# Development testing
npm run dev

# Build testing
npm run build
npm run preview

# Type checking
npx tsc --noEmit
```

**Test before submitting:**
- [ ] No TypeScript errors: `npm run build`
- [ ] No console errors: Open DevTools (F12)
- [ ] All tests pass: `npm run test` (if available)
- [ ] Tested in multiple browsers
- [ ] Tested on mobile view

#### Step 4: Commit Changes
```bash
# Check what changed
git status

# Stage changes
git add .

# Write good commit message
git commit -m "feat: Add dark mode toggle to settings"
```

**Good commit messages:**
- `feat: Add feature description`
- `fix: Fix specific bug`
- `docs: Update documentation`
- `style: Fix formatting`
- `refactor: Improve code structure`
- `test: Add/update tests`

**Bad commit messages:**
- ❌ "fixed stuff"
- ❌ "WIP"
- ❌ "asdf"

#### Step 5: Push to Your Fork
```bash
git push origin feature/amazing-feature
```

#### Step 6: Create Pull Request
1. Go to original repository
2. Click **Pull Requests** → **New PR**
3. Select your branch
4. Fill PR template

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes
- Change 1
- Change 2
- Change 3

## Testing
How to test this?

## Checklist
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings
- [ ] Tested in multiple browsers
- [ ] Code follows style guide
- [ ] New features documented
```

#### Step 7: Code Review
- Be open to feedback
- Respond to review comments
- Make requested changes
- Re-push when done (force-push not needed)

#### Step 8: Merge
- Maintainers will merge when approved
- Your code is now in main branch! 🎉

---

## 📝 Code Style Guide

### TypeScript
```typescript
// ✅ Good
interface UserData {
  name: string
  age: number
}

async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const data = await api.get(`/users/${userId}`)
    return data
  } catch (error) {
    logger.error('Failed to fetch user', error)
    throw error
  }
}

// ❌ Avoid
const fetchUserData = async (userId) => {
  const data = await api.get('/users/' + userId)
  return data
}
```

### React Components
```typescript
// ✅ Good
interface Props {
  title: string
  onClose: () => void
}

export function Dialog({ title, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <button onClick={() => setIsOpen(false)}>Close</button>
    </div>
  )
}

// ❌ Avoid
export function Dialog({ title, onClose }) {
  return <div className="dialog"><h2>{title}</h2></div>
}
```

### Variable Naming
```typescript
// ✅ Good
const isLoading = true
const userDocuments = []
const maxFileSize = 52428800

// ❌ Avoid
const loading = true
const docs = []
const MAX_SIZE = 52428800
```

### Comments
```typescript
// ✅ Good
// Consume stream with browser yields to prevent UI freezing
// Yields every 50ms to allow React rendering
async function consumeStreamWithYields(stream) {
  // ...
}

// ❌ Avoid
// loop through stream
// get tokens
```

---

## 🧪 Testing

### Manual Testing Checklist

Before submitting PR:

**Feature Testing**
- [ ] New feature works as intended
- [ ] No bugs in new feature
- [ ] Edge cases handled

**Regression Testing**
- [ ] Existing features still work
- [ ] No breaking changes
- [ ] No console errors

**Browser Testing**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if possible)
- [ ] Mobile Browser (if applicable)

**Performance Testing**
- [ ] Page load time acceptable
- [ ] No memory leaks
- [ ] Responsive during operations

---

## 📚 Documentation

### When to Document
- New features
- API changes
- Configuration options
- Known limitations

### Where to Document
- **Features.md** - Feature descriptions
- **API.md** - Service APIs
- **Architecture.md** - Technical details
- **README.md** - Quick overview
- **Code comments** - Complex logic

### Example: Documenting New Feature
```typescript
/**
 * Generate summary from document content
 * Yields to browser to maintain responsiveness
 * 
 * @param content - Document text to summarize
 * @param type - Summary format (brief/detailed/bullet-points)
 * @returns Promise resolving to summary text
 * 
 * @example
 * const summary = await generateSummary(content, 'brief')
 * 
 * @throws Error if generation fails
 * @timeout 120 seconds
 */
async function generateSummary(
  content: string,
  type: 'brief' | 'detailed' | 'bullet-points' = 'detailed'
): Promise<string> {
  // Implementation
}
```

---

## 🔒 Security Guidelines

### When Submitting Code
- ✅ Input validation
- ✅ XSS protection
- ✅ No hardcoded secrets
- ✅ Sanitize user input
- ✅ Validate file uploads
- ✅ Error messages don't leak info

### Security Review Checklist
- [ ] No `eval()` or dangerous functions
- [ ] All user input validated
- [ ] HTML properly escaped
- [ ] No credentials in code
- [ ] Dependencies are trusted
- [ ] Error messages are safe

---

## 🎯 Common Contribution Types

### 1. Bug Fix
```
Branch: bugfix/page-unresponsive-fix
Files: src/utils/streaming.ts
Test: Perform long analysis, verify page responsive
```

### 2. New Feature
```
Branch: feature/dark-mode
Files: src/styles/, src/components/
Test: Toggle dark mode, verify all components themed
Doc: Update FEATURES.md
```

### 3. Performance Improvement
```
Branch: perf/optimize-quiz-generation
Files: src/services/documentAnalysis.ts
Measure: Before/after metrics (time, memory)
```

### 4. Documentation
```
Branch: docs/update-api-reference
Files: API.md, specific comment blocks
Test: Verify docs are clear and accurate
```

---

## 📊 PR Review Criteria

PRs are evaluated on:

| Criteria | What We Check |
|----------|---------------|
| **Code Quality** | Clean, readable, follows style guide |
| **Functionality** | Works as intended, no bugs |
| **Testing** | Manually tested, no regressions |
| **Documentation** | Changes documented, clear |
| **Performance** | No degradation, optimization considered |
| **Security** | Secure, validates input, no vulnerabilities |
| **Git Hygiene** | Good commit messages, reasonable history |

---

## 🙏 Thank You!

Every contribution helps, whether it's:
- 🐛 Bug reports
- 💡 Feature ideas
- 🔧 Code improvements
- 📝 Documentation
- 🎨 Design suggestions
- ✅ Testing

**Contributors are the heart of open source!**

---

## ❓ Questions?

- 📖 Check documentation
- 💬 Ask in Discussions
- 🆘 Open an issue
- 📧 Email maintainers

---

## 📋 Additional Resources

- [Code of Conduct](CODE_OF_CONDUCT.md) (if exists)
- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](API.md)
- [Development Setup](QUICK_START.md)

---

## 🎖️ Recognition

Contributors will be:
- ✅ Added to CONTRIBUTORS.md
- ✅ Mentioned in release notes
- ✅ Recognized in community

**Together, we build amazing educational technology! 🚀**
