# Piloto V5.1 (rama de prueba)

Implementación del Issue #1: prioridades explicadas, resolución/posposición sobre registros existentes y continuidad manual con ChatGPT. Ver [guía de staging y pendientes](docs/V5.1-STAGING.md). No fusionar ni desplegar sobre la versión estable. El build público de piloto usa datos locales; Auth/Firestore se validan con emuladores.

La documentación histórica de V5.0 se conserva a continuación.

# FACU AI HUB 5.0

Centro de control personal en React + TypeScript, Tailwind compilado y Vite. Diseño oscuro con navegación móvil, safe areas de iPhone y uso local sin cuenta. Reemplaza el HTML anterior; no requiere servicios externos para proyectos, tareas, prompts, tracking o recomendaciones locales.

## Desarrollo

Node 22 (`.nvmrc`), npm y navegador moderno. En esta máquina se verificó también con Node 24. Los procesos de instalación no despliegan nada.

```sh
npm ci
npm run dev
```

```sh
npm test             # lógica de tracking, intención y migración
npm run build        # TypeScript, bundle y Service Worker
npm run test:e2e     # Chromium: flujo móvil, persistencia y apertura offline
npm run preview     # servir dist para probar PWA (no el servidor dev)
```

Playwright usa Chromium del sistema si existe `/usr/bin/chromium`; de lo contrario, instalar su navegador con `npx playwright install chromium`. HTTPS es obligatorio fuera de localhost. No se instalan paquetes desde CDN en el navegador.

## Datos y migración

- Modo local: IndexedDB, escrituras serializadas, bloqueo entre pestañas cuando el navegador lo soporta y notificación de cambios mediante BroadcastChannel.
- Al primer inicio sin datos v5 se recuperan proyectos y contador de 4.5 (`facu_hub_projects`, `facu_hub_tracking`), ediciones de proyectos v1.2 y tareas v1.4. Los originales nunca se borran. El contador viejo se importa en pausa: no se inventa el tiempo pasado en segundo plano.
- Los metadatos ejecutivos v1.5 se conservan en su clave original y se muestra aviso; exportarlos desde esa versión antes de borrar datos del sitio.
- La migración automática requiere el mismo **origen y almacenamiento del navegador**. Un archivo HTML abierto desde otra URL o con `file://` no comparte datos con la PWA. Conservar la versión vieja para exportar los datos y convertirlos antes de importarlos si su formato difiere de v5.
- Ajustes permite exportar un respaldo JSON v5 e importarlo con validación de esquema, límites y referencias. La importación combina por ID, actualiza coincidencias y conserva registros ajenos al respaldo. Exportar antes para poder revertir.
- Los proyectos iniciales proceden de la referencia 4.5; sus versiones y estados son referencias del usuario, no verificaciones en vivo.

## Conectar Firebase (acción pendiente del propietario)

El propietario creó el proyecto `facahub` y suministró la configuración pública de la app Web, guardada en `.env.local` (ignorado por Git) y en el borrador del entorno. La compilación con esa configuración funciona. Tras activar los servicios, la consulta de configuración de Auth devuelve HTTP 200 y Firestore rechaza la lectura sin sesión con HTTP 403 “Missing or insufficient permissions”. Las comprobaciones posteriores autenticadas de lectura/escritura y aislamiento entre cuentas pasaron con las reglas publicadas; la edición offline y reconexión desde Chromium del entorno también se verificaron posteriormente con TLS activo. No hay credenciales administrativas de despliegue; la comprobación posterior de operaciones autenticadas se documenta al final.

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/) y registrar una aplicación Web. Auth + Firestore pueden usarse dentro de las cuotas gratuitas de Spark; revisar cuotas y región antes de crear recursos.
2. Activar Authentication → Email/Password. Crear Firestore y elegir conscientemente su región. Las reglas incluidas deben publicarse antes de usar datos reales; no usar reglas públicas de prueba.
3. Copiar `.env.example` a `.env.local` y completar `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` con la configuración de la aplicación Web. Estos campos son configuración pública del cliente, **no una clave privada de servicio**. Nunca poner claves privadas o de IA en variables `VITE_`.
4. En tu terminal autorizada, ejecutar `npx firebase login`, luego `npx firebase deploy --only firestore:rules --project TU_PROJECT_ID`. No hace falta login para trabajar en modo local o usar emuladores.
5. Agregar el dominio del hosting a los dominios autorizados de Authentication. Para GitHub Pages: `facundocapello-blip.github.io`. Restringir la API key a las APIs y orígenes necesarios según la configuración de Firebase.
6. Volver a compilar. En Ajustes, crear cuenta/iniciar sesión. La nube es un espacio separado: importar el modo local explícitamente o crear los proyectos iniciales.
7. Probar cuenta A/cuenta B, edición sin conexión, reconexión, cierre de sesión y recuperación de contraseña. Confirmar que los datos aparecen en otro dispositivo antes de darlos por respaldados.

