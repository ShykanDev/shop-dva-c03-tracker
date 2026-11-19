import type {
  BucketProyecto,
  GrupoLambdas,
  ProyectoReferencia,
  RutaProyecto,
  StoreProyecto,
  TablaProyecto,
} from '@/types/proyecto'

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

export const RUTAS: RutaProyecto[] = [
  { ruta: '/', tipo: 'pública', descripcion: 'Inicio y productos destacados' },
  { ruta: '/productos', tipo: 'pública', descripcion: 'Catálogo, búsqueda y filtros' },
  { ruta: '/producto/:id', tipo: 'pública', descripcion: 'Detalle de un producto' },
  { ruta: '/login', tipo: 'pública', descripcion: 'Iniciar sesión' },
  { ruta: '/registro', tipo: 'pública', descripcion: 'Crear cuenta' },
  { ruta: '/carrito', tipo: 'pública', descripcion: 'Carrito de compras' },
  { ruta: '/checkout', tipo: 'protegida', descripcion: 'Confirmar pedido' },
  { ruta: '/pedidos', tipo: 'protegida', descripcion: 'Mis pedidos' },
  { ruta: '/pedidos/:id', tipo: 'protegida', descripcion: 'Detalle de un pedido' },
  { ruta: '/admin', tipo: 'admin', descripcion: 'Panel, ventas y pedidos' },
  { ruta: '/admin/productos', tipo: 'admin', descripcion: 'Lista y crear/editar productos' },
  { ruta: '/admin/productos/nuevo', tipo: 'admin', descripcion: 'Crear producto con foto' },
  { ruta: '/admin/pedidos', tipo: 'admin', descripcion: 'Lista de pedidos y cambio de estado' },
]

export const STORES: StoreProyecto[] = [
  {
    nombre: 'authStore',
    estado: 'usuario, token, grupos',
    acciones: 'login, logout, registro, grupo admin o cliente',
  },
  {
    nombre: 'cartStore',
    estado: 'items, cantidad, total',
    acciones: 'agregar, quitar, limpiar y persistir en localStorage',
  },
  {
    nombre: 'productsStore',
    estado: 'lista, filtro, detalle, caché',
    acciones: 'búsqueda, filtro por categoría y carga del catálogo',
  },
  {
    nombre: 'ordersStore',
    estado: 'pedido actual, mis pedidos',
    acciones: 'crear pedido, listar mis pedidos y ver el detalle',
  },
  {
    nombre: 'adminStore',
    estado: 'productos y pedidos del admin',
    acciones: 'crear/editar productos y cambiar el estado de un pedido',
  },
]

export const TABLAS: TablaProyecto[] = [
  {
    nombre: 'Shop-Products',
    pk: 'PRODUCT#<productId>',
    sk: '—',
    atributos: [
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
    indices: [
      {
        nombre: 'GSI-Category',
        pk: 'category',
        sk: 'price',
        uso: 'Buscar productos por categoría ordenados por precio.',
      },
    ],
    nota: 'Un producto es un item, no una tabla por producto.',
  },
  {
    nombre: 'Shop-Orders',
    pk: 'USER#<userId>',
    sk: 'ORDER#<orderId>',
    atributos: [
      'orderId',
      'userId',
      'items (productId, name, price, qty)',
      'total',
      'status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)',
      'createdAt',
    ],
    indices: [
      {
        nombre: 'GSI-Status',
        pk: 'status',
        sk: 'createdAt',
        uso: 'Pedidos por estado ordenados por fecha para el admin.',
      },
    ],
    nota: 'El cliente consulta por USER#<userId>; el admin consulta por estado.',
  },
  {
    nombre: 'Shop-Cart',
    pk: 'USER#<userId>',
    sk: 'CART',
    atributos: ['items (lista)', 'expiresAt (TTL opcional)'],
    indices: [],
    nota: 'Opcional. Empieza con Pinia + localStorage y migra el carrito a DynamoDB como mejora.',
  },
]

export const BUCKETS: BucketProyecto[] = [
  {
    nombre: 'shop-products-images',
    uso: 'Fotos de productos.',
    acceso: 'Subida por presigned URL de 15 minutos; lectura por CloudFront o presigned URL.',
  },
  {
    nombre: 'shop-frontend',
    uso: 'Frontend Vue compilado.',
    acceso: 'Servido por CloudFront con S3 privado y Origin Access Control.',
  },
]

export const LAMBDAS: GrupoLambdas[] = [
  {
    grupo: 'Auth y productos',
    funciones: [
      { nombre: 'createProduct', proposito: 'Admin: valida, guarda en DynamoDB y guarda imageKey.' },
      { nombre: 'getProducts', proposito: 'Lista con filtro por categoría y paginación.' },
      { nombre: 'getProductById', proposito: 'Detalle de un producto.' },
      { nombre: 'updateProduct', proposito: 'Admin: actualiza precio y stock.' },
      { nombre: 'deleteProduct', proposito: 'Admin: marca como inactivo en vez de borrar.' },
    ],
  },
  {
    grupo: 'Pedidos y carrito',
    funciones: [
      { nombre: 'createOrder', proposito: 'Valida stock, crea el pedido, descuenta stock y manda mensaje a SQS.' },
      { nombre: 'getMyOrders', proposito: 'Lista los pedidos del usuario logueado.' },
      { nombre: 'getOrderById', proposito: 'Detalle, solo si es tuyo o eres admin.' },
      { nombre: 'updateOrderStatus', proposito: 'Admin: cambia PENDING a SHIPPED, etc.' },
    ],
  },
  {
    grupo: 'Archivos',
    funciones: [
      { nombre: 'getUploadUrl', proposito: 'Presigned URL de S3 para subir una foto; expira en 15 minutos.' },
      { nombre: 'getProductImageUrl', proposito: 'Presigned URL de lectura o URL de CloudFront para la foto.' },
    ],
  },
  {
    grupo: 'Async',
    funciones: [
      { nombre: 'processOrder', proposito: 'Disparada por SQS; si falla 3 veces, va a la DLQ.' },
      { nombre: 'sendOrderNotification', proposito: 'Disparada por SNS/EventBridge; notifica pedido recibido o enviado.' },
      { nombre: 'cleanupExpiredCarts', proposito: 'Disparada por EventBridge cada día; borra carritos viejos y usa TTL.' },
    ],
  },
]
