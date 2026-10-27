import type { MasterRegistry } from "../lib/masterRegistry";
// Copia inicial PUBLICA del maestro; el botón Actualizar prioriza el registro actual en GitHub.
// No incluye datos privados de Firestore ni reemplaza proyectos del usuario.
export const packagedMaster: MasterRegistry = {
  "projects": [
    {
      "priority": "P1",
      "name": "Henris Gallery",
      "status": "STAGING publicada 21/10, AppSheet separado",
      "evidence": "GitHub main `2878a81`; web principal EXPERIENCE V1.0; STAGING Gemini Fusion URL responde. HTML 23/10 es candidato no comprobado.",
      "next": "No reabrir pruebas resueltas de AppSheet 1.000031; investigar candidato 23/10 solo si se recupera archivo.",
      "url": "https://facundocapello-blip.github.io/henris-gallery-experience/staging/henris-gemini-fusion-20261020/"
    },
    {
      "priority": "P1",
      "name": "FACU AI HUB",
      "status": "V5.0 en main; V5.1 candidata",
      "evidence": "Main `e3edbe1`; rama staging/v5.1-issue-1 `0b619f1` con workflow OK, sin publicación en producción; web online con proyectos desactualizados.",
      "next": "No reemplazar datos del usuario. Actualizar estados a través de fuente verificable y evaluar V5.1 en aislado.",
      "url": "https://facundocapello-blip.github.io/facu-ai-hub/"
    },
    {
      "priority": "P1",
      "name": "Experiencia ChatGPT y control versiones",
      "status": "Vigilancia cada 6 h activa; registro PR #3",
      "evidence": "GitHub 6 repositorios sin nuevos commits en main al 26/10. Últimas apps viven además en Vercel y Floot.",
      "next": "Extender vigilancia a aplicaciones fuera de GitHub; no volver a ejecutar pruebas antiguas aprobadas.",
      "url": "https://github.com/facundocapello-blip/facu-ai-hub/pull/3"
    },
    {
      "priority": "P2",
      "name": "Mambapalabra estable",
      "status": "Release B1.13.1 declarada estable",
      "evidence": "GitHub main `ce3caa3` es documentación RC6; release estable B1.13.1 separada; producción preservada.",
      "next": "No promocionar RC6 sin aprobación; evitar base B1.11 histórica.",
      "url": "https://facundocapello-blip.github.io/Mambapalabra/"
    },
    {
      "priority": "P2",
      "name": "Mambapalabra STAGING",
      "status": "B1.13.1 Fish398 RC6 online",
      "evidence": "Manifiesto HTTPS 26/10: 821 audios, velocidad 1.22; `main` de repo staging `e61b00a` NO representa el deploy RC6.",
      "next": "Pendiente evaluación auditiva/micrófono Safari físico, no rehacer CI ya exitoso.",
      "url": "https://facundocapello-blip.github.io/mambapalabra-staging/"
    },
    {
      "priority": "P2",
      "name": "Living Design Studio — HTML autónomo",
      "status": "Publicado Vercel 25/10 (20 muebles)",
      "evidence": "Proyecto Vercel READY y web HTTPS 26/10: objetos independientes mover/girar/escalar/inclinar; editor 2.5D.",
      "next": "Conservar base, incorporar muebles reales PNG transparentes; Safari físico no verificado.",
      "url": "https://living-design-zip-html-preview.vercel.app/"
    },
    {
      "priority": "P2",
      "name": "Living Design Studio — AI 2D/3D",
      "status": "Candidato AI Studio sin publicación validada",
      "evidence": "Conversación 26/10: servidor Gemini compilado, API 503/timeout o HTML; no evidencia de endpoint funcional online.",
      "next": "Reparar endpoint/JSON sin sobrescribir la versión 2.5D publicada.",
      "url": ""
    },
    {
      "priority": "P3",
      "name": "Living Design Studio preview",
      "status": "Editor Vercel READY",
      "evidence": "Publicación HTTPS 26/10 con foto, mover/girar, escala/perspectiva ilustrativa.",
      "next": "Conservar como preview separado, no confundir con versión HTML completa.",
      "url": "https://living-design-studio-preview.vercel.app/"
    },
    {
      "priority": "P3",
      "name": "Living Cálido simulador",
      "status": "Sitio Vercel READY; superposiciones esquemáticas",
      "evidence": "HTTPS 26/10 indica que las piezas no son fotos reales.",
      "next": "No continuar paralelo salvo necesidad de comparación.",
      "url": "https://living-calido-simulador.vercel.app/"
    },
    {
      "priority": "P3",
      "name": "MARGOUSH",
      "status": "Floot V23.9 publicado",
      "evidence": "Floot published=true; HTTPS 26/10 identifica V23.9 en título. Código en sitio personal `/v23/` puede ser otra versión.",
      "next": "No retroceder a V23.7. Safari móvil real no validado.",
      "url": "https://margoush-v238.floot.app/"
    },
    {
      "priority": "P3",
      "name": "MARGOUSH Party / Chupete Rush",
      "status": "PUBLICADA V0.2 en raíz; CANDIDATA V0.8 en preview",
      "evidence": "GitHub main `fdf6f3b` (17/10) actualiza documentación, NO promociona V0.8; `index.html` y README identifican V0.2 en raíz; `PROJECT_STATUS.md` conserva V0.8 aislada en `preview-v08/`. Ambas URLs HTTPS accesibles 26/10.",
      "next": "No confundir commit/documentación V0.8 con versión principal. Safari físico pendiente; ranking compartido no implementado.",
      "url": "https://facundocapello-blip.github.io/margoush-party/preview-v08/"
    },
    {
      "priority": "P3",
      "name": "BLACK MAMBA",
      "status": "Floot V1.6 STAGING publicado",
      "evidence": "Floot published=true al 26/10; producción V1.5.2 histórica separada.",
      "next": "No decir que la detección de cartas de Betano está probada con capturas reales; Safari pendiente.",
      "url": "https://black-mamba-v16-staging.floot.app/"
    },
    {
      "priority": "P3",
      "name": "Asistente compras mudanza",
      "status": "PUBLICADA en Vercel; interfaz rotulada V7 (función de búsqueda SIN VERIFICAR)",
      "evidence": "Último deploy production Vercel `dpl_GkZd84c7WpFTEFAkGum7Y8H57jAW` READY (23/10 02:07 UTC); web HTTPS 26/10 titulada «V7 - Buscador Online», indica búsqueda de tiendas sin login ML. No se probó resultado real de precios.",
      "next": "Conservar; contrastar funcionalmente con buscador ML V6 antes de duplicar trabajo.",
      "url": "https://asistente-compras-mudanza.vercel.app/"
    },
    {
      "priority": "P3",
      "name": "Buscador de precios / MercadoLibre",
      "status": "V6 reportada; publicación canónica no verificada",
      "evidence": "Historial 22/10: API ML/OAuth callback fallaba.",
      "next": "No asumir OAuth resuelto. Evaluar proyecto Vercel Asistente compras mudanza antes de duplicar.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "Punto de Oro",
      "status": "Commit GitHub 19/09; funcionalidad web sin confirmar",
      "evidence": "Main `7050036`.",
      "next": "Por demanda, sin afirmar publicación funcional comprobada.",
      "url": "https://facundocapello-blip.github.io/punto-de-oro/"
    },
    {
      "priority": "P4",
      "name": "EXILIADOS",
      "status": "Juego candidato histórico",
      "evidence": "VAPOR, jefe final; URL reportada pero no verificada.",
      "next": "Buscar fuente antes de nuevas mejoras.",
      "url": "https://exiliados-run-gun.facucape.chatgpt.site/"
    },
    {
      "priority": "P4",
      "name": "Juego sobrinas",
      "status": "Juego histórico publicado según usuario",
      "evidence": "Versión V1.3.1 referencial; no repo verificable en GitHub conectado.",
      "next": "No rehacer; localizar versión real cuando se retome.",
      "url": "https://juego-sobrinas-facu.facucape.chatgpt.site/"
    },
    {
      "priority": "P4",
      "name": "Botones para Martu",
      "status": "Proyecto histórico sin URL validada",
      "evidence": "Cuatro caritas y audios, memoria, ANUNEN y globos.",
      "next": "Localizar versión existente antes de rehacer.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "Cepiphone",
      "status": "En espera, fuente sin validar",
      "evidence": "App base histórica reportada.",
      "next": "Localizar respaldo original antes de desarrollar.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "Piso o Caos",
      "status": "Idea de juego sin deploy confirmado",
      "evidence": "Piso vinílico, barro, fernet, colillas, niveles offline.",
      "next": "En espera.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "Plantas — guía interactiva",
      "status": "Proyecto de guía sin publicación comprobada",
      "evidence": "Sol/luna y animaciones pedidos históricamente.",
      "next": "En espera, sin duplicar.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "PLP Lashes",
      "status": "Marketing por encargo, sin campaña actual verificada",
      "evidence": "Auditoría IG e historias históricas.",
      "next": "No producir campañas nuevas sin pedido.",
      "url": "https://www.instagram.com/plp.lashes/"
    },
    {
      "priority": "P4",
      "name": "White Mamba / Punto de Oro audiovisual",
      "status": "Contenido creativo por demanda",
      "evidence": "Imágenes/video y cinemagraphs, no versión única de aplicación.",
      "next": "Control de créditos, no duplicar renders.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "Video Bicho/Bicha + audio + avatar",
      "status": "Materiales parciales históricos",
      "evidence": "Versiones de video voz y hoja facial, sin validación final de lipsync.",
      "next": "Sólo retomar con fuente real.",
      "url": ""
    },
    {
      "priority": "P4",
      "name": "FACU DEV / REA",
      "status": "Solicitados, instalación REA no verificada",
      "evidence": "No se encontró plugin privado FACU DEV entre los diez plugins propios; npx/doctor no verificado.",
      "next": "Aprovechar Codex, no instalar duplicados.",
      "url": ""
    },
    {
      "priority": "PERM",
      "name": "SAP HCM PT/TM",
      "status": "Consultoría + rutinas semanales existentes",
      "evidence": "Briefing y vacantes lunes, automatizaciones ya creadas.",
      "next": "Conservar y mantener separada documentación de datos empresariales.",
      "url": ""
    }
  ],
  "updated": "2026-10-26"
};
