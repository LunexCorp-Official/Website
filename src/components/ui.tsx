import { ReactNode, CSSProperties } from "react";
import { AlertTriangle, RefreshCw, SearchX, Star, GitFork } from "lucide-react";
import { useReveal } from "../lib/hooks";
import { cn, langColor, num } from "../lib/utils";

export function Reveal({ children, delay = 0, className, as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const ref = useReveal<HTMLDivElement>();
  return <Tag ref={ref as never} className={cn("reveal", className)} style={{ "--d": `${delay}ms` } as CSSProperties}>{children}</Tag>;
}

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden />;
}
export function RepoSkeleton({ row }: { row?: boolean }) {
  return (
    <div className={cn("repo", row && "row")} aria-hidden>
      <Skeleton className="h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-3"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-3/4" /></div>
    </div>
  );
}

export function StateBox({ kind, title, text, onRetry, retryLabel = "Try again" }: { kind: "error" | "empty"; title: string; text: string; onRetry?: () => void; retryLabel?: string }) {
  const Icon = kind === "error" ? AlertTriangle : SearchX;
  return (
    <div role={kind === "error" ? "alert" : "status"} className="flex flex-col items-center text-center gap-4 border border-dashed rounded-md py-16 px-6" style={{ borderColor: "var(--line2)" }}>
      <Icon size={28} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
      <h3 className="display h3">{title}</h3>
      <p className="muted max-w-md text-[0.95rem]">{text}</p>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}><RefreshCw size={14} /> {retryLabel}</button>}
    </div>
  );
}

/** Deterministic geometric mark per repository, echoing the LunexCorp logo planes. */
export function RepoMark({ name, size = 44 }: { name: string; size?: number }) {
  let h = 2166136261;
  for (const c of name) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const pal = ["#ecceb4", "#b58c73", "#6f716f", "#d3cabb", "#8b7d63", "#f1ece1"];
  const pick = (i: number) => pal[((h >>> (i * 4)) & 0xff) % pal.length];
  const x = 14 + (h % 17), y = 14 + ((h >>> 5) % 17), flip = (h >>> 9) & 1;
  const g = flip ? "scale(-1,1) translate(-44,0)" : undefined;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden className="shrink-0 rounded-[3px]">
      <g transform={g}>
        <rect width="44" height="44" fill={pick(0)} />
        <polygon points={`${x},0 44,0 44,${y} ${x},${y}`} fill={pick(1)} />
        <polygon points={`0,${y} ${x},${y} 44,44 0,44`} fill={pick(2)} />
        <polygon points={`${x},${y} 44,${y} 44,44`} fill={pick(3)} />
        <polygon points={`0,0 ${x},0 ${x},${y} 0,${y}`} fill={pick(4)} opacity="0.9" />
      </g>
    </svg>
  );
}

export function LangDot({ lang }: { lang?: string | null }) {
  if (!lang) return null;
  return <span className="inline-flex items-center gap-1.5"><span className="dot" style={{ background: langColor(lang) }} />{lang}</span>;
}
export function Stat({ stars, forks }: { stars: number; forks: number }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="inline-flex items-center gap-1" title="Stars"><Star size={13} />{num(stars)}</span>
      <span className="inline-flex items-center gap-1" title="Forks"><GitFork size={13} />{num(forks)}</span>
    </span>
  );
}

/** Simple GitHub mark (lucide dropped brand icons). */
export function Github({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
