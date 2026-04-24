'use client'

export default function ProjectForm({ projects, setProjects }) {
  const addProject = () => {
    if (projects.length < 3) {
      setProjects([...projects, { name: '', description: '', stack: '', link: '' }]);
    }
  };

  const updateProject = (index, field, value) => {
    const newP = [...projects];
    newP[index][field] = value;
    setProjects(newP);
  };

  const removeProject = (index) => {
    const newP = projects.filter((_, i) => i !== index);
    setProjects(newP);
  };

  return (
    <div className="neo-box" style={{ marginTop: '1rem' }}>
      <h3>Projects (Max 3)</h3>
      {projects.map((proj, i) => (
        <div key={i} style={{ borderBottom: '3px solid black', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>Project {i + 1}</h4>
            <button type="button" onClick={() => removeProject(i)} style={{ background: 'var(--bg-red)', color: 'white', border: '3px solid black', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
          </div>
          <input className="neo-input" placeholder="Project Name" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} />
          <textarea className="neo-input" placeholder="Description (impact, challenges solved)" rows={3} value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} style={{ marginTop: '0.5rem' }} />
          <input className="neo-input" placeholder="Tech Stack (e.g., React, Node, AWS)" value={proj.stack} onChange={e => updateProject(i, 'stack', e.target.value)} style={{ marginTop: '0.5rem' }} />
          <input className="neo-input" placeholder="Deployed Link / GitHub" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} style={{ marginTop: '0.5rem' }} />
        </div>
      ))}
      {projects.length < 3 && <button type="button" className="neo-button" onClick={addProject} style={{ width: '100%', background: 'white', color: 'black' }}>+ Add Project</button>}
    </div>
  );
}