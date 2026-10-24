# Inventario de versiones · 24/10/2026

Este registro es una **fotografía verificable del código en GitHub**, no una certificación de la versión publicada ni del funcionamiento de cada aplicación.

## Último commit de la rama `main` observado en GitHub

| Repositorio | Commit (SHA corto) | Fecha UTC | Descripción del último commit |
|---|---|---|---|
| [Henris Gallery](https://github.com/facundocapello-blip/henris-gallery-experience) | [2878a81](https://github.com/facundocapello-blip/henris-gallery-experience/commit/2878a814f6e8eb38788b04cb52d07ae6fb94b6d3) | 2026-10-21 13:36 | deploy: keep Henris URL and publish direct operational AppSheet access |
| [FACU AI HUB](https://github.com/facundocapello-blip/facu-ai-hub) | [e3edbe1](https://github.com/facundocapello-blip/facu-ai-hub/commit/e3edbe14c92c3903cfb638b1049c7b053dfef2e2) | 2026-10-22 18:42 | Implement FACU AI HUB 5.0 with Firebase sync and offline PWA |
| [Mambapalabra](https://github.com/facundocapello-blip/Mambapalabra) | [ce3caa3](https://github.com/facundocapello-blip/Mambapalabra/commit/ce3caa35d18239dd04f424b3d309add03297ab89) | 2026-10-21 01:54 | docs: record RC6 staging release, evidence, regression scope and RC5 rollback |
| [Mambapalabra STAGING](https://github.com/facundocapello-blip/mambapalabra-staging) | [e61b00a](https://github.com/facundocapello-blip/mambapalabra-staging/commit/e61b00a9befd1c7bf903bf06d639dcf36a7b1fe1) | 2026-10-14 03:52 | test(b113): rerun visual gate with compact 12px landscape letters |
| [Margoush Party](https://github.com/facundocapello-blip/margoush-party) | [fdf6f3b](https://github.com/facundocapello-blip/margoush-party/commit/fdf6f3b2c035e44a35bcb34a9fd3b94bceb62e8e) | 2026-10-17 15:28 | docs: V0.8 compact game UI, QA evidence and Safari pending |
| [Punto de Oro](https://github.com/facundocapello-blip/punto-de-oro) | [7050036](https://github.com/facundocapello-blip/punto-de-oro/commit/70500368884c3565fbd5aab6e392612c99be5131) | 2026-09-19 05:20 | Add files via upload |

Fuente: conector GitHub, `GET /repos/{owner}/{repo}/commits/main` consultado el 24/10/2026. Estos seis repositorios son los visibles en la consulta por propietario; otros proyectos pueden estar alojados en otro lugar.

## Discrepancias / candidatos externos (NO sincronizados)

- **Henris Gallery:** el código en `main` termina en `2878a81` (21/10). Las conversaciones del usuario informan una versión HTML/AppSheet preparada el **23/10** que podría ser posterior. **No se verificó que exista como archivo recuperable, que esté publicada ni que reemplazara la versión de GitHub**. Tratarla como *candidata a investigar*; no sobrescribir `main` ni APP de producción.
- **Henris Gallery `PROJECT_STATUS.md`:** indica fecha 15/10 y por lo tanto está desactualizado frente al commit del 21/10; no usarlo como fuente definitiva de la última publicación.
- **Mambapalabra:** el último mensaje de commit de `Mambapalabra` menciona RC6 STAGING, mientras que existe otro repositorio llamado `mambapalabra-staging`. No inferir que el repo con commit más reciente sea el desplegado. Verificar ramas, workflows, URLs y build antes de decidir.
- **FACU AI HUB:** su README describe la versión 5.0. La última revisión del README contiene estados históricos de pruebas/publicación que pueden no reflejar el estado actual; confirmar contra hosting/Actions.

## Política obligatoria antes de modificar una app

1. Consultar repositorio, ramas principales, último SHA, últimos workflows, URL vigente y entorno.
2. Comparar con entregables recientes procedentes de chats, archivos, otras IA o ramas. **Los chats no se sincronizan automáticamente con GitHub**: sólo están disponibles si un conector o un archivo exportado los hace accesibles.
3. Clasificar cada fuente como **confirmado en GitHub**, **publicación comprobada**, **candidato externo**, **reporte del usuario** o **desconocido**.
4. Si hay discrepancia, no partir de una versión antigua ni sobreescribir ninguna fuente; registrar conflicto y resolver contra evidencia.
5. Trabajar en rama de prueba, conservar rollback, no modificar producción empresarial ni AppSheet con datos reales.
6. Mantener un registro por proyecto de: último SHA, URL verificada, tipo de entorno (STAGING/producción), fecha de comprobación, pendiente y próxima acción.

## Pendiente para convertirlo en automatización

- **Este archivo es un inventario manual, NO un agente ni una sincronización continua.**
- Automatizar lectura diaria/semanal de SHAs y workflows con permisos sólo de lectura a repositorios; publicar diferencias como informe/PR, no copiar versiones no validadas.
- Para cambios hechos en chats u otras IA, definir una vía concreta de ingestión (archivo fuente/PR/commit u otra conexión compatible); no afirmar acceso automático al historial completo.
- Antes de integrar con el HUB, validar la URL de despliegue y las pruebas de iPhone sin tocar la versión estable.

**Regla de resolución:** la fecha más nueva no convierte una versión en estable; *versión candidata*, *commit en main* y *versión pública funcional* son estados diferentes.

## Inspección de evidencias — 24/10/2026 14:50 ART

**Alcance:** lectura de GitHub, acciones, releases, páginas HTTPS y manifiestos públicos. No se realizaron pruebas táctiles/micrófono en un iPhone real. No se modificaron aplicaciones ni datos de negocio.

**Comparación con SHAs de referencia:** los seis `main` continúan en los mismos SHAs del inventario del 24/10; no se detectó ningún commit nuevo en `main`. Sin releases nuevos fechados después de los de referencia. Las fechas UTC y mensajes de los últimos commits de `main` ya constan arriba.

### Evidencia adicional que resuelve ambigüedades del inventario inicial

- **Mambapalabra — release etiquetado:** [B1.13.1](https://github.com/facundocapello-blip/Mambapalabra/releases/tag/b1.13.1), publicado el 15/10/2026 18:09 UTC, figura como **no prerelease** y denominado "estable" por el autor. El commit apuntado por la release es `667c403d383928558f7f7237fd3ddb539239bd51` (15/10 16:23:59 UTC). Esto es evidencia de una **release declarada estable**, no de QA físico en iPhone.
- **Mambapalabra STAGING — RC6 publicado y manifiesto confirmado:** rama `ux/b1131-presenter-iphone`, SHA `6fa96e180a49bf3b4b83d43e1f3f349db5a7fe41` (21/10 01:51:54 UTC); [workflow de publicación](https://github.com/facundocapello-blip/mambapalabra-staging/actions/runs/39529752200) concluyó **success**. El [manifiesto HTTPS STAGING_BUILD.json](https://facundocapello-blip.github.io/mambapalabra-staging/STAGING_BUILD.json) responde con `B1.13.1-UX1-FISH398-VOZ-UNICA-RC6-STAGING`, 821 audios Fish, factor 1.22 y dos señales cortas. La rama `main` de este repo sigue en `e61b00a` (14/10): **el SHA de main no identifica el deploy RC6**. La [página STAGING](https://facundocapello-blip.github.io/mambapalabra-staging/) responde, sin equivaler a prueba de voz real en iPhone.
- **Conflicto documental del HUB:** la [web pública FACU AI HUB](https://facundocapello-blip.github.io/facu-ai-hub/) todavía muestra Mambapalabra como "Reportado · Staging v0.9", mientras el manifiesto del STAGING accesible declara **RC6 B1.13.1**. Tratar el rótulo del HUB como **estado reportado/desactualizado**, no como fuente técnica del build actual. No se editó el HUB ni se corrigió el rótulo automáticamente.
- **FACU AI HUB — V5.1 candidata:** rama `staging/v5.1-issue-1`, SHA `0b619f176774bc081c3f4f30f31b1a5f1677aec8` (23/10 14:38:37 UTC), con [workflow de validación](https://github.com/facundocapello-blip/facu-ai-hub/actions/runs/39971382942) **success**. El workflow dice explícitamente **"no production deploy"**. La versión de `main` sigue en `e3edbe1` (V5.0). La rama `staging-v51-dist` apunta a `b4d7aa8` (23/10 14:37:52 UTC), sin asumir que sea el sitio principal publicado.
- **Henris Gallery:** [web principal](https://facundocapello-blip.github.io/henris-gallery-experience/) accesible y rotulada **EXPERIENCE / V1.0**; [presentación STAGING](https://facundocapello-blip.github.io/henris-gallery-experience/staging/henris-gemini-fusion-20261020/) accesible y enlaza a AppSheet. Rama STAGING `staging/henris-gemini-fusion-20261020`, SHA `aa4700c07949b950921f82eb60bd85294cf12e81` (21/10 13:36:22 UTC). [Último workflow de publicación main](https://github.com/facundocapello-blip/henris-gallery-experience/actions/runs/39609525674) **success**. La posible versión HTML del **23/10** sigue **no verificable** como archivo o deploy. La web accesible no demuestra que los formularios AppSheet guarden correctamente.
- **Margoush Party:** `main` `fdf6f3b` (17/10 15:28:46 UTC), [Pages](https://facundocapello-blip.github.io/margoush-party/) accesible y [workflow](https://github.com/facundocapello-blip/margoush-party/actions/runs/39045217369) **success**. La web visible es "Chupete Rush"; no confundirla con otras URLs o versiones de MARGOUSH. Safari físico no verificado.
- **Punto de Oro:** `main` `7050036` (19/09 05:20:19 UTC), [workflow Pages](https://github.com/facundocapello-blip/punto-de-oro/actions/runs/35423685216) **success**. La extracción del [sitio Pages](https://facundocapello-blip.github.io/punto-de-oro/) devolvió `empty_content`: **no permite concluir** que esté caído o funcional; contenido visual o HTML no extraíble es una posibilidad.

**Incidentes históricos:** las planillas antiguas de pruebas no se usaron como prueba de defectos vigentes. El estado funcional actual de AppSheet, voz en Safari físico y juego completo no se da por validado sólo con hojas de prueba o workflows.

**Acción sugerida, sin ejecutarla:** actualizar el estado reportado de Mambapalabra dentro de FACU AI HUB **sólo después de confirmar el modelo de datos de versiones**; mantener separadas la release estable B1.13.1, la candidata RC6 STAGING y el rótulo del HUB. Sin merges ni cambios en producción.
