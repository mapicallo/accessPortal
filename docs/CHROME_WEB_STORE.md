# AccessPortal — Chrome Web Store submission

Checklist for publishing the **companion extension** (Chrome only, no Edge in v1).

**Version:** 1.0.0 · **Package:** `apps/extension/AccessPortal-extension-v1.0.0.zip`

---

## Pre-flight

- [ ] Chrome 148+ desktop with Gemini Nano **available** or **downloadable**
- [ ] PWA deployed at `https://www.ai4context.com/web-extensions/access-portal/` **or** local preview documented for reviewer
- [ ] `npm run pack` in `apps/extension` produces ZIP without errors
- [ ] Load unpacked `dist/` — popup opens, privacy link works, **Use this page** flow end-to-end

---

## Internal QA checklist

### Extension popup
- [ ] **Open AccessPortal** opens/focuses PWA tab
- [ ] **Use this page** shows on-page confirm → text appears in PWA cognitive portal
- [ ] **Use selection** works with highlighted text
- [ ] Cancel on-page confirm shows cancelled status (no crash)
- [ ] ES/EN locale switch updates labels
- [ ] **Privacy** opens `privacy.html?lang=…` in new tab
- [ ] Restricted pages (chrome://, Web Store) show clear error

### PWA (companion)
- [ ] Import banner shows after extension send
- [ ] Summarize / easy read produce on-device results
- [ ] Capabilities panel and privacy footer link work
- [ ] Visual and motor profiles functional (smoke test)

### Store listing copy
- [ ] Name: **AccessPortal — make web content more accessible in Chrome**
- [ ] Short description matches [FICHA_PRODUCTO.md](./FICHA_PRODUCTO.md)
- [ ] Long description EN uploaded (optional ES in separate field if supported)
- [ ] Single purpose statement matches privacy policy
- [ ] Privacy URL: `https://mapicallo.github.io/accessPortal/privacy.html?lang=en`
- [ ] Homepage: `https://github.com/mapicallo/accessPortal`
- [ ] Support: GitHub Issues URL

### Assets uploaded to CWS
- [ ] Icon 128×128 (`public/icons/icon128.png`)
- [ ] 4× screenshots 1280×800 (`store-assets/screenshots/`)
- [ ] Small promo 440×280 JPG
- [ ] Marquee promo 1400×560 JPG

### Permissions justification (paste in review notes)
See **Permisos — justificación** in [FICHA_PRODUCTO.md](./FICHA_PRODUCTO.md).

---

## Build commands

```powershell
# Store visuals (Windows; requires .NET System.Drawing)
cd apps/extension
npm run icons
npm run store-assets

# Production ZIP for upload
npm run pack
```

---

## Reviewer test script (paste in CWS "Notes for reviewer")

```
AccessPortal companion extension + PWA (AI4Context).

1. Open https://www.ai4context.com/web-extensions/access-portal/ in Chrome 148+ desktop.
2. Wait for "Local AI is ready" (Gemini Nano). If unavailable, enable chrome://flags/#prompt-api-for-gemini-nano and retry.
3. Open a news article in another tab.
4. Click AccessPortal extension → "Use this page" → confirm on the page.
5. Switch to AccessPortal tab — imported text appears. Click "Summarize key points".
6. Processing stays on-device; no account required.

Privacy: https://mapicallo.github.io/accessPortal/privacy.html?lang=en
Support: https://github.com/mapicallo/accessPortal/issues
```

---

## Post-submission

- [ ] Save CWS item ID when approved
- [ ] Update Phase 10 landing `STORE_URLS` in `code-rag-java`
- [ ] Replace placeholder screenshots with real UI captures if needed

---

## Related docs

- [FICHA_PRODUCTO.md](./FICHA_PRODUCTO.md) — listing copy EN/ES
- [PRIVACY_STORE.md](./PRIVACY_STORE.md) — privacy URLs
- [CAPABILITIES.md](./CAPABILITIES.md) — product limits matrix
