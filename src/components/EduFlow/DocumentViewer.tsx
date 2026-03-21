import { type StudyDocument } from '../../services/studyStorage';
import './DocumentViewer.css';

interface Props {
  document: StudyDocument | null;
}

export function DocumentViewer({ document }: Props) {
  if (!document) {
    return (
      <div className="document-viewer-empty">
        <div className="empty-state">
          <h3>No Document Selected</h3>
          <p>Upload a .txt file to get started</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#888' }}>
            Sample file available: <code>sample-study-material.txt</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <div className="document-header">
        <h3>{document.name}</h3>
        <span className="document-type">{document.type.toUpperCase()}</span>
      </div>

      <div className="document-content">
        {document.type === 'text' && document.content && (
          <pre className="text-content">{document.content}</pre>
        )}

        {document.type === 'text' && !document.content && (
          <div className="empty-state">
            <p>No text content found in this file.</p>
          </div>
        )}

        {(document.type === 'image' || document.type === 'pdf') && (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <h3>⚠️ Limited Support</h3>
            <p>PDF and image analysis is limited in Workspace mode.</p>
            <p style={{ marginTop: '1rem' }}>
              <strong>For image/PDF analysis:</strong>
            </p>
            <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
              <li>Use the <strong>"Doubt Destroyer"</strong> tab to point your camera at the document</li>
              <li>Or copy-paste the text into a .txt file and upload that</li>
            </ul>
            {document.imageData && (
              <img src={document.imageData} alt={document.name} className="image-content" style={{ marginTop: '1rem', maxWidth: '100%', maxHeight: '300px' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
