# Shop · Seguimiento DVA-C03

SPA de seguimiento del proyecto **Shop**, la tienda en línea serverless de la especificación de estudio para **AWS Certified Developer – Associate (DVA-C03)**.

- Repo: https://github.com/ShykanDev/shop-dva-c03-tracker
- App: https://shykandev.github.io/shop-dva-c03-tracker/

No es la app de estudio. Es un tracker aparte: checklist, guía paso a paso y prompts de Amazon Q. No modifica `devapp` ni los módulos CLF-C02 / DVA-C03.

## Qué incluye

- **Paso 0 al Paso 15**, en orden, sin fechas por semana ni límites diarios.
- **103 acciones marcables**: 88 en los 16 pasos + 15 en el cierre.
- **24 prompts de Amazon Q**: 16 por paso + 8 por lab, cada uno con su propio estado de completado.
- **8 labs del Paso 14**: Step Functions, Kinesis + Firehose, Athena, Bedrock, ElastiCache/DAX, RDS/Aurora, testing con SAM y blue/green.
- **Cierre**: definición de terminado, costos y limpieza, y cobertura real del examen.
- **Respaldo**: exportar el progreso a JSON e importarlo en otro navegador o dispositivo.
- **Documentación técnica** (`/proyecto`): identidad, usuarios, flujo, stack, 13 rutas, 5 stores, 3 tablas DynamoDB, 2 buckets, 14 Lambdas y datos del examen.
- **Contratos técnicos** (`/contratos`): la fuente única de verdad de stores, rutas, Lambdas, tablas y variables, con el paso donde se implementa cada cosa.
- **Especificación original** en `public/docs/especificacion-tecnica-dva-c03.txt`, descargable desde la app.
- **Sugerencias de Vue** en los pasos donde aplican, con el porqué.
- **Guías concretas**: consola de AWS, CLI, SAM, código TypeScript y criterios de verificación.

## Stack

Vue 3 + TypeScript + Vite + Tailwind CSS v4 + Vue Router. Sin backend, sin Firebase, sin PWA y sin IA integrada.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # vue-tsc --noEmit
npm test           # vitest run
npm run build      # typecheck + build de producción
npm run preview    # servir el build
npm run deploy     # build + 404.html + push a la rama gh-pages
```

El build de producción usa `base: /shop-dva-c03-tracker/` para GitHub Pages. En desarrollo se sirve en `/`.

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Redirige a `/checklist` |
| `/checklist` | Las 103 acciones, agrupadas por paso |
| `/guia` | Redirige a `/guia/paso-0` |
| `/guia/paso-0` … `/guia/paso-15` | Guía completa del paso, verificaciones y prompt |
| `/guia/paso-14` | Los 8 labs, cada uno con su prompt |
| `/proyecto` | Documentación técnica: rutas, tablas, Lambdas, stores y stack |
| `/cierre` | Definición de terminado, costos y cobertura |

## Progreso

Se guarda en el navegador con la clave:

```
shop-dva-c03:progress
```

Forma del dato:

```json
{
  "version": 1,
  "acciones": {
    "paso-2.1": { "hecho": true, "fecha": "2026-11-19T00:00:00.000Z" }
  },
  "prompts": {
    "paso-2.prompt": { "hecho": true, "fecha": "2026-11-19T00:00:00.000Z" }
  }
}
```

- No se guarda nada en un servidor.
- Si el JSON se corrompe, la app arranca en blanco sin lanzar.
- El botón de reinicio de `/cierre` borra solo esa clave.
- Copiar el proyecto a otra Mac no traslada el progreso: usa exportar/importar.

### Respaldo y traslado

En `/cierre`, sección **Respaldo de progreso**:

- **Exportar progreso** descarga `shop-dva-c03-progreso-YYYY-MM-DD.json` con formato legible (`version`, `acciones`, `prompts`).
- **Importar progreso** lee ese JSON, valida la forma, pide confirmación si ya hay progreso y reemplaza el estado actual.
- Si el archivo no es JSON o no tiene el formato esperado, muestra un error y no toca el progreso existente.
- El archivo se genera y se lee en tu equipo; no se envía a ningún servidor.

## Estructura

```
public/
  docs/especificacion-tecnica-dva-c03.txt   # fuente de verdad original
