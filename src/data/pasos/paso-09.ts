import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso09: Paso = {
  id: 'paso-9',
  numero: 9,
  titulo: 'CloudWatch + X-Ray: ver qué pasa',
  resumen:
    'Pasar de "no sé qué falló" a un log estructurado, una métrica, una alarma y un trace completo de la compra.',
  objetivo:
    'Encontrar una compra en CloudWatch Logs Insights y recorrer su traza de API Gateway a Lambda y DynamoDB en X-Ray.',
  acciones: [
    {
      id: 'paso-9.1',
      texto: 'Activar logs estructurados en todas las Lambdas',
      detalle:
        'JSON con requestId, userId, acción y resultado. Nada de console.log("aquí entré").',
      skills: ['4.1.2', '4.2.1'],
    },
    {
      id: 'paso-9.2',
      texto: 'Crear métricas personalizadas de pedidos creados y errores de Lambda',
      detalle:
        'Puedes usar Embedded Metric Format en el log para no hacer llamadas extra a CloudWatch.',
      skills: ['4.1.3', '4.2.2'],
    },
    {
      id: 'paso-9.3',
      texto: 'Crear una alarma si los errores superan 5 en 5 minutos',
      detalle:
        'La alarma debe avisar a un tema SNS con tu correo. Una alarma sin destinatario no sirve.',
      skills: ['4.2.3', '4.2.4'],
    },
    {
      id: 'paso-9.4',
      texto: 'Activar X-Ray en API Gateway y Lambda y revisar el trace de una compra',
      detalle:
        'Modo Active en la Lambda y tracing habilitado en el stage de API Gateway.',
      skills: ['4.2.5'],
    },
  ],
  verifica: [
    {
      id: 'paso-9.v1',
      texto: 'Trace completo en X-Ray y query útil en CloudWatch Logs Insights',
      detalle:
        'La query debe filtrar por acción u orderId, no solo por @message. Si no encuentras la compra, el requestId no se está propagando.',
      skills: ['4.2.1', '4.2.5'],
    },
  ],
  skills: ['4.1.2', '4.1.3', '4.2.1', '4.2.2', '4.2.3', '4.2.4', '4.2.5'],
  guia: [
    {
      tipo: 'texto',
      md: 'En el examen, "troubleshooting" no significa adivinar: significa seguir una traza y leer una métrica. Aquí vas a instrumentar la tienda para que una compra se pueda rastrear de punta a punta. La regla es que cada log tenga un requestId y una acción; sin eso, CloudWatch es un vertedero de texto.',
    },
    {
      tipo: 'lista',
      titulo: 'Logs estructurados',
      items: [
        'Crea src/lib/logger.ts en el backend (junto a los handlers, no dentro de un layer todavía). Recibe acción, userId, orderId y resultado, y devuelve un solo JSON.',
        'En el Paso 10 mueve logger.ts al layer compartido shop-shared para reutilizarlo en todas las Lambdas sin copiarlo.',
        'En cada handler, genera o toma el requestId de event.requestContext.requestId. No inventes uno nuevo si ya viene.',
        'Registra el inicio y el fin de la operación. En errores, registra el nombre del error y el stack, nunca el token ni la contraseña.',
        'No uses console.log con strings concatenados: CloudWatch no puede filtrar por campos si todo es texto plano.',
        'Prueba una compra y busca el requestId en Logs Insights.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        '// src/lib/logger.ts',
        'export function log(evento: {',
        '  accion: string',
        '  requestId?: string',
        '  userId?: string',
        '  orderId?: string',
        '  resultado: "ok" | "error"',
        '  detalle?: string',
        '}) {',
        '  console.log(JSON.stringify({',
        '    nivel: evento.resultado === "ok" ? "INFO" : "ERROR",',
        '    timestamp: new Date().toISOString(),',
        '    ...evento,',
        '  }))',
        '}',
        '',
        '// Métrica personalizada con Embedded Metric Format',
        'export function metricaPedidoCreado(cantidad = 1) {',
        '  console.log(JSON.stringify({',
        '    _aws: {',
        '      Timestamp: Date.now(),',
        '      CloudWatchMetrics: [{',
        '        Namespace: "Shop",',
        '        Dimensions: [["Entorno"]],',
        '        Metrics: [{ Name: "OrdersCreated", Unit: "Count" }],',
        '      }],',
        '    },',
        '    Entorno: process.env.ENTORNO ?? "dev",',
        '    OrdersCreated: cantidad,',
        '  }))',
        '}',
      ].join('\n'),
      nota: 'Con EMF, CloudWatch crea la métrica a partir del log. No necesitas llamar a PutMetricData, que añade latencia y permisos extra.',
    },
    {
      tipo: 'lista',
      titulo: 'Alarma de errores',
      items: [
        'Consola → CloudWatch → Alarms → Create alarm → Select metric → Lambda → tu función → Errors.',
        'Estadística Sum, periodo 5 minutos, umbral mayor que 5.',
        'Acción: enviar a un tema SNS y suscribir tu correo. Confirma la suscripción.',
        'Pon nombre y descripción claros: "Shop-Orders: más de 5 errores en 5 min".',
        'Prueba la alarma forzando errores en una Lambda de prueba. Una alarma que nunca se probó no se sabe si funciona.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'X-Ray de una compra',
      items: [
        'En la función Lambda, activa Active tracing. En SAM: Tracing: Active en Globals o en la función.',
        'En API Gateway, entra al stage (Prod o dev) → Logs and tracing → X-Ray tracing: Enable.',
        'Verifica que el rol de la Lambda tenga xray:PutTraceSegments y xray:PutTelemetryRecords. SAM lo agrega con Tracing: Active.',
        'Haz una compra y abre CloudWatch → X-Ray traces → Service map. Debes ver API Gateway → Lambda → DynamoDB.',
        'En el trace, revisa la duración de cada segmento. Si DynamoDB tarda, el problema no es el frontend.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'sql',
      codigo: [
        '-- CloudWatch Logs Insights: últimas compras fallidas',
        'fields @timestamp, accion, requestId, userId, orderId, detalle',
        '| filter accion = "createOrder" and resultado = "error"',
        '| sort @timestamp desc',
        '| limit 20',
      ].join('\n'),
      nota: 'Si los campos no aparecen, el log no es JSON válido o está dentro de un string. Revisa el primer evento de la Lambda.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Qué mirar primero en un incidente',
      md: '1) ¿La Lambda tiene errores o timeouts? 2) ¿El log trae requestId? 3) ¿X-Ray muestra el cuello de botella en DynamoDB, en la API o en una integración? 4) ¿La alarma avisó? Ese orden evita cambiar código a ciegas.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Cuando una compra falla, muestra el requestId en la pantalla de error y cópialo al portapapeles. Con provide/inject puedes tener un composable de toasts que reciba el requestId sin pasarlo por props por medio árbol.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 9,
    titulo: 'CloudWatch + X-Ray: ver qué pasa',
    quiere:
      'instrumentar las Lambdas con logs JSON que incluyan requestId, userId y acción; crear métricas de pedidos y errores; una alarma de más de 5 errores en 5 minutos; y activar X-Ray en API Gateway y Lambda para ver una compra completa',
    yaHice: 'los Pasos 0 a 8: frontend, DynamoDB, API, Cognito, pedidos, fotos, SQS/SNS y secretos',
    extra:
      'Quiero una query de CloudWatch Logs Insights que me sirva para encontrar un pedido fallido por orderId, y entender cómo se propaga el requestId entre API Gateway y Lambda. No me des todo el proyecto.',
  }),
  sugerenciaVue: {
    titulo: 'provide/inject para requestId y toasts',
    porque:
      'El requestId de un error se necesita en la vista, en el toast y quizá en el reporte. Pasarlo por props obliga a que todos los componentes intermedios lo conozcan. Con provide/inject el árbol lo comparte sin acoplar la cadena de componentes.',
    ejemplo: [
      'const REQUEST_ID = Symbol("requestId")',
      'provide(REQUEST_ID, readonly(requestId))',
      '',
      '// En un descendiente',
      'const requestId = inject(REQUEST_ID)',
    ].join('\n'),
  },
}
