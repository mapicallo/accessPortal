# AccessPortal — Análisis de viabilidad (PWA a11y + IA local Chrome)

Documento de referencia para la idea de **Portal de Mediación** con accesibilidad adaptativa y **Gemini Nano** en el dispositivo.  
**Estado:** exploración / aparcada → retomada (jun 2026)  
**Ecosistema:** [AI4Context](https://www.ai4context.com)  
**Nombre provisional:** AccessPortal o AI4Access

---

## 1. Objetivo del producto

Ofrecer una **PWA instalable** (y opcionalmente extensión compañera) donde personas con distintas necesidades de accesibilidad puedan:

- Traer **contenido que ellas eligen** (texto pegado, documento, imagen, o página/selección vía extensión).
- Obtener **adaptaciones en tiempo real** procesadas **en local** (Prompt API, Summarizer, Rewriter).
- Guardar historial solo en el dispositivo (**IndexedDB**), sin backend AI4Context para el núcleo.

**Promesa de privacidad (realista):** no subir conversaciones ni contenidos a servidores del desarrollador; Chrome/Google gestiona descarga y actualización del modelo on-device.

---

## 2. Origen de la idea y prompt inicial

Idea “aparcada” retomada al conocer las capacidades de **IA nativa en Chrome** (Gemini Nano, Prompt API, Summarizer, Rewriter). Se contrastó un prompt generado por Gemini con la arquitectura real y el know-how de **LocalChat** (extensión Chrome, multimodal, adjuntos, historial local).

### Correcciones críticas al prompt original

| Afirmación del prompt | Realidad técnica |
|----------------------|------------------|
| `window.ai` / `ai.languageModel` global | Usar **`LanguageModel`**, **`Summarizer`**, **`Rewriter`** en `globalThis` |
| PWA extrae contenido pegando **URL** | **CORS** impide fetch arbitrario; hace falta **pegar texto**, subir archivo o **extensión** (“usar esta página/selección”) |
| Android + offline + Gemini Nano pleno | **Desktop-first** (Chrome 148+, Windows/macOS/Linux/Chromebook Plus); móvil **no** asumir paridad en v1 |
| Dictado “local” vía Gemini Nano | **STT** = Web Speech API / SO; Nano interpreta **texto** ya transcrito |
| Summarizer genérico vía Prompt solo | Mejor **Summarizer API** (puntos clave) + **Rewriter** (simplificar) + Prompt para casos puntuales |
| Zero-knowledge / salud sin matices | Sin backend propio sí; **Chrome** gestiona el modelo; no equivale a certificación sanitaria |

### Viabilidad PWA vs extensión

- **Chrome 148+:** Prompt API disponible también en **páginas web** (no solo extensiones). Ver [Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started).
- **LocalChat** sigue siendo extensión porque nació antes y necesita `activeTab` + scripting para pestañas.
- **Recomendación:** PWA principal + **extensión ligera opcional** (v1.1) para enviar página/selección — mismo patrón AI4Context (BkCx, LocalChat, web-apps en `/web-extensions/`).

---

## 3. ¿Qué discapacidades puede asistir y cómo? (visión usuario)

La app **no diagnostica**, **no sustituye** ayudas técnicas oficiales ni adaptaciones legales obligatorias. **Complementa** la comprensión y el uso de contenidos que el usuario trae voluntariamente.

### 3.1 Cognitiva y neurodivergencia  
*(dislexia, TDAH, dificultad de comprensión lectora, sobrecarga informativa, etc.)*

| Problema | Cómo ayuda (Portal cognitivo) |
|----------|-------------------------------|
| Textos largos o con jerga | Resumen en **puntos clave** |
| Párrafos difíciles | **Lectura fácil** bajo demanda (frases cortas, lenguaje directo) |
| Sobrecarga visual | UI minimalista, **OpenDyslexic**, espaciado amplio, pocos estímulos |

**Límites:** no garantiza “lectura fácil” normativa; calidad variable según modelo; textos muy largos pueden truncarse.

### 3.2 Visual  
*(baja visión, dificultad para leer texto en imágenes, contenido sin `alt`)*

| Problema | Cómo ayuda (Portal visual) |
|----------|----------------------------|
| Imagen sin descripción | **Descripción en texto** generada en local (multimodal) |
| Texto en foto / cartel / etiqueta | Transcripción orientada a **lectura en voz alta** |
| Texto pequeño en pantalla | Presentación **ampliada** + compatible con lector de pantalla (`aria-live`) |

**Entrada:** subir imagen o captura; cámara en PWA donde el SO lo permita.  
**Límites:** no sustituye OCR profesional ni orientación/movilidad; no lee “toda la web” sin que el usuario capture o adjunte.

### 3.3 Motora y fatiga  
*(temblor, movilidad reducida en manos, fatiga al escribir, uso de voz)*

| Problema | Cómo ayuda (Portal motor) |
|----------|---------------------------|
| Formularios con muchos campos | **Menos pasos**, botones grandes, flujo guiado |
| Escribir mucho | **Dictado** (Web Speech) + IA que estructura respuesta |
| Clics pequeños | UI con **targets grandes**, confirmaciones claras |

**Límites:** v1 no rellena automáticamente formularios **de otras webs** (riesgo legal/UX); solo flujos **dentro del portal**. Dictado puede usar servicios del navegador/SO — no prometer voz 100 % offline sin validar.

### 3.4 Auditiva *(parcial, indirecto)*

| Problema | Cómo ayuda |
|----------|------------|
| Contenido solo en audio/video sin subtítulos | Usuario pega **transcripción** → resumen / lectura fácil |
| Complemento | Descripciones de texto legibles por **braille display** vía lector de pantalla |

**Límites:** no transcribe audio automáticamente en v1 sin motor STT adicional.

### 3.5 Personas mayores o poco familiarizadas con la tecnología

Beneficio transversal: **menos pasos**, lenguaje claro, resúmenes, interfaz predecible. No es discapacidad en sí, pero encaja en el mismo diseño.

---

## 4. Matriz resumen

| Perfil | Entrada típica | Salida | IA local |
|--------|----------------|--------|----------|
| Cognitivo | Texto pegado / PDF / página (ext.) | Resumen + lectura fácil | Summarizer, Rewriter, Prompt |
| Visual | Imagen / captura / cámara | Descripción accesible ampliada | Prompt multimodal |
| Motor | Voz + formularios del portal | Campos rellenados / confirmación | Prompt sobre texto dictado |
| Auditivo (indirecto) | Transcripción pegada | Resumen / simplificación | Summarizer, Rewriter |

---

## 5. Arquitectura recomendada

```
┌─────────────────────────────────────────────────────────┐
│  PWA AccessPortal (ai4context.com/web-extensions/…)     │
│  • Perfiles: cognitivo | visual | motor                   │
│  • UI WCAG 2.2 AA                                        │
│  • IndexedDB (historial, preferencias)                   │
│  • LanguageModel / Summarizer / Rewriter                 │
└───────────────────────┬─────────────────────────────────┘
                        │ opcional v1.1
┌───────────────────────▼─────────────────────────────────┐
│  Extensión Chrome ligera                                 │
│  • Enviar selección / página al portal                   │
└───────────────────────────────────────────────────────────┘
```

Relación con productos existentes:

- **LocalChat:** Prompt API, multimodal imagen, adjuntos documento — reutilizable como referencia de código.
- **myAI4context:** perfiles de usuario (metáfora distinta: contexto para IA externa).
- **Landing AI4Context:** catálogo, `/web-extensions/*`, patrón PWA embebida.

---

## 6. Estructura de archivos propuesta

```
apps/pwa/
├── manifest.webmanifest
├── index.html
├── sw.js
├── css/
│   ├── base.css
│   └── profiles/   (cognitive.css, visual.css, motor.css)
├── src/
│   ├── main.ts
│   └── lib/         (ai, portals, i18n, ui)
└── fonts/opendyslexic/
```

---

## 7. Requisitos técnicos clave

1. **Detección:** `LanguageModel.availability()` con mismas opciones que `create()` / `prompt()`.
2. **Descarga modelo:** gesto de usuario + `downloadprogress` — ver [Inform users of model download](https://developer.chrome.com/docs/ai/inform-users-of-model-download).
3. **Offline:** shell PWA en caché (SW); inferencia offline tras primera descarga del modelo.
4. **Persistencia:** IndexedDB; sin sync a servidores AI4Context.
5. **Accesibilidad propia:** la UI del portal debe cumplir WCAG (contraste, foco, ARIA, teclado).

---

## 8. Roadmap sugerido

| Fase | Alcance |
|------|---------|
| v0.1 | PWA desktop: portal cognitivo (pegar texto + resumen + lectura fácil) + chequeo de modelo |
| v0.2 | Portal visual (imagen → descripción) |
| v0.3 | IndexedDB historial + perfiles guardados |
| v0.4 | Extensión “enviar página/selección” |
| v0.5 | Portal motor (voz → intención → formularios internos) |
| v1.0 | Ficha catálogo AI4Context + privacidad + revisión accesibilidad UI |

---

## 9. Riesgos y decisiones pendientes

- **Alcance legal:** no presentar la app como dispositivo médico ni sustituto de adaptaciones reglamentarias.
- **Calidad IA:** respuestas pueden alucinar — UI debe advertir y permitir ver original.
- **Móvil:** posponer o modo “solo lectura de historial” sin IA en dispositivos no compatibles.
- **Nombre final:** AccessPortal vs AI4Access vs otro.
- **Ubicación en repo:** monorepo `accessPortal` (decisión jun 2026).

---

## 10. Próximo paso recomendado

**MVP v0.1 — Portal cognitivo only:** pegar texto → comprobar modelo → resumen + simplificar párrafo → UI dyslexia-friendly. Validar en Chrome 148+ desktop antes de invertir en extensión o catálogo.

---

## Referencias

- [Chrome — Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started)
- [Chrome — Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [Chrome — Inform users of model download](https://developer.chrome.com/docs/ai/inform-users-of-model-download)
- Proyecto interno: **LocalChat** (`mapicallo/localChat`) — Prompt API, adjuntos, privacidad local
- `docs/CAPABILITIES.md` (LocalChat) — estilo de límites honestos a replicar en AccessPortal

---

*Última actualización: junio 2026 — borrador de análisis tras revisión del prompt Gemini y aterrizaje por tipo de discapacidad.*
