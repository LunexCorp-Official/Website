import { EXCLUDED_REPOS, SITE } from "../config";

export interface Repo {
  id: number; name: string; full_name: string; description: string | null; html_url: string;
  homepage: string | null; language: string | null; stargazers_count: number; forks_count: number;
  watchers_count: number; open_issues_count: number; size: number; default_branch: string;
  created_at: string; updated_at: string; pushed_at: string; archived: boolean; fork: boolean;
  private: boolean; topics?: string[]; license: { name: string; spdx_id: string } | null;
}
export interface Asset { id: number; name: string; size: number; download_count: number; browser_download_url: string; content_type: string }
export interface Release {
  id: number; repo?: string; name: string | null; tag_name: string; html_url: string; body: string | null;
  draft: boolean; prerelease: boolean; published_at: string | null; created_at: string; assets: Asset[]; zipball_url: string;
}
export interface GHEvent { id: string; type: string; created_at: string; repo: { name: string }; payload: any }

export class GHError extends Error {
  constructor(public kind: "rate" | "network" | "http", public reset = 0) { super(kind); }
}
export const describeError = (e: unknown) => {
  const k = e instanceof GHError ? e : null;
  if (k?.kind === "rate")
    return `GitHub is limiting requests from this network${k.reset ? ` until about ${new Date(k.reset * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : " for a short while"}.`;
  if (k?.kind === "network") return "GitHub could not be reached. Check your connection and try again.";
  return "GitHub returned an unexpected response.";
};

const API = "https://api.github.com";
const TTL = 15 * 60 * 1000;
const inflight = new Map<string, Promise<unknown>>();

function readCache(key: string): { t: number; v: unknown } | null {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function writeCache(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* storage full or blocked */ }
}

/** Cached GET. Fresh cache wins; on failure a stale cache is served instead. 404 resolves to null. */
async function gh(path: string, raw = false): Promise<any> {
  const key = `lx:${raw ? "raw" : "json"}:${path}`;
  const cached = readCache(key);
  if (cached && Date.now() - cached.t < TTL) return cached.v;
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      let r: Response;
      try {
        r = await fetch(API + path, { headers: { Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json" } });
      } catch { throw new GHError("network"); }
      if (r.status === 404) return null;
      if (r.status === 429 || (r.status === 403 && r.headers.get("x-ratelimit-remaining") === "0"))
        throw new GHError("rate", Number(r.headers.get("x-ratelimit-reset")) || 0);
      if (!r.ok) throw new GHError("http");
      const v = raw ? await r.text() : await r.json();
      writeCache(key, v);
      return v;
    } catch (e) {
      if (cached) return cached.v; // graceful fallback to stale data
      throw e;
    } finally { inflight.delete(key); }
  })();
  inflight.set(key, p);
  return p;
}

const O = encodeURIComponent(SITE.githubOwner);

export async function fetchRepos(): Promise<Repo[]> {
  const all: Repo[] = [];
  for (let page = 1; page < 20; page++) {
    const pg: Repo[] | null = await gh(`/users/${O}/repos?type=owner&per_page=100&page=${page}`);
    if (!pg) break;
    all.push(...pg);
    if (pg.length < 100) break;
  }
  return all.filter((r) => !r.private && !EXCLUDED_REPOS.includes(r.name.toLowerCase()));
}
export const fetchRepo = async (name: string): Promise<Repo | null> => {
  const r: Repo | null = await gh(`/repos/${O}/${encodeURIComponent(name)}`);
  return r && !r.private && !EXCLUDED_REPOS.includes(r.name.toLowerCase()) ? r : null;
};
export const fetchReadme = (name: string): Promise<string | null> => gh(`/repos/${O}/${encodeURIComponent(name)}/readme`, true);
export const fetchLatestRelease = (name: string): Promise<Release | null> => gh(`/repos/${O}/${encodeURIComponent(name)}/releases/latest`);

export async function fetchReleases(name: string): Promise<Release[]> {
  const list: Release[] | null = await gh(`/repos/${O}/${encodeURIComponent(name)}/releases?per_page=50`);
  return (list || []).filter((r) => !r.draft).map((r) => ({ ...r, repo: name }));
}
export async function fetchAllReleases(repos: Repo[]) {
  const res = await Promise.allSettled(repos.map((r) => fetchReleases(r.name)));
  const releases: Release[] = [];
  let failed = 0, lastError: unknown = null;
  res.forEach((x) => (x.status === "fulfilled" ? releases.push(...x.value) : (failed++, (lastError = x.reason))));
  return { releases, failed, lastError };
}
export const fetchEvents = async (): Promise<GHEvent[]> => (await gh(`/orgs/${O}/events?per_page=30`)) || [];

export const zipUrl = (r: Repo) => `https://github.com/${r.full_name}/archive/refs/heads/${encodeURIComponent(r.default_branch)}.zip`;
export const tagZipUrl = (r: string, tag: string) => `https://github.com/${SITE.githubOwner}/${r}/archive/refs/tags/${encodeURIComponent(tag)}.zip`;
