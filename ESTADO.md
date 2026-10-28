# ESTADO — FACU AI HUB

Actualizado: 2026-10-28

## Publicado
- `https://facundocapello-blip.github.io/facu-ai-hub/` — rama `main`, publica
  `.github/workflows/pages.yml` en cada push (corre tests antes). HTTP 200 verificado.
- Último commit: `0eafd59` (AGENTS.md).

## Abierto
- 3 PRs en borrador: **#2, #3, #4**. No mergear sin revisar.
- Datos iniciales de Mambapalabra y Black Mamba actualizados en `src/lib/seeds.ts` con los
  estados/URLs verificados. `docs/PROJECT_MASTER_CURRENT.md` no existe en este checkout.
- La app inicia con datos seed solo si el navegador no tiene un workspace previo. En el Hub ya
  usado, editar seeds no cambia los registros guardados en IndexedDB; no migrarlos sin exportar
  y revisar el respaldo.

## Trampas
- Solo entra el Hub: un producto con vida propia va a su propio repo.
- Los datos viven en IndexedDB: abrir `index.html` con `file://` muestra la app vacía.
- Probar la PWA con `npm run preview`, no con el servidor de desarrollo.
