# prabuddharajshrestha.com.np

Personal portfolio of **Prabuddha Raj Shrestha**, Senior Project Manager.

Plain HTML, CSS and JavaScript. No build step.

## Run locally

```bash
npx http-server -p 5173
```

## Deploy (GitHub Pages)

1. Repo **Settings → Pages → Source: Deploy from a branch → `main` / root**.
2. The `CNAME` file already sets the custom domain `prabuddharajshrestha.com.np`.
3. At your DNS provider, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `prstha.github.io`
4. Once DNS resolves, tick **Enforce HTTPS** in Settings → Pages.

## Editing content

All content lives in `index.html`. The "A sprint with me" day texts are in `script.js` (`days`).
