import type { DominioCobertura, SeccionCierre } from '@/types/proyecto'

export const DATOS_EXAMEN = {
  codigo: 'DVA-C03',
  preguntas: 65,
  preguntasPuntuadas: 50,
  preguntasNoPuntuadas: 15,
  duracionMinutos: 130,
  escala: '100–1000',
  corte: 720,
  tareas: 12,
  habilidades: 72,
  cobertura: '70–80 %',
  dominios: 'Desarrollo 30 % · Seguridad 26 % · Testing y Deployment 22 % · Troubleshooting y Optimización 22 %',
}

export const SECCIONES_CIERRE: SeccionCierre[] = [
  {
    id: 'cierre-terminado',
    titulo: 'Definición de terminado',
    descripcion:
      'El proyecto está listo cuando puedes demostrar estas seis cosas, no cuando terminaste los pasos.',
    acciones: [
      {
        id: 'cierre-terminado.1',
        texto: 'Puedes registrarte, comprar y ver tu pedido de punta a punta en producción',
        detalle: 'Con la URL de CloudFront, no con localhost.',
      },
      {
        id: 'cierre-terminado.2',
        texto: 'Un admin puede crear un producto con foto y cambiar un pedido a enviado',
        detalle: 'Prueba con un usuario del grupo admin, no con root.',
      },
      {
        id: 'cierre-terminado.3',
        texto: 'Un pedido fallido termina en la DLQ y lo ves en CloudWatch',
        detalle: 'Forzar el error es parte de la demostración.',
      },
      {
        id: 'cierre-terminado.4',
        texto: 'Puedes desplegar con un push a GitHub y hacer rollback',
        detalle: 'El rollback debe estar probado, no solo configurado.',
      },
      {
        id: 'cierre-terminado.5',
        texto:
          'Puedes explicar sin leer por qué Lambda y no EC2, DynamoDB y no RDS, SQS y no llamada directa, presigned URL y no bucket público',
        detalle: 'Cuatro decisiones, una frase cada una.',
      },
      {
        id: 'cierre-terminado.6',
        texto: 'Sacas 80 % o más en mocks varias veces seguidas',
        detalle: 'Sin fallar siempre en el mismo dominio.',
      },
    ],
  },
  {
    id: 'cierre-costos',
    titulo: 'Costos y limpieza',
    descripcion:
      'Los créditos no son infinitos. Estas reglas se aplican durante todo el proyecto, no al final.',
    acciones: [
      {
        id: 'cierre-costos.1',
        texto: 'Revisar Billing cada 2 días',
        detalle: 'Especialmente después de cada lab.',
      },
      {
        id: 'cierre-costos.2',
        texto: 'Borrar tablas, buckets, colas y servicios ECS cuando termines un lab',
        detalle: 'Un recurso apagado no siempre es un recurso sin costo.',
      },
      {
        id: 'cierre-costos.3',
        texto: 'No crear EKS, RDS grande ni dejar NAT Gateway prendido',
        detalle: 'Ninguno de los tres aporta al objetivo de este proyecto.',
      },
      {
        id: 'cierre-costos.4',
        texto: 'Si algo cobra más de 5 USD en un día y no sabes por qué, pararlo y preguntar',
        detalle: 'Revisa Cost Explorer por servicio antes de asumir.',
      },
      {
        id: 'cierre-costos.5',
        texto: 'Mantener DynamoDB on-demand, Lambda en free tier y S3 con pocos archivos de prueba',
        detalle: 'La configuración del proyecto ya está pensada para eso.',
      },
    ],
  },
  {
    id: 'cierre-cobertura',
    titulo: 'Brechas de cobertura cubiertas',
    descripcion:
      'La tienda cubre aproximadamente 70–80 % del examen. Estas son las brechas que se cierran con labs aparte.',
    acciones: [
      {
        id: 'cierre-cobertura.1',
        texto: 'Tarea 2.3 de seguridad de IA cubierta con el lab de Bedrock',
        detalle: 'Permisos, privacidad, filtrado, prompt injection y logs sin PII.',
      },
      {
        id: 'cierre-cobertura.2',
        texto: 'Blue/green y canary practicados en una Lambda de prueba',
        detalle: 'Lab 8: aliases, CodeDeploy, cambio de tráfico y rollback.',
      },
      {
        id: 'cierre-cobertura.3',
        texto: 'Optimización de memoria y concurrencia practicada',
        detalle: 'Paso 12: 128 vs 512 MB, provisión de concurrencia y caching.',
      },
      {
        id: 'cierre-cobertura.4',
        texto: 'Labs fuera del proyecto completados en orden',
        detalle:
          'Step Functions, Kinesis + Firehose, Athena, Bedrock, ElastiCache/DAX, RDS/Aurora, testing y blue/green.',
      },
    ],
  },
]

export const DOMINIOS_COBERTURA: DominioCobertura[] = [
  {
    id: 'dominio-1',
    nombre: 'Desarrollo con AWS',
    peso: '30 %',
    estado: 'casi-completo',
    cubre: [
      'Lambda',
      'API Gateway',
      'DynamoDB',
      'S3',
      'SQS',
      'SNS',
      'EventBridge',
      'SDKs',
      'APIs',
      'eventos',
      'streaming básico',
    ],
    falta: 'Profundizar en streaming con Kinesis (lab 2).',
    pasos: [1, 3, 5, 7, 8],
  },
  {
    id: 'dominio-2',
    nombre: 'Seguridad',
    peso: '26 %',
    estado: 'casi-completo',
    cubre: [
      'Cognito',
      'IAM',
      'presigned URLs',
      'KMS',
      'Secrets Manager',
      'ACM',
    ],
    falta: 'La parte de IA (Tarea 2.3) se cubre aparte en el lab 4.',
    pasos: [0, 4, 6, 8, 12, 14],
  },
  {
    id: 'dominio-3',
    nombre: 'Testing y Deployment',
    peso: '22 %',
    estado: 'parcial',
    cubre: [
      'SAM',
      'CloudFormation',
      'CodePipeline',
      'CodeBuild',
      'CodeDeploy',
      'ECR',
      'ECS/Fargate',
      'API Gateway stages',
      'Lambda layers',
      'zip',
    ],
    falta: 'Practicar blue/green y canary a fondo en el lab 8.',
    pasos: [3, 10, 11, 13, 14],
  },
  {
    id: 'dominio-4',
    nombre: 'Troubleshooting y Optimización',
    peso: '22 %',
    estado: 'parcial',
    cubre: [
      'CloudWatch Logs',
      'métricas',
      'alarmas',
      'X-Ray',
      'SQS DLQ',
      'errores de Lambda',
      'caching',
    ],
    falta: 'Optimización de memoria y concurrencia en el Paso 12.',
    pasos: [9, 12, 14],
  },
]

export const FUERA_DE_ALCANCE = [
  'SageMaker AI',
  'Amazon Polly',
  'Amazon Rekognition',
]

export const TEMAS_OPCIONALES = [
  'Aurora/RDS como alternativa a DynamoDB',
  'ElastiCache/DAX como caché',
  'Kinesis/Firehose/Athena/OpenSearch para streaming y analítica',
  'Step Functions para workflows',
  'Elastic Beanstalk/Amplify como otras formas de desplegar',
  'Bedrock/Bedrock AgentCore/Quick/Kiro para IA',
]
