import { Link } from "react-router-dom";
import { ArrowUpRight, Archive } from "lucide-react";
import { Repo } from "../lib/github";
import { ago } from "../lib/utils";
import { LangDot, RepoMark, Stat } from "./ui";

export function RepoCard({ repo, row }: { repo: Repo; row?: boolean }) {
  const desc = repo.description || "No description provided.";
  return (
    <Link to={`/projects/${encodeURIComponent(repo.name)}`} className={`repo group ${row ? "row" : ""}`} aria-label={`${repo.name}: view project`}>
      <div className={row ? "flex items-center gap-4 min-w-0 flex-1" : "flex items-start justify-between gap-4"}>
        <RepoMark name={repo.name} />
        {row && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h3 className="font-display font-semibold tracking-tight truncate">{repo.name}</h3>{repo.archived && <span className="tag"><Archive size={11} />archived</span>}</div>
            <p className="muted text-sm truncate">{desc}</p>
          </div>
        )}
        {!row && <ArrowUpRight size={18} className="faint transition group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </div>
      {!row && (
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2"><h3 className="display h3 truncate">{repo.name}</h3>{repo.archived && <span className="tag"><Archive size={11} />archived</span>}</div>
          <p className="muted text-[0.92rem] leading-relaxed clamp2">{desc}</p>
        </div>
      )}
      <div className={`flex items-center gap-x-4 gap-y-1 flex-wrap text-[0.78rem] faint font-mono ${row ? "shrink-0 hidden sm:flex" : "pt-4 border-t"}`} style={{ borderColor: "var(--line)" }}>
        <LangDot lang={repo.language} />
        <Stat stars={repo.stargazers_count} forks={repo.forks_count} />
        <span>Updated {ago(repo.pushed_at || repo.updated_at)}</span>
      </div>
    </Link>
  );
}
