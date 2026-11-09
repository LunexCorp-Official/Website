import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";

const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Lucif = lazy(() => import("./pages/Lucif"));
const Releases = lazy(() => import("./pages/Releases"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Fallback = () => <div className="wrap pt-40 pb-40" aria-busy><div className="skeleton h-8 w-1/3" /></div>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:name" element={<ProjectDetail />} />
            <Route path="lucif" element={<Lucif />} />
            <Route path="releases" element={<Releases />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
