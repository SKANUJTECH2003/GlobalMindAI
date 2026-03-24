// Document Analysis Service - The Brain of EduFlow
// Uses VLM for visual analysis and LLM for text generation

import { TextGeneration } from '@runanywhere/web-llamacpp';
import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { ModelManager } from '@runanywhere/web';
import { logger } from './logger';
import { MODEL_CONFIG } from '../constants/config';
import { consumeStreamWithYields, withTimeout } from '../utils/streaming';
import { createEnhancedPrompt, formatResponse } from '../utils/responseFormatter';
import type { Quiz, QuizQuestion, ImportantTopic, Flashcard, MindMap, MindMapNode } from './studyStorage';

// Ensure LLM model is loaded
let isModelLoaded = false;

async function ensureModelLoaded(): Promise<void> {
  if (isModelLoaded) return;
  
  try {
    // Load the LFM2 350M model for text generation
    const modelId = MODEL_CONFIG.LLM_MODEL_ID;
    
    // Check if model is already loaded
    const loadedModel = ModelManager.getLoadedModel();
    if (loadedModel?.id === modelId) {
      isModelLoaded = true;
      return;
    }
    
    // Load the model
    logger.info('Loading LLM model for text generation', { modelId });
    await ModelManager.loadModel(modelId);
    isModelLoaded = true;
    logger.info('LLM model loaded successfully');
  } catch (error) {
    logger.error('Failed to load LLM model', error);
    throw new Error('Failed to initialize AI model. Please refresh and try again.');
  }
}

// Tool definitions for structured extraction
const TOOL_DEFINITIONS = [
  {
    name: 'extract_important_topics',
    description: 'Extracts key topics and concepts from study material',
    parameters: {
      type: 'object',
      properties: {
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              topic: { type: 'string', description: 'The topic name' },
              explanation: { type: 'string', description: 'Brief explanation of the topic' },
            },
            required: ['topic', 'explanation'],
          },
        },
      },
      required: ['topics'],
    },
  },
  {
    name: 'create_flashcards',
    description: 'Creates flashcards from study material',
    parameters: {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              front: { type: 'string', description: 'Question or prompt' },
              back: { type: 'string', description: 'Answer or explanation' },
              difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            },
            required: ['front', 'back', 'difficulty'],
          },
        },
      },
      required: ['flashcards'],
    },
  },
  {
    name: 'generate_mind_map',
    description: 'Creates a hierarchical mind map structure',
    parameters: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              children: { type: 'array', items: { type: 'string' } },
              level: { type: 'number' },
            },
            required: ['id', 'label', 'children', 'level'],
          },
        },
      },
      required: ['nodes'],
    },
  },
];

export class DocumentAnalysisService {
  // Analyze image-based documents (handwritten notes, textbook pages, diagrams)
  async analyzeImageDocument(
    imageData: ImageData,
    analysisType: 'ocr' | 'diagram' | 'general'
  ): Promise<string> {
    const prompt = this.getVLMPrompt(analysisType);
    
    // Convert ImageData to RGB array for VLM
    const rgbData = new Uint8Array(imageData.width * imageData.height * 3);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const idx = (i / 4) * 3;
      rgbData[idx] = imageData.data[i];
      rgbData[idx + 1] = imageData.data[i + 1];
      rgbData[idx + 2] = imageData.data[i + 2];
    }

    const result = await VLMWorkerBridge.shared.process(
      rgbData,
      imageData.width,
      imageData.height,
      prompt
    );

