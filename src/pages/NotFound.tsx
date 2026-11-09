import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSeo } from "../lib/hooks";

export default function NotFound() {
  useSeo("Page not found", "The page you are looking for does not exist.", "/404");
  return (
    <section className="wrap pt-44 pb-32 min-h-[70vh] flex flex-col items-start justify-center">
      <p className="eyebrow mb-5">Error 404</p>
      <h1 className="display h1">Page not found.</h1>
      <p className="lead mt-6">The page you requested does not exist or has moved.</p>
      <div className="mt-10 flex gap-3 flex-wrap"><Link to="/" className="btn btn-primary"><ArrowLeft size={16} />Back home</Link><Link to="/projects" className="btn">Browse projects</Link></div>
    </section>
  );
}