Estructura: `users/{uid}/projects`, `tasks`, `sessions` y `prompts`. Reglas con acceso por propietario y validación de campos. Nunca se confía en un UID enviado por un formulario. IndexedDB persistente de Firestore permite editar sin conexión después de cargar el espacio; los snapshots distinguen caché, escrituras pendientes y servidor. Una cuenta recién iniciada sin conexión no puede recuperar documentos nunca descargados.

Conflictos: Firestore resuelve escrituras sobre un mismo documento según la última escritura aceptada por el servidor. No hay merge de texto ni garantía de un único tracker entre dispositivos desconectados: las sesiones usan IDs distintos para no sobrescribirse; si aparecen varias abiertas, la interfaz avisa y permite finalizarlas sucesivamente. No iniciar varias sesiones simultáneas. La fecha del dispositivo influye en el tracking.

Cerrar sesión está bloqueado mientras haya escrituras pendientes o no haya conexión; al salir se termina Firestore y se limpia su caché. Cerrar otras pestañas primero: si una mantiene abierta la persistencia, se informa el fallo de limpieza. En equipos compartidos, borrar datos del sitio si no se pudo limpiar. El modo local conserva su propio espacio separado.

### Emuladores, sin proyecto real

Java 21 y el CLI de Firebase están entre los requisitos de estas pruebas. Ninguna usa una API de IA ni crea recursos cloud.

```sh
npm run test:auth     # alta, login, logout y rechazo de contraseña inválida
npm run test:rules    # aislamiento, permisos y validación contra Firestore Emulator
npm run test:cloud    # Auth + Firestore, edición offline y cierre de sesión en navegador
```

En el entorno administrado, usar ubicaciones de caché escribibles si el directorio personal no permite escrituras:

```sh
XDG_CONFIG_HOME=/workspace/.config FIREBASE_EMULATORS_PATH=/workspace/.cache/firebase CI=true npm run test:rules
XDG_CONFIG_HOME=/workspace/.config FIREBASE_EMULATORS_PATH=/workspace/.cache/firebase CI=true npm run test:cloud
```

La descarga oficial del emulador requiere `storage.googleapis.com`. Si la política de red la bloquea, permitir ese dominio en la configuración del entorno y volver a ejecutar las pruebas. No desactivar TLS ni checksums. El CLI puede advertir sobre `firebase-public.firebaseio.com` para anuncios; no es un requisito funcional del emulador.

## Recomendador por intenciones

Funciona de manera autónoma mediante reglas locales: desarrollo, SAP, operaciones, análisis y creatividad. Devuelve herramienta, motivo, próximo paso y prompt con contexto; no ejecuta acciones externas. El resultado distingue reglas de clasificación con modelo y funciona offline.

`functions/index.js` agrega clasificación opcional con Gemini. La clave queda del lado servidor y nunca se entrega al cliente. El endpoint valida token Firebase, email verificado, origen, formato de entrada y salida, y limita peticiones por usuario (30 por día, una cada 3 segundos). Ante error, el cliente conserva el resultado local. Solo envía el objetivo ingresado, no las notas del proyecto. El usuario debe activar expresamente el modelo remoto en el formulario; no enviar datos SAP confidenciales sin autorización.

**No se ha desplegado ni invocado el modelo.** Cloud Functions normalmente requiere Blaze y puede generar cargos; esta implementación no habilita facturación ni despliega por sí sola. Es opcional y la app queda funcional sin ella.

Cuando se decida habilitarlo con un presupuesto autorizado:

```sh
npm ci --prefix functions
npx firebase functions:secrets:set GEMINI_API_KEY --project TU_PROJECT_ID
npx firebase deploy --only functions:recommendIntent --project TU_PROJECT_ID
```

El CLI solicitará `APP_ORIGIN` (origen HTTPS exacto sin barra final) e `INTENT_MODEL` (por defecto `gemini-2.5-flash`; verificar disponibilidad del modelo en el proyecto). Configurar alertas/presupuesto y revisar cuotas. Poner la URL HTTPS devuelta en `VITE_AI_ENDPOINT` y recompilar. En producción, configurar además App Check si se necesita protección contra abuso más fuerte; los límites por cuenta no sustituyen un presupuesto global. La intención que devuelve el modelo está limitada a un enum; no puede decidir endpoints ni ejecutar comandos.

## PWA e iPhone

Vite PWA genera manifest, iconos y Service Worker en producción. Solo se cachean los recursos propios compilados; no se cachean respuestas de Auth, Firestore ni del modelo con el Service Worker. Los datos se gestionan por separado en IndexedDB/Firestore.

