import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const username = process.env.GITHUB_USERNAME || 'satyamsingh-2s';
const token = process.env.GITHUB_TOKEN;

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} for ${path}: ${body}`);
  }
  return response.json();
}

async function getAllRepos() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await github(`/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&type=owner`);
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

const previous = JSON.parse(await readFile(resolve(root, 'src/data.json'), 'utf8'));
const [profile, repos] = await Promise.all([
  github(`/users/${encodeURIComponent(username)}`),
  getAllRepos()
]);

const languageTotals = new Map();

for (const repo of repos) {
  const languages = await github(`/repos/${repo.full_name}/languages`);
  for (const [language, bytes] of Object.entries(languages)) {
    languageTotals.set(language, (languageTotals.get(language) || 0) + bytes);
  }
}

const totalLanguageBytes = [...languageTotals.values()].reduce((sum, n) => sum + n, 0);
const languages = [...languageTotals.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([name, bytes]) => `${name} ${Math.round((bytes / totalLanguageBytes) * 100)}%`)
  .join(', ');

const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
const forks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
const topRepo = [...repos].sort(
  (a, b) => (b.stargazers_count - a.stargazers_count) || (b.forks_count - a.forks_count)
)[0];

const data = {
  username: profile.login,
  uptime: previous.uptime,
  location: profile.location || previous.location,
  languages: languages || previous.languages,
  email: profile.email || previous.email,
  website: profile.blog || previous.website,
  stats: {
    repos: profile.public_repos,
    stars,
    forks,
    followers: profile.followers,
    commits: previous.stats.commits,
    contributed: previous.stats.contributed,
    prs: previous.stats.prs,
    issues: previous.stats.issues,
    topRepo: topRepo?.name || previous.stats.topRepo,
    topRepoStars: topRepo?.stargazers_count ?? previous.stats.topRepoStars,
    contributions: previous.stats.contributions,
    reviews: previous.stats.reviews
  }
};

await writeFile(resolve(root, 'src/data.json'), JSON.stringify(data, null, 2) + '\n');
console.log('Fetched live GitHub profile/repository data.');
