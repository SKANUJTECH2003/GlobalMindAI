/**
 * Response Formatter - Enhances AI responses with emojis, structure, and better formatting
 */

/**
 * Enhanced prompt that asks for beautifully formatted responses with emojis
 */
export function createEnhancedPrompt(basePrompt: string): string {
  const enhancementInstructions = `

---
📝 FORMATTING INSTRUCTIONS:
Please format your response beautifully with:
1. Use relevant emojis at the start of each section
2. Use clear headers with emojis (e.g., "📚 Key Concepts:", "💡 Examples:", "⚠️ Important Notes:")
3. Use bullet points (- ) for lists
4. Use **bold** for important terms
5. Add line breaks between sections for readability
6. Use numbered lists (1. 2. 3.) for steps or sequences
7. Use 🎯, 💼, 🔑, ✨, 🚀, 📌, 🎓, 🧠, 📖, 🔍, ⭐, 👍 emojis liberally
8. Make it visually appealing and easy to scan

Format your response EXACTLY like this structure:
- Start with a brief intro
- Use section headers with emojis
- Use bullet points for details
- End with a summary if needed

Now provide your response:
`;
  
  return basePrompt + enhancementInstructions;
}

/**
 * Post-process response to ensure proper formatting with emojis
 */
export function formatResponse(text: string): string {
  // Clean up text
  let formatted = text
    .trim()
    .replace(/\n\n\n+/g, '\n\n') // Remove excessive line breaks
    .replace(/(\d+\.\s)/g, '\n$1'); // Ensure numbered lists are on new lines
  
  // Add section headers if not present
  if (!formatted.includes('📚') && !formatted.includes('💡') && !formatted.includes('🎯')) {
    // Try to detect sections and add emojis
    formatted = formatted
      .replace(/^(key[\s\w]*:?)/gim, '🔑 **$1**')
      .replace(/^(important[\s\w]*:?)/gim, '⚠️ **$1**')
      .replace(/^(example[\s\w]*:?)/gim, '💡 **Example:**')
      .replace(/^(steps?[\s\w]*:?)/gim, '🚀 **$1**')
      .replace(/^(summary[\s\w]*:?)/gim, '📋 **Summary:**')
      .replace(/^(concept[\s\w]*:?)/gim, '📚 **$1**')
      .replace(/^(definition[\s\w]*:?)/gim, '📖 **$1**')
      .replace(/^(tips?[\s\w]*:?)/gim, '💼 **$1**')
      .replace(/^(remember[\s\w]*:?)/gim, '🧠 **$1**')
      .replace(/^(note[\s\w]*:?)/gim, '📌 **$1**');
  }

  // Convert plain lists to bullet points
  formatted = formatted.replace(/^([a-zA-Z][a-zA-Z0-9\s\-]*?)(?=\n|$)/gm, (match) => {
    // Check if it looks like a list item
    if (match.length > 3 && !match.includes('**')) {
      return '• ' + match;
    }
    return match;
  });

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
