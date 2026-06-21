# AccessPortal — Privacy policy (store reference)

## Public URLs

| Environment | URL |
|-------------|-----|
| **Bundled with PWA** | `./privacy.html?lang=en` (same origin as deployed PWA) |
| **Local dev** | `http://localhost:4173/privacy.html?lang=en` |
| **GitHub Pages** (target) | `https://mapicallo.github.io/accessPortal/privacy.html?lang=en` |

Spanish: append `?lang=es` or use the language selector on the page.

## Deployment note

When publishing to GitHub Pages, copy or deploy `apps/pwa/dist/` (includes `privacy.html` and `privacy.js` from `public/`).

For Chrome Web Store (extension, Phase 9), use the GitHub Pages URL above — **not** a `github.com/.../blob/...` link.

**Extension bundled policy:** `chrome-extension://<id>/privacy.html?lang=en` (also shipped in ZIP).

## Store listing

See [FICHA_PRODUCTO.md](./FICHA_PRODUCTO.md) and [CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md).

## Single purpose (extension)

Send page text or user selection to the AccessPortal PWA for local on-device accessibility adaptations.

## Effective date

2 June 2026
