import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SITE } from "../config";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/lucif", label: "Lucif" },
  { to: "/releases", label: "Releases" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className={`nav ${solid || open ? "solid" : ""}`}>
        <nav className="wrap h-full flex items-center justify-between" aria-label="Primary">
          <Link to="/" className="flex items-center gap-3 no-underline" aria-label="LunexCorp home">
            <img src="/assets/lunexcorp.webp" alt="" width={30} height={30} className="rounded-full" />
            <span className="font-display font-bold tracking-tight text-[1.05rem]">LunexCorp</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">{l.label}</NavLink>)}
            <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="nav-link inline-flex items-center gap-1">GitHub <ArrowUpRight size={14} /></a>
          </div>
          <button className="md:hidden p-2 -mr-2" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>
      <div id="mobile-menu" className={`mobile-panel md:hidden ${open ? "open" : ""}`} aria-hidden={!open}>
        {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} tabIndex={open ? 0 : -1}>{l.label}</NavLink>)}
        <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>GitHub <ArrowUpRight size={22} /></a>
      </div>
    </>
  );
}
