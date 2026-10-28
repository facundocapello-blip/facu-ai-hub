# ESTADO — FACU AI HUB

Actualizado: 2026-10-28

## Publicado
- `https://facundocapello-blip.github.io/facu-ai-hub/` — rama `main`, publica
  `.github/workflows/pages.yml` en cada push (corre tests antes). HTTP 200 verificado.
- Último commit: `0eafd59` (AGENTS.md).

## Abierto
- 3 PRs en borrador: **#2, #3, #4**. No mergear sin revisar.
- `docs/PROJECT_MASTER_CURRENT.md` desactualizado: no sabe de Mambapalabra RC6 en producción
  ni de Black Mamba V1.7M publicada. Es la Fase 2 del plan.

## Trampas
- Solo entra el Hub: un producto con vida propia va a su propio repo.
- Los datos viven en IndexedDB: abrir `index.html` con `file://` muestra la app vacía.
- Probar la PWA con `npm run preview`, no con el servidor de desarrollo.
