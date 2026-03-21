import { useState, useEffect } from 'react';
import { VoicePipeline } from '@runanywhere/web';
import { studyStorage, type StudyDocument, type Quiz } from '../../services/studyStorage';
import { documentAnalysis } from '../../services/documentAnalysis';
import './ActiveRecall.css';

interface Props {
  currentDocument: StudyDocument | null;
}

export function ActiveRecall({ currentDocument }: Props) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (currentDocument) {
      loadQuizzes();
    }
  }, [currentDocument]);

  const loadQuizzes = async () => {
    if (!currentDocument) return;
    const quizData = await studyStorage.getQuizzesForDocument(currentDocument.id);
    setQuizzes(quizData);
    setCurrentQuestionIndex(0);
    setFeedback(null);
  };

  const currentQuiz = quizzes[0];
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  const startVoiceAnswer = () => {
    setIsListening(true);
    // In a real implementation, you would use VAD + STT here
    // For now, we'll use a text input fallback
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !studentAnswer.trim()) return;

    setIsEvaluating(true);

    try {
      const expectedAnswer = currentQuestion.type === 'mcq'
        ? currentQuestion.correctAnswer || ''
        : currentQuestion.expectedPoints?.join('. ') || '';

      const evaluation = await documentAnalysis.evaluateAnswer(
        currentQuestion.question,
        studentAnswer,
        expectedAnswer
      );

      setFeedback(evaluation);
    } catch (error) {
      console.error('Evaluation error:', error);
      setFeedback({ feedback: 'Error evaluating answer', score: 0 });
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setStudentAnswer('');
      setFeedback(null);
    }
  };

  const speakFeedback = async (text: string) => {
    // In a real implementation, use TTS to speak the feedback
    console.log('Speaking:', text);
  };

  if (!currentDocument) {
    return (
      <div className="active-recall-empty">
        <h3>No Document Selected</h3>
        <p>Select a document from the workspace to start Active Recall practice</p>
      </div>
    );
  }

  if (!currentQuiz || quizzes.length === 0) {
    return (
      <div className="active-recall-empty">
        <h3>No Quizzes Available</h3>
        <p>Generate a quiz from your document first in the Workspace</p>
      </div>
    );
  }

  return (
    <div className="active-recall">
      <div className="ar-header">
        <h2>Active Recall - Voice Coaching</h2>
        <p>Answer questions verbally and get instant feedback</p>
        <div className="progress-bar">
          <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
          <div className="progress-fill" style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="ar-content">
        <div className="question-panel">
          <h3>Question</h3>
          <p className="question-text">{currentQuestion.question}</p>

          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <div className="mcq-options">
              {currentQuestion.options.map((opt, i) => (
                <div key={i} className="option">
                  {String.fromCharCode(65 + i)}) {opt}
                </div>
              ))}
            </div>
          )}

          <div className="answer-input">
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Type your answer here or use voice input..."
              rows={4}
              disabled={isEvaluating}
            />
            <div className="answer-controls">
              <button
                onClick={startVoiceAnswer}
                disabled={isListening || isEvaluating}
                className="voice-btn"
              >
                {isListening ? 'Listening...' : 'Voice Answer'}
              </button>
              <button
                onClick={submitAnswer}
                disabled={!studentAnswer.trim() || isEvaluating}
                className="submit-btn"
              >
                {isEvaluating ? 'Evaluating...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="feedback-panel">
            <h3>Feedback</h3>
            <div className={`score-display score-${feedback.score >= 70 ? 'good' : feedback.score >= 40 ? 'ok' : 'low'}`}>
              <span className="score-value">{feedback.score}%</span>
            </div>
            <p className="feedback-text">{feedback.feedback}</p>

            {feedback.followUp && (
              <div className="followup-question">
                <h4>Follow-up:</h4>
                <p>{feedback.followUp}</p>
              </div>
            )}

            <div className="feedback-actions">
              <button onClick={() => speakFeedback(feedback.feedback)} className="speak-btn">
                Read Feedback Aloud
              </button>
              <button onClick={nextQuestion} className="next-btn">
                Next Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
