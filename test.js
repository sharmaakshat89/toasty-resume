const html = '<div id="resume-skills-content" style="font-size: 11pt; margin-bottom: 10px;"><b>Languages:</b> JS, Python<br/><b>Tools:</b> Git<br/></div>';
const firstCategory = html.indexOf('<br');
console.log('firstCategory index:', firstCategory);
if (firstCategory !== -1) {
  console.log('Result:', html.substring(0, firstCategory) + ', DOCKER' + html.substring(firstCategory));
}