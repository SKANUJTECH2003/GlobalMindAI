/**
 * Response Formatter - Enhances AI responses with emojis, structure, and better formatting
 */

/**
 * Enhanced prompt - Extremely minimal to avoid generating markers
 */
export function createEnhancedPrompt(basePrompt: string): string {
  return basePrompt;  // No extra instructions - let model respond naturally
}

/**
 * Post-process response - Aggressively remove all _PART markers and related garbage
 */
export function formatResponse(text: string): string {
  let formatted = text
    .trim()
    // Remove ALL _PART marker variants (more comprehensive patterns)
    // Matches: _PART0__, _PART1__, _PARTO_, PART0, etc.
    .replace(/\(_*PART[A-Z0-9]*_*\)/gi, '')         // (_PART0_), (PART0), etc.
    .replace(/_*PART[A-Z0-9]*_*:/gi, '')             // _PART0_:, PART0:, etc.
    .replace(/_+PART[A-Z0-9]+_+/gi, '')              // _PART0__, _PART1__, etc.
    .replace(/\bPART[0-9]+\b/gi, '')                 // PART0, PART1 as standalone words
    // Clean up leftover garbage patterns
    .replace(/\(\s*\)/g, '')                         // Empty parentheses
    .replace(/:\s*$/gm, '')                          // Trailing colons at line end
    .replace(/^\s*[-_]+\s*$/gm, '')                  // Lines with only dashes/underscores
    .replace(/\n\n\n+/g, '\n\n')                     // Remove excessive line breaks
    .replace(/^\s+$/gm, '');                         // Remove whitespace-only lines
  
  // Ensure newlines before numbered sections for list rendering
  formatted = formatted.replace(/([^:\n])(\*{0,2}\d+\.?\s)/g, '$1\n$2');
  
  // Ensure newlines before bullet points
  formatted = formatted.replace(/([^\n])(\s+[-•*]\s+)/g, '$1\n$2');
  
  return formatted;
}

/**
 * Create quiz response with better formatting
 */
export function formatQuizResponse(question: string, options: string[], correctAnswer: string): string {
  let response = `🎯 **Question:** ${question}\n\n`;
  
  response += `📋 **Options:**\n`;
  options.forEach((opt, idx) => {
    const marker = opt === correctAnswer ? '✅' : '•';
    response += `${marker} ${opt}\n`;
  });
  
  response += `\n✨ **Correct Answer:** ${correctAnswer}\n`;
  
  return response;
}

/**
 * Format summary response
 */
export function formatSummaryResponse(summary: string): string {
  return `📚 **Summary**\n\n${formatResponse(summary)}`;
}

/**
 * Format explanation with examples
 */
export function formatExplanation(explanation: string, examples?: string[]): string {
  let response = `💡 **Explanation**\n\n${formatResponse(explanation)}`;
  
  if (examples && examples.length > 0) {
    response += `\n\n📝 **Examples:**\n`;
    examples.forEach((ex, idx) => {
      response += `${idx + 1}. ${ex}\n`;
    });
  }
  
  return response;
}

/**
 * Format learning objectives
 */
export function formatObjectives(objectives: string[]): string {
  let response = `🎯 **Learning Objectives**\n\n`;
  objectives.forEach(obj => {
    response += `✨ ${obj}\n`;
  });
  return response;
}

/**
 * Format tips and tricks
 */
export function formatTips(tips: string[]): string {
  let response = `💼 **Tips & Tricks**\n\n`;
  tips.forEach((tip, idx) => {
    response += `${idx + 1}. 💡 ${tip}\n`;
  });
  return response;
}

/**
 * Add emoji prefix based on content type
 */
export function addEmojiPrefix(content: string, type: 'concept' | 'tip' | 'example' | 'note' | 'question'): string {
  const prefixes = {
    concept: '📚',
    tip: '💡',
    example: '📝',
    note: '📌',
    question: '❓'
  };
  
  return `${prefixes[type]} ${content}`;
}

/**
 * Wrap important terms in bold
 */
export function boldImportantTerms(text: string, terms: string[]): string {
  let result = text;
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(regex, `**${term}**`);
  });
  return result;
}

/**
 * Create completion response with celebrations
 */
export function formatCompletionResponse(topic: string, score?: number): string {
  const celebrations = ['🎉', '🌟', '✨', '🚀', '👏', '⭐'];
  const emoji = celebrations[Math.floor(Math.random() * celebrations.length)];
  
  let response = `${emoji} **Great Job!**\n\n`;
  response += `You've successfully completed the lesson on **${topic}**!\n\n`;
  
  if (score !== undefined) {
    response += `📊 **Your Score:** ${score}%\n`;
    if (score >= 80) {
      response += `🏆 **Excellent performance!** Keep up the great work!\n`;
    } else if (score >= 60) {
      response += `🎯 **Good work!** Review the concepts to improve further.\n`;
    } else {
      response += `💪 **Don't give up!** Review and try again.\n`;
    }
  }
  
  return response;
}
