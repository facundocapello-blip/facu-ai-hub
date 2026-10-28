# FACU AI HUB — reglas para trabajar acá

Leer `README.md` primero. Es el registro central de la cartera, no un lugar para productos.

## Qué entra
- **Solo el Hub**: React/TypeScript, tests, reglas de Firebase y su documentación.
- Un producto con vida propia va a su **propio repo**. Una rama que contenga otro producto
  se separa y se borra.
- No crear otro gestor de proyectos: este es el único.

## Desarrollo
Node 22 (`.nvmrc`), npm. En esta máquina se probó también con Node 24.

```sh
npm ci
npm run dev
npm test          # lógica de tracking, intención y migración
npm run build     # TypeScript + bundle + Service Worker
npm run test:e2e  # Chromium: flujo móvil, persistencia, offline
```

- No instalar paquetes desde CDN en el navegador.
- HTTPS es obligatorio fuera de localhost.
- Probar la PWA con `npm run preview`, no con el servidor de desarrollo.

## Publicación
`.github/workflows/pages.yml` publica en cada push a **`main`**: corre `npm test`, `npm run build`
con `VITE_BASE_PATH` y sube el artefacto. Si los tests fallan, no publica.
`.github/workflows/checks.yml` valida los PRs.

Después de pushear a `main`, esperar el workflow y verificar la URL en vivo.

## Estado conocido
- 3 PRs en borrador: **#2, #3, #4**. No mergear sin revisar.
- `docs/PROJECT_MASTER_CURRENT.md` está desactualizado: no sabe de Mambapalabra RC6 en
  producción ni de Black Mamba V1.7M publicada. Se corrige en la Fase 2 del plan.
- Los datos viven en IndexedDB del navegador. Cambiar de origen o de almacenamiento rompe la
  migración: no abrir el `index.html` con `file://` esperando ver los datos.
