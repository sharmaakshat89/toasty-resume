export function buildResumeHTML(data) {
  const { personal, skills, projects, experience, education } = data;

  const headerHtml = `
    <div class="resume-header">
      <h1 class="resume-name">${personal.name}</h1>
      <div class="resume-contact">
        ${personal.email} | ${personal.phone} | ${personal.location}
      </div>
    </div>
  `;

  // Skills
  let skillsHtml = '';
  if (skills && skills.length > 0) {
    skillsHtml += `<h2 class="section-title">Technical Skills</h2>`;
    skillsHtml += `<div id="resume-skills-content" style="font-size: 11pt; margin-bottom: 10px;">`;
    skills.forEach(s => {
      let itemsStr = Array.isArray(s.items) ? s.items.join(', ') : (s.items || '');
      skillsHtml += `<b>${s.category || 'Skills'}:</b> ${itemsStr}<br/>`;
    });
    skillsHtml += `</div>`;
  }

  // Projects
  let projectsHtml = '';
  if (projects && projects.length > 0) {
    projectsHtml += `<h2 class="section-title">Projects</h2>`;
    projects.forEach(p => {
      projectsHtml += `
        <div style="margin-bottom: 10px;">
          <div class="item-header">
            <span><b>${p.title || 'Project'}</b> ${p.link ? `(<a href="${p.link}">${p.link}</a>)` : ''} | <i>${p.tech || ''}</i></span>
          </div>
          <ul>
            ${p.points.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      `;
    });
  }

  // Experience
  let expHtml = '';
  if (experience && experience.length > 0) {
    expHtml += `<h2 class="section-title">Experience</h2>`;
    experience.forEach(e => {
      expHtml += `
        <div style="margin-bottom: 5px;">
          <div class="item-header">
            <span><b>${e.company || ''}</b></span>
            <span>${e.duration || ''}</span>
          </div>
          <div class="item-sub">
            <span><i>${e.role || ''}</i></span>
            <span>${e.location || ''}</span>
          </div>
          ${e.points && e.points.length > 0 ? `<ul>${e.points.map(pt => `<li>${pt}</li>`).join('')}</ul>` : ''}
        </div>
      `;
    });
  }

  // Education
  let eduHtml = '';
  if (education && education.length > 0) {
    eduHtml += `<h2 class="section-title">Education</h2>`;
    education.forEach(e => {
      eduHtml += `
        <div style="margin-bottom: 5px;">
          <div class="item-header">
            <span><b>${e.institution}</b></span>
            <span>${e.year}</span>
          </div>
          <div class="item-sub">
            <span><i>${e.degree}</i></span>
            <span>${e.location}</span>
          </div>
        </div>
      `;
    });
  }

  const css = `
    <style>
      .resume-container { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; line-height: 1.2; max-width: 800px; margin: 0 auto; font-weight: inherit; }
      .resume-header { text-align: center; margin-bottom: 15px; }
      .resume-name { font-size: 24pt; font-weight: normal; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px; }
      .resume-contact { font-size: 10pt; }
      .section-title { font-size: 12pt; font-weight: bold; text-transform: capitalize; border-bottom: 1px solid black; margin-top: 10px; margin-bottom: 5px; }
      .item-header { display: flex; justify-content: space-between; align-items: baseline; font-weight: bold; }
      .item-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; margin-bottom: 3px; }
      ul { margin: 0 0 10px 0; padding-left: 20px; }
      li { margin-bottom: 3px; }
      a { color: blue; text-decoration: none; }
    </style>
  `;

  return `${css}<div class="resume-container">${headerHtml}${skillsHtml}${projectsHtml}${expHtml}${eduHtml}</div>`;
}