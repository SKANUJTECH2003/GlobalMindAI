/**
 * Input Sanitization Utilities
 * Protects against XSS attacks and malicious content
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param text - The text to escape
 * @returns Escaped text safe for HTML display
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize user input for display in markdown/rich text
 * Removes potentially dangerous attributes and tags
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // List of allowed tags for markdown rendering
  const allowedTags = new Set([
    'P', 'BR', 'STRONG', 'EM', 'B', 'I', 'U', 'CODE', 'PRE',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG',
  ]);

  const dangerousAttributes = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
    'javascript:', 'data:', 'vbscript:', 'file:', 'about:',
  ];

  // Remove dangerous elements and attributes
  const allElements = tempDiv.querySelectorAll('*');
  allElements.forEach((el) => {
    // Remove if tag is not allowed
    if (!allowedTags.has(el.tagName)) {
      const parent = el.parentElement;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
      return;
    }

    // Remove dangerous attributes
    Array.from(el.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.toLowerCase();

      // Check for event handlers
      if (attrName.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }

      // Check for dangerous protocols in href, src, etc.
      if ((attrName === 'href' || attrName === 'src') && dangerousAttributes.some(protocol => attrValue.includes(protocol))) {
        el.removeAttribute(attr.name);
        return;
      }
    });

    // Special handling for links - open in new tab
    if (el.tagName === 'A') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }

    // Special handling for images - enforce security
    if (el.tagName === 'IMG') {
      // Only allow data URIs or HTTPS images
      const src = el.getAttribute('src') || '';
      if (!src.startsWith('data:') && !src.startsWith('https://')) {
        el.removeAttribute('src');
      }
    }
  });

  return tempDiv.innerHTML;
}

/**
 * Validate and sanitize document content
 * @param content - Raw document content
 * @returns Cleaned content
 */
export function sanitizeDocumentContent(content: string): string {
  if (!content) return '';

  // Remove binary data and suspicious patterns
  let cleaned = content
    // Remove base64 encoded images
    .replace(/data:image\/[^;]+;base64,[^\s]+/g, '[Image Removed]')
    // Remove binary content
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit consecutive spaces
    .replace(/\s{4,}/g, '   ');

  return cleaned.trim();
}

/**
 * Validate file content before processing
 * @param content - File content
 * @param maxSize - Maximum allowed size in characters
 * @returns Validation result
 */
export function validateFileContent(content: string, maxSize: number = 1000000): {
  valid: boolean;
  error?: string;
} {
  if (!content) {
    return { valid: false, error: 'File is empty' };
  }

  if (content.length > maxSize) {
    return {
      valid: false,
      error: `File is too large (${(content.length / 1024 / 1024).toFixed(2)}MB). Maximum allowed: ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check for suspicious patterns that might indicate binary content
  const nullByteCount = (content.match(/\0/g) || []).length;
  if (nullByteCount > content.length * 0.01) {
    // More than 1% null bytes = likely binary
    return { valid: false, error: 'File appears to be binary. Please upload text files only.' };
  }

  return { valid: true };
}

/**
 * Create a blob URL safely
 * @param blob - The blob to create URL for
 * @returns Safe blob URL
 */
export function createSafeObjectUrl(blob: Blob): string {
  try {
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to create object URL:', error);
    return '';
  }
}

/**
 * Revoke blob URL safely
 * @param url - The blob URL to revoke
 */
export function revokeSafeObjectUrl(url: string): void {
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to revoke object URL:', error);
    }
  }
}
