import { useMemo, useState } from "react";
import { Download, FileArchive, Package, Search, Tag } from "lucide-react";
import { describeError, fetchAllReleases, fetchRepos, Release, tagZipUrl } from "../lib/github";
import { useAsync, useSeo } from "../lib/hooks";
import { renderMarkdown } from "../lib/markdown";
import { SITE } from "../config";
import { bytes, fmtDate } from "../lib/utils";
import { RepoMark, Skeleton, StateBox } from "../components/ui";

function Notes({ r }: { r: Release }) {
  const html = useMemo(() => (r.body ? renderMarkdown(r.body, { owner: SITE.githubOwner, repo: r.repo!, branch: "HEAD" }) : ""), [r]);
  return html ? <div className="prose mt-5 text-[0.92rem]" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="faint text-sm mt-5">No release notes were provided.</p>;
}

export default function Releases() {
  useSeo("Releases", "Release archive for every public LunexCorp project: versions, release notes and downloadable assets.", "/releases");
  const { data, loading, error, reload } = useAsync(async () => {
    const repos = await fetchRepos();
    const res = await fetchAllReleases(repos);
    if (!res.releases.length && res.failed) throw res.lastError;
    return res;
  }, []);
  const [q, setQ] = useState(""); const [repo, setRepo] = useState("all"); const [kind, setKind] = useState<"all" | "stable" | "pre">("all"); const [order, setOrder] = useState<"new" | "old">("new");

  const names = useMemo(() => [...new Set((data?.releases || []).map((r) => r.repo!))].sort(), [data]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const d = (r: Release) => +new Date(r.published_at || r.created_at);
    return (data?.releases || [])
      .filter((r) => (repo === "all" || r.repo === repo) && (kind === "all" || (kind === "pre") === r.prerelease) && (!s || [r.repo, r.name, r.tag_name, r.body].some((v) => v?.toLowerCase().includes(s))))
      .sort((a, b) => (order === "new" ? d(b) - d(a) : d(a) - d(b)));
  }, [data, q, repo, kind, order]);

  return (
    <>
      <section className="pt-[calc(var(--hdr)+clamp(48px,8vw,100px))] pb-10">
        <div className="wrap"><p className="eyebrow mb-5">Release archive</p><h1 className="display h1">Releases.</h1><p className="lead mt-6">Published releases from every public LunexCorp project. Release assets are built files; source ZIPs are an automatic snapshot of the code at that tag.</p></div>
      </section>
      <section className="pb-28">
        <div className="wrap">
          <div className="flex flex-col lg:flex-row gap-3 py-4 border-y" style={{ borderColor: "var(--line)" }}>
            <label className="relative flex-1"><span className="sr-only">Search releases</span><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 faint" /><input className="input" type="search" placeholder="Search releases, versions and notes" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <div className="flex flex-wrap gap-3">
              <label><span className="sr-only">Repository</span><select className="select" value={repo} onChange={(e) => setRepo(e.target.value)}><option value="all">All repositories</option>{names.map((n) => <option key={n}>{n}</option>)}</select></label>
              <label><span className="sr-only">Release type</span><select className="select" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}><option value="all">Stable and pre-release</option><option value="stable">Stable only</option><option value="pre">Pre-release only</option></select></label>
              <label><span className="sr-only">Sort</span><select className="select" value={order} onChange={(e) => setOrder(e.target.value as typeof order)}><option value="new">Newest first</option><option value="old">Oldest first</option></select></label>
            </div>
          </div>
          {!!data?.failed && <p role="status" className="mt-5 text-sm faint">{data.failed} {data.failed === 1 ? "repository" : "repositories"} could not be checked just now, so the archive may be incomplete.</p>}
          <p className="font-mono text-xs faint my-6" aria-live="polite">{loading ? "Loading releases…" : data ? `${list.length} ${list.length === 1 ? "release" : "releases"}` : ""}</p>

          {error ? <StateBox kind="error" title="Could not load releases" text={describeError(error)} onRetry={reload} />
            : loading ? <div className="space-y-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
            : !data?.releases.length ? <StateBox kind="empty" title="No releases published yet" text="Releases will appear here automatically once a public repository publishes one." />
            : !list.length ? <StateBox kind="empty" title="No matching releases" text="Adjust the search or filters." retryLabel="Clear filters" onRetry={() => { setQ(""); setRepo("all"); setKind("all"); }} />
            : <ol className="divide-y" style={{ borderColor: "var(--line)" }}>
              {list.map((r) => (
                <li key={r.id} className="py-10 grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="flex md:flex-col gap-4 md:gap-3 items-center md:items-start"><RepoMark name={r.repo!} /><div><p className="font-display font-semibold">{r.repo}</p><time className="font-mono text-xs faint" dateTime={r.published_at || r.created_at}>{fmtDate(r.published_at || r.created_at)}</time></div></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3"><h2 className="display h3">{r.name || r.tag_name}</h2><span className="tag"><Tag size={11} />{r.tag_name}</span>
                      <span className="tag" style={{ color: r.prerelease ? "#d9b86c" : "var(--accent)", borderColor: "currentColor" }}>{r.prerelease ? "Pre-release" : "Stable"}</span></div>
                    <Notes r={r} />
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <div><h3 className="eyebrow mb-3 inline-flex items-center gap-2"><Package size={13} />Release assets</h3>
                        {r.assets.length ? <ul className="space-y-2 text-sm">{r.assets.map((a) => <li key={a.id}><a className="btn btn-sm w-full justify-between" href={a.browser_download_url}><span className="inline-flex items-center gap-2 truncate"><Download size={14} />{a.name}</span><span className="faint font-mono text-xs">{bytes(a.size)}</span></a></li>)}</ul> : <p className="faint text-sm">No built assets attached to this release.</p>}
                      </div>
                      <div><h3 className="eyebrow mb-3 inline-flex items-center gap-2"><FileArchive size={13} />Source code</h3>
                        <a className="btn btn-sm w-full justify-start" href={tagZipUrl(r.repo!, r.tag_name)}><FileArchive size={14} />Source code (ZIP)</a>
                        <p className="faint text-xs mt-2">Repository snapshot at this tag, not a built release.</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>}
        </div>
      </section>
    </>
  );
}
