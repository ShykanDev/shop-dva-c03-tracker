import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso02: Paso = {
  id: 'paso-2',
  numero: 2,
  titulo: 'DynamoDB y S3, sin código todavía',
  resumen:
    'Crear las tablas, los índices y el bucket a mano para entender PK, SK, GSI y Query antes de meter una Lambda.',
  objetivo:
    'Tener Shop-Products y Shop-Orders con sus GSIs, el bucket de imágenes y cinco productos de prueba visibles en la consola.',
  acciones: [
    {
      id: 'paso-2.1',
      texto: 'Crear la tabla Shop-Products on-demand con el GSI-Category',
      detalle:
        'PK PRODUCT#<productId>, GSI-Category con partition key category y sort key price.',
      skills: ['1.3.1', '1.3.2'],
    },
    {
      id: 'paso-2.2',
      texto: 'Crear la tabla Shop-Orders on-demand con el GSI-Status',
      detalle:
        'PK USER#<userId>, SK ORDER#<orderId>, GSI-Status con partition key status y sort key createdAt.',
      skills: ['1.3.1', '1.3.2'],
    },
    {
      id: 'paso-2.3',
      texto: 'Crear el bucket S3 para imágenes de productos',
      detalle:
        'Nombre base shop-products-images. Si está ocupado, agrega tus iniciales y un sufijo corto.',
      skills: ['1.3.1'],
    },
    {
      id: 'paso-2.4',
      texto: 'Insertar 5 productos de prueba a mano en la consola',
      detalle:
        'Cada uno con productId, name, description, price (Number), stock (Number), category, imageKey, createdAt y updatedAt.',
      skills: ['1.3.2'],
    },
  ],
  verifica: [
    {
      id: 'paso-2.v1',
      texto: 'Puedes explicar PK, SK, GSI y la diferencia entre Query y Scan',
      detalle:
        'Query usa la clave de la tabla o de un índice; Scan recorre toda la tabla y cuesta más. Si no lo puedes explicar, repite este paso.',
      skills: ['1.3.4'],
    },
  ],
  skills: ['1.3.1', '1.3.2', '1.3.4'],
  guia: [
    {
      tipo: 'texto',
      md: 'Vamos a crear la base de datos antes de escribir una sola línea de backend. La razón es que DynamoDB se diseña desde las consultas: primero decides cómo vas a leer (productos por categoría, pedidos por estado) y después eliges la clave. Si lo haces al revés, terminas usando Scan para todo.',
    },
    {
      tipo: 'lista',
      titulo: 'Tabla Shop-Products en la consola',
      items: [
        'Consola → DynamoDB → Tables → Create table.',
        'Table name: Shop-Products. Partition key: PK, tipo String. Sort key: ninguna.',
        'Capacity mode: On-demand. Así no pagas capacidad reservada mientras aprendes.',
        'Después de crearla, entra a Indexes → Create index. Index name: GSI-Category. Partition key: category (String). Sort key: price (Number). Attribute projections: All.',
        'Espera a que el índice diga Active. Hasta entonces no puedes consultarlo.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Tabla Shop-Orders en la consola',
      items: [
        'Create table → Table name: Shop-Orders. Partition key: PK (String). Sort key: SK (String).',
        'Capacity mode: On-demand.',
        'Crea el índice GSI-Status: partition key status (String), sort key createdAt (String), proyección All.',
        'Así el admin podrá pedir "todos los pedidos SHIPPED ordenados por fecha" sin escanear la tabla.',
        'Opcional para después: Shop-Cart con PK USER#<userId> y SK CART. Empieza con Pinia + localStorage y migra el carrito a DynamoDB como mejora.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Bucket S3 e inserción de productos',
      items: [
        'Consola → S3 → Create bucket. Nombre: shop-products-images (si está ocupado, agrega un sufijo único). Región us-east-1.',
        'Bloquea el acceso público por ahora. La lectura para el catálogo se resolverá con CloudFront o presigned URL en el Paso 6.',
        'DynamoDB → Shop-Products → Explore table items → Create item. Cambia a vista JSON y pega un producto por vez.',
        'Usa dos o tres categorías distintas para que el GSI tenga sentido: por ejemplo naturales, cuidado-personal y supplements.',
        'Cada producto necesita imageKey aunque todavía no exista la foto: usa una ruta como products/demo-1.jpg.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'bash',
      codigo: [
        '# Alternativa por CLI para Shop-Products',
        'aws dynamodb create-table \\',
        '  --table-name Shop-Products \\',
        '  --attribute-definitions \\',
        '    AttributeName=PK,AttributeType=S \\',
        '    AttributeName=category,AttributeType=S \\',
        '    AttributeName=price,AttributeType=N \\',
        '  --key-schema AttributeName=PK,KeyType=HASH \\',
        '  --billing-mode PAY_PER_REQUEST \\',
        '  --global-secondary-indexes \'[',
        '    {',
        '      "IndexName": "GSI-Category",',
        '      "KeySchema": [',
        '        { "AttributeName": "category", "KeyType": "HASH" },',
        '        { "AttributeName": "price", "KeyType": "RANGE" }',
        '      ],',
        '      "Projection": { "ProjectionType": "ALL" }',
        '    }',
        '  ]\'',
      ].join('\n'),
      nota: 'La consola es más lenta pero más clara para el primer intento. La CLI sirve para repetir el laboratorio cuando lo borres.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'json',
      codigo: [
        '{',
        '  "PK": { "S": "PRODUCT#prod-001" },',
        '  "productId": { "S": "prod-001" },',
        '  "name": { "S": "Jabón de avena" },',
        '  "description": { "S": "Jabón natural para piel sensible" },',
        '  "price": { "N": "89" },',
        '  "stock": { "N": "25" },',
        '  "category": { "S": "cuidado-personal" },',
        '  "imageKey": { "S": "products/demo-1.jpg" },',
        '  "createdAt": { "S": "2026-11-19T00:00:00.000Z" },',
        '  "updatedAt": { "S": "2026-11-19T00:00:00.000Z" }',
        '}',
      ].join('\n'),
      nota: 'El GSI-Category usa category y price directamente del item. No hace falta duplicarlos.',
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'Query vs Scan, en una frase',
      md: 'Query va directo a una partición y usa la sort key para ordenar; Scan lee todo y filtra después. En una tienda real, el catálogo por categoría debe ser Query sobre GSI-Category, nunca Scan.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Aunque este paso no toca el frontend, define ya las interfaces TypeScript del producto y del pedido. Que el tipo del catálogo sea el mismo que el del store y el de la Lambda evita el clásico error de precio como string en la vista.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 2,
    titulo: 'DynamoDB y S3, sin código todavía',
    quiere:
      'crear Shop-Products y Shop-Orders en modo on-demand con sus índices GSI-Category y GSI-Status, crear el bucket shop-products-images e insertar 5 productos de prueba',
    yaHice: 'el Paso 0 y el Paso 1: frontend Vue con rutas, stores y componentes',
    extra:
      'Quiero entender por qué la PK de Shop-Products es PRODUCT#<productId> y por qué el GSI usa category + price. Explícame Query vs Scan con un ejemplo de "todos los productos de la categoría naturales ordenados por precio".',
  }),
  sugerenciaVue: {
    titulo: 'Un solo tipo de producto para toda la app',
    porque:
      'DynamoDB devuelve price y stock como Number. Si el store de Pinia los guarda como string, el total del carrito se concatena en vez de sumar. Define la interfaz una vez y úsala en ProductCard, cartStore y productsStore.',
    ejemplo: [
      'export interface Product {',
      '  productId: string',
      '  name: string',
      '  description: string',
      '  price: number',
      '  stock: number',
      '  category: string',
      '  imageKey: string',
      '}',
    ].join('\n'),
  },
}
