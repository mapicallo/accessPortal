# AccessPortal — Ficha de producto (Chrome Web Store)

**Versión extensión:** 1.0.0 · **Fecha:** June 2026  
**Repositorio:** https://github.com/mapicallo/accessPortal

---

## Nombre (CWS)

**AccessPortal — make web content more accessible in Chrome**

---

## Descripción corta (132 caracteres máx.)

**EN:** Adaptive web accessibility with Chrome's built-in AI. Private, on-device.

**ES:** Accesibilidad web adaptativa con la IA integrada de Chrome. Privado, en el dispositivo.

---

## Descripción larga (EN)

AccessPortal is a companion Chrome extension for the AccessPortal progressive web app (PWA). It sends **visible page text** or **text you highlight** to the PWA so you can adapt content with **Gemini Nano on your device** — summaries, easy-read simplification, image descriptions, and motor-profile notes.

**What the extension does**
- Opens or focuses the AccessPortal PWA tab.
- After you confirm on the page, reads visible text from the active tab and sends it to the PWA.
- Sends only your highlighted selection when you choose **Use selection**.
- Stores optional settings (PWA URL, locale) in `chrome.storage.sync`.

**What it does not do**
- Does not read tabs in the background without your click.
- Does not upload content to AI4Context servers.
- Does not autofill forms on external websites.
- Does not run on Microsoft Edge (Chrome-only built-in AI in v1).

**Requirements**
- Chrome 148+ desktop.
- Hardware and flags per [Chrome built-in AI](https://developer.chrome.com/docs/ai/get-started).
- AccessPortal PWA available at the configured URL (production: `https://www.ai4context.com/web-extensions/access-portal/`).

Part of the [AI4Context](https://www.ai4context.com) extension family.

---

## Descripción larga (ES)

AccessPortal es una extensión compañera de Chrome para la PWA AccessPortal. Envía **texto visible de la página** o **texto que resaltas** a la PWA para adaptar contenido con **Gemini Nano en tu dispositivo**: resúmenes, lectura fácil, descripciones de imágenes y notas del perfil motor.

**Qué hace la extensión**
- Abre o enfoca la pestaña de la PWA AccessPortal.
- Tras confirmar en la página, lee el texto visible de la pestaña activa y lo envía a la PWA.
- Envía solo tu selección cuando eliges **Usar selección**.
- Guarda ajustes opcionales (URL de la PWA, idioma) en `chrome.storage.sync`.

**Qué no hace**
- No lee pestañas en segundo plano sin tu clic.
- No sube contenido a servidores de AI4Context.
- No autocompleta formularios en sitios web externos.
- No funciona en Microsoft Edge (IA integrada solo en Chrome en v1).

**Requisitos**
- Chrome 148+ en escritorio.
- Hardware y flags según [IA integrada en Chrome](https://developer.chrome.com/docs/ai/get-started).
- PWA AccessPortal en la URL configurada (producción: `https://www.ai4context.com/web-extensions/access-portal/`).

Parte de la familia de extensiones [AI4Context](https://www.ai4context.com).

---

## Categoría CWS

**Accessibility** (or **Productivity**)

---

## URLs

| Campo | URL |
|-------|-----|
| Homepage | https://github.com/mapicallo/accessPortal |
| Support | https://github.com/mapicallo/accessPortal/issues |
| Privacy policy | https://mapicallo.github.io/accessPortal/privacy.html?lang=en |
| PWA (production) | https://www.ai4context.com/web-extensions/access-portal/ |

---

## Permisos — justificación para el revisor

| Permission | Why |
|------------|-----|
| `storage` | Save UI locale and optional PWA base URL (`ap_pwa_base_url`). |
| `activeTab` | Access the tab the user is on when they click **Use this page** or **Use selection**. |
| `scripting` | Inject a one-time script to read visible or selected text after user confirms on the page. |
| `tabs` | Open or focus the AccessPortal PWA tab and pass imported text via `localStorage` bridge. |
| Host: `localhost` / `127.0.0.1` | Development PWA (`vite preview`). |
| Host: `ai4context.com` | Production PWA deployment. |

---

## Single purpose

Send page text or user selection to the AccessPortal PWA for **local on-device accessibility adaptations** (summarize, easy read, describe images, motor notes).

---

## Notas para el revisor (EN)

1. Install the **AccessPortal PWA** from `https://www.ai4context.com/web-extensions/access-portal/` (or run `npm run preview` in `apps/pwa` at `http://localhost:4173/`).
2. Use **Chrome 148+** on desktop with Gemini Nano available (see `chrome://on-device-internals` or enable `#prompt-api-for-gemini-nano` in `chrome://flags` for dev).
3. Open any article (e.g. a news site), click the AccessPortal extension icon → **Use this page** → confirm the dialog on the page → switch to the AccessPortal tab → use **Summarize** or **Easy read**.
4. No account is required. No data is sent to the developer's servers.
5. Privacy policy: bundled in the extension (`chrome-extension://…/privacy.html`) and at GitHub Pages URL above.

---

## Notas para el revisor (ES)

1. Instala la **PWA AccessPortal** desde `https://www.ai4context.com/web-extensions/access-portal/` (o ejecuta `npm run preview` en `apps/pwa` en `http://localhost:4173/`).
2. Usa **Chrome 148+** en escritorio con Gemini Nano disponible (consulta `chrome://on-device-internals` o activa `#prompt-api-for-gemini-nano` en `chrome://flags` para desarrollo).
3. Abre un artículo, pulsa el icono AccessPortal → **Usar esta página** → confirma en la página → cambia a la pestaña AccessPortal → **Resumir** o **Lectura fácil**.
4. No se requiere cuenta. No se envían datos a servidores del desarrollador.
5. Política de privacidad: incluida en la extensión y en la URL de GitHub Pages indicada arriba.

---

## Assets (generar)

```powershell
cd apps/extension
npm run icons
npm run store-assets
```

| Asset | Path |
|-------|------|
| Icon 128 | `public/icons/icon128.png` |
| Screenshots ×4 | `store-assets/screenshots/AccessPortal-screenshot-*-1280x800.png` |
| Promo small | `store-assets/promo/AccessPortal-promo-small-440x280.jpg` |
| Promo marquee | `store-assets/promo/AccessPortal-promo-marquee-1400x560.jpg` |

Replace generated screenshots with real captures from the running PWA when available.

---

## Empaquetado

```powershell
cd apps/extension
npm run pack
```

Output: `AccessPortal-extension-v1.0.0.zip`

See [CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md) for submission checklist.
