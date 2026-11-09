import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, ArrowLeft, Download, ExternalLink, GitBranch, Package, Scale, Tag } from "lucide-react";
import { SITE } from "../config";
import { describeError, fetchLatestRelease, fetchReadme, fetchRepo, tagZipUrl, zipUrl } from "../lib/github";
import { useAsync, useSeo } from "../lib/hooks";
import { renderMarkdown } from "../lib/markdown";
import { bytes, fmtDate } from "../lib/utils";
import { Github, LangDot, RepoMark, Skeleton, StateBox, Stat } from "../components/ui";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { name = "" } = useParams();
  const repoQ = useAsync(() => fetchRepo(name), [name]);
  const repo = repoQ.data;
  const extra = useAsync(async () => {
    if (!repo) return null;
    const [readme, latest] = await Promise.allSettled([fetchReadme(repo.name), fetchLatestRelease(repo.name)]);
    return { readme: readme.status === "fulfilled" ? readme.value : null, readmeFailed: readme.status === "rejected", latest: latest.status === "fulfilled" ? latest.value : null };
  }, [repo?.name]);

  useSeo(repo ? repo.name : "Project", repo?.description || `Project ${name} by LunexCorp on GitHub.`, `/projects/${encodeURIComponent(name)}`);
  const html = useMemo(() => (repo && extra.data?.readme ? renderMarkdown(extra.data.readme, { owner: SITE.githubOwner, repo: repo.name, branch: repo.default_branch }) : ""), [repo, extra.data?.readme]);

  if (repoQ.loading) return <div className="wrap pt-40 pb-32 space-y-5" aria-busy><Skeleton className="h-4 w-24" /><Skeleton className="h-14 w-2/3" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-64 w-full mt-10" /></div>;
  if (repoQ.error) return <div className="wrap pt-40 pb-32"><StateBox kind="error" title="Could not load this project" text={describeError(repoQ.error)} onRetry={repoQ.reload} /></div>;
  if (!repo) return <NotFound />;

  const latest = extra.data?.latest;
  const empty = repo.size === 0;
  return (
    <>
      <section className="pt-[calc(var(--hdr)+40px)] pb-12">
        <div className="wrap">
          <Link to="/projects" className="link-arrow faint mb-10 inline-flex"><ArrowLeft size={15} />All projects</Link>
          <div className="flex items-start gap-5">
            <RepoMark name={repo.name} size={64} />
            <div className="min-w-0">
              <h1 className="display text-[clamp(2rem,5vw,3.6rem)] break-words">{repo.name}</h1>
              <p className="lead mt-4">{repo.description || "No description provided."}</p>
            </div>
          </div>
          {repo.archived && <div role="status" className="mt-8 flex items-center gap-3 border rounded-md px-4 py-3 text-sm" style={{ borderColor: "var(--line2)" }}><Archive size={16} style={{ color: "var(--accent)" }} />This repository is archived. It is read-only and no longer actively maintained.</div>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href={repo.html_url} target="_blank" rel="noopener noreferrer"><Github size={16} />View on GitHub</a>
            {empty ? <span className="btn" aria-disabled="true"><Download size={16} />No source to download yet</span> : <a className="btn" href={zipUrl(repo)} rel="noopener"><Download size={16} />Download ZIP</a>}
            <a className="btn" href={`${repo.html_url}/releases`} target="_blank" rel="noopener noreferrer"><Package size={16} />View releases</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm faint font-mono"><LangDot lang={repo.language} /><Stat stars={repo.stargazers_count} forks={repo.forks_count} /><span className="inline-flex items-center gap-1.5"><GitBranch size={13} />{repo.default_branch}</span><span>Updated {fmtDate(repo.pushed_at || repo.updated_at)}</span></div>
          {!!repo.topics?.length && <div className="mt-5 flex flex-wrap gap-2">{repo.topics.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
        </div>
      </section>

      <section className="pb-28 hairline pt-12">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_320px]">
          <article className="min-w-0 order-2 lg:order-1" aria-label="README">
            <h2 className="eyebrow mb-6">README</h2>
            {extra.loading ? <div className="space-y-3"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-32 w-full" /></div>
              : empty ? <StateBox kind="empty" title="This repository is empty" text="No files have been pushed yet." />
              : extra.data?.readmeFailed ? <StateBox kind="error" title="README unavailable" text="The README could not be loaded from GitHub right now." onRetry={extra.reload} />
              : html ? <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
              : <StateBox kind="empty" title="No README" text="This repository does not include a README file. See the repository on GitHub for details." />}
          </article>
          <aside className="order-1 lg:order-2 space-y-8 lg:sticky lg:top-24 self-start">
            {latest && (
              <div className="border rounded-md p-5" style={{ borderColor: "var(--line2)" }}>
                <h2 className="eyebrow mb-3">Latest release</h2>
                <p className="font-display font-semibold">{latest.name || latest.tag_name}</p>
                <p className="faint text-xs font-mono mt-1 flex items-center gap-2"><Tag size={12} />{latest.tag_name}<span>{fmtDate(latest.published_at)}</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  {latest.assets.map((a) => <li key={a.id}><a className="flex justify-between gap-3 hover:text-[var(--accent)]" href={a.browser_download_url}><span className="truncate inline-flex items-center gap-2"><Download size={13} />{a.name}</span><span className="faint shrink-0 font-mono text-xs">{bytes(a.size)}</span></a></li>)}
                  <li><a className="flex justify-between gap-3 faint hover:text-[var(--fg)]" href={tagZipUrl(repo.name, latest.tag_name)}><span className="inline-flex items-center gap-2"><Download size={13} />Source code (ZIP)</span></a></li>
                </ul>
                {!latest.assets.length && <p className="faint text-xs mt-2">This release has no uploaded assets; only source code is available.</p>}
              </div>
            )}
            <div>
              <h2 className="eyebrow mb-3">Repository</h2>
              <dl className="text-sm divide-y" style={{ borderColor: "var(--line)" }}>
                {([["License", repo.license ? repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : repo.license.name : "Not specified"], ["Created", fmtDate(repo.created_at)], ["Last push", fmtDate(repo.pushed_at)], ["Default branch", repo.default_branch], ["Size", repo.size ? bytes(repo.size * 1024) : "Empty"], ["Open issues", String(repo.open_issues_count)], ["Visibility", "Public"]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5 border-t first:border-t-0" style={{ borderColor: "var(--line)" }}><dt className="faint inline-flex items-center gap-2">{k === "License" && <Scale size={13} />}{k}</dt><dd className="font-medium text-right">{v}</dd></div>
                ))}
              </dl>
              {repo.homepage && /^https?:\/\//.test(repo.homepage) && <a className="link-arrow mt-4" href={repo.homepage} target="_blank" rel="noopener noreferrer">Project website <ExternalLink size={14} /></a>}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
