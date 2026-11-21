import type {
  BucketProyecto,
  GrupoLambdas,
  ProyectoReferencia,
  RutaProyecto,
  StoreProyecto,
  TablaProyecto,
} from '@/types/proyecto'
import {
  BUCKETS as CONTRATOS_BUCKETS,
  LAMBDAS as CONTRATOS_LAMBDAS,
  RUTAS as CONTRATOS_RUTAS,
  STORES as CONTRATOS_STORES,
  TABLAS as CONTRATOS_TABLAS,
} from './contratos'

export const PROYECTO: ProyectoReferencia = {
  nombre: 'Shop — Tienda en línea serverless',
  idea:
    'Una tienda real de productos naturales / de farmacia, como un Amazon chiquito, donde un cliente compra y un admin gestiona productos y pedidos.',
  usuarios: [
    {
      rol: 'Cliente',
      hace: 'Se registra, busca productos, agrega al carrito, hace un pedido y ve sus pedidos.',
    },
    {
      rol: 'Admin',
      hace: 'Sube productos con fotos, ve pedidos, cambia el estado de pendiente a enviado y ve ventas.',
    },
  ],
  flujo: [
    'El cliente entra a la tienda y ve el catálogo con fotos, precios y stock.',
    'Busca un producto, abre su detalle y lo agrega al carrito.',
    'Va al checkout y confirma su pedido.',
    'El pedido queda guardado y le llega una confirmación.',
    'El admin ve el pedido en su panel y lo marca como enviado.',
    'El cliente ve su pedido como enviado.',
  ],
  stack: [
    {
      grupo: 'Frontend',
      items: [
        'Vue 3 + TypeScript + Vite',
        'Pinia con stores: auth, cart, products, orders y admin',
        'Tailwind CSS',
        'Vue Router',
        'AWS SDK for JavaScript v3 (@aws-sdk/client-dynamodb, @aws-sdk/client-s3, @aws-sdk/client-cognito-identity-provider, etc.)',
        'Axios o fetch con token de Cognito',
      ],
    },
    {
      grupo: 'Backend y AWS',
      items: [
        'Lambda con Node.js 20 en TypeScript',
        'AWS SAM + CloudFormation',
        'API Gateway REST API',
        'DynamoDB on-demand',
        'S3 para fotos y frontend',
        'CloudFront para el frontend y las imágenes',
        'Cognito User Pool para login y registro',
        'SQS + Dead-Letter Queue',
        'SNS para notificaciones',
        'EventBridge para eventos programados',
        'Secrets Manager y Parameter Store',
        'CloudWatch Logs, métricas, alarmas y X-Ray',
        'CodePipeline + CodeBuild + CodeDeploy',
        'ECR + ECS con Fargate para un solo servicio',
        'ACM para HTTPS',
      ],
    },
  ],
  cuenta: {
    region: 'us-east-1 (Virginia)',
    creditos: '180 USD',
    alarmas: ['5 USD', '20 USD'],
    reglas: [
      'No dejar EC2 ni ECS prendidos todo el día.',
      'Usar serverless como base.',
      'Borrar cada lab cuando termine.',
      'DynamoDB en modo on-demand.',
      'Lambda en free tier (1M requests).',
      'S3 con pocos archivos de prueba.',
    ],
  },
  contratoLambda: [
    'Handler exportado y una operación por función.',
    'Variables de entorno en Parameter Store / Secrets Manager.',
    'Rol IAM de mínimo privilegio.',
    'Timeout y memoria configurados.',
    'Logs estructurados en CloudWatch.',
    'X-Ray activado.',
  ],
  reglasAmazonQ: [
    'Pregunta por un paso, un error o un concepto, no por el proyecto completo.',
    'Da contexto: stack, paso actual, qué ya hiciste y qué intentaste.',
    'Pega el error exacto y el requestId si lo tienes.',
    'Pide que te explique qué revisar primero y por qué.',
    'No aceptes código de pasos siguientes sin entender el actual.',
  ],
}

const DESCRIPCION_RUTA: Record<string, string> = {
  '/': 'Inicio y productos destacados',
  '/productos': 'Catálogo, búsqueda y filtros',
  '/producto/:id': 'Detalle de un producto',
  '/login': 'Iniciar sesión',
  '/registro': 'Crear cuenta',
  '/carrito': 'Carrito de compras',
  '/checkout': 'Confirmar pedido',
  '/pedidos': 'Mis pedidos',
  '/pedidos/:id': 'Detalle de un pedido',
  '/admin': 'Panel, ventas y pedidos',
  '/admin/productos': 'Lista y crear/editar productos',
  '/admin/productos/nuevo': 'Crear producto con foto',
  '/admin/pedidos': 'Lista de pedidos y cambio de estado',
}

const TIPO_RUTA: Record<string, RutaProyecto['tipo']> = {
  público: 'pública',
  cognito: 'protegida',
  admin: 'admin',
  'n/a': 'pública',
}

/** Derivado de contratos.ts: una sola lista de rutas en todo el proyecto. */
export const RUTAS: RutaProyecto[] = CONTRATOS_RUTAS.map((ruta) => ({
  ruta: ruta.ruta,
  tipo: TIPO_RUTA[ruta.auth],
  descripcion: DESCRIPCION_RUTA[ruta.ruta] ?? '',
}))

