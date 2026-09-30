import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const template = await readFile(resolve(root, 'src/template.svg'), 'utf8');
const data = JSON.parse(await readFile(resolve(root, 'src/data.json'), 'utf8'));

const values = {
  USERNAME: data.username,
  UPTIME: data.uptime,
  LOCATION: data.location,
  LANGUAGES: data.languages,
  EMAIL: data.email,
  WEBSITE: data.website,
  REPOS: data.stats.repos,
  STARS: data.stats.stars,
  FORKS: data.stats.forks,
  FOLLOWERS: data.stats.followers,
  COMMITS: data.stats.commits,
  CONTRIBUTED: data.stats.contributed,
  PRS: data.stats.prs,
  ISSUES: data.stats.issues,
  TOP_REPO: data.stats.topRepo,
  TOP_REPO_STARS: data.stats.topRepoStars,
  CONTRIBUTIONS: data.stats.contributions,
  REVIEWS: data.stats.reviews
};

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

let svg = template;
for (const [key, value] of Object.entries(values)) {
  svg = svg.replaceAll('{{' + key + '}}', escapeXml(value));
}

const unresolved = svg.match(/{{[A-Z0-9_]+}}/g);
if (unresolved) throw new Error('Unresolved placeholders: ' + [...new Set(unresolved)].join(', '));

await writeFile(resolve(root, 'generated/dark_mode.svg'), svg);
console.log('Generated generated/dark_mode.svg');
