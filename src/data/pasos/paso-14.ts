import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso14: Paso = {
  id: 'paso-14',
  numero: 14,
  titulo: 'Lo que no cubre el proyecto: labs aparte',
  resumen:
    'Ocho laboratorios cortos para cubrir streaming, analítica, IA, SQL, testing y despliegues progresivos.',
  objetivo:
    'Cerrar las brechas que la tienda no cubre de forma natural, con un lab por tema y sin dejar recursos caros encendidos.',
  acciones: [
    {
      id: 'paso-14.1',
      texto: 'Lab 1 — Step Functions: workflow de 3 pasos para procesar un pedido',
      detalle: 'Validar, cobrar y enviar. Solo para entender el orquestador.',
      skills: [],
    },
    {
      id: 'paso-14.2',
      texto: 'Lab 2 — Kinesis + Firehose: eventos de clics guardados en S3',
      detalle: 'Stream mínimo y entrega a S3. No hace falta un cluster grande.',
      skills: [],
    },
    {
      id: 'paso-14.3',
      texto: 'Lab 3 — Athena: una consulta SQL sobre los logs de S3',
      detalle: 'Crea la tabla externa y ejecuta una query concreta.',
      skills: [],
    },
    {
      id: 'paso-14.4',
      texto: 'Lab 4 — Bedrock: generar la descripción de un producto',
      detalle:
        'Pide acceso al modelo. Después estudia la Tarea 2.3: permisos, privacidad, filtrado, prompt injection y logs sin PII.',
      skills: ['2.3.1', '2.3.2', '2.3.3', '2.3.4', '2.3.5'],
    },
    {
      id: 'paso-14.5',
      texto: 'Lab 5 — ElastiCache / DAX: cuándo cachear el catálogo y por qué no dejarlo prendido',
      detalle: 'Compara latencia y costo; decide con argumentos.',
      skills: ['4.3.4'],
    },
    {
      id: 'paso-14.6',
      texto: 'Lab 6 — RDS / Aurora: cuándo usar SQL en vez de DynamoDB',
      detalle: 'Sin crear una base cara. La decisión es el ejercicio.',
      skills: ['1.3.3'],
    },
    {
      id: 'paso-14.7',
      texto: 'Lab 7 — Testing: 5 tests con SAM, mock de API Gateway y evento JSON de prueba',
      detalle: 'Incluye caso feliz, validación, error de stock, no autorizado y no encontrado.',
      skills: ['3.2.2', '3.2.3'],
    },
    {
      id: 'paso-14.8',
      texto: 'Lab 8 — Blue/green y canary con Lambda aliases y CodeDeploy',
      detalle: 'Practica el cambio de tráfico y el rollback en una Lambda de prueba.',
      skills: ['3.3.5', '3.3.6'],
    },
  ],
  verifica: [
    {
      id: 'paso-14.v1',
      texto: 'Los 8 labs respondieron su verificación y borraste los recursos de cada uno',
      detalle:
        'Step Functions, Kinesis/Firehose, Athena, Bedrock, DAX/ElastiCache, RDS/Aurora, tests y CodeDeploy.',
    },
  ],
  skills: [],
  guia: [
    {
      tipo: 'texto',
      md: 'La tienda no cubre todo el examen, y ningún proyecto real lo hace. Estos ocho labs cierran las brechas: orquestación, streaming, analítica, IA, SQL, testing y despliegues progresivos. Hazlos después del proyecto, en orden, y borra cada recurso al terminar. La especificación sugiere un máximo de 1 hora por lab; si necesitas más tiempo, tómalo: el orden importa más que la prisa.',
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'Estos labs no son pasos del proyecto',
      md: 'No agregues estos servicios a la tienda principal. Son laboratorios separados para el examen. Si los mezclas, la demo se vuelve frágil y la factura sube.',
    },
    {
      tipo: 'lista',
      titulo: 'Cómo organizar los 8 labs',
      items: [
        'Hazlos en el orden del 1 al 8. Cada uno cierra un tema distinto; no los mezcles con la tienda.',
        'Antes de crear recursos, lee el costo y la limpieza del lab. Si no puedes limpiarlo, no lo empieces.',
        'Usa un prefijo lab- en los nombres de recursos para encontrarlos rápido y borrarlos sin dudar.',
        'Al terminar, borra los recursos y marca el lab en el checklist del Paso 14.',
        'Si un lab no responde su verificación, no pases al siguiente: anota el error y pregúntale a Amazon Q con el prompt del lab.',
      ],
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 14,
    titulo: 'Lo que no cubre el proyecto: labs aparte',
    quiere:
      'hacer ocho labs separados: Step Functions, Kinesis + Firehose, Athena, Bedrock, ElastiCache/DAX, RDS/Aurora, testing con SAM y blue/green con CodeDeploy, sin dejar recursos caros encendidos',
    yaHice: 'los Pasos 0 a 13: la tienda completa en producción',
    extra:
      'Quiero el orden correcto de los labs y cuáles se pueden hacer solo en concepto sin crear recursos. Para cada uno, dime el costo aproximado y cómo limpiarlo.',
  }),
  laboratorios: [
    {
      id: 'lab-1',
      titulo: 'Step Functions: workflow de 3 pasos',
      objetivo:
        'Entender un orquestador con estados, transiciones y manejo de errores usando un pedido como excusa.',
      como: [
        'Consola → Step Functions → Create state machine → Standard → Write your workflow in code.',
        'Define tres estados Task o Pass: ValidarPedido, CobrarPedido y EnviarPedido. Encadénalos con Next.',
        'Si usas Task, invoca una Lambda de prueba por estado. Si no quieres crear Lambdas, usa Pass con Result para simular la salida.',
        'Agrega un Catch en CobrarPedido que lleve a un estado PedidoFallido.',
        'Ejecuta con un input JSON de pedido y revisa el gráfico: los estados exitosos en verde y el error controlado.',
        'Borra la state machine al terminar. Standard cobra por transición de estado.',
      ],
      verifica:
        'La ejecución muestra los tres pasos y, al forzar un error, el flujo va al estado de fallo sin quedarse colgado.',
      limpieza: 'Delete state machine y borra las Lambdas de prueba si las creaste.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 1 — Step Functions',
        quiere:
          'crear una state machine de 3 pasos para validar, cobrar y enviar un pedido, con un Catch que lleve a un estado de fallo',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'Quiero el JSON mínimo de la state machine y cómo probar el flujo sin crear cinco Lambdas. Explícame el costo por transición y cómo borrarla.',
      }),
    },
    {
      id: 'lab-2',
      titulo: 'Kinesis + Firehose: clics hacia S3',
      objetivo:
        'Ver un flujo de eventos en tiempo casi real y su entrega a S3 sin administrar servidores.',
      como: [
        'Consola → Kinesis → Data streams → Create stream. Nombre: shop-clicks. Para el laboratorio usa Provisioned con 1 shard; si tu consola solo ofrece On-demand, elige esa opción y no configures shards.',
        'Consola → Kinesis → Firehose → Create delivery stream. Source: el stream shop-clicks. Destination: S3.',
        'Crea el bucket shop-clicks-lab y elige un prefijo como clicks/.',
        'Baja el buffer a 60 segundos y 1 MB para ver resultados rápido en el laboratorio.',
        'Envía eventos con aws kinesis put-record o un script Node con PutRecordCommand. Cada evento: { userId, productId, accion: "view" }.',
        'Espera el buffer y revisa los objetos en S3. Firehose escribe archivos, no un registro por línea.',
        'Borra el delivery stream, el data stream y el bucket al terminar.',
      ],
      verifica:
        'Aparecen objetos en S3 con los eventos enviados y puedes explicar la diferencia entre Kinesis Data Streams y Firehose.',
      limpieza:
        'Delete delivery stream, delete data stream y vaciar/borrar el bucket. Firehose y Kinesis cobran por hora y por shard.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 2 — Kinesis + Firehose',
        quiere:
          'crear un stream de 1 shard y un delivery stream de Firehose hacia S3, enviar eventos de clics y ver los archivos en el bucket',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'Explícame la diferencia entre Kinesis Data Streams y Firehose, qué es el buffer y cómo borrar todo sin dejar cargos.',
      }),
    },
    {
      id: 'lab-3',
      titulo: 'Athena: una consulta SQL sobre S3',
      objetivo:
        'Consultar datos que ya están en S3 sin cargarlos en una base de datos.',
      como: [
        'Usa los archivos que Firehose dejó en shop-clicks-lab, o exporta un log pequeño a S3.',
        'Consola → Athena → Query editor. Configura un bucket de resultados de consultas.',
        'Crea una base de datos: CREATE DATABASE shop_lab;',
        'Crea una tabla externa sobre el prefijo de S3. Si los datos son JSON, usa el SerDe de JSON y mapea las columnas.',
        'Ejecuta una consulta concreta: cuenta eventos por productId o por acción.',
        'Revisa el costo escaneado. Athena cobra por TB leído: particiona y comprime para reducir.',
        'Borra la tabla, la base de datos y el bucket de resultados del lab.',
      ],
      verifica:
        'Una query devuelve filas reales y sabes explicar por qué Athena no necesita un servidor ni una base cargada.',
      limpieza:
        'DROP TABLE y DROP DATABASE en Athena; borra el bucket de resultados y los datos del lab.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 3 — Athena',
        quiere:
          'crear una tabla externa en Athena sobre los archivos de S3 y ejecutar una consulta SQL que cuente eventos por producto',
        yaHice: 'el lab de Kinesis + Firehose con archivos en S3',
        extra:
          'Dame el CREATE EXTERNAL TABLE mínimo para JSON y explícame por qué el costo depende de los bytes escaneados, no de las filas.',
      }),
    },
    {
      id: 'lab-4',
      titulo: 'Bedrock + Tarea 2.3 de seguridad de IA',
      objetivo:
        'Invocar un modelo para generar una descripción de producto y estudiar permisos, privacidad, filtrado, prompt injection y logs sin PII.',
      como: [
        'Consola → Bedrock → Model access → Request access al modelo que vayas a usar. Espera la aprobación.',
        'Prueba primero en el playground con un prompt: "Genera una descripción de 40 palabras para un jabón de avena".',
        'Invoca desde la CLI o SDK con bedrock-runtime. Revisa el modelo, el body y la respuesta.',
        'Tarea 2.3: limita el permiso IAM a bedrock:InvokeModel sobre el ARN del modelo, no a todos.',
        'Privacidad: no envíes datos personales de clientes al modelo. Usa datos de producto o datos sintéticos.',
        'Filtrado: prueba un prompt con instrucciones maliciosas y observa cómo responde. No confíes solo en el prompt del sistema.',
        'Prompt injection: si el modelo lee reseñas de usuarios, trátalas como datos no confiables, nunca como instrucciones.',
        'Logs: registra el id de la petición y el modelo, no el prompt con PII ni la respuesta completa con datos personales.',
      ],
      verifica:
        'Obtienes una descripción generada y puedes explicar los cinco puntos de la Tarea 2.3 con un ejemplo de la tienda.',
      limpieza:
        'Bedrock cobra por tokens. No hay recurso persistente que borrar, pero no dejes scripts en bucle invocando el modelo.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 4 — Bedrock y seguridad de IA',
        quiere:
          'invocar un modelo de Bedrock para generar la descripción de un producto y entender los controles de la Tarea 2.3: permisos, privacidad, filtrado, prompt injection y logs sin PII',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'Dame un prompt de ejemplo y el permiso IAM mínimo. Explícame qué NO debo registrar en CloudWatch y cómo detectar un intento de prompt injection en una reseña.',
      }),
    },
    {
      id: 'lab-5',
      titulo: 'ElastiCache / DAX: caché para el catálogo',
      objetivo:
        'Decidir con argumentos si el catálogo necesita caché en memoria y por qué no se deja encendido.',
      como: [
        'Mide primero: tiempo de getProducts con DynamoDB y con CloudFront delante. Anota el número.',
        'DAX acelera lecturas de DynamoDB con microsegundos, pero requiere una VPC y un cluster con costo por hora.',
        'ElastiCache (Redis o Memcached) sirve para sesiones, rankings o catálogos con invalidación explícita. También cobra por hora y por nodo.',
        'Para esta tienda, el catálogo cambia poco y CloudFront ya cachea las fotos. Un GSI-Category bien usado puede ser suficiente.',
        'Si quieres practicar, crea un cluster pequeño, mide una lectura y bórralo el mismo día. No lo dejes encendido.',
        'Documenta la decisión: qué probaste, qué número obtuviste y por qué no lo dejaste.',
      ],
      verifica:
        'Puedes explicar cuándo usarías DAX, cuándo ElastiCache y por qué este proyecto no los necesita encendidos.',
      limpieza: 'Delete cluster y subnet group si lo creaste. Verifica en Billing que no quede ningún nodo.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 5 — ElastiCache / DAX',
        quiere:
          'entender cuándo cachear el catálogo con DAX o ElastiCache, comparar latencia y costo, y decidir si esta tienda lo necesita',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'No quiero dejar un cluster encendido. Explícame el costo por hora, la diferencia entre DAX y ElastiCache y una alternativa sin caché administrado.',
      }),
    },
    {
      id: 'lab-6',
      titulo: 'RDS / Aurora: cuándo SQL en vez de DynamoDB',
      objetivo:
        'Razonar la elección de base de datos sin crear una instancia cara.',
      como: [
        'Piensa en los datos de la tienda: pedidos con totales, productos con categorías, reportes de ventas por mes.',
        'DynamoDB brilla en acceso por clave, escala horizontal y esquema flexible. No es ideal para joins ad hoc ni reportes SQL complejos.',
        'RDS/Aurora brilla en transacciones relacionales, integridad referencial y consultas SQL. Cobra por instancia o por ACU.',
        'No crees una instancia grande para el laboratorio. Si practicas, usa la opción más pequeña posible y bórrala el mismo día.',
        'Escribe una respuesta de examen: "usaría RDS si necesitara reportes con joins y transacciones entre varias tablas; usaría DynamoDB si el patrón de acceso es por clave y necesito escala sin administrar servidores".',
        'Revisa si el proyecto necesita reportes SQL. Si no, la decisión correcta es no crear la base.',
      ],
      verifica:
        'Puedes defender DynamoDB para la tienda y describir un caso concreto donde elegirías Aurora.',
      limpieza: 'Si creaste algo, elimina la instancia, las subredes y los snapshots. RDS cobra aunque no haya tráfico.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 6 — RDS / Aurora',
        quiere:
          'entender cuándo usar RDS o Aurora en vez de DynamoDB, sin crear una base cara, y saber defender la decisión en una pregunta de escenario',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'Dame dos escenarios de la tienda donde DynamoDB gana y dos donde Aurora gana. No quiero crear una instancia real.',
      }),
    },
    {
      id: 'lab-7',
      titulo: 'Testing: 5 tests con SAM y mock de API Gateway',
      objetivo:
        'Probar una Lambda como una función, no como una caja negra, con eventos reales de API Gateway.',
      como: [
        'Crea tests para createOrder: caso feliz, body vacío, items inválidos, stock insuficiente y usuario no autorizado.',
        'Usa Vitest o Jest. Para el SDK v3, mockea el cliente con aws-sdk-client-mock para no llamar a AWS.',
        'Crea un evento JSON de API Gateway que incluya requestContext.authorizer.claims.sub y un body de pedido. Si usas HTTP API con JWT authorizer, la ruta es requestContext.authorizer.jwt.claims.sub.',
        'Prueba el handler directamente: const respuesta = await handler(evento, contexto).',
        'Verifica statusCode, el cuerpo JSON y que el mock de DynamoDB recibió el comando esperado.',
        'Ejecuta sam local invoke con un evento JSON para probar el empaquetado real.',
        'No persigas 100 % de cobertura: cubre los caminos que pueden romper una compra.',
      ],
      verifica:
        'Los 5 tests pasan sin credenciales de AWS y uno de ellos simula un fallo de stock con ConditionalCheckFailedException.',
      limpieza: 'No hay recursos que borrar. Los tests corren en tu Mac.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 7 — Testing con SAM',
        quiere:
          'escribir 5 tests para la Lambda createOrder con Vitest, mockear DynamoDB con aws-sdk-client-mock y crear un evento JSON de API Gateway con claims de Cognito',
        yaHice: 'la tienda completa hasta el Paso 13',
        extra:
          'Quiero el ejemplo del mock de DynamoDB y cómo ejecutar un test de sam local invoke. Explícame qué casos cubren el camino crítico de una compra.',
      }),
    },
    {
      id: 'lab-8',
      titulo: 'Blue/green y canary con Lambda aliases',
      objetivo:
        'Mover tráfico entre dos versiones de una Lambda y volver atrás sin tocar el código.',
      como: [
        'Crea una Lambda de prueba que devuelva la versión en el body. Publica la versión 1 y crea el alias live apuntando a ella.',
        'Cambia el código, publica la versión 2 y deja el alias en la 1. La URL del alias sigue estable.',
        'Crea una aplicación de CodeDeploy para Lambda y un deployment group que use el alias live.',
        'Configura un despliegue canary: 10 % del tráfico a la versión 2 durante 5 minutos, luego 100 %.',
        'En SAM, esto se declara con AutoPublishAlias y DeploymentPreference. En la consola, CodeDeploy hace el cambio gradual.',
        'Observa las alarmas y las métricas durante el despliegue. Si algo falla, CodeDeploy vuelve a la versión 1.',
        'Practica el rollback manual y borra la aplicación, el deployment group y la función de prueba.',
      ],
      verifica:
        'Ves el cambio de peso entre versiones y un rollback que devuelve el 100 % a la versión anterior.',
      limpieza:
        'Delete CodeDeploy application, deployment group y Lambda de prueba. Revisa que no quede ningún alias huérfano.',
      prompt: construirPrompt({
        paso: 14,
        titulo: 'Lab 8 — Blue/green y canary',
        quiere:
          'crear una Lambda de prueba con alias live, publicar dos versiones y usar CodeDeploy para un canary de 10 % durante 5 minutos, con rollback',
        yaHice: 'los Pasos 10 y 13: SAM, CI/CD y frontend en producción',
        extra:
          'Explícame la diferencia entre blue/green, canary y linear, y cómo se ve el rollback en CodeDeploy. Muéstrame solo el AppSpec y la configuración mínima.',
      }),
    },
  ],
  sugerenciaVue: {
    titulo: 'Slots, Teleport y Suspense en los labs de UI',
    porque:
      'Los labs añaden diálogos, paneles y vistas que no son parte del catálogo. Con slots reutilizas OrderCard sin copiarlo; con Teleport evitas que un modal quede recortado; con Suspense puedes mostrar un esqueleto mientras carga una vista pesada.',
    ejemplo: [
      '<!-- OrderCard reutilizable con acciones -->',
      '<OrderCard :order="pedido">',
      '  <template #acciones>',
      '    <AppButton @click="cancelar">Cancelar</AppButton>',
      '  </template>',
      '</OrderCard>',
    ].join('\n'),
  },
}
