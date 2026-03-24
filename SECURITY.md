# Security Policy

## 🔒 Reporting Security Vulnerabilities

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email security concerns to: **[security@globalmindai.com](mailto:security@globalmindai.com)**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response time:** We aim to respond within 48 hours.

---

## 🛡️ Security Practices

### Code Security

✅ **Input Validation**
- All user input is validated before processing
- File uploads limited to 50MB max
- Allowed file types enforced
- Content validation checks performed

✅ **XSS Protection**
- HTML escaped before rendering
- Sanitization utilities prevent injection
- URL validation implemented
- All user input sanitized

✅ **Memory Safety**
- No buffer overflows (TypeScript managed)
- Proper resource cleanup on unmount
- AbortController used for cancellation
- Memory leaks prevented

✅ **Data Privacy**
- All processing happens locally in browser
- No data sent to external servers
- No user tracking implemented
- Session data cleared on page refresh

✅ **Dependency Security**
- Regular dependency updates
- Security audits performed
- Minimal dependencies used
- No vulnerable package versions

---

## 🔐 Browser Security Features

### Client-Side Storage
- **Session Storage**: In-memory, cleared on page refresh
- **LocalStorage**: Optional for preferences
- **IndexedDB**: Available for persistent storage (opt-in)
- **No sensitive data** stored persistently

### Content Security

✅ **Same-Origin Policy**
- No cross-origin requests by default
- CORS properly configured
- Iframe sandboxing enabled

✅ **No Third-Party Tracking**
- No analytics by default
- Google Analytics optional (configurable)
- No advertising
- No data selling

---

## 🔄 Dependency Management

### Dependencies
```json
{
  "@runanywhere/web": "0.1.0-beta.10",
  "@runanywhere/web-llamacpp": "0.1.0-beta.10",
  "@runanywhere/web-onnx": "0.1.0-beta.10",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Security Updates
- Dependencies checked quarterly
- Vulnerabilities patched immediately
- Critical updates hotfixed
- Security advisories monitored

---

## ✅ Security Checklist

### Before Deployment
- [ ] No console.log with sensitive data
- [ ] No hardcoded credentials
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak information
- [ ] HTTPS enabled (if using custom domain)
- [ ] Security headers configured
- [ ] Dependencies updated

### Ongoing
- [ ] Monitor security advisories
- [ ] Regular code reviews
- [ ] Dependency updates checked
- [ ] Security patches applied quickly
- [ ] User feedback on security issues

---

## 🚨 Known Limitations

### Browser-Based AI
- No backend authentication
- Models run locally (slower than server)
- Limited by browser resources
- No audit logging (by design for privacy)

### Model Limitations
- AI models can make mistakes
- Knowledge cutoff exists
- Biased training data possible
- Not suitable for critical decisions

### Privacy Trade-offs
- Trade: Privacy gained (local processing)
- Cost: Performance (browser runs AI)
- Trade: User autonomy gained
- Cost: Limited features/scaling

---

## 🔍 Transparency

### What We Track (Optional)
- Analytics (if enabled)
  - Page views
  - Feature usage
  - Error rates
  - Performance metrics

### What We Do NOT Track
- ❌ User conversations
- ❌ Uploaded documents
- ❌ User behavior
- ❌ Personal information
- ❌ IP addresses (unless analytics enabled)

### Your Choices
- Disable analytics in settings
- Clear browser storage anytime
- Avoid creating accounts
- Use incognito/private browsing

---

## 🎯 Security by Design Principles

1. **Privacy First**
   - Local-first architecture
   - No server processing
   - User data ownership

2. **Minimal Scope**
   - Fewest dependencies
   - Smallest attack surface
   - Clear permissions

3. **Transparency**
   - Open source
   - Public documentation
   - Clear policies

4. **User Control**
   - No forced updates
   - Data always accessible
   - Can delete anytime

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Secure Coding](https://cheatsheetseries.owasp.org/)

---

## 🔗 Related Documentation

- [README](README.md) - Project overview
- [Architecture](ARCHITECTURE.md) - Security architecture
- [Contributing](CONTRIBUTING.md) - Development guidelines
- [Privacy Policy](#) - (Coming soon)

---

## ⚠️ Disclaimer

GlobalMindAI is provided "AS IS" without warranty. While we implement security
best practices, no system is 100% secure. Users are responsible for:
- Keeping systems updated
- Using strong passwords (if authentication added)
- Protecting their data
- Reporting security issues responsibly

---

## 📞 Contact

**Security Contact:** security@globalmindai.com

**Response Guarantee:** 48-hour response time for security reports

**Acknowledgment:** We acknowledge security researchers who report issues responsibly

---

**Last Updated:** March 22, 2026
**Status:** Active and Monitored
