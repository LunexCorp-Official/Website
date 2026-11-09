import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import py from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import kotlin from "highlight.js/lib/languages/kotlin";
import cpp from "highlight.js/lib/languages/cpp";
import cs from "highlight.js/lib/languages/csharp";
import yaml from "highlight.js/lib/languages/yaml";
import sql from "highlight.js/lib/languages/sql";
import delphi from "highlight.js/lib/languages/delphi";
import ini from "highlight.js/lib/languages/ini";
import md from "highlight.js/lib/languages/markdown";

const langs: Record<string, any> = { javascript: js, typescript: ts, json, bash, python: py, css, xml, kotlin, cpp, csharp: cs, yaml, sql, delphi, ini, markdown: md };
Object.entries(langs).forEach(([n, l]) => hljs.registerLanguage(n, l));
hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
hljs.registerAliases(["js", "node"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["html", "svg"], { languageName: "xml" });
hljs.registerAliases(["pascal", "dpr"], { languageName: "delphi" });
hljs.registerAliases(["kt"], { languageName: "kotlin" });
hljs.registerAliases(["c", "h"], { languageName: "cpp" });
hljs.registerAliases(["yml"], { languageName: "yaml" });

export interface MdContext { owner: string; repo: string; branch: string }
let ctx: MdContext | null = null;

const isAbsolute = (u: string) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u);
function resolve(u: string, kind: "img" | "link") {
  if (!ctx || isAbsolute(u)) return u;
  const path = u.replace(/^\.?\//, "");
  return kind === "img"
    ? `https://raw.githubusercontent.com/${ctx.owner}/${ctx.repo}/${ctx.branch}/${path}`
    : `https://github.com/${ctx.owner}/${ctx.repo}/blob/${ctx.branch}/${path}`;
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    const href = node.getAttribute("href");
    if (href) {
      const abs = resolve(href, "link");
      node.setAttribute("href", abs);
      if (!abs.startsWith("#")) { node.setAttribute("target", "_blank"); node.setAttribute("rel", "noopener noreferrer nofollow"); }
    }
  }
  if (node.tagName === "IMG") {
    const src = node.getAttribute("src");
    if (src) node.setAttribute("src", resolve(src, "img"));
    node.setAttribute("loading", "lazy");
    node.setAttribute("referrerpolicy", "no-referrer");
  }
});

/** Markdown -> sanitised, highlighted HTML. Repository content is never trusted. */
export function renderMarkdown(src: string, context: MdContext | null = null): string {
  ctx = context;
  const dirty = marked.parse(src, { async: false, gfm: true, breaks: false }) as string;
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select", "iframe", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["style", "srcset"],
  });
  ctx = null;
  const tpl = document.createElement("template");
  tpl.innerHTML = clean;
  tpl.content.querySelectorAll("pre > code").forEach((el) => {
    const m = /language-([\w+-]+)/.exec(el.className);
    const text = el.textContent || "";
    try {
      const r = m && hljs.getLanguage(m[1]) ? hljs.highlight(text, { language: m[1] }) : hljs.highlightAuto(text.slice(0, 4000));
      el.innerHTML = r.value;
      el.classList.add("hljs");
    } catch { /* leave as plain text */ }
  });
  tpl.content.querySelectorAll("table").forEach((t) => {
    const w = document.createElement("div"); w.className = "table-wrap";
    t.replaceWith(w); w.appendChild(t);
  });
  const out = document.createElement("div");
  out.appendChild(tpl.content);
  return out.innerHTML;
}
