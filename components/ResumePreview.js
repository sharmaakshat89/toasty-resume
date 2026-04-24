'use client'
import DOMPurify from 'dompurify';

export default function ResumePreview({ htmlContent }) {
  if (!htmlContent) return null;

  const copyToClipboard = () => {
    const content = document.getElementById('resume-content');
    if (!content) return;
    
    // Copy as plain text and HTML for better pasting support
    const text = content.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy', err);
    });
  };

  return (
    <div className="neo-box print-full-width" style={{ marginTop: '0', background: 'var(--bg-blue)', color: 'white' }}>
      <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button className="neo-button" style={{ background: 'var(--bg-yellow)', color: 'black' }} onClick={() => window.print()}>Download PDF (Print)</button>
        <button className="neo-button" style={{ background: 'white', color: 'black' }} onClick={copyToClipboard}>Copy Text</button>
      </div>
      <div 
        id="resume-content"
        contentEditable 
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent, { FORCE_BODY: true, ADD_TAGS: ['style'] }) }}
        style={{ 
          padding: '2rem', 
          background: 'white', 
          color: 'black',
          minHeight: '800px', 
          border: '4px solid black'
        }}
        className="resume-document"
      />
    </div>
  );
}