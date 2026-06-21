# AccessPortal — Plan de implementación

**Producto:** PWA instalable + extensión Chrome compañera (MV3) — accesibilidad web adaptativa con IA integrada del navegador (Gemini Nano).

**Nombre tienda:** AccessPortal — make web content more accessible in Chrome  

**Descripción corta (manifest):** Adaptive web accessibility with Chrome’s built-in AI. Private, on-device.

**Workspace:** `C:\code-accessPortal\`  
**Repositorio:** https://github.com/mapicallo/accessPortal  
**Ecosistema:** [AI4Context](https://www.ai4context.com)

**Documento relacionado:** análisis de viabilidad en `code-rag-java/docs/analisis-access-portal-a11y.md` (copiar o enlazar aquí en Fase 0).

---

## Principios de diseño

1. **Local-first:** Summarizer, Rewriter y Prompt API on-device; sin backend AI4Context para el núcleo.
2. **Accesible en sí misma:** la UI del portal debe cumplir WCAG 2.2 AA (contraste, teclado, ARIA, foco visible).
3. **Honestidad:** no prometer “accesible para todos” ni adaptación automática de toda la web.
4. **Consentimiento explícito:** el usuario trae contenido (pegar, archivo, imagen); la extensión solo lee pestaña tras clic.
5. **Desktop-first:** Chrome 148+; móvil sin IA local en v1.
6. **Incremental:** cada fase produce artefacto desplegable o cargable en `chrome://extensions`.
7. **Stack alineado con LocalChat:** TypeScript, Vite, vanilla TS en UI; ES modules.

---

## APIs correctas (Chromium built-in AI)

| Uso | API | Notas |
|-----|-----|--------|
| Resumen puntos clave | `Summarizer` | Preferir sobre Prompt genérico |
| Simplificar / lectura fácil | `Rewriter` o `LanguageModel` | System prompt estricto si Rewriter no basta |
| Describir imagen | `LanguageModel` multimodal | `expectedInputs: image` |
| Dictado → intención | Web Speech API → texto → `LanguageModel` | Nano no es STT |
| Disponibilidad | `*.availability()` | Mismas opciones que `create()` |
| **No usar** | `window.ai`, `ai.languageModel` | Obsoleto / incorrecto |

