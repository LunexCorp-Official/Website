import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { SITE } from "../config";

export function Footer() {
  return (
    <footer className="hairline bg-themed">
      <div className="wrap py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><img src="/assets/lunexcorp.webp" alt="" width={28} height={28} className="rounded-full" /><span className="font-display font-bold text-lg">LunexCorp</span></div>
          <p className="muted text-sm mt-4 max-w-xs leading-relaxed">Independent software development. Practical tools, intelligent automation and innovative projects.</p>
        </div>
        <FooterCol title="Explore" items={[["Home", "/"], ["Projects", "/projects"], ["Lucif", "/lucif"], ["Releases", "/releases"]]} />
        <div>
          <h4 className="eyebrow mb-4">Elsewhere</h4>
          <ul className="space-y-2.5 text-sm muted">
            <li><a className="hover:text-[var(--fg)]" href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a className="hover:text-[var(--fg)] inline-flex items-center gap-1.5" href={`mailto:${SITE.email}`}><Mail size={14} />Email</a></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-4">Contact</h4>
          <a className="text-sm muted hover:text-[var(--fg)] break-all" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
      <div className="wrap hairline py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs faint">
        <span>&copy; {new Date().getFullYear()} LunexCorp. All rights reserved.</span>
        <span>Lucif is an independent project, not affiliated with or endorsed by WhatsApp or Meta.</span>
      </div>
    </footer>
  );
}
function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h4 className="eyebrow mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm muted">{items.map(([l, to]) => <li key={to}><Link className="hover:text-[var(--fg)]" to={to}>{l}</Link></li>)}</ul>
    </div>
  );
}
