// Generates sitemap.xml (static routes + live public repos when GitHub is reachable) and robots.txt into dist/.
import { writeFileSync } from "node:fs";
const base = "https://lunexcorp.org", owner = "LunexCorp-Official";
const paths = ["/", "/projects", "/lucif", "/releases"];
try {
  const r = await fetch(`https://api.github.com/users/${owner}/repos?type=owner&per_page=100`, { headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(8000) });
  if (r.ok) (await r.json()).filter((x) => !x.private && x.name.toLowerCase() !== "lucif").forEach((x) => paths.push(`/projects/${encodeURIComponent(x.name)}`));
  else console.warn("sitemap: GitHub returned", r.status, "- static routes only");
} catch (e) { console.warn("sitemap: GitHub unreachable - static routes only"); }
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${base}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
writeFileSync("dist/sitemap.xml", xml);
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
console.log(`sitemap.xml: ${paths.length} URLs`);
