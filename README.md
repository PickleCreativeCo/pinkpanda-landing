# Pink Panda — pre-launch landing page

Static single-page teaser site for Pink Panda (eco-engineered bamboo activewear).
Built from the design handoff in `design_handoff_pinkpanda_landing/`.

## Structure

- `index.html` — page markup
- `css/style.css` — all styles (design tokens as CSS custom properties, responsive at 700px)
- `js/main.js` — scroll progress rail + email form validation/success states
- `assets/` — logos, mascot, background photo (client-supplied)

## Local preview

No build step — it's plain HTML/CSS/JS. Any static file server works, e.g.:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

then open http://localhost:8080. (`serve.ps1` is a tiny local-only dev server; it isn't
needed for deployment — Vercel serves the static files directly.)

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project** → import the repo. No framework/build settings needed
   (static site, output is the repo root).
3. **Project → Settings → Domains** → add the production domain and follow the DNS
   instructions Vercel shows there.

## Known open items

See `design_handoff_pinkpanda_landing/README.md` → "Open Items for the Client" for what's
still outstanding (ESP choice for the email forms, real social URLs, SVG wordmark,
privacy/GDPR copy, favicon/OG image).
