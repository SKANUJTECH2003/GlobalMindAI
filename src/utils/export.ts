import toast from 'react-hot-toast';

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'txt' | 'html';
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
}

/**
 * Export chat messages to various formats
 */
export function exportChat(
  messages: any[],
  format: 'pdf' | 'json' | 'txt' | 'html' | 'csv' = 'json',
  filename?: string
) {
  const timestamp = new Date().toLocaleString();
  const title = filename || `EduFlow-Chat-${Date.now()}`;

  try {
    let content = '';
    let fileExtension = format;
    let mimeType = 'text/plain';

    switch (format) {
      case 'json':
        content = JSON.stringify(
          {
            exportDate: timestamp,
            messageCount: messages.length,
            messages,
          },
          null,
          2
        );
        mimeType = 'application/json';
        break;

      case 'txt':
        content = messages
          .map(msg => {
            const role = msg.role === 'user' ? 'YOU' : 'AI';
            const time = new Date(msg.timestamp).toLocaleString();
            return `[${time}] ${role}:\n${msg.content}\n`;
          })
          .join('\n---\n\n');
        break;

      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .header { border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-bottom: 20px; }
    .message { margin-bottom: 16px; padding: 12px; border-radius: 8px; }
    .user { background: #e3f2fd; border-left: 4px solid #2196f3; }
    .ai { background: #f3e5f5; border-left: 4px solid #7c3aed; }
    .timestamp { font-size: 0.85em; color: #666; }
    .content { margin-top: 8px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EduFlow Chat Export</h1>
      <p>Exported on: ${timestamp}</p>
      <p>Total messages: ${messages.length}</p>
    </div>
    ${messages
      .map(msg => {
        const isUser = msg.role === 'user';
        const time = new Date(msg.timestamp).toLocaleString();
        return `
      <div class="message ${isUser ? 'user' : 'ai'}">
        <strong>${isUser ? 'You' : 'Assistant'}</strong>
        <div class="timestamp">${time}</div>
        <div class="content">${msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      </div>
        `;
      })
      .join('')}
  </div>
</body>
</html>
        `;
        mimeType = 'text/html';
        break;

      case 'csv':
        content = 'Timestamp,Role,Message\n';
        content += messages
          .map(msg => {
            const time = new Date(msg.timestamp).toLocaleString();
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const message = `"${msg.content.replace(/"/g, '""')}"`;
            return `"${time}","${role}",${message}`;
          })
          .join('\n');
        mimeType = 'text/csv';
        break;

      case 'pdf':
        // For PDF, we'll create a simple approach or show a message
        toast.error('PDF export requires additional library. Use JSON or HTML instead.');
        return;
    }

    downloadFile(content, title, fileExtension, mimeType);
    toast.success(`Chat exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export chat');
  }
}

/**
 * Export quiz results
 */
export function exportQuizResults(
  quizData: any,
  format: 'json' | 'csv' | 'html' = 'json'
) {
  const timestamp = new Date().toLocaleString();
  const filename = `Quiz-Results-${Date.now()}`;

  try {
    let content = '';
    let fileExtension = format;
    let mimeType = 'text/plain';

    switch (format) {
      case 'json':
        content = JSON.stringify(
          {
            exportDate: timestamp,
            ...quizData,
          },
          null,
          2
        );
        mimeType = 'application/json';
        break;

      case 'csv':
        const { questions = [], score = 0, totalScore = 0 } = quizData;
        content = 'Question,Your Answer,Correct Answer,Result\n';
        content += questions
          .map((q: any) => {
            const result = q.userAnswer === q.correct ? 'Correct' : 'Incorrect';
            return `"${q.question}","${q.userAnswer}","${q.correct}","${result}"`;
          })
          .join('\n');
        content += `\n\nTotal Score,${score}/${totalScore}`;
        mimeType = 'text/csv';
        break;

      case 'html':
        const { questions: qs = [], score: s = 0, totalScore: ts = 0 } = quizData;
        const percentage = ((s / ts) * 100).toFixed(1);
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quiz Results</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    .score-card { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .score-card h1 { margin: 0 0 10px 0; font-size: 2em; }
    .question { margin-bottom: 20px; padding: 16px; background: #f9f9f9; border-left: 4px solid #7c3aed; border-radius: 4px; }
    .question.correct { border-left-color: #10b981; }
    .question.incorrect { border-left-color: #ef4444; }
    .question h3 { margin: 0 0 10px 0; }
    .answer-row { margin: 8px 0; font-size: 0.95em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="score-card">
      <h1>Quiz Completed!</h1>
      <div>Score: ${s}/${ts} (${percentage}%)</div>
    </div>
    <div class="questions">
      ${qs
        .map((q: any) => {
          const isCorrect = q.userAnswer === q.correct;
          return `
        <div class="question ${isCorrect ? 'correct' : 'incorrect'}">
          <h3>${q.question}</h3>
          <div class="answer-row"><strong>Your Answer:</strong> ${q.userAnswer}</div>
          <div class="answer-row"><strong>Correct Answer:</strong> ${q.correct}</div>
          <div class="answer-row"><strong>Result:</strong> ${isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
        </div>
          `;
        })
        .join('')}
    </div>
  </div>
</body>
</html>
        `;
        mimeType = 'text/html';
        break;
    }

    downloadFile(content, filename, fileExtension, mimeType);
    toast.success(`Quiz results exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export quiz results');
  }
}

/**
 * Export flashcards
 */
export function exportFlashcards(
  cards: any[],
  format: 'json' | 'csv' | 'html' = 'json'
) {
  const filename = `Flashcards-${Date.now()}`;

  try {
    let content = '';
    let fileExtension = format;
    let mimeType = 'text/plain';

    switch (format) {
      case 'json':
        content = JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            cardCount: cards.length,
            cards,
          },
          null,
          2
        );
        mimeType = 'application/json';
        break;

      case 'csv':
        content = 'Front,Back,Difficulty,Topic\n';
        content += cards
          .map(c => `"${c.front}","${c.back}","${c.difficulty}","${c.topic}"`)
          .join('\n');
        mimeType = 'text/csv';
        break;

      case 'html':
        content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Flashcards</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { text-align: center; color: #333; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .card { background: white; border: 2px solid #7c3aed; border-radius: 8px; padding: 20px; min-height: 200px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .front { font-weight: bold; font-size: 1.1em; margin-bottom: 20px; }
    .back { color: #666; font-style: italic; }
    .meta { font-size: 0.8em; color: #999; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Flashcards (${cards.length} cards)</h1>
    <div class="cards-grid">
      ${cards
        .map(c => `
      <div class="card">
        <div class="front">Q: ${c.front}</div>
        <div class="back">A: ${c.back}</div>
        <div class="meta">Difficulty: ${c.difficulty} | Topic: ${c.topic}</div>
      </div>
      `)
        .join('')}
    </div>
  </div>
</body>
</html>
        `;
        mimeType = 'text/html';
        break;
    }

    downloadFile(content, filename, fileExtension, mimeType);
    toast.success(`${cards.length} flashcards exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Failed to export flashcards');
  }
}

/**
 * Helper function to download file
 */
function downloadFile(
  content: string,
  filename: string,
  extension: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export function copyToClipboard(text: string, label = 'Text') {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied to clipboard`);
  }).catch(() => {
    toast.error('Failed to copy to clipboard');
  });
}
