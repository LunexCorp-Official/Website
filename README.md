# LunexCorp website

React + TypeScript + Vite + Tailwind CSS v4. Deploys to Vercel as-is (`vercel.json` rewrites every route to the SPA).

```
npm install
npm run dev      # local development
npm run build    # typecheck, build, generate sitemap.xml + robots.txt in dist/
```

- GitHub owner, WhatsApp number/channel and the demo limit live in `src/config.ts`.
- All project and release data is fetched live from the public GitHub REST API (no token), cached in localStorage for 15 minutes, with stale-cache fallback if the API is rate limited.
- The `Lucif` repository is excluded from every list and from direct URLs (`EXCLUDED_REPOS` in `src/config.ts`).
- README and release-note HTML is sanitised with DOMPurify before rendering.
