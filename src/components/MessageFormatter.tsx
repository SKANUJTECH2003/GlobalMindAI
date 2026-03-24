import React, { useState, useRef } from 'react';
import './MessageFormatter.css';

interface FeedbackData {
  rating?: 'like' | 'dislike' | null;
  flagged?: boolean;
}

interface MessageFormatterProps {
  content: string;
  messageId: string;
  onRegenerate?: () => void;
  isAI?: boolean;
  onFeedback?: (feedback: FeedbackData) => void;
  initialFeedback?: FeedbackData;
}

export function MessageFormatter({ 
  content, 
  messageId, 
  onRegenerate, 
  isAI = false,
  onFeedback,
  initialFeedback
}: MessageFormatterProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>(initialFeedback || {});
  const [showFlagMenu, setShowFlagMenu] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    const result: (string | React.JSX.Element)[] = [];
    let key = 0;
    
    // Create a map of all patterns to find and replace
    interface Match {
      index: number;
      length: number;
      element: React.JSX.Element;
    }
    
    const matches: Match[] = [];
    
    // Find inline code: `code`
    const codeRegex = /`([^`]+)`/g;
    let match;
    while ((match = codeRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        element: <code key={`inline-${key++}`} className="inline-code">{match[1]}</code>
      });
    }
    
    // Find bold: **text** or __text__
    const boldRegex = /\*\*([^*]+)\*\*/g;
    while ((match = boldRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        element: <strong key={`bold-${key++}`} className="formatted-bold">{match[1]}</strong>
      });
    }
    
    // Find italic: *text* or _text_ (but not part of bold or other formatting)
    const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
    while ((match = italicRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        element: <em key={`italic-${key++}`} className="formatted-italic">{match[1]}</em>
      });
    }
    
    // Find links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        element: <a key={`link-${key++}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="formatted-link">{match[1]}</a>
      });
    }
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Build result by processing matches in order
    let lastIndex = 0;
    for (const m of matches) {
      // Add text before this match
      if (m.index > lastIndex) {
        const textBefore = text.substring(lastIndex, m.index);
        if (textBefore) {
          result.push(textBefore);
        }
      }
      // Add the formatted element
      result.push(m.element);
      lastIndex = m.index + m.length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      if (textAfter) {
        result.push(textAfter);
      }
    }
    
    // If no matches found, return the original text
    if (result.length === 0) {
      return [text];
    }
    
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

  // Text-to-speech for AI responses
  const toggleSpeak = () => {
    if (!synth.current) {
      synth.current = typeof window !== 'undefined' ? window.speechSynthesis : null;
    }

    if (!synth.current) {
      console.error('Speech Synthesis not supported');
      return;
    }

    if (isPlaying) {
      // Stop speaking
      synth.current.cancel();
      setIsPlaying(false);
      utteranceRef.current = null;
    } else {
      // Extract plain text from formatted content
      const plainText = content
        .replace(/[*_`~]/g, '') // Remove markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to plain text

      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      synth.current.speak(utterance);
    }
  };

  // Copy entire response to clipboard
  const copyResponse = async () => {
    try {
      const plainText = content
        .replace(/[*_`~]/g, '') // Remove markdown symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert links to plain text
      
      await navigator.clipboard.writeText(plainText);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch (err) {
      console.error('Failed to copy response:', err);
    }
  };

  // Handle like feedback
  const handleLike = () => {
    const newRating = feedback.rating === 'like' ? null : 'like';
    const newFeedback = { ...feedback, rating: newRating };
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
  };

  // Handle dislike feedback
  const handleDislike = () => {
    const newRating = feedback.rating === 'dislike' ? null : 'dislike';
    const newFeedback = { ...feedback, rating: newRating };
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
  };

  // Handle flag feedback
  const handleFlag = () => {
    const newFeedback = { ...feedback, flagged: !feedback.flagged };
    setFeedback(newFeedback);
    onFeedback?.(newFeedback);
    setShowFlagMenu(false);
  };

  return (
    <div className="message-formatter">
      {formatMessage(content)}
      
      {/* Message Action Buttons for AI responses */}
      <div className="message-actions">
        {isAI && (
          <>
            <button
              className="action-btn copy-btn"
              onClick={copyResponse}
              title="Copy response"
            >
              {copiedResponse ? '✅' : '📋'} {copiedResponse ? 'Copied!' : 'Copy'}
            </button>

            <button
              className={`action-btn like-btn ${feedback.rating === 'like' ? 'active' : ''}`}
              onClick={handleLike}
              title={feedback.rating === 'like' ? 'Remove like' : 'Like this response'}
            >
              👍
            </button>

            <button
              className={`action-btn dislike-btn ${feedback.rating === 'dislike' ? 'active' : ''}`}
              onClick={handleDislike}
              title={feedback.rating === 'dislike' ? 'Remove dislike' : 'Dislike this response'}
            >
              👎
            </button>

            <div className="flag-menu-container">
              <button
                className={`action-btn flag-btn ${feedback.flagged ? 'active' : ''}`}
                onClick={() => setShowFlagMenu(!showFlagMenu)}
                title="More options"
              >
                ⋮
              </button>
              
              {showFlagMenu && (
                <div className="flag-menu">
                  <button
                    className={`flag-option ${feedback.flagged ? 'active' : ''}`}
                    onClick={handleFlag}
                  >
                    <span className="flag-icon">{feedback.flagged ? '🚩' : '🚩'}</span>
                    <span>Flag Response</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className={`action-btn speak-btn ${isPlaying ? 'playing' : ''}`}
              onClick={toggleSpeak}
              title={isPlaying ? 'Stop speaking' : 'Listen to response'}
            >
              {isPlaying ? '🔊' : '🔉'}
            </button>
          </>
        )}
        
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
    </div>
  );
}
