import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, GitCommit, GitPullRequest, Package, Plus, Star, GitBranch } from "lucide-react";
import { SITE } from "../config";
import { fetchEvents, fetchRepos, describeError, GHEvent, Repo } from "../lib/github";
import { useAsync, useSeo } from "../lib/hooks";
import { ago } from "../lib/utils";
import { Reveal, RepoSkeleton, StateBox, Skeleton, Github } from "../components/ui";
import { RepoCard } from "../components/RepoCard";

function HeroArt() {
  return (
    <svg viewBox="0 0 600 600" className="w-full h-auto" role="img" aria-label="Abstract composition of overlapping geometric planes">
      <defs>
        <clipPath id="disc"><circle cx="300" cy="300" r="270" /></clipPath>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <circle cx="300" cy="300" r="292" fill="none" stroke="rgba(241,236,225,.12)" />
      <circle cx="300" cy="300" r="282" fill="none" stroke="rgba(199,156,130,.5)" strokeDasharray="2 10" style={{ transformOrigin: "300px 300px", animation: "spin 90s linear infinite" }} />
      <g clipPath="url(#disc)">
        <rect width="600" height="600" fill="#1b1a18" />
        <polygon className="f2" points="30,30 250,30 250,330 30,330" fill="#ecceb4" />
        <polygon className="f1" points="250,30 380,30 380,300 250,330" fill="#f1ece1" />
        <polygon className="f2" points="380,30 600,30 600,230 380,300" fill="#d3cabb" />
        <polygon className="f1" points="30,330 250,330 300,420 30,600" fill="#6f716f" />
        <polygon className="f2" points="380,300 600,230 600,600 330,600 300,420" fill="#b58c73" />
        <polygon className="f1" points="250,330 380,300 410,380 330,470 240,400" fill="#8b7d63" />
        <polygon points="250,330 380,300 410,380 330,470 240,400" fill="url(#sheen)" />
        <line x1="250" y1="30" x2="250" y2="330" stroke="rgba(0,0,0,.25)" /><line x1="30" y1="330" x2="300" y2="420" stroke="rgba(0,0,0,.2)" />
      </g>
    </svg>
  );
}

function Hero() {
  const repos = useAsync(fetchRepos, []);
  return (
    <section className="relative pt-[calc(var(--hdr)+clamp(48px,9vw,110px))] pb-20 overflow-hidden">
      <div className="grid-bg absolute inset-0 pointer-events-none" aria-hidden />
      <div className="wrap relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-2"><span className="dot live-dot" style={{ background: "var(--accent)" }} />Independent software studio</p>
          <h1 className="display h1">Software built<br />with purpose.</h1>
          <p className="lead mt-7">Independent software development. Practical tools, intelligent automation and innovative projects, built to make technology work better.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/projects" className="btn btn-primary">Explore our projects <ArrowRight size={16} /></Link>
            <Link to="/lucif" className="btn">Discover Lucif</Link>
          </div>
          <p className="mt-10 font-mono text-xs faint flex items-center gap-2" aria-live="polite">
            <Github size={14} />
            {repos.loading ? <Skeleton className="h-3 w-44" /> : repos.data ? `${repos.data.length} public ${repos.data.length === 1 ? "repository" : "repositories"} on GitHub` : "Projects hosted on GitHub"}
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none"><HeroArt /></div>
      </div>
    </section>
  );
}

function Flagship() {
  return (
    <section className="hairline" data-theme="lucif" style={{ background: "#050806", color: "#e9f1ec", "--fg": "#e9f1ec", "--fg2": "#a9b8b0", "--fg3": "#7f9086", "--line": "rgba(34,255,68,.13)", "--line2": "rgba(34,255,68,.3)", "--accent": "#22ff44", "--accent-ink": "#031006", "--bg": "#050806" } as React.CSSProperties}>
      <div className="wrap section grid gap-12 md:grid-cols-[auto_1fr] items-center">
        <Reveal><img src="/assets/lucif.webp" alt="Lucif mask logo" width={260} height={260} className="w-40 md:w-64 rounded-full" style={{ boxShadow: "0 0 90px -20px rgba(34,255,68,.45)" }} /></Reveal>
        <Reveal delay={100}>
          <p className="eyebrow mb-4">Flagship product</p>
          <h2 className="display h2">Lucif.<br /><span style={{ color: "var(--accent)" }}>Your WhatsApp group, under control.</span></h2>
          <p className="lead mt-6">An intelligent WhatsApp assistant combining entertainment, group management, moderation and useful tools in one place.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/lucif" className="btn btn-primary">Discover Lucif <ArrowRight size={16} /></Link><Link to="/lucif#demo" className="btn">Try the demo</Link></div>
        </Reveal>
      </div>
    </section>
  );
}

