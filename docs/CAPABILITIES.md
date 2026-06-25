# AccessPortal — Capabilities & limits

Honest matrix: what AccessPortal can and cannot do by accessibility profile.  
**Version:** 1.2.0 · **Chrome 148+ desktop** · **Gemini Nano on-device**

AccessPortal does **not** diagnose disabilities, replace official assistive technology, or guarantee regulatory “easy read” compliance.

---

## Cognitive profile

| Can do | Cannot do |
|--------|-----------|
| Summarize pasted text or documents (.txt, .md, .pdf) into key points | Read arbitrary URLs (CORS) — paste text, attach a file, or use the Chrome extension |
| Simplify selected text into easier language (local AI) | Guarantee normative “lectura fácil” quality |
| Store preferences and adaptation history on this device (IndexedDB) | Process unlimited length — very long text may be truncated (~40k chars) |
| OpenDyslexic-friendly typography (optional font files) | Replace human judgment for medical/legal decisions |

---

## Visual profile

| Can do | Cannot do |
|--------|-----------|
| Describe uploaded or captured images locally (multimodal Gemini Nano) | Read the entire web without user-provided image or capture |
| Present descriptions for screen readers (`aria-live`) | Replace professional OCR or mobility/orientation aids |
| High-contrast, large-type UI | Guarantee perfect transcription of all photos |

---

## Motor profile

| Can do | Cannot do |
|--------|-----------|
| Dictate into a transcript (Web Speech API — browser/OS may use cloud STT) | Fill forms on external websites |
| Structure dictation into an internal **Accessibility note** form (title + body) | Provide 100% offline voice recognition on all platforms |
| Large buttons, few steps, keyboard navigable | Autofill or submit third-party web forms |

---

## Chrome extension (companion)

| Can do | Cannot do |
|--------|-----------|
| Send visible page text or selection to the open PWA (with on-page confirmation) | Monitor tabs in the background without user action |
| Open/focus the AccessPortal PWA tab | Run on Microsoft Edge (Chrome-only built-in AI in v1) |
| **On-page assistance (opt-in):** simplify selected text in an overlay; describe images on click; apply readable styles (OpenDyslexic, contrast, text size) | Replace entire page text in-place or auto-scan all images |
| Restore the original page (overlay, alt text, styles) | Auto-fill forms on external websites |

---

## Privacy & data

| Statement |
|-----------|
| Core adaptations run **on-device** via Chrome built-in AI (Summarizer, LanguageModel). |
| **No** AI4Context backend receives your pasted text, images, or chat. |
| History and preferences stay in **IndexedDB** / local storage on this device. |
| Google Chrome manages Gemini Nano download, updates, and its own privacy terms. |
| Dictation may use **browser or OS speech services** (not necessarily offline). |

---

## Platform

| Supported | Not supported in v1 |
|-----------|---------------------|
| Chrome 148+ desktop (Windows, macOS, Linux, Chromebook Plus) | Mobile parity for on-device AI |
| PWA installable from HTTPS | Edge Add-ons |
| Optional Chrome extension for page/selection bridge + opt-in in-page assistance | Automatic adaptation of every website |

---

## Contact

- GitHub: https://github.com/mapicallo/accessPortal  
- Ecosystem: https://www.ai4context.com  

---

*Last updated: June 2026*