- Primera carga completa con conexión; después se puede reabrir offline.
- Safari → Compartir → Agregar a inicio. Los datos de Safari y la app instalada pueden estar separados.
- Actualizaciones con aviso: guardar formularios antes de actualizar. El botón se bloquea con formularios de edición abiertos, texto de tarea/objetivo sin resolver o escrituras pendientes.
- Safe areas, `100dvh`, zoom permitido, campos móviles de 16 px, modales nativos con foco y Escape, navegación accesible y reducción de movimiento.
- El reloj se recalcula con timestamps al volver a primer plano; no escribe cada segundo. No depende de Background Sync, que no es una base confiable en iOS.
- iOS puede purgar almacenamiento por falta de espacio. Mantener respaldos. Offline no permite verificar una cuenta nueva ni obtener una respuesta del modelo.

Las pruebas de navegador automatizadas no sustituyen una prueba en un iPhone físico. Probar teclado, cambio de orientación, bloqueo de pantalla, instalación y reapertura desde el icono.

## Publicación

No se ha realizado push ni despliegue. El workflow de Pages compila y sube `dist`, con `VITE_BASE_PATH=/facu-ai-hub/` derivado del nombre del repositorio. La configuración pública de `facahub` está en `src/config/firebase.public.json`, por lo que el build de GitHub Pages conserva la conexión aun sin Repository variables. Las variables `VITE_FIREBASE_*` permiten reemplazarla por otra app/proyecto. El endpoint de IA remoto continúa desactivado salvo que se configure `VITE_AI_ENDPOINT`. Para un modo exclusivamente local, usar `VITE_LOCAL_ONLY=true`. Esta configuración Web no incluye claves privadas; el acceso a los datos depende de Auth y las reglas de Firestore. Un push autorizado a `main` activará ese workflow existente.

Alternativa Firebase Hosting: compilar con `VITE_BASE_PATH=/` y ejecutar `npx firebase deploy --only hosting --project TU_PROJECT_ID` desde una sesión autorizada. `firebase.json` evita cachear indefinidamente HTML y Service Worker. No desplegar las Functions opcionales con un comando global accidentalmente.

## Organización

- `src/lib/storage.ts`: validación, migración e IndexedDB local.
- `src/lib/useWorkspace.ts`: repositorio local/cloud, estados de sincronización y Auth.
- `src/lib/tracking.ts`: cálculo de tiempo independiente de React.
- `src/lib/intents.ts`: intención, recomendación y composición de prompt.
- `src/components`: reloj aislado y modal accesible.
- `firestore.rules`, `tests/rules.test.ts`: acceso y validación cloud.
- `functions`: backend opcional del modelo.
- `tests`: unidades y flujos de navegador/PWA/cloud.

El override de `@grpc/grpc-js` actualiza la dependencia Node de Firestore a una versión compatible de la rama 1.x para evitar vulnerabilidades conocidas de versiones antiguas. La aplicación web usa el SDK de navegador, sin gRPC Node.

## Verificación de esta entrega

- Instalación reproducible con `npm ci` en la app y en `functions`: completada.
- Compilación TypeScript y bundle PWA: completada. El bundle Firebase genera un aviso de tamaño; no se midió el objetivo de inicio menor a 2 segundos.
- 19 pruebas de lógica/migración y controles del endpoint: aprobadas.
- 5 flujos de navegador Chromium: aprobados, incluyendo apertura offline, edición persistente y coordinación entre pestañas.
- 1 prueba con Firebase Authentication Emulator: aprobada (alta, logout, login y rechazo de contraseña incorrecta).
- Firestore Rules Emulator: no ejecutado por bloqueo de la descarga oficial del JAR. Las operaciones y permisos de Firebase real y el flujo cloud completo en navegador se verificaron posteriormente (detalle al final).
- Export del backend Functions: cargado correctamente; proveedor Gemini no invocado ni desplegado.
- Auditoría de dependencias de producción: sin vulnerabilidades reportadas en la app ni en Functions al ejecutar esta entrega. No equivale a una auditoría de seguridad del producto.
- Safari/iPhone físico y publicación de la app: no verificados. Firebase real: verificado posteriormente según el detalle siguiente.

### Comprobación posterior con Firebase real (`facahub`)

Se crearon dos cuentas temporales independientes y se verificó mediante REST: alta Auth, lectura/escritura de proyectos, tareas, sesiones y prompts por su propietario; rechazo de lectura desde otra cuenta, rechazo sin autenticación y rechazo de documentos con esquema inválido. Todos los documentos y cuentas temporales se eliminaron al terminar.

Con autorización explícita del propietario se registró la CA suministrada por el entorno en el almacén NSS de Chromium. Se ejecutó la prueba desde el mismo contexto de ejecución con permisos para dicho almacén; el sandbox aislado puede presentar un almacén distinto. La verificación TLS permaneció activa. Pasaron: inicio de sesión desde la interfaz, alta de un proyecto en Firestore, edición sin conexión, confirmación de sincronización al reconectar, lectura REST independiente del dato actualizado, persistencia tras recargar y cierre de sesión sin mostrar datos de la cuenta. La cuenta y el documento de prueba se eliminaron. Esto no sustituye la prueba en Safari/iPhone físico.