    return result.text;
  }

  // Generate comprehensive summary from text content
  async generateSummary(
    content: string,
    summaryType: 'brief' | 'detailed' | 'bullet-points'
  ): Promise<string> {
    logger.debug('generateSummary called', { contentLength: content?.length, summaryType });
    
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = this.getSummaryPrompt(content, summaryType);
    const prompt = createEnhancedPrompt(basePrompt);
    logger.debug('Summary prompt prepared', { promptLength: prompt.length });
    
    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: MODEL_CONFIG.SUMMARY_MAX_TOKENS,
        temperature: MODEL_CONFIG.SUMMARY_TEMPERATURE,
      });

      // Use streaming utility that yields to browser to prevent freezing
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 120000, // 2 minute timeout
        onProgress: (progress) => {
          logger.debug('Summary generation progress', {
            tokens: progress.tokensGenerated,
            timeElapsed: progress.totalTime,
          });
        },
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);

      logger.info('Summary generation completed', { responseLength: fullResponse.length });
      return fullResponse;
    } catch (error) {
      logger.error('Summary generation failed', error);
      throw error;
    }
  }

  // Generate quizzes with MCQ and descriptive questions
  async generateQuiz(
    content: string,
    questionCount: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<QuizQuestion[]> {
    logger.debug('generateQuiz called', { contentLength: content?.length, questionCount, difficulty });
    
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = this.getQuizPrompt(content, questionCount, difficulty);
    const prompt = createEnhancedPrompt(basePrompt);
    logger.debug('Quiz prompt prepared', { promptLength: prompt.length });
    
    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: MODEL_CONFIG.QUIZ_MAX_TOKENS,
        temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
      });

      // Use streaming utility with browser yields
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 180000, // 3 minute timeout for quiz
        onProgress: (progress) => {
          logger.debug('Quiz generation progress', {
            tokens: progress.tokensGenerated,
            timeElapsed: progress.totalTime,
          });
        },
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);

      logger.info('Quiz generation completed', { responseLength: fullResponse.length });
      return this.parseQuizResponse(fullResponse);
    } catch (error) {
      logger.error('Quiz generation failed', error);
      throw error;
    }
  }

  // Extract important topics using tool calling
  async extractImportantTopics(content: string): Promise<ImportantTopic[]> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = `Analyze the following study material and extract the most important topics and key concepts. For each topic, provide a clear explanation.

Study Material:
${content}

Extract 5-10 important topics with their explanations using clear formatting and emojis for emphasis.`;

    const prompt = createEnhancedPrompt(basePrompt);

    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: 1000,
        temperature: 0.4,
      });

      // Use streaming with browser yields
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 120000,
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);

      return this.parseTopicsFromResponse(fullResponse);
    } catch (error) {
      logger.error('Topic extraction failed', error);
      throw error;
    }
  }

  // Generate flashcards from content
  async generateFlashcards(content: string, count: number = 10): Promise<Omit<Flashcard, 'id' | 'documentId' | 'createdAt'>[]> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = `Create ${count} flashcards from the following study material. Each flashcard should have:
- Front: A clear question or concept prompt
- Back: A concise, accurate answer
- Difficulty: easy, medium, or hard

Study Material:
${content}

Format each flashcard clearly with headers and emojis:
FRONT: [question]
BACK: [answer]
DIFFICULTY: [easy/medium/hard]
---`;

    const prompt = createEnhancedPrompt(basePrompt);

    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: 1500,
        temperature: 0.6,
      });

      // Use streaming with browser yields
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 180000,
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);

      return this.parseFlashcardsFromResponse(fullResponse);
    } catch (error) {
      logger.error('Flashcard generation failed', error);
      throw error;
    }
  }

  // Generate mind map structure
  async generateMindMap(content: string): Promise<MindMapNode[]> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = `Create a hierarchical mind map from the following study material. Identify:
- Main topic (level 0)
- Major subtopics (level 1)
- Key concepts under each subtopic (level 2)
- Supporting details (level 3)

Study Material:
${content}

Format as clear hierarchy with emojis:
LEVEL 0: [Main Topic]
LEVEL 1: [Subtopic 1]
LEVEL 2: [Concept 1.1]
LEVEL 2: [Concept 1.2]
LEVEL 1: [Subtopic 2]
...`;

    const prompt = createEnhancedPrompt(basePrompt);

    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: 1000,
        temperature: 0.5,
      });

      // Use streaming with browser yields
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 120000,
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);

      return this.parseMindMapFromResponse(fullResponse);
    } catch (error) {
      logger.error('Mind map generation failed', error);
      throw error;
    }
  }

  // Explain a specific concept (for Doubt Destroyer feature)
  async explainConcept(conceptText: string, context?: string): Promise<string> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const basePrompt = context
      ? `Given the context: "${context}"\n\nExplain this concept in detail: "${conceptText}"\n\nProvide a clear, student-friendly explanation with examples and visual structure.`
      : `Explain this concept in detail: "${conceptText}"\n\nProvide a clear, student-friendly explanation with examples and visual structure.`;
    
    const enhancedPrompt = createEnhancedPrompt(basePrompt);

    try {
      const { stream } = await TextGeneration.generateStream(enhancedPrompt, {
        maxTokens: 500,
        temperature: 0.4,
      });

      // Use streaming with browser yields
      let fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 90000,
      });

      // Post-process response to ensure proper formatting
      fullResponse = formatResponse(fullResponse);
      
      return fullResponse;
    } catch (error) {
      logger.error('Concept explanation failed', error);
      throw error;
    }
  }

  // Active Recall: Generate follow-up question based on student's answer
  async evaluateAnswer(
    question: string,
    studentAnswer: string,
    expectedAnswer: string
  ): Promise<{ feedback: string; score: number; followUp?: string }> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const prompt = `You are a helpful tutor. A student was asked:
Question: "${question}"

Expected Answer: "${expectedAnswer}"

Student's Answer: "${studentAnswer}"

Evaluate the student's answer:
1. Give encouraging feedback
2. Point out what was correct
3. Mention what was missed (if anything)
4. Rate the answer (0-100)
5. If incomplete, ask a follow-up question to help them remember

Format your response as:
FEEDBACK: [your feedback]
SCORE: [0-100]
FOLLOWUP: [optional follow-up question]`;

    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: 400,
        temperature: 0.5,
      });

      // Use streaming with browser yields
      const fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 60000,
      });

      return this.parseEvaluationResponse(fullResponse);
    } catch (error) {
      logger.error('Answer evaluation failed', error);
      throw error;
    }
  }

  // Helper: Get VLM prompt based on analysis type
  private getVLMPrompt(analysisType: 'ocr' | 'diagram' | 'general'): string {
    switch (analysisType) {
      case 'ocr':
        return 'Extract all text from this image. Preserve the structure and formatting. Include all handwritten notes, equations, and printed text.';
      case 'diagram':
        return 'Describe this diagram in detail. Explain what it represents, label all components, and describe the relationships between elements.';
      case 'general':
        return 'Analyze this educational material. Extract all key information, concepts, and visual elements that would be useful for studying.';
    }
  }

  // Helper: Get summary prompt based on type
  private getSummaryPrompt(content: string, summaryType: 'brief' | 'detailed' | 'bullet-points'): string {
    const basePrompt = `Summarize the following study material:\n\n${content}\n\n`;
    
    switch (summaryType) {
      case 'brief':
        return basePrompt + 'Provide a brief 2-3 sentence summary of the main ideas.';
      case 'detailed':
        return basePrompt + 'Provide a comprehensive summary covering all key concepts, definitions, and important details.';
      case 'bullet-points':
        return basePrompt + 'Provide a bullet-point summary of the key concepts and main ideas. Use clear, concise points.';
    }
  }

  // Helper: Get quiz generation prompt
  private getQuizPrompt(content: string, questionCount: number, difficulty: string): string {
    return `Create ${questionCount} ${difficulty} quiz questions from this study material:

${content}

Generate a mix of:
- Multiple Choice Questions (MCQ) with 4 options
- Descriptive Questions

Format each question as:
TYPE: MCQ or DESCRIPTIVE
QUESTION: [question text]
OPTIONS: A) [option1] B) [option2] C) [option3] D) [option4] (for MCQ only)
ANSWER: [correct answer]
POINTS: [key points to cover] (for DESCRIPTIVE only)
---`;
  }

  // Parser: Extract quiz questions from response
  private parseQuizResponse(response: string): QuizQuestion[] {
    try {
      const questions: QuizQuestion[] = [];
      const questionBlocks = response.split('---').filter(b => b.trim());

      for (const block of questionBlocks) {
        try {
          const lines = block.split('\n').filter(l => l.trim());
          const question: Partial<QuizQuestion> = {};

          for (const line of lines) {
            if (line.startsWith('TYPE:')) {
              const type = line.replace('TYPE:', '').trim().toLowerCase();
              question.type = type.includes('mcq') ? 'mcq' : 'descriptive';
            } else if (line.startsWith('QUESTION:')) {
              question.question = line.replace('QUESTION:', '').trim();
            } else if (line.startsWith('OPTIONS:')) {
              const optionsText = line.replace('OPTIONS:', '').trim();
              const opts = optionsText
                .split(/[A-D]\)/)
                .slice(1)
                .map(o => o.trim())
                .filter(o => o.length > 0);
              if (opts.length > 0) {
                question.options = opts;
              }
            } else if (line.startsWith('ANSWER:')) {
              const answer = line.replace('ANSWER:', '').trim();
              if (answer.length > 0) {
                question.correctAnswer = answer;
              }
            } else if (line.startsWith('POINTS:')) {
              const pointsText = line.replace('POINTS:', '').trim();
              if (pointsText.length > 0) {
                question.expectedPoints = pointsText.split(',').map(p => p.trim()).filter(p => p.length > 0);
              }
            }
          }

          // Validate question before adding
          if (question.type && question.question) {
            // Fill in missing optional fields
            if (question.type === 'mcq' && !question.correctAnswer) {
              question.correctAnswer = 'Not specified';
            }
            if (question.type === 'descriptive' && !question.expectedPoints) {
              question.expectedPoints = ['Key concept understanding'];
            }
            questions.push(question as QuizQuestion);
          }
        } catch (blockError) {
          logger.warn('Error parsing individual quiz block, skipping', blockError);
          continue;
        }
      }

      if (questions.length === 0) {
        logger.warn('No valid questions found in quiz response');
        // Return a fallback question
        return [{
          type: 'descriptive',
          question: 'What are the main concepts from the material?',
          expectedPoints: ['Key concepts', 'Main ideas'],
        }];
      }

      logger.info('Quiz parsing successful', { questionCount: questions.length });
      return questions;
    } catch (error) {
      logger.error('Error parsing quiz response', error);
      throw new Error('Failed to parse quiz questions. Please try again.');
    }
  }

  // Parser: Extract topics from response
  private parseTopicsFromResponse(response: string): ImportantTopic[] {
    const topics: Partial<ImportantTopic>[] = [];
    const lines = response.split('\n').filter(l => l.trim());
    
    let currentTopic: string | null = null;
    let currentExplanation: string = '';

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        // Save previous topic
        if (currentTopic) {
          topics.push({
            topic: currentTopic,
            explanation: currentExplanation.trim(),
          });
        }
        // Start new topic
        currentTopic = line.replace(/^\d+\./, '').split(':')[0].trim();
        currentExplanation = line.split(':').slice(1).join(':').trim();
      } else if (currentTopic && line.trim()) {
        currentExplanation += ' ' + line.trim();
      }
    }

    // Save last topic
    if (currentTopic) {
      topics.push({
        topic: currentTopic,
        explanation: currentExplanation.trim(),
      });
    }

    return topics as ImportantTopic[];
  }

  // Parser: Extract flashcards from response
  private parseFlashcardsFromResponse(response: string): Omit<Flashcard, 'id' | 'documentId' | 'createdAt'>[] {
    const flashcards: Array<Omit<Flashcard, 'id' | 'documentId' | 'createdAt'>> = [];
    const cardBlocks = response.split('---').filter(b => b.trim());

    for (const block of cardBlocks) {
      const lines = block.split('\n').filter(l => l.trim());
      const card: Partial<Flashcard> = {};

      for (const line of lines) {
        if (line.startsWith('FRONT:')) {
          card.front = line.replace('FRONT:', '').trim();
        } else if (line.startsWith('BACK:')) {
          card.back = line.replace('BACK:', '').trim();
        } else if (line.startsWith('DIFFICULTY:')) {
          const diff = line.replace('DIFFICULTY:', '').trim().toLowerCase();
          if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
            card.difficulty = diff;
          }
        }
      }

      if (card.front && card.back && card.difficulty) {
        flashcards.push(card as Omit<Flashcard, 'id' | 'documentId' | 'createdAt'>);
      }
    }

    return flashcards;
  }

  // Parser: Extract mind map from response
  private parseMindMapFromResponse(response: string): MindMapNode[] {
    const nodes: MindMapNode[] = [];
    const lines = response.split('\n').filter(l => l.trim() && l.includes('LEVEL'));
    const nodesByLevel: Map<number, string[]> = new Map();

    for (const line of lines) {
      const match = line.match(/LEVEL (\d+):\s*(.+)/);
      if (match) {
        const level = parseInt(match[1]);
        const label = match[2].trim();
        const id = `node-${nodes.length}`;
        
        if (!nodesByLevel.has(level)) {
          nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(id);

        nodes.push({
          id,
          label,
          children: [],
          level,
        });
      }
    }

    // Link children to parents
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const childLevel = node.level + 1;
      
      // Find next nodes at child level
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[j].level === childLevel) {
          node.children.push(nodes[j].id);
        } else if (nodes[j].level <= node.level) {
          break;
        }
      }
    }

    return nodes;
  }

  // Generate follow-up question for deeper understanding
  async generateFollowUpQuestion(topic: string, context: string): Promise<string> {
    // Ensure model is loaded first
    await ensureModelLoaded();
    
    const prompt = `Based on the following topic and context, generate a thought-provoking follow-up question that encourages deeper understanding:

Topic: "${topic}"
Context: "${context}"

Generate a single, clear follow-up question:`;

    try {
      const { stream } = await TextGeneration.generateStream(prompt, {
        maxTokens: 200,
        temperature: 0.6,
      });

      // Use streaming with browser yields
      const fullResponse = await consumeStreamWithYields(stream, {
        timeoutMs: 60000,
      });

      return fullResponse.trim();
    } catch (error) {
      logger.error('Follow-up question generation failed', error);
      throw error;
    }
  }

  // Parser: Extract evaluation from response
  private parseEvaluationResponse(response: string): { feedback: string; score: number; followUp?: string } {
    const lines = response.split('\n');
    let feedback = '';
    let score = 0;
    let followUp: string | undefined;

    for (const line of lines) {
      if (line.startsWith('FEEDBACK:')) {
        feedback = line.replace('FEEDBACK:', '').trim();
      } else if (line.startsWith('SCORE:')) {
        const scoreMatch = line.match(/\d+/);
        if (scoreMatch) {
          score = parseInt(scoreMatch[0]);
        }
      } else if (line.startsWith('FOLLOWUP:')) {
        followUp = line.replace('FOLLOWUP:', '').trim();
      }
    }

    return { feedback, score, followUp };
  }
}

export const documentAnalysis = new DocumentAnalysisService();
