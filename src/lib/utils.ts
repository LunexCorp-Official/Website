export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const num = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K" : String(n);

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "Date unavailable";

export function ago(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  const units: [number, string][] = [[31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [v, l] of units) if (s >= v) return `${Math.floor(s / v)}${l} ago`;
  return "just now";
}

export const bytes = (b: number) =>
  b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";

export const LANG_COLORS: Record<string, string> = {
  JavaScript: "#e5c07b", TypeScript: "#5b9bd5", Python: "#6a9fcf", Kotlin: "#b48ead", Java: "#c0865a",
  "C++": "#d16d8a", C: "#8a8f98", "C#": "#6bb36b", HTML: "#d9825b", CSS: "#7a8fd9", Shell: "#8fbf7f",
  Pascal: "#c9a063", Delphi: "#c9a063", "Object Pascal": "#c9a063", Go: "#6fc2c9", Rust: "#c98a6f",
};
export const langColor = (l?: string | null) => (l && LANG_COLORS[l]) || "#a8a093";
