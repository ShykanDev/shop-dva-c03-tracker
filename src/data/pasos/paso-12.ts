import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso12: Paso = {
  id: 'paso-12',
  numero: 12,
  titulo: 'Optimización y seguridad final',
  resumen:
    'Medir memoria y concurrencia, entender el caché y cerrar cifrado, HTTPS y WAF con criterio.',
  objetivo:
    'Poder explicar sin leer por qué elegiste cada configuración de rendimiento, costo y seguridad.',
  acciones: [
    {
      id: 'paso-12.1',
      texto: 'Probar una Lambda con 128 MB y con 512 MB, midiendo tiempo y costo',
      detalle:
        'Más memoria también da más CPU. A veces 512 MB termina siendo más barato porque dura menos.',
      skills: ['4.3.1', '4.3.2'],
    },
    {
      id: 'paso-12.2',
      texto: 'Probar provisioned concurrency en una Lambda crítica',
      detalle:
        'Úsala si el arranque en frío afecta la compra. Tiene costo por hora: no la dejes encendida en el lab.',
      skills: ['4.3.1'],
    },
    {
      id: 'paso-12.3',
      texto: 'Probar caching: ElastiCache o DAX en concepto y CloudFront para fotos',
      detalle:
        'No necesitas dejar ElastiCache ni DAX prendidos. CloudFront para imágenes sí aporta desde el Paso 6.',
      skills: ['4.3.4', '4.3.5'],
    },
    {
      id: 'paso-12.4',
      texto: 'Revisar cifrado en reposo y en tránsito, ACM para HTTPS y WAF básico en API Gateway',
      detalle:
        'DynamoDB y S3 cifrados, TLS en CloudFront y API, ACM en us-east-1 para CloudFront y WAF con reglas administradas.',
      skills: ['2.2.1', '2.2.2', '2.2.4'],
    },
  ],
  verifica: [
    {
      id: 'paso-12.v1',
      texto: 'Puedes explicar por qué elegiste cada configuración, sin leer',
      detalle:
        'Memoria, concurrencia, caché, cifrado y WAF. Si solo recuerdas el nombre del servicio, repite la medición.',
      skills: ['4.3.1', '4.3.2'],
    },
  ],
  skills: ['4.3.1', '4.3.2', '4.3.4', '4.3.5', '2.2.1', '2.2.2', '2.2.4'],
  guia: [
    {
      tipo: 'texto',
      md: 'Optimizar no es poner el número más grande. Es medir. La memoria de una Lambda cambia la CPU y el tiempo; la concurrencia reservada cambia el arranque en frío y el costo; el caché cambia la latencia y la factura de DynamoDB. En este paso vas a probar, comparar y quedarte con una decisión que puedas defender.',
    },
    {
      tipo: 'lista',
      titulo: 'Memoria: 128 vs 512 MB',
      items: [
        'Elige una Lambda representativa, por ejemplo getProducts o createOrder. No pruebes con una función que solo devuelve "hola".',
        'Ejecuta 10 invocaciones con 128 MB y anota la duración media en CloudWatch. Repite con 512 MB.',
        'Compara el costo: GB-segundo = memoria en GB × duración en segundos. A veces 512 MB dura menos de la mitad y sale más barato.',
        'Prueba también 1024 MB si tu función hace procesamiento de imágenes. No asumas; mide.',
        'Deja la configuración elegida documentada en el README con el número y la razón.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'bash',
      codigo: [
        '# Cambiar memoria y ejecutar una prueba',
        'aws lambda update-function-configuration \\',
        '  --function-name getProducts \\',
        '  --memory-size 128',
        '',
        'aws lambda invoke \\',
        '  --function-name getProducts \\',
        '  --payload \'{}\' \\',
        '  respuesta.json',
        '',
        '# Después repite con --memory-size 512',
      ].join('\n'),
      nota: 'La duración aparece en CloudWatch → Logs → REPORT. Compara Duration y Billed Duration, no solo el tiempo que ves en la consola.',
    },
    {
      tipo: 'lista',
      titulo: 'Provisioned concurrency',
      items: [
        'Elige la Lambda crítica: la que crea el pedido o la que lee el catálogo en la portada.',
        'En la consola: Configuration → Concurrency → Provisioned concurrency. Asigna 1 o 2 para el laboratorio.',
        'Publica una versión o usa un alias; provisioned concurrency se aplica a versiones o aliases, no al $LATEST.',
        'Mide el arranque en frío antes y después. Si no hay diferencia perceptible en tu tráfico, no la necesitas.',
        'Borra la configuración al terminar. Se cobra por capacidad reservada aunque no haya tráfico.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Caché: cuándo sí y cuándo no',
      items: [
        'CloudFront para fotos: sí. Las imágenes cambian poco y el CDN reduce latencia y costo de S3.',
        'DAX para DynamoDB: solo si tienes lecturas muy calientes y necesitas microsegundos. Para este proyecto, un GSI bien diseñado y CloudFront son suficientes.',
        'ElastiCache: útil para sesiones o catálogos con lógica de invalidación. Añade una VPC, subredes y costo por hora. No lo dejes prendido.',
        'Documenta qué caché probaste y por qué no lo dejaste. "No lo usé porque el catálogo se cachea en CloudFront" es una respuesta válida.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Cifrado, HTTPS y WAF',
      items: [
        'DynamoDB: cifrado en reposo activado por defecto con clave administrada por AWS. Si necesitas controlar la clave, usa KMS con una CMK.',
        'S3: SSE-S3 o SSE-KMS. Con SSE-KMS, la Lambda necesita kms:Decrypt y kms:GenerateDataKey sobre la clave.',
        'En tránsito: solo HTTPS. CloudFront con certificado ACM en us-east-1; API Gateway con custom domain y certificado.',
        'WAF: asócialo al stage de API Gateway o a CloudFront. Empieza con reglas administradas (Core rule set) y rate limiting. WAF tiene costo mensual: actívalo, prueba y decide.',
        'No pongas TLS 1.0. Usa la política mínima TLS 1.2.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'Costo de las pruebas',
      md: 'Provisioned concurrency, WAF, DAX y ElastiCache cobran por tiempo, no por uso. Para el laboratorio, actívalos el tiempo necesario y apágalos el mismo día. El paso 12 no requiere dejarlos encendidos para la demo.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Si el catálogo crece, guarda la lista en shallowRef o en un computed que no reaccione a cada propiedad interna. Recalcular filtros en la plantilla en cada render es una optimización barata que se nota en móviles.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 12,
    titulo: 'Optimización y seguridad final',
    quiere:
      'medir una Lambda con 128 MB y 512 MB, probar provisioned concurrency en una función crítica, entender el caching con CloudFront/DAX/ElastiCache y revisar cifrado, ACM y WAF básico',
    yaHice: 'los Pasos 0 a 11: tienda completa, observabilidad, CI/CD y el servicio en Fargate',
    extra:
      'Quiero saber cómo calcular el costo por GB-segundo y por qué más memoria puede salir más barato. Explícame cuándo NO vale la pena DAX ni ElastiCache en esta tienda y cómo apagar provisioned concurrency.',
  }),
  sugerenciaVue: {
    titulo: 'computed para filtros, shallowRef para listas grandes',
    porque:
      'Un computed cachea el resultado y solo se recalcula cuando cambian sus dependencias. Con una lista de cientos de productos, envolverla en shallowRef evita que Vue rastree cada propiedad interna y reduzca el costo de reactividad sin perder la actualización cuando reemplazas la lista.',
    ejemplo: [
      'const productos = shallowRef<Product[]>([])',
      '',
      'const filtrados = computed(() =>',
      '  productos.value.filter((p) =>',
      '    p.name.toLowerCase().includes(busqueda.value.toLowerCase()),',
      '  ),',
      ')',
    ].join('\n'),
  },
}