/** Derivado de contratos.ts: los 5 stores con la misma firma que las guías. */
export const STORES: StoreProyecto[] = CONTRATOS_STORES.map((store) => ({
  nombre: store.export,
  archivo: store.archivo,
  estado: Object.keys(store.estado).join(', '),
  acciones: store.acciones.join(', '),
  paso: store.paso,
  implementadoEn: store.implementadoEn,
}))

const ATRIBUTOS_TABLA: Record<string, string[]> = {
  'Shop-Products': [
    'productId',
    'name',
    'description',
    'price (number)',
    'stock (number)',
    'category',
    'imageKey (S3)',
    'createdAt',
    'updatedAt',
  ],
  'Shop-Orders': [
    'orderId',
    'userId',
    'items (productId, name, price, qty)',
    'total',
    'status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)',
    'createdAt',
  ],
  'Shop-Cart': ['items (lista)', 'expiresAt (TTL opcional)'],
}

const NOTA_TABLA: Record<string, string> = {
  'Shop-Products': 'Un producto es un item, no una tabla por producto.',
  'Shop-Orders': 'El cliente consulta por USER#<userId>; el admin consulta por estado.',
  'Shop-Cart':
    'Opcional. Empieza con Pinia + localStorage y migra el carrito a DynamoDB como mejora.',
}

const INDICES_TABLA: Record<string, TablaProyecto['indices']> = {
  'Shop-Products': [
    {
      nombre: 'GSI-Category',
      pk: 'category',
      sk: 'price',
      uso: 'Buscar productos por categoría ordenados por precio.',
    },
  ],
  'Shop-Orders': [
    {
      nombre: 'GSI-Status',
      pk: 'status',
      sk: 'createdAt',
      uso: 'Pedidos por estado ordenados por fecha para el admin.',
    },
  ],
  'Shop-Cart': [],
}

export const TABLAS: TablaProyecto[] = CONTRATOS_TABLAS.map((tabla) => ({
  nombre: tabla.nombre,
  pk: tabla.pk,
  sk: tabla.sk,
  atributos: ATRIBUTOS_TABLA[tabla.nombre] ?? [],
  indices: INDICES_TABLA[tabla.nombre] ?? [],
  nota: NOTA_TABLA[tabla.nombre] ?? '',
}))

const ACCESO_BUCKET: Record<string, string> = {
  'shop-products-images':
    'Subida por presigned URL de 15 minutos; lectura por CloudFront o presigned URL.',
  'shop-frontend': 'Servido por CloudFront con S3 privado y Origin Access Control.',
}

export const BUCKETS: BucketProyecto[] = CONTRATOS_BUCKETS.map((bucket) => ({
  nombre: bucket.nombre,
  uso: bucket.uso,
  acceso: ACCESO_BUCKET[bucket.nombre] ?? '',
}))

const GRUPO_LAMBDA: Record<string, string> = {
  createProduct: 'Auth y productos',
  getProducts: 'Auth y productos',
  getProductById: 'Auth y productos',
  updateProduct: 'Auth y productos',
  deleteProduct: 'Auth y productos',
  createOrder: 'Pedidos y carrito',
  getMyOrders: 'Pedidos y carrito',
  getOrderById: 'Pedidos y carrito',
  updateOrderStatus: 'Pedidos y carrito',
  getUploadUrl: 'Archivos',
  getProductImageUrl: 'Archivos',
  processOrder: 'Async',
  sendOrderNotification: 'Async',
  cleanupExpiredCarts: 'Async',
}

const PROPOSITO_LAMBDA: Record<string, string> = {
  createProduct: 'Admin: valida, guarda en DynamoDB y guarda imageKey.',
  getProducts: 'Lista con filtro por categoría y paginación.',
  getProductById: 'Detalle de un producto.',
  updateProduct: 'Admin: actualiza precio y stock.',
  deleteProduct: 'Admin: marca como inactivo en vez de borrar.',
  createOrder: 'Valida stock, crea el pedido, descuenta stock y manda mensaje a SQS.',
  getMyOrders: 'Lista los pedidos del usuario logueado.',
  getOrderById: 'Detalle, solo si es tuyo o eres admin.',
  updateOrderStatus: 'Admin: cambia PENDING a SHIPPED, etc.',
  getUploadUrl: 'Presigned URL de S3 para subir una foto; expira en 15 minutos.',
  getProductImageUrl: 'Presigned URL de lectura o URL de CloudFront para la foto.',
  processOrder: 'Disparada por SQS; si falla 3 veces, va a la DLQ.',
  sendOrderNotification: 'Disparada por SNS/EventBridge; notifica pedido recibido o enviado.',
  cleanupExpiredCarts: 'Disparada por EventBridge cada día; borra carritos viejos y usa TTL.',
}

/** Derivado de contratos.ts: agrupado para la vista /proyecto. */
export const LAMBDAS: GrupoLambdas[] = [
  'Auth y productos',
  'Pedidos y carrito',
  'Archivos',
  'Async',
].map((grupo) => ({
  grupo,
  funciones: CONTRATOS_LAMBDAS.filter(
    (lambda) => GRUPO_LAMBDA[lambda.nombre] === grupo,
  ).map((lambda) => ({
    nombre: lambda.nombre,
    proposito: PROPOSITO_LAMBDA[lambda.nombre] ?? '',
  })),
}))