Referencias: [Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started), [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [Model download UX](https://developer.chrome.com/docs/ai/inform-users-of-model-download).

Tipos dev: `@types/dom-chromium-ai`.

---

## Perfiles de accesibilidad (producto)

| Perfil | Entrada | Salida | Fase |
|--------|---------|--------|------|
| **Cognitivo** | Texto pegado, PDF (v0.3), página vía ext. (v6) | Resumen + lectura fácil | 2–4 |
| **Visual** | Imagen / captura | Descripción ampliada + `aria-live` | 5 |
| **Motor** | Voz + formularios internos | Campos rellenados en portal | 7 |

---

## Estructura objetivo del repo

```
accessPortal/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md     ← este documento
│   ├── ANALISIS_VIABILIDAD.md     ← copia/resumen del análisis
│   ├── ARCHITECTURE.md
│   ├── CAPABILITIES.md            ← catálogo honesto (límites por discapacidad)
│   ├── FICHA_PRODUCTO.md
│   ├── PRIVACY_STORE.md
│   └── STORE_URLS.md
├── apps/
│   ├── pwa/                       ← PWA principal (Fases 0–5, 7–8)
│   │   ├── public/
│   │   │   ├── manifest.webmanifest
│   │   │   ├── icons/
│   │   │   ├── privacy.html
│   │   │   └── fonts/opendyslexic/
│   │   ├── src/
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── sw.ts              → compilado a sw.js
│   │   │   ├── styles/
│   │   │   │   ├── base.css
│   │   │   │   └── profiles/      (cognitive, visual, motor)
│   │   │   └── lib/
│   │   │       ├── ai/            (capabilities, summarizer, rewriter, languageModel, describeImage)
│   │   │       ├── db/            (indexedDB)
│   │   │       ├── portals/       (cognitive, visual, motor)
│   │   │       ├── profiles/      (selector perfil + persistencia)
│   │   │       ├── i18n.ts
│   │   │       └── ui/
│   │   ├── scripts/
│   │   │   ├── build-pwa.mjs
│   │   │   └── write-placeholder-icons.mjs
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── extension/                 ← compañera (Fase 6+)
│       ├── public/manifest.json
│       ├── src/
│       │   ├── background.ts      # abre PWA + envía contexto
│       │   └── lib/tabBridge.ts
│       └── … (patrón LocalChat)
├── pantallazos/                   # capturas tienda
├── README.md
├── LICENSE
└── .gitignore
```

**Build PWA:** `npm run build` → `apps/pwa/dist/` (servir estático o desplegar en ai4context.com).

**Build extensión:** `apps/extension/dist/` (Fase 6+).

---

## Requisitos de desarrollo

- **Chrome 148+** (desktop): Windows 10/11, macOS 13+, Linux, Chromebook Plus.
- Flags si `availability()` devuelve `unavailable`:
  - `chrome://flags/#prompt-api-for-gemini-nano` → Enabled (multilingual si aplica).
  - Dev: `#optimization-guide-on-device-model` → BypassPerfRequirement.
- Comprobar en consola de la PWA: `await LanguageModel.availability({...})`.
- **Sin Edge en v1:** Gemini Nano / Prompt API no equivalente en Edge para este producto.

---

## Despliegue previsto

| Destino | Uso |
|---------|-----|
| **GitHub Pages** | `privacy.html`, demo |
| **ai4context.com** | `/web-extensions/access-portal/` (Vercel, carpeta `landing/public/` o proxy) |
| **Chrome Web Store** | Extensión compañera (Fase 9) o PWA empaquetada si se opta solo por extensión-launcher |

Decisión Fase 0: PWA canónica en repo `accessPortal`; integración en `code-rag-java/landing` en Fase 10.

---

## Fases

### Fase 0 — Bootstrap del repo (0,5–1 día)

**Objetivo:** repo clonable, build vacío, README, primer push a `main`.

**Tareas:**
- [ ] `git init`, remoto `https://github.com/mapicallo/accessPortal.git`.
- [ ] `.gitignore`: `node_modules`, `dist`, `.env`, `*.zip`, `.idea`.
- [ ] `README.md`: requisitos Chrome 148+, flags, `npm install`, `npm run build`, cómo servir PWA en local.
- [ ] `LICENSE` (MIT, alineado AI4Context).
- [ ] Scaffold `apps/pwa` con Vite (HTML + TS + CSS).
- [ ] `manifest.webmanifest` mínimo + iconos placeholder 192/512.
- [ ] `index.html`: shell AI4Context (header, footer, “AccessPortal — loading…”).
- [ ] Service Worker: cache shell estático (sin cachear respuestas IA).
- [ ] Copiar/adaptar `docs/ANALISIS_VIABILIDAD.md` desde `code-rag-java`.
- [ ] Primer commit + push `main`.

**Criterio de aceptación:** `npm run build` sin errores; PWA abre en `localhost` vía `vite preview` o static server.

---

### Fase 1 — Disponibilidad del modelo (1–2 días)

**Objetivo:** pantalla de estado antes de usar portales.

**Tareas:**
- [ ] `lib/ai/capabilities.ts`: `checkSummarizer()`, `checkLanguageModel()`, estados UI.
- [ ] Estados: `checking`, `unavailable`, `downloadable`, `downloading`, `ready`.
- [ ] UI progreso descarga (`downloadprogress`) — patrón LocalChat.
- [ ] Botón “Preparar IA local” (requiere **gesto de usuario** si `downloadable`).
- [ ] Pantalla `unavailable`: requisitos hardware + enlace docs Chrome.
- [ ] i18n ES/EN mínimo para estados.

**Criterio de aceptación:** en PC compatible, usuario completa descarga y ve “Listo”; en incompatible, mensaje claro.

**Versión:** `0.1.0`

---

### Fase 2 — Portal cognitivo MVP (2–3 días)

**Objetivo:** pegar texto → resumen + simplificar párrafo.

**Tareas:**
- [ ] UI perfil **Cognitivo**: textarea grande, botones “Resumir” / “Simplificar selección”.
- [ ] Estilos cognitivos: OpenDyslexic (woff2 local), `line-height` amplio, modo bajo distracción.
- [ ] `lib/ai/summarizer.ts`: `Summarizer.create({ type: 'key-points' })` + fallback Prompt.
- [ ] `lib/ai/rewriter.ts` o `easyRead.ts`: streaming lectura fácil vía `LanguageModel.promptStreaming()`.
- [ ] Límite caracteres (~40k) + aviso truncado.
- [ ] `aria-live="polite"` en zona de resultados.
- [ ] Aviso legal: “La IA puede equivocarse; consulte el texto original.”

**Criterio de aceptación:** artículo pegado → puntos clave + párrafo simplificado en streaming; usable solo con teclado.

**Versión:** `0.2.0`

---

### Fase 3 — Persistencia y perfiles (1–2 días)

**Objetivo:** guardar preferencias e historial en dispositivo.

**Tareas:**
- [ ] `lib/db/indexedDb.ts`: stores `preferences`, `history` (últimos N textos adaptados).
- [ ] Selector perfil: cognitivo | visual | motor (visual/motor placeholder hasta Fase 5/7).
- [ ] Persistir idioma UI, perfil activo, tamaño fuente.
- [ ] Pantalla historial: abrir / borrar entrada / borrar todo.

**Criterio de aceptación:** recargar PWA mantiene idioma y perfil; historial visible y borrable.

**Versión:** `0.3.0`

---

### Fase 4 — Documentos y pulido cognitivo (2 días)

**Objetivo:** adjuntar PDF/texto como LocalChat.

**Tareas:**
- [ ] Input archivo: `.txt`, `.md`, `.pdf` (pdf.js legacy, bundled).
- [ ] Extracción texto local; mismo flujo resumen / lectura fácil.
- [ ] Botón “Copiar resultado” + “Descargar .txt”.
- [ ] Mejoras UX: cancelar stream, indicador “Escribiendo…”.

**Criterio de aceptación:** PDF de prueba → resumen local sin subir a red AI4Context.

**Versión:** `0.4.0`

---

### Fase 5 — Portal visual (2–3 días)

**Objetivo:** imagen → descripción accesible.

**Tareas:**
- [ ] UI perfil **Visual**: input file + preview; tipografía grande; alto contraste.
- [ ] `lib/ai/describeImage.ts`: multimodal `LanguageModel` con `expectedInputs: image`.
- [ ] Redimensionar imagen (max dim / MB) antes de inferencia.
- [ ] Resultado en `<article aria-live="polite">` optimizado para lectores de pantalla.
- [ ] Cámara (`capture=environment`) solo si probado en target; fallback upload.

**Criterio de aceptación:** captura con texto → descripción útil locutada por NVDA/VoiceOver.

**Versión:** `0.5.0`

---

### Fase 6 — Extensión Chrome compañera (3–4 días)

**Objetivo:** enviar página o selección a la PWA (CORS workaround).

**Tareas:**
- [ ] Scaffold `apps/extension` (MV3, Vite, patrón LocalChat).
- [ ] `manifest`: `activeTab`, `scripting`, `tabs`, `storage`; **sin** sidePanel — popup o action → abre PWA.
- [ ] Botones “Usar esta página” / “Usar selección” (confirmación en página).
- [ ] Puente: `chrome.storage.session` o URL hash / `postMessage` a PWA en ai4context.com.
- [ ] Reutilizar lógica extracción de `LocalChat` (`pageContext.ts`) adaptada.
- [ ] Icono familia AI4Context (accesibilidad: distinto color/forma vs LocalChat).

**Criterio de aceptación:** en artículo web, extensión envía texto a PWA abierta y usuario obtiene resumen.

**Versión extensión:** `0.6.0`

---

### Fase 7 — Portal motor (2–3 días)

**Objetivo:** flujos internos con voz y targets grandes.

**Tareas:**
- [ ] UI perfil **Motor**: botones ≥44px, pocos pasos, confirmaciones claras.
- [ ] Web Speech API → texto → Prompt para estructurar notas / formulario interno.
- [ ] Formulario simple: “Nota de accesibilidad” (título + cuerpo) — no autofill en webs externas.
- [ ] Documentar límites del dictado (puede usar nube del navegador según SO).

**Criterio de aceptación:** dictado rellena formulario interno; navegable solo con teclado y switch.

**Versión:** `0.7.0`

---

### Fase 8 — Capacidades, privacidad, i18n completo (2 días)

**Objetivo:** producto explicable y publicable.

**Tareas:**
- [ ] `docs/CAPABILITIES.md` + `lib/capabilities.ts`: matriz discapacidad → qué hace / qué no.
- [ ] Chip “¿Qué puede hacer AccessPortal?” en UI.
- [ ] `privacy.html` + `privacy.js` bilingüe (patrón LocalChat).
- [ ] i18n completo ES/EN (UI, errores, estados modelo).
- [ ] GitHub Pages: URL pública privacidad.

**Criterio de aceptación:** preguntas sobre límites responden sin alucinar; privacidad abre en pestaña.

**Versión:** `0.8.0`

---

### Fase 9 — Empaquetado Chrome Web Store (3–5 días)

**Objetivo:** extensión compañera en revisión CWS (Chrome only).

**Tareas:**
- [ ] `npm run pack` → ZIP extensión.
- [ ] Capturas 1280×800, icono 128, mosaicos promo.
- [ ] Ficha: nombre, descripción larga, permisos justificados, instrucciones revisor.
- [ ] Política privacidad URL (GitHub Pages / ai4context).
- [ ] `docs/PRIVACY_STORE.md`, `docs/FICHA_PRODUCTO.md`.

**Copy tienda (borrador):**
- **Nombre:** AccessPortal — make web content more accessible in Chrome  
- **Corta:** Adaptive web accessibility with Chrome’s built-in AI. Private, on-device.  
- **Homepage:** https://github.com/mapicallo/accessPortal  
- **Support:** GitHub Issues  

**Criterio de aceptación:** paquete subido a CWS; extensión probada por checklist interno.

**Versión:** `1.0.0`

---

### Fase 10 — Catálogo AI4Context (1 día)

**Objetivo:** visibilidad en ai4context.com.

**Tareas:**
- [ ] Entrada en `code-rag-java/landing`: slug `access-portal`, `STORE_URLS`, traducciones EN/ES.
- [ ] Desplegar PWA en `https://www.ai4context.com/web-extensions/access-portal/` (build copiado o CI).
- [ ] Capturas en `landing/public/images/extensions/accessPortal/`.
- [ ] Chrome link live o “Próximamente en Chrome” hasta aprobación.
- [ ] **Sin botón Edge** (`CHROME_ONLY_STORE_KEYS`).

**Criterio de aceptación:** ficha `/extensions/access-portal` live; PWA instalable desde HTTPS ai4context.

---

## Cronograma orientativo

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 0 Bootstrap | 1 d | 1 d |
| 1 Modelo | 2 d | 3 d |
| 2 Cognitivo MVP | 3 d | 6 d |
| 3 Persistencia | 2 d | 8 d |
| 4 Documentos | 2 d | 10 d |
| 5 Visual | 3 d | 13 d |
| 6 Extensión | 4 d | 17 d |
| 7 Motor | 3 d | 20 d |
| 8 Privacidad/i18n | 2 d | 22 d |
| 9 Tienda | 4 d | 26 d |
| 10 AI4Context | 1 d | 27 d |

*Estimación solo desarrollo; revisión CWS aparte.*

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| IA alucina en lectura fácil | Mostrar original; disclaimer; no uso médico/legal |
| Summarizer/Rewriter no disponible | Fallback unificado Prompt API |
| Usuario espera adaptar cualquier URL | Copy claro; extensión Fase 6 |
| PWA sin IA en móvil | Detectar `unavailable` + mensaje “usa Chrome en escritorio” |
| WCAG audit falla | Probar NVDA/VoiceOver cada fase; checklist axe en CI opcional |

---

## Referencias de código hermano

| Proyecto | Reutilizar |
|----------|------------|
| [localChat](https://github.com/mapicallo/localChat) | `model.ts`, availability UI, multimodal imagen, pdf.js, popup |
| [code-rag-java/landing](https://github.com/mapicallo/code-rag-java) | Patrón `/web-extensions/*`, catálogo, i18n |

---

## Próximo paso inmediato

**Ejecutar Fase 0:** scaffold `apps/pwa`, primer commit en https://github.com/mapicallo/accessPortal, validar build local.

---

*Última actualización: junio 2026*
