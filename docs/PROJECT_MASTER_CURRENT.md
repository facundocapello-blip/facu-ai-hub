# Registro maestro actual — 26/10/2026 (ART)

**Alcance:** 26 proyectos y flujos. Actualizado por análisis combinado de conversaciones recuperables (principalmente 23–26/10), GitHub, Floot, Vercel y páginas HTTPS. No equivale a acceso completo a todos los chats. Un despliegue READY no significa QA física en Safari.

**Ubicación:** rama aislada `audit/version-index-2026-10-24`, PR #3. **No se modifica main ni apps en producción.**

## Matriz de continuidad

| Prioridad | Proyecto | Estado más reciente | Evidencia / alcance | Próxima acción sin repetir trabajo | URL |
|---|---|---|---|---|---|
| P1 | Henris Gallery | STAGING publicada 21/10, AppSheet separado | GitHub main `2878a81`; web principal EXPERIENCE V1.0; STAGING Gemini Fusion URL responde. HTML 23/10 es candidato no comprobado. | No reabrir pruebas resueltas de AppSheet 1.000031; investigar candidato 23/10 solo si se recupera archivo. | https://facundocapello-blip.github.io/henris-gallery-experience/staging/henris-gemini-fusion-20261020/ |
| P1 | FACU AI HUB | V5.0 en main; V5.2 STAGING con conciliación automática publicada | Main `e3edbe1` intacta. [PR #4](https://github.com/facundocapello-blip/facu-ai-hub/pull/4) rama `staging/v5.2-master-registry`, SHA `216954b`; CI completo aún no certificado en este registro. Deploy independiente Vercel `dpl_6vAaHKwcpw5c7TNrYfWHRVCwM7ch` READY. Página HTTPS verificada: compara 26 estados auditados, preserva notas y próximos pasos históricos, refresca al abrir y cada 6 horas en primer plano; `VITE_LOCAL_ONLY=true`, Firebase producción intacto. Safari físico sin verificar. | Mantener V5.0 estable; terminar CI cloud y QA móvil; no promover V5.2 sin aprobación. | https://facu-ai-hub-v52-staging-4fkmmcuca-facundocapello-8441.vercel.app/ |
| P1 | Experiencia ChatGPT y control versiones | Vigilancia cada 6 h activa; registro PR #3 | GitHub 6 repositorios sin nuevos commits en main al 26/10. Últimas apps viven además en Vercel y Floot. | Extender vigilancia a aplicaciones fuera de GitHub; no volver a ejecutar pruebas antiguas aprobadas. | https://github.com/facundocapello-blip/facu-ai-hub/pull/3 |
| P2 | Mambapalabra estable | Release B1.13.1 declarada estable | GitHub main `ce3caa3` es documentación RC6; release estable B1.13.1 separada; producción preservada. | No promocionar RC6 sin aprobación; evitar base B1.11 histórica. | https://facundocapello-blip.github.io/Mambapalabra/ |
| P2 | Mambapalabra STAGING | B1.13.1 Fish398 RC6 online | Manifiesto HTTPS 26/10: 821 audios, velocidad 1.22; `main` de repo staging `e61b00a` NO representa el deploy RC6. | Pendiente evaluación auditiva/micrófono Safari físico, no rehacer CI ya exitoso. | https://facundocapello-blip.github.io/mambapalabra-staging/ |
| P2 | Living Design Studio — HTML autónomo | Publicado Vercel 25/10 (20 muebles) | Proyecto Vercel READY y web HTTPS 26/10: objetos independientes mover/girar/escalar/inclinar; editor 2.5D. | Conservar base, incorporar muebles reales PNG transparentes; Safari físico no verificado. | https://living-design-zip-html-preview.vercel.app/ |
| P2 | Living Design Studio — AI 2D/3D | Candidato AI Studio sin publicación validada | Conversación 26/10: servidor Gemini compilado, API 503/timeout o HTML; no evidencia de endpoint funcional online. | Reparar endpoint/JSON sin sobrescribir la versión 2.5D publicada. | — |
| P3 | Living Design Studio preview | Editor Vercel READY | Publicación HTTPS 26/10 con foto, mover/girar, escala/perspectiva ilustrativa. | Conservar como preview separado, no confundir con versión HTML completa. | https://living-design-studio-preview.vercel.app/ |
| P3 | Living Cálido simulador | Sitio Vercel READY; superposiciones esquemáticas | HTTPS 26/10 indica que las piezas no son fotos reales. | No continuar paralelo salvo necesidad de comparación. | https://living-calido-simulador.vercel.app/ |
| P3 | MARGOUSH | Floot V23.9 publicado | Floot published=true; HTTPS 26/10 identifica V23.9 en título. Código en sitio personal `/v23/` puede ser otra versión. | No retroceder a V23.7. Safari móvil real no validado. | https://margoush-v238.floot.app/ |
| P3 | MARGOUSH Party / Chupete Rush | PUBLICADA V0.2 en raíz; CANDIDATA V0.8 en preview | GitHub main `fdf6f3b` (17/10) actualiza documentación, NO promociona V0.8; `index.html` y README identifican V0.2 en raíz; `PROJECT_STATUS.md` conserva V0.8 aislada en `preview-v08/`. Ambas URLs HTTPS accesibles 26/10. | No confundir commit/documentación V0.8 con versión principal. Safari físico pendiente; ranking compartido no implementado. | https://facundocapello-blip.github.io/margoush-party/preview-v08/ |
| P3 | BLACK MAMBA | Floot V1.6 STAGING publicado | Floot published=true al 26/10; producción V1.5.2 histórica separada. | No decir que la detección de cartas de Betano está probada con capturas reales; Safari pendiente. | https://black-mamba-v16-staging.floot.app/ |
| P3 | Asistente compras mudanza | PUBLICADA en Vercel; interfaz rotulada V7 (función de búsqueda SIN VERIFICAR) | Último deploy production Vercel `dpl_GkZd84c7WpFTEFAkGum7Y8H57jAW` READY (23/10 02:07 UTC); web HTTPS 26/10 titulada «V7 - Buscador Online», indica búsqueda de tiendas sin login ML. No se probó resultado real de precios. | Conservar; contrastar funcionalmente con buscador ML V6 antes de duplicar trabajo. | https://asistente-compras-mudanza.vercel.app/ |
| P3 | Buscador de precios / MercadoLibre | V6 reportada; publicación canónica no verificada | Historial 22/10: API ML/OAuth callback fallaba. | No asumir OAuth resuelto. Evaluar proyecto Vercel Asistente compras mudanza antes de duplicar. | — |
| P4 | Punto de Oro | Commit GitHub 19/09; funcionalidad web sin confirmar | Main `7050036`. | Por demanda, sin afirmar publicación funcional comprobada. | https://facundocapello-blip.github.io/punto-de-oro/ |
| P4 | EXILIADOS | PUBLICADA web HTTPS accesible; jugabilidad SIN VERIFICAR | Página consultada 26/10/2026: título «Exiliados — Run & Gun», controles de P1 y P2 VAPOR, teletransporte, ultrasónico y Guardián final documentados. La carga de la página no demuestra partida completa ni QA móvil. | Conservar URL; no rehacer. Verificar jugabilidad sólo cuando se retome. | https://exiliados-run-gun.facucape.chatgpt.site/ |
| P4 | Juego sobrinas | PUBLICADO portal/demo; juego final SIN VERIFICAR | HTTPS consultado 26/10/2026: «Juego de mis sobrinas» carga portada, demo y opción «Cargar juego HTML»; el propio sitio indica que falta sustituir el placeholder por el juego final. V1.3.1 sigue siendo referencia reportada, no despliegue comprobado. No se infiere regresión ni pérdida de una versión anterior. | Conservar portal; localizar fuente del juego completo sólo al retomar, sin sobrescribir ni rehacer. | https://juego-sobrinas-facu.facucape.chatgpt.site/ |
| P4 | Botones para Martu | Proyecto histórico sin URL validada | Cuatro caritas y audios, memoria, ANUNEN y globos. | Localizar versión existente antes de rehacer. | — |
| P4 | Cepiphone | En espera, fuente sin validar | App base histórica reportada. | Localizar respaldo original antes de desarrollar. | — |
| P4 | Piso o Caos | Idea de juego sin deploy confirmado | Piso vinílico, barro, fernet, colillas, niveles offline. | En espera. | — |
| P4 | Plantas — guía interactiva | Proyecto de guía sin publicación comprobada | Sol/luna y animaciones pedidos históricamente. | En espera, sin duplicar. | — |
| P4 | PLP Lashes | Marketing por encargo, sin campaña actual verificada | Auditoría IG e historias históricas. | No producir campañas nuevas sin pedido. | https://www.instagram.com/plp.lashes/ |
| P4 | White Mamba / Punto de Oro audiovisual | Contenido creativo por demanda | Imágenes/video y cinemagraphs, no versión única de aplicación. | Control de créditos, no duplicar renders. | — |
| P4 | Video Bicho/Bicha + audio + avatar | Materiales parciales históricos | Versiones de video voz y hoja facial, sin validación final de lipsync. | Sólo retomar con fuente real. | — |
| P4 | FACU DEV / REA | Solicitados, instalación REA no verificada | No se encontró plugin privado FACU DEV entre los diez plugins propios; npx/doctor no verificado. | Aprovechar Codex, no instalar duplicados. | — |
| PERM | SAP HCM PT/TM | Consultoría + rutinas semanales existentes | Briefing y vacantes lunes, automatizaciones ya creadas. | Conservar y mantener separada documentación de datos empresariales. | — |

## Últimos seis commits de main (reconfirmados 26/10)

| Repo | SHA | Fecha |
|---|---|---|
| henris-gallery-experience | 2878a814f6e8eb38788b04cb52d07ae6fb94b6d3 | 21/10 |
| facu-ai-hub | e3edbe14c92c3903cfb638b1049c7b053dfef2e2 | 22/10 |
| Mambapalabra | ce3caa35d18239dd04f424b3d309add03297ab89 | 21/10 |
| mambapalabra-staging | e61b00a9befd1c7bf903bf06d639dcf36a7b1fe1 | 14/10 |
| margoush-party | fdf6f3b2c035e44a35bcb34a9fd3b94bceb62e8e | 17/10 |
| punto-de-oro | 70500368884c3565fbd5aab6e392612c99be5131 | 19/09 |

**No se detectaron nuevos commits en main** respecto al inventario del 24/10. Algunas ramas STAGING y las aplicaciones Floot/Vercel contienen estados más recientes.

## Publicación V5.2 STAGING — 26/10/2026

- **Vercel proyecto independiente:** `facu-ai-hub-v52-staging` (`prj_dO6F2CPzcQWr6HFCqcm4rBXsVk6f`), deployment `dpl_EEjJm33ZKGeWa71tVg6boCW1rBVB` READY.
- **URL HTTPS comprobada con renderizado JS:** https://facu-ai-hub-v52-staging-2hz6ib05c-facundocapello-8441.vercel.app/ . Contenido: panel 26 proyectos y estado actual auditado en paralelo al estado guardado sin sobrescritura.
- **GitHub CI V5.2:** workflow `40435459275`, SUCCESS (pruebas y compilación). La rama V5.2 surge de la V5.1 candidata, no es un merge en `main`.
- **Aislamiento:** en este proyecto de Vercel se estableció `VITE_LOCAL_ONLY=true`; no se inicia conexión Firebase. El sitio principal V5.0 no se modificó.
- **No probado:** Safari físico y flujo real de sesiones del usuario; no afirmar QA móvil manual.
- **Precaución:** el contenido inicial conserva ocho proyectos guardados/seeds históricos y los marca como potencialmente desactualizados, mientras un panel separado presenta los estados del maestro. Ningún dato privado fue actualizado automáticamente.

## Fuentes y confianza
- **GitHub:** commits y README/PROJECT_STATUS, y el documento histórico [inventario 24/10](PROJECT_VERSION_INVENTORY_2026-10-24.md). Distinguir main, rama STAGING, release y workflow.
- **Floot:** lectura `list_projects` + `get_publish_status` al 26/10 para BLACK MAMBA V1.6, Mambapalabra B1.13.1 STAGING, MARGOUSH V23.9, B1.11 base y Margoush Qwen no publicado.
- **Vercel:** `list_projects` y `list_deployments`, estado READY, más extracción pública de páginas al 26/10.
- **Chats:** algunas conversaciones recientes fueron recuperables; no se dispone de todos los mensajes ni de versiones generadas fuera de los sistemas conectados. Clasificar esas referencias como **reportadas**.
- **QA pendiente:** audio/micrófono Safari físico o AppSheet con usuario autorizado no se declaran probados por una URL activa.

## Decisiones de continuidad
1. Nunca recuperar automáticamente la tarea «probar pedido en Henris» solo porque una hoja antigua muestre errores: existe evidencia histórica posterior de validación STAGING 1.000031. Si hubiera regresión reciente, aportar prueba nueva.
2. No confundir el rótulo desactualizado de FACU HUB («Mambapalabra Staging v0.9») con el manifiesto RC6 del STAGING real.
3. No sobrescribir una versión estable por HTML generado más tarde sin vincularlo a fuente verificable, QA y aceptación.
4. Si otro agente modifica un repo, registrar SHA, rama, deploy HTTPS, fecha, fuente y resultado; no copiar a main sin autorización.
5. Priorizar entregables ya abiertos. Actualizar este documento mediante PR de inventario; no editar datos comerciales ni activar gastos.
6. Riesgo a revisar: una notificación de GitHub sobre configuración de clave Google/Firebase en FACU AI HUB (22/10) requiere evaluar restricciones de clave; la configuración Firebase Web no es por sí misma una credencial secreta. No publicar valores de claves.

**Última actualización:** 2026-10-27. 26 filas. Los nombres de herramientas no constituyen prueba de acceso actual fuera de los conectores observados.

## Reconciliación puntual — 26/10/2026, 26/10/2026, 16:54:04 ART

- **MARGOUSH Party: corrección de clasificación (confirmada).** La raíz publicada es **V0.2**, no V0.8. El commit más reciente de `main` (`fdf6f3b`, 17/10) solo modifica `PROJECT_STATUS.md`, que identifica **V0.8 como candidata aislada**. Se comprobó acceso HTTPS a [producción V0.2](https://facundocapello-blip.github.io/margoush-party/) y a [preview V0.8](https://facundocapello-blip.github.io/margoush-party/preview-v08/). No se comprobó QA física Safari ni promoción a estable. Fuentes: [README](https://github.com/facundocapello-blip/margoush-party/blob/main/README.md), [PROJECT_STATUS](https://github.com/facundocapello-blip/margoush-party/blob/main/PROJECT_STATUS.md), [commit](https://github.com/facundocapello-blip/margoush-party/commit/fdf6f3b2c035e44a35bcb34a9fd3b94bceb62e8e).
- **Asistente compras mudanza: versión pública identificada (confirmada parcialmente).** La [URL canónica](https://asistente-compras-mudanza.vercel.app/) presenta rótulo **V7 - Buscador Online** y Vercel registra deploy de producción READY del 23/10/2026 (ID `dpl_GkZd84c7WpFTEFAkGum7Y8H57jAW`). No se comprobó que las consultas devuelvan precios reales ni su equivalencia con el proyecto MercadoLibre V6.
- **Sin cambios de SHA en los seis `main` ni nuevos deploys Vercel/Floot** frente al registro previo del 26/10; ramas STAGING y releases GitHub consultadas. No se modificaron aplicaciones, datos ni producción. Los demás estados se mantienen; fuentes externas no conectadas siguen SIN VERIFICAR.

## Reconciliación puntual — 26/10/2026, 23:23 ART

- **EXILIADOS — disponibilidad confirmada, funcionalidad sin QA.** La [URL existente](https://exiliados-run-gun.facucape.chatgpt.site/) responde HTTPS con título «Exiliados — Run & Gun» y texto de controles de dos jugadores, VAPOR y jefe final. Clasificación: **PUBLICADA web accesible**, no «estable jugable comprobada». No se abrió trabajo nuevo.
- **Juego sobrinas — discrepancia de publicación.** La [URL existente](https://juego-sobrinas-facu.facucape.chatgpt.site/) responde HTTPS, pero el contenido visible es un **portal/demo** con «Cargar juego HTML» y la indicación de sustituir el placeholder por el juego definitivo. La versión V1.3.1 no está verificada como despliegue en esa URL. **No se afirma que haya dejado de funcionar ni que un bug antiguo persista**; se diferencia la evidencia actual del reporte histórico.
- **GitHub:** los seis SHA de `main` continúan iguales; ramas STAGING, releases y últimas Actions consultadas. Release [Mambapalabra B1.13.1](https://github.com/facundocapello-blip/Mambapalabra/releases/tag/b1.13.1) confirma que el identificador interno `B1.13.1-RC1` del HTML publicado corresponde exactamente al build aceptado como estable; **no es un conflicto de versión**. En FACU AI HUB V5.2 el último CI de la rama STAGING fue SUCCESS; PR #4 permanece en borrador.
- **Floot:** BLACK MAMBA V1.6 STAGING, Mambapalabra B1.13.1 UX1 STAGING, MARGOUSH V23.9 y B1.11 siguen publicados, sin nueva fecha de actualización respecto al maestro. **Vercel:** los cuatro proyectos de Living/Compras conservan sus últimos despliegues READY; V5.2 STAGING mantiene preview READY independiente. No se ejecutaron pruebas físicas de Safari ni operaciones con datos privados.
- **Fuentes:** GitHub API (commits, ramas, release, workflows, PR), Floot `list_projects`/`get_publish_status`, Vercel `list_projects`/`list_deployments`/`get_project` y lectura HTTPS pública. **Inspección:** 2026-10-26 23:23 ART. No se modificó `main`, ninguna aplicación ni datos reales.

## Conciliación automática STAGING — verificación 27/10/2026 (ART)

- **Implementación real:** `src/lib/reconciliation.ts` calcula estado y siguiente paso a partir de 26 entradas del maestro cuando hay alias inequívoco. Los proyectos originales y tareas no se actualizan en Firebase ni IndexedDB. Se conservan notas y próximos pasos de usuario, identificados como personales/históricos. Las recomendaciones y el resumen para ChatGPT también usan el estado auditado antes que los estados históricos.
- **Actualización:** al abrir la web, al retomar foco si pasaron seis horas y cada seis horas si permanece abierta; la automatización de seguimiento separada actualiza el archivo maestro cuando hay evidencia y permisos. Sin acceso universal a los chats.
- **URL STAGING HTTPS:** https://facu-ai-hub-v52-staging-4fkmmcuca-facundocapello-8441.vercel.app/ (Vercel `READY` y contenido renderizado comprobado con JavaScript). Fuente: GitHub [PR #4](https://github.com/facundocapello-blip/facu-ai-hub/pull/4), SHA `216954b`.
- **QA ejecutado:** build Vercel READY; UI real extraída con 26 entradas, Henris/Mambapalabra corregidos, notas y versiones históricas visibles. GitHub CI anterior pasó pruebas unitarias y E2E, pero falló en un caso cloud por ocultar un próximo paso guardado; la corrección se incorporó al SHA `216954b`. **No declarar el CI final como SUCCESS hasta consulta de conclusión.**
- **Aislamiento:** Vercel STAGING con `VITE_LOCAL_ONLY=true`. `main` y web productiva V5.0 sin cambios. QA Safari físico pendiente.
