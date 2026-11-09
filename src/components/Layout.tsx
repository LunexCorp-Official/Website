import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.documentElement.dataset.theme = pathname.startsWith("/lucif") ? "lucif" : "lunex";
  }, [pathname]);
  useEffect(() => {
    if (hash) { setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60); }
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="bg-themed min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-[60] focus:top-3 focus:left-3 btn btn-primary btn-sm">Skip to content</a>
      <Nav />
      <main id="main" key={pathname} className="page-enter flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
