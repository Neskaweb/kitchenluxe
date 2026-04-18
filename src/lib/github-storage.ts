const GITHUB_API = 'https://api.github.com';

function getConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) {
    throw new Error('Missing GitHub env vars: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN');
  }
  return { owner, repo, token };
}

export async function readJSONFile<T>(filePath: string): Promise<{ data: T; sha: string }> {
  const { owner, repo, token } = getConfig();

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'KitchenLuxe-Autopilot',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`GitHub read failed for ${filePath}: ${res.status}`);

  const file = await res.json() as { content: string; sha: string };
  const decoded = Buffer.from(file.content, 'base64').toString('utf8');
  return { data: JSON.parse(decoded), sha: file.sha };
}

export async function writeJSONFile<T>(
  filePath: string,
  data: T,
  sha: string | undefined,
  commitMessage: string
): Promise<void> {
  const { owner, repo, token } = getConfig();
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

  const body: Record<string, string> = { message: commitMessage, content };
  if (sha) body.sha = sha;

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'KitchenLuxe-Autopilot',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write failed for ${filePath}: ${res.status} - ${err}`);
  }
}
