'use client'
import { useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import ResumePreview from '../../components/ResumePreview';
import { generateResumeAction } from '../../lib/orchestrator';

export default function TechResume() {
  const [jobDesc, setJobDesc] = useState('');
  const [projects, setProjects] = useState([]);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDesc) {
      alert("Please provide a job description.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateResumeAction(jobDesc, projects);
      setHtmlOutput(result);
    } catch (e) {
      console.error(e);
      alert(`Error generating resume: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 className="no-print" style={{ fontSize: '2.5rem', background: 'var(--bg-black)', color: 'white', display: 'inline-block', padding: '0.5rem 1rem', border: '4px solid black', marginBottom: '2rem' }}>TECH RESUME GENERATOR</h1>
      
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div>
          <div className="neo-box">
            <h3 style={{ background: 'var(--bg-blue)', color: 'white', display: 'inline-block', padding: '0.25rem 0.5rem', margin: '0 0 1rem 0', border: '3px solid black' }}>Job Description</h3>
            <textarea 
              className="neo-input" 
              rows={8}
              placeholder="Paste the job description here..."
              value={jobDesc} 
              onChange={e => setJobDesc(e.target.value)} 
            />
          </div>
          
          <ProjectForm projects={projects} setProjects={setProjects} />
          
          <button 
            className="neo-button" 
            style={{ width: '100%', marginTop: '2rem', padding: '1.5rem', fontSize: '1.5rem', background: 'var(--bg-red)', color: 'white' }} 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'GENERATING PIPELINE...' : '>> GENERATE RESUME <<'}
          </button>
        </div>
        
        <div style={{ position: 'sticky', top: '2rem' }}>
          {htmlOutput ? (
             <ResumePreview htmlContent={htmlOutput} />
          ) : (
             <div className="neo-box" style={{ height: '800px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', background: '#ccc' }}>
               <h2>Preview will appear here</h2>
             </div>
          )}
        </div>
      </div>

      {/* For Print Layout */}
      <div className="print-only" style={{ display: 'none' }}>
        <ResumePreview htmlContent={htmlOutput} />
      </div>
    </div>
  );
}