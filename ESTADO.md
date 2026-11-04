# ESTADO — FACU AI HUB

Actualizado: 2026-11-04

## Publicado
- `https://facundocapello-blip.github.io/facu-ai-hub/` — rama `main`, 200 y consola sin errores (verificado 02/11). Versión visible en la app: **5.0**.
- Publicado: `origin/main` `361fd76` (seeds de Mambapalabra y Black Mamba con estado verificado + ESTADO actualizado). Local y remoto sincronizados.

## Abierto
- 3 PRs en borrador (#2, #3, #4). No mergear sin revisar.

## Trampas
- Solo entra el Hub: un producto con vida propia va a su propio repo.
- Los datos viven en IndexedDB: el seed nuevo no toca un workspace ya usado; no migrar sin exportar y revisar el respaldo.
- Abrir `index.html` con `file://` muestra la app vacía. Probar la PWA con `npm run preview`.
- `docs/PROJECT_MASTER_CURRENT.md` no existe en este checkout.
