import React, { useState } from 'react';
import './MessageFormatter.css';

interface MessageFormatterProps {
  content: string;
  messageId: string;
  onRegenerate?: () => void;
  isAI?: boolean;
}

export function MessageFormatter({ content, messageId, onRegenerate, isAI = false }: MessageFormatterProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Parse message content and format it
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    const formatted: React.JSX.Element[] = [];
    let codeBlock: string[] = [];
    let codeLanguage = '';
    let inCodeBlock = false;
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        formatted.push(
          <ul key={`list-${formatted.length}`} className="formatted-list">
            {listItems.map((item, idx) => (
              <li key={idx}>{formatInlineText(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushCodeBlock = () => {
      if (codeBlock.length > 0) {
        const code = codeBlock.join('\n');
        formatted.push(
          <div key={`code-${formatted.length}`} className="code-block-container">
            <div className="code-header">
              <span className="code-language">{codeLanguage || 'code'}</span>
              <button
                className="copy-code-btn"
                onClick={() => copyCode(code, `code-${formatted.length}`)}
                title="Copy code"
              >
                {copiedCode === `code-${formatted.length}` ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="code-block">
              <code className={`language-${codeLanguage}`}>{code}</code>
            </pre>
          </div>
        );
        codeBlock = [];
        codeLanguage = '';
        inCodeBlock = false;
      }
    };

    lines.forEach((line, index) => {
      // Code block detection
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          flushList();
          inCodeBlock = true;
          codeLanguage = line.trim().substring(3).toLowerCase();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlock.push(line);
        return;
      }

      // List detection (bullets: -, *, •, numbers: 1., 2.)
      const listMatch = line.match(/^[\s]*[-*•]\s+(.+)$/) || line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (listMatch) {
        if (!inList) {
          flushList();
          inList = true;
        }
        listItems.push(listMatch[1]);
        return;
      } else if (inList) {
        flushList();
      }

      // Headers (###, ##, #)
      if (line.startsWith('###')) {
        formatted.push(
          <h4 key={index} className="formatted-h4">{formatInlineText(line.substring(3).trim())}</h4>
        );
        return;
      }
      if (line.startsWith('##')) {
        formatted.push(
          <h3 key={index} className="formatted-h3">{formatInlineText(line.substring(2).trim())}</h3>
        );
        return;
      }
      if (line.startsWith('#')) {
        formatted.push(
          <h2 key={index} className="formatted-h2">{formatInlineText(line.substring(1).trim())}</h2>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        formatted.push(<hr key={index} className="formatted-hr" />);
        return;
      }

      // Blockquote
      if (line.startsWith('>')) {
        formatted.push(
          <blockquote key={index} className="formatted-blockquote">
            {formatInlineText(line.substring(1).trim())}
          </blockquote>
        );
        return;
      }

      // Empty line
      if (line.trim() === '') {
        formatted.push(<br key={index} />);
        return;
      }

      // Regular paragraph
      formatted.push(
        <p key={index} className="formatted-paragraph">
          {formatInlineText(line)}
        </p>
      );
    });

    // Flush any remaining content
    flushCodeBlock();
    flushList();

    return formatted;
  };

  // Format inline text (bold, italic, code, links)
  const formatInlineText = (text: string): (string | React.JSX.Element)[] => {
    const parts: (string | React.JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    // Inline code: `code`
    remaining = remaining.replace(/`([^`]+)`/g, (match, code) => {
      parts.push(<code key={`inline-${key++}`} className="inline-code">{code}</code>);
      return `__PART_${parts.length - 1}__`;
    });

    // Bold: **text** or __text__
    remaining = remaining.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (match, bold1, bold2) => {
      parts.push(<strong key={`bold-${key++}`} className="formatted-bold">{bold1 || bold2}</strong>);
      return `__PART_${parts.length - 1}__`;
    });

    // Italic: *text* or _text_
    remaining = remaining.replace(/\*([^*]+)\*|_([^_]+)_/g, (match, italic1, italic2) => {
      parts.push(<em key={`italic-${key++}`} className="formatted-italic">{italic1 || italic2}</em>);
      return `__PART_${parts.length - 1}__`;
    });

    // Links: [text](url)
    remaining = remaining.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      parts.push(
        <a key={`link-${key++}`} href={url} target="_blank" rel="noopener noreferrer" className="formatted-link">
          {text}
        </a>
      );
      return `__PART_${parts.length - 1}__`;
    });

    // Reconstruct text with formatted parts
    const result: (string | React.JSX.Element)[] = [];
    const segments = remaining.split(/(__PART_\d+__)/);
    
    segments.forEach((segment, idx) => {
      const partMatch = segment.match(/__PART_(\d+)__/);
      if (partMatch) {
        result.push(parts[parseInt(partMatch[1])]);
      } else if (segment) {
        result.push(segment);
      }
    });

    return result;
  };

  // Copy code to clipboard
  const copyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(blockId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="message-formatter">
      {formatMessage(content)}
      
      {/* Regenerate button for AI messages */}
      {isAI && onRegenerate && (
        <button 
          className="regenerate-btn"
          onClick={onRegenerate}
          title="Regenerate response"
        >
          🔄 Regenerate
        </button>
      )}
    </div>
  );
}