function Featured() {
  const { data, loading, error, reload } = useAsync(async () => {
    const r = await fetchRepos();
    return [...r].filter((x) => !x.fork && !x.archived).sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at)).slice(0, 6);
  }, []);
  return (
    <section className="section hairline">
      <div className="wrap">
        <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div><p className="eyebrow mb-4">Selected work</p><h2 className="display h2">Open projects.</h2></div>
          <Link to="/projects" className="link-arrow">All projects <ArrowRight size={16} /></Link>
        </Reveal>
        {error ? <StateBox kind="error" title="Projects unavailable" text={describeError(error)} onRetry={reload} /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? Array.from({ length: 6 }, (_, i) => <RepoSkeleton key={i} />) : data!.length ? data!.map((r: Repo, i: number) => <Reveal key={r.id} delay={i * 60}><RepoCard repo={r} /></Reveal>) : <div className="sm:col-span-3"><StateBox kind="empty" title="No public projects yet" text="Public repositories will appear here automatically." /></div>}
          </div>
        )}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="light bg-themed">
      <div className="wrap section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal><p className="eyebrow mb-4">About LunexCorp</p><h2 className="display h2">Small studio.<br />Careful engineering.</h2></Reveal>
        <Reveal delay={120}>
          <p className="text-xl leading-relaxed" style={{ color: "var(--fg)" }}>LunexCorp is an independent software development studio. We build software, utilities, applications and automation tools, and publish many of them openly on GitHub.</p>
          <p className="lead mt-5">Every project is built to be useful first: dependable, well structured and documented, with attention to the details that make software pleasant to rely on.</p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: "var(--line2)" }}>
            {[["Software", "Applications and utilities"], ["Automation", "Bots and tooling"], ["Open source", "Public on GitHub"]].map(([a, b]) => (
              <div key={a}><dt className="font-display font-bold text-lg">{a}</dt><dd className="text-sm faint mt-1">{b}</dd></div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function eventLine(e: GHEvent): { icon: React.ReactNode; text: string } | null {
  const repo = e.repo.name.split("/").pop();
  switch (e.type) {
    case "PushEvent": {
      const n = e.payload?.size ?? e.payload?.commits?.length ?? 0;
      const msg = e.payload?.commits?.[e.payload.commits.length - 1]?.message?.split("\n")[0];
      return { icon: <GitCommit size={15} />, text: `Pushed ${n || "new"} commit${n === 1 ? "" : "s"} to ${repo}${msg ? `: ${msg}` : ""}` };
    }
    case "ReleaseEvent": return { icon: <Package size={15} />, text: `Published ${e.payload?.release?.name || e.payload?.release?.tag_name || "a release"} in ${repo}` };
    case "CreateEvent": return { icon: <Plus size={15} />, text: `Created ${e.payload?.ref_type === "repository" ? "repository" : e.payload?.ref_type} ${e.payload?.ref ? e.payload.ref + " in " : ""}${repo}` };
    case "PullRequestEvent": return { icon: <GitPullRequest size={15} />, text: `${e.payload?.action === "closed" && e.payload?.pull_request?.merged ? "Merged" : e.payload?.action} a pull request in ${repo}` };
    case "WatchEvent": return { icon: <Star size={15} />, text: `${repo} was starred` };
    default: return null;
  }
}

function Activity() {
  const { data, loading, error } = useAsync(async () => {
    const ev = (await fetchEvents()).map((e) => ({ e, l: eventLine(e) })).filter((x) => x.l).slice(0, 7);
    if (ev.length) return { kind: "events" as const, ev };
    const repos = [...(await fetchRepos())].sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at)).slice(0, 6);
    return { kind: "repos" as const, repos };
  }, []);
  return (
    <section className="section hairline">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal><p className="eyebrow mb-4">GitHub activity</p><h2 className="display h2">Built in the open.</h2><p className="lead mt-5">Recent public development across the LunexCorp organisation, pulled live from GitHub.</p><a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="btn mt-8"><Github size={16} />Follow on GitHub</a></Reveal>
        <Reveal delay={100}>
          <div className="border-t" style={{ borderColor: "var(--line)" }}>
            {loading && Array.from({ length: 5 }, (_, i) => <div key={i} className="py-5 border-b" style={{ borderColor: "var(--line)" }}><Skeleton className="h-4 w-4/5" /></div>)}
            {error ? <p className="py-6 muted text-sm" role="alert">{describeError(error)} Recent activity is available on <a className="underline" href={SITE.githubUrl}>GitHub</a>.</p> : null}
            {data?.kind === "events" && data.ev.map(({ e, l }) => (
              <div key={e.id} className="flex gap-4 items-start py-4 border-b" style={{ borderColor: "var(--line)" }}>
                <span className="mt-0.5 faint">{l!.icon}</span><p className="flex-1 text-[0.93rem] muted min-w-0 break-words">{l!.text}</p><time className="font-mono text-xs faint shrink-0" dateTime={e.created_at}>{ago(e.created_at)}</time>
              </div>
            ))}
            {data?.kind === "repos" && data.repos.map((r) => (
              <Link key={r.id} to={`/projects/${r.name}`} className="flex gap-4 items-center py-4 border-b no-underline hover:bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] px-1" style={{ borderColor: "var(--line)" }}>
                <GitBranch size={15} className="faint" /><span className="flex-1 text-[0.93rem]">Updated <b className="font-semibold">{r.name}</b></span><time className="font-mono text-xs faint" dateTime={r.pushed_at}>{ago(r.pushed_at)}</time>
              </Link>
            ))}
            {data && data.kind === "repos" && !data.repos.length && <p className="py-6 muted text-sm">No public activity yet.</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="light bg-themed">
      <div className="wrap section text-center">
        <Reveal><h2 className="display h2 max-w-2xl mx-auto">See what we are building.</h2><p className="lead mx-auto mt-5">Browse every public project, download the source or follow development on GitHub.</p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center"><Link to="/projects" className="btn btn-primary">Explore projects <ArrowRight size={16} /></Link><a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="btn">Visit GitHub <ArrowUpRight size={16} /></a></div></Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useSeo("LunexCorp | Software built with purpose.", "LunexCorp is an independent software development studio. Practical tools, intelligent automation and innovative projects, built to make technology work better.", "/");
  return <><Hero /><Featured /><Flagship /><About /><Activity /><Cta /></>;
}
