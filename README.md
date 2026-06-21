# AccessPortal

**AccessPortal — make web content more accessible in Chrome**

PWA + extensión compañera (AI4Context) para adaptar contenido web con **IA local** (Gemini Nano): lectura fácil, resúmenes, descripción de imágenes y flujos simplificados. Privado, on-device.

Parte del ecosistema [AI4Context](https://www.ai4context.com).

## Estado

**v0.4.0** — Fases 0–4: portal cognitivo, persistencia, adjuntos PDF/txt/md, copiar y descargar resultados.

Ver [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) para el roadmap completo.

## Requisitos

- **Chrome 148+** (desktop)
- Hardware según [Chrome built-in AI](https://developer.chrome.com/docs/ai/get-started)
- Node.js 20+ (desarrollo)

### Flags de desarrollo (si `availability()` devuelve `unavailable`)

- `chrome://flags/#prompt-api-for-gemini-nano` → Enabled
- Dev: `#optimization-guide-on-device-model` → BypassPerfRequirement

## Desarrollo

```bash
cd apps/pwa
npm install
npm run build
npm run preview
```

Abre la URL que muestra `vite preview` (p. ej. `http://localhost:4173`) en Chrome 148+.

## Estructura

```
apps/pwa/          PWA principal (Vite + TypeScript)
docs/              Plan, análisis de viabilidad
```

## Repositorio

https://github.com/mapicallo/accessPortal

## Licencia

MIT — Manuel Angel Picallo Perez / AI4Context.
