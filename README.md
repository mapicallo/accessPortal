# AccessPortal

**AccessPortal — make web content more accessible in Chrome**

PWA + extensión compañera (AI4Context) para adaptar contenido web con **IA local** (Gemini Nano): lectura fácil, resúmenes, descripción de imágenes y flujos simplificados. Privado, on-device.

Parte del ecosistema [AI4Context](https://www.ai4context.com).

## Estado

**v1.0.0** — Extensión Chrome lista para CWS: `npm run pack`, assets de tienda, ficha y checklist.

Ver [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) y [docs/FICHA_PRODUCTO.md](docs/FICHA_PRODUCTO.md).

**v0.8.0** — Matriz de capacidades/límites (panel determinista), privacidad bilingüe ES/EN, i18n completo en pie de página.

## Requisitos

- **Chrome 148+** (desktop)
- Hardware según [Chrome built-in AI](https://developer.chrome.com/docs/ai/get-started)
- Node.js 20+ (desarrollo)

### Flags de desarrollo (si `availability()` devuelve `unavailable`)

- `chrome://flags/#prompt-api-for-gemini-nano` → Enabled
- Dev: `#optimization-guide-on-device-model` → BypassPerfRequirement

## Desarrollo

### PWA

```bash
cd apps/pwa
npm install
npm run build
npm run preview
```

Abre la URL que muestra `vite preview` (p. ej. `http://localhost:4173`) en Chrome 148+.

### Extensión Chrome

```bash
cd apps/extension
npm install
npm run build
```

Carga `apps/extension/dist/` en `chrome://extensions` (modo desarrollador).  
Empaqueta con `npm run pack` → `AccessPortal-extension-v1.0.0.zip`.

Genera capturas y mosaicos CWS:

```powershell
npm run store-assets
```

Assets en `apps/extension/store-assets/`. Ver [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md).

Flujo: en un artículo web → icono AccessPortal → **Usar esta página** → confirma en la página → se abre la PWA con el texto cargado.

La extensión usa `http://localhost:4173/` por defecto. Producción: `https://www.ai4context.com/web-extensions/access-portal/` (configurable vía `chrome.storage.sync`, clave `ap_pwa_base_url`).

### Perfil motor — dictado

- **Web Speech API** para transcribir voz (puede usar servicios del navegador/SO; no es 100 % offline).
- **Gemini Nano** estructura la transcripción en el formulario interno “Nota de accesibilidad” (título + cuerpo).
- No rellena formularios de otras webs — solo flujos dentro del portal.

## Estructura

```
apps/pwa/          PWA principal (Vite + TypeScript)
apps/extension/    Extensión MV3 compañera
docs/              Plan, análisis de viabilidad
```

## Repositorio

https://github.com/mapicallo/accessPortal

## Licencia

MIT — Manuel Angel Picallo Perez / AI4Context.
