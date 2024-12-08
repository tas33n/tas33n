const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getTopProjects() {
  const { data: repos } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100
  });

  const topProjects = repos
    .filter(repo => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map(repo => `- [${repo.name}](${repo.html_url}) - ${repo.description || 'No description'}`);

  return topProjects.join('\n');
}

async function updateReadme() {
  const topProjects = await getTopProjects();
  
  let readme = fs.readFileSync('README.md', 'utf8');
  
  const startToken = '<!-- TOP-PROJECTS-LIST:START -->';
  const endToken = '<!-- TOP-PROJECTS-LIST:END -->';
  
  const newContent = `${startToken}\n${topProjects}\n${endToken}`;
  
  readme = readme.replace(
    new RegExp(`${startToken}[\\s\\S]*${endToken}`),
    newContent
  );
  
  fs.writeFileSync('README.md', readme);
}

updateReadme();

