import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { describeError, fetchRepos } from "../lib/github";
import { useAsync, useSeo } from "../lib/hooks";
import { RepoCard } from "../components/RepoCard";
import { RepoSkeleton, StateBox } from "../components/ui";
import { langColor } from "../lib/utils";

type Sort = "updated" | "created" | "stars" | "name";

export default function Projects() {
  useSeo("Projects", "Browse every public LunexCorp project on GitHub: tools, utilities, libraries and applications, with source downloads and releases.", "/projects");
  const { data, loading, error, reload } = useAsync(fetchRepos, []);
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("All");
  const [sort, setSort] = useState<Sort>("updated");
  const [view, setView] = useState<"grid" | "list">("grid");

  const langs = useMemo(() => {
    const c = new Map<string, number>();
    data?.forEach((r) => r.language && c.set(r.language, (c.get(r.language) || 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data || [])
      .filter((r) => (lang === "All" || r.language === lang) && (!s || [r.name, r.description, r.language, ...(r.topics || [])].some((v) => v?.toLowerCase().includes(s))))
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "stars" ? b.stargazers_count - a.stargazers_count : sort === "created" ? +new Date(b.created_at) - +new Date(a.created_at) : +new Date(b.pushed_at) - +new Date(a.pushed_at));
  }, [data, q, lang, sort]);

  return (
    <>
      <section className="pt-[calc(var(--hdr)+clamp(48px,8vw,100px))] pb-10">
        <div className="wrap">
          <p className="eyebrow mb-5">Project directory</p>
          <h1 className="display h1">Projects.</h1>
          <p className="lead mt-6">Every public repository from the LunexCorp organisation, retrieved live from GitHub. Open a project to read its documentation, or download the source straight away.</p>
        </div>
      </section>
      <section className="pb-28">
        <div className="wrap">
          <div className="sticky top-[var(--hdr)] z-30 -mx-[var(--gutter)] px-[var(--gutter)] py-4 border-y backdrop-blur-xl" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
            <div className="flex flex-col md:flex-row gap-3">
              <label className="relative flex-1"><span className="sr-only">Search projects</span><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 faint" /><input className="input" type="search" placeholder="Search by name, description, topic or language" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              <div className="flex gap-3">
                <label><span className="sr-only">Sort projects</span>
                  <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                    <option value="updated">Recently updated</option><option value="created">Newest</option><option value="stars">Most stars</option><option value="name">Name A to Z</option>
                  </select></label>
                <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: "var(--line2)" }} role="group" aria-label="Layout">
                  {([["grid", LayoutGrid, "Grid layout"], ["list", List, "List layout"]] as const).map(([v, I, label]) => (
                    <button key={v} aria-label={label} aria-pressed={view === v} onClick={() => setView(v)} className="w-11 grid place-items-center transition" style={{ background: view === v ? "var(--fg)" : "transparent", color: view === v ? "var(--bg)" : "var(--fg2)" }}><I size={17} /></button>
                  ))}
                </div>
              </div>
            </div>
            {langs.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mb-1" role="group" aria-label="Filter by language">
                <button className="chip" aria-pressed={lang === "All"} onClick={() => setLang("All")}>All</button>
                {langs.map(([l, n]) => <button key={l} className="chip" aria-pressed={lang === l} onClick={() => setLang(l)}><span className="dot" style={{ background: langColor(l) }} />{l}<span className="opacity-60">{n}</span></button>)}
              </div>
            )}
          </div>

          <p className="font-mono text-xs faint my-6" aria-live="polite">{loading ? "Loading projects…" : data ? `${list.length} of ${data.length} ${data.length === 1 ? "project" : "projects"}` : ""}</p>

          {error ? <StateBox kind="error" title="Could not load projects" text={describeError(error)} onRetry={reload} />
            : loading ? <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-3"}>{Array.from({ length: 6 }, (_, i) => <RepoSkeleton key={i} row={view === "list"} />)}</div>
            : !data?.length ? <StateBox kind="empty" title="No public projects yet" text="Public repositories will appear here automatically as soon as they exist." />
            : !list.length ? <StateBox kind="empty" title="No matching projects" text="Try a different search term or clear the language filter." retryLabel="Clear filters" onRetry={() => { setQ(""); setLang("All"); }} />
            : <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-3"}>{list.map((r) => <RepoCard key={r.id} repo={r} row={view === "list"} />)}</div>}
        </div>
      </section>
    </>
  );
}
