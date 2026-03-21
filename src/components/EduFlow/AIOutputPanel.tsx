import { sanitizeHtml } from '../../utils/sanitization';

interface Props {
  result: any;
}

export function AIOutputPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="ai-output-empty">
        <p>Select an analysis type and click "Analyze" to generate insights</p>
      </div>
    );
  }

  if (result.type === 'error') {
    return (
      <div className="ai-output-error">
        <h3>Error</h3>
        <p>{result.message}</p>
      </div>
    );
  }

  return (
    <div className="ai-output-panel">
      {result.type === 'summary' && (
        <div className="summary-output">
          <h3>Summary & Notes</h3>
          <div className="summary-content">{sanitizeHtml(result.content)}</div>
        </div>
      )}

      {result.type === 'quiz' && (
        <div className="quiz-output">
          <h3>Quiz Questions</h3>
          {result.questions.map((q: any, idx: number) => (
            <div key={idx} className="quiz-question">
              <h4>Question {idx + 1} ({q.type.toUpperCase()})</h4>
              <p className="question-text">{q.question}</p>
              
              {q.type === 'mcq' && q.options && (
                <div className="mcq-options">
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className="option">
                      {String.fromCharCode(65 + i)}) {opt}
                    </div>
                  ))}
                  <p className="correct-answer">Answer: {q.correctAnswer}</p>
                </div>
              )}

              {q.type === 'descriptive' && q.expectedPoints && (
                <div className="expected-points">
                  <strong>Key Points to Cover:</strong>
                  <ul>
                    {q.expectedPoints.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.type === 'topics' && (
        <div className="topics-output">
          <h3>Important Topics</h3>
          {result.topics.map((topic: any, idx: number) => (
            <div key={idx} className="topic-card">
              <h4>{topic.topic}</h4>
              <p>{topic.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {result.type === 'mindmap' && (
        <div className="mindmap-output">
          <h3>Mind Map</h3>
          <div className="mindmap-tree">
            {result.nodes
              .filter((node: any) => node.level === 0)
              .map((node: any) => (
                <MindMapNode key={node.id} node={node} allNodes={result.nodes} />
              ))}
          </div>
        </div>
      )}

      {result.type === 'flashcards' && (
        <div className="flashcards-output">
          <h3>Flashcards Generated</h3>
          <p className="flashcard-count">{result.flashcards.length} flashcards created</p>
          <div className="flashcards-list">
            {result.flashcards.map((card: any, idx: number) => (
              <div key={idx} className={`flashcard difficulty-${card.difficulty}`}>
                <div className="flashcard-front">
                  <strong>Q:</strong> {card.front}
                </div>
                <div className="flashcard-back">
                  <strong>A:</strong> {card.back}
                </div>
                <span className="difficulty-badge">{card.difficulty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MindMapNode({ node, allNodes }: { node: any; allNodes: any[] }) {
  const children = allNodes.filter((n) => node.children.includes(n.id));

  return (
    <div className={`mindmap-node level-${node.level}`}>
      <div className="node-label">{node.label}</div>
      {children.length > 0 && (
        <div className="node-children">
          {children.map((child) => (
            <MindMapNode key={child.id} node={child} allNodes={allNodes} />
          ))}
        </div>
      )}
    </div>
  );
}
