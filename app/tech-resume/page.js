'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectForm from '../../components/ProjectForm';
import ResumePreview from '../../components/ResumePreview';
import AnimatedGradientText from '../../components/AnimatedGradientText';
import { generateResumeAction } from '../../lib/orchestrator';
import styles from './page.module.css';

export default function TechResume() {
  const [jobDesc, setJobDesc] = useState('');
  const [projects, setProjects] = useState([]);
  const [htmlOutput, setHtmlOutput] = useState('');
  const [missingSkills, setMissingSkills] = useState([]);
  const [fontWeight, setFontWeight] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDesc) {
      alert("Please provide a job description.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateResumeAction(jobDesc, projects);
      setHtmlOutput(result.html);
      setMissingSkills(result.missingSkills || []);
    } catch (e) {
      console.error(e);
      alert(`Error generating resume: ${e.message}`);
    }
    setLoading(false);
  };

  const handleSkillAdd = (skillName) => {
    const skillsDiv = document.getElementById('resume-skills-content');
    if (skillsDiv) {
      const firstCategory = skillsDiv.innerHTML.indexOf('<br');
      if (firstCategory !== -1) {
        skillsDiv.innerHTML = skillsDiv.innerHTML.substring(0, firstCategory) + ', ' + skillName + skillsDiv.innerHTML.substring(firstCategory);
      } else {
        skillsDiv.innerHTML += ', ' + skillName;
      }
      setMissingSkills(prev => prev.filter(s => s !== skillName));
    }
  };

  return (
    <div className={styles.page}>
      {/* Decorative floating elements */}
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.3 }}>✨</motion.div>
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.3 }}>🚀</motion.div>

      <div className={styles.container}>
        <div className={`${styles.pixelifyContent}`}>
          <h1 className={`${styles.title} no-print`}>
            <AnimatedGradientText>Tech Resume Generator</AnimatedGradientText>
          </h1>
          
          <div className={`${styles.grid} no-print`}>
            <div>
              <div className={styles.formBox}>
                <label className={styles.inputLabel}>Job Description</label>
                <textarea 
                  className={styles.textarea}
                  rows={8}
                  placeholder="Paste the job description here..."
                  value={jobDesc} 
                  onChange={e => setJobDesc(e.target.value)} 
                />
              </div>
              
              <ProjectForm projects={projects} setProjects={setProjects} />
              
              <button 
                className={styles.generateButton}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'GENERATING PIPELINE...' : 'GENERATE RESUME'}
              </button>
            </div>
            
            <div style={{ position: 'sticky', top: '2rem' }}>
              <div className="no-print">
                <div className={styles.controls}>
                  <label style={{ fontWeight: '600' }}>Font Weight:</label>
                  <select className={styles.select} value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="500">Medium</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                
                {missingSkills.length > 0 && (
                  <div className={styles.missingSkills}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem' }}>Missing Skills (Click to add):</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {missingSkills.map((skill, idx) => (
                        <button 
                          key={idx} 
                          className={styles.skillButton}
                          onClick={() => handleSkillAdd(skill)}
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* The preview is now back inside the grid column */}
              {htmlOutput ? (
                  <ResumePreview htmlContent={htmlOutput} fontWeight={fontWeight} />
              ) : (
                  <div className={styles.previewPlaceholder}>
                    <h2>Preview will appear here</h2>
                  </div>
              )}
            </div>
          </div>
        </div> {/* End of pixelifyContent */}

        {/* For Print Layout */}
        <div className="print-only" style={{ display: 'none' }}>
          <ResumePreview htmlContent={htmlOutput} />
        </div>
      </div>
    </div>
  );

}