src/
  components/        AppShell, PasoCard, CheckItem, PromptAmazonQ, BloqueGuia…
  composables/       useProgreso, useTotales, useCopiar
  data/
    pasos/           un archivo por paso (paso-00.ts … paso-15.ts)
    pasos/index.ts   PASOS y búsquedas
    contratos.ts     fuente única: stores, rutas, Lambdas, tablas, variables
    proyecto.ts      derivado de contratos.ts + identidad y stack
    cierre.ts        definición de terminado, costos, cobertura y examen
  types/proyecto.ts  Paso, Accion, BloqueGuia, Laboratorio, referencias
  views/             ChecklistView, GuiaView, ProyectoView, ContratosView, CierreView
tests/unit/          contenido, referencia, contratos, progreso, componentes y cierre
```

### Cómo agregar una acción

1. Abre `src/data/pasos/paso-NN.ts`.
2. Agrega un objeto a `acciones` o `verifica` con un `id` único (`paso-NN.M`).
3. Si el total cambia, actualiza el conteo en `tests/unit/contenido.spec.ts`.
4. Ejecuta `npm test` y `npm run typecheck`.

### Cómo agregar un recurso (store, Lambda, ruta, tabla, variable)

`src/data/contratos.ts` es la fuente única. Los guardrails de `tests/unit/contratos.spec.ts`
fallan si una guía nombra algo que no está ahí, si un store no tiene snippet en su paso,
si una Lambda no tiene acción marcable, si una variable se usa sin declararu o si
`/proyecto` y `/contratos` no cuentan lo mismo.

1. Añade el recurso en `contratos.ts` con `paso` y `origen` (`spec` o `convencion`).
2. Escribe su guía en el paso indicado, con el «cómo», el snippet y su verificación.
3. Si es una Lambda, crea su acción con `accion: 'paso-N.M'` y que el id exista.
4. `npm test` debe quedar en verde antes de commitear.

## Reutilización desde devapp

- Tokens de color y tipografía equivalentes a `devapp/src/theme/variables.css`.
- Patrón de progreso defensivo inspirado en `devapp/src/lib/clfC02Progress.ts`.
- Patrón visual de tarjetas y barra de progreso de los módulos CLF-C02.
- Nada de Firebase, Ionic, PWA ni los schemas de examen.

## Verificación

```bash
npm run typecheck
npm test
npm run build
```

Los tests comprueban, entre otras cosas:

- 16 pasos (0–15), sin huecos.
- 103 acciones, 24 prompts, 8 labs y 15 criterios de cierre.
- 13 rutas, 5 stores, 3 tablas, 2 buckets y 14 Lambdas de la especificación.
- Contratos: cada store con archivo, export, estado y snippet; cada Lambda con acción marcable, ruta y variables; cada variable declarada en el paso que la crea.
- Coherencia checklist ↔ `/proyecto` ↔ `/contratos`.
- Que el `.txt` de `public/docs/` contenga todas las secciones, pasos, rutas, tablas y Lambdas.
- IDs únicos y skills de la especificación por paso.
- Todos los nombres de rutas, tablas, Lambdas y servicios de la spec.
- Que no haya planificación por semana ni límites diarios.
- Persistencia, normalización de datos corruptos y reinicio.
- Exportación/importación de respaldo JSON, validación y rechazo de archivos inválidos.
- Chip «Completado», copia del prompt y accesibilidad del checkbox.

## Deploy

GitHub Pages sirve la rama `gh-pages`, generada por `npm run deploy`.

- `dist/index.html` se copia a `dist/404.html` para que los deep links (`/guia/paso-2`, `/proyecto`) funcionen con Vue Router en modo history.
- `.nojekyll` evita que Pages procese los assets con Jekyll.
- El workflow local es: `npm run deploy`, esperar el build de Pages y abrir https://shykandev.github.io/shop-dva-c03-tracker/.
