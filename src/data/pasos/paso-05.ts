import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso05: Paso = {
  id: 'paso-5',
  numero: 5,
  titulo: 'Crear producto y pedido',
  resumen:
    'Escribir createProduct para el admin y createOrder para el cliente, con descuento de stock seguro.',
  objetivo:
    'Hacer un pedido real que aparezca en Shop-Orders, baje el stock y falle con mensaje claro si se compra más de lo disponible.',
  acciones: [
    {
      id: 'paso-5.1',
      texto: 'Crear la Lambda createProduct para el admin',
      detalle:
        'Valida nombre, precio y stock. Guarda PK PRODUCT#<id>, el GSI-Category y el imageKey. Solo el grupo admin puede invocarla.',
      skills: ['1.1.5', '1.1.7', '2.1.4'],
    },
    {
      id: 'paso-5.2',
      texto: 'Crear la Lambda createOrder con validación de stock y ConditionExpression',
      detalle:
        'No vendas de más: la condición stock >= cantidad debe evaluarse en DynamoDB, no en JavaScript.',
      skills: ['1.1.5', '1.2.3', '1.3.4', '2.2.1'],
    },
    {
      id: 'paso-5.3',
      texto: 'Conectar el checkout al carrito Pinia: createOrder y limpiar carrito',
      detalle:
        'Si la API responde error, no limpies el carrito. Muestra el mensaje real del backend.',
      skills: ['2.2.6'],
    },
    {
      id: 'paso-5.4',
      texto: 'Crear updateProduct y deleteProduct para el admin',
      detalle:
        'updateProduct ajusta precio y stock. deleteProduct marca el producto como inactivo en vez de borrarlo.',
      skills: ['1.1.7', '2.1.4'],
    },
    {
      id: 'paso-5.5',
      texto: 'Crear getMyOrders y getOrderById para el cliente',
      detalle:
        'getMyOrders consulta por USER#<userId>. getOrderById solo devuelve el pedido si es del usuario o si quien pide es admin.',
      skills: ['1.1.7', '1.2.3', '2.1.4'],
    },
  ],
  verifica: [
    {
      id: 'paso-5.v1',
      texto: 'Pedido real en Shop-Orders, stock descontado y compra excesiva rechazada con mensaje claro',
      detalle:
        'Revisa que la PK sea USER#<userId> y la SK ORDER#<orderId>. Prueba comprar stock + 1 y verifica el 409.',
      skills: ['1.3.4'],
    },
  ],
  skills: ['1.1.5', '1.1.7', '1.2.3', '1.3.4', '2.1.4', '2.2.1', '2.2.6'],
  guia: [
    {
      tipo: 'texto',
      md: 'Este paso es el corazón de la tienda. createProduct escribe el catálogo y createOrder convierte un carrito en un pedido. La parte delicada no es guardar el pedido: es descontar stock sin vender dos veces la última unidad. Por eso la condición va dentro de DynamoDB.',
    },
    {
      tipo: 'lista',
      titulo: 'createProduct, paso a paso',
      items: [
        'En SAM crea la función CreateProductFunction con evento POST /admin/products y autorizador de Cognito.',
        'En el handler lee el body JSON, valida que name, price y stock existan y que price sea número mayor que cero.',
        'Genera productId con crypto.randomUUID(). Construye PK PRODUCT#<id> y guarda también category e imageKey.',
        'Devuelve 201 con el producto creado. Devuelve 400 con el campo inválido, no un 500 genérico.',
        'Prueba primero con curl o con la consola de Lambda antes de tocar el formulario de Vue.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        "import { DynamoDBClient } from '@aws-sdk/client-dynamodb'",
        "import { DynamoDBDocumentClient, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb'",
        '',
        'const cliente = DynamoDBDocumentClient.from(new DynamoDBClient({}))',
        '',
        'async function descontarStock(productId: string, cantidad: number) {',
        '  try {',
        '    await cliente.send(new UpdateCommand({',
        "      TableName: 'Shop-Products',",
        '      Key: { PK: `PRODUCT#${productId}` },',
        "      UpdateExpression: 'SET stock = stock - :cantidad, updatedAt = :ahora',",
        "      ConditionExpression: 'stock >= :cantidad',",
        '      ExpressionAttributeValues: {',
        '        \':cantidad\': cantidad,',
        '        \':ahora\': new Date().toISOString(),',
        '      },',
        '    }))',
        '  } catch (error: any) {',
        "    if (error.name === 'ConditionalCheckFailedException') {",
        "      throw new Error('No hay stock suficiente para uno de los productos')",
        '    }',
        '    throw error',
        '  }',
        '}',
        '',
        'export const handler = async (event: any) => {',
        '  const body = JSON.parse(event.body ?? "{}")',
        "  const userId = event.requestContext.authorizer.claims.sub",
        '  const orderId = crypto.randomUUID()',
        '',
        '  if (!Array.isArray(body.items) || body.items.length === 0) {',
        "    return { statusCode: 400, body: JSON.stringify({ message: 'El pedido está vacío' }) }",
        '  }',
        '',
        '  for (const item of body.items) {',
        '    await descontarStock(item.productId, item.qty)',
        '  }',
        '',
        '  const total = body.items.reduce(',
        '    (suma: number, item: any) => suma + item.price * item.qty,',
        '    0,',
        '  )',
        '',
        '  await cliente.send(new PutCommand({',
        "    TableName: 'Shop-Orders',",
        '    Item: {',
        '      PK: `USER#${userId}`,',
        '      SK: `ORDER#${orderId}`,',
        '      orderId,',
        '      userId,',
        '      items: body.items,',
        '      total,',
        "      status: 'PENDING',",
        '      createdAt: new Date().toISOString(),',
        '    },',
        '  }))',
        '',
        "  return { statusCode: 201, body: JSON.stringify({ orderId, total, status: 'PENDING' }) }",
        '}',
      ].join('\n'),
      nota: 'Para producción, usa TransactWriteItems para que pedido y stock sean atómicos. Si el pedido falla después de descontar, necesitas revertir el stock o usar una transacción.',
    },
    {
      tipo: 'lista',
      titulo: 'Las otras Lambdas de este bloque',
      items: [
        'updateProduct: recibe productId y los campos a cambiar. Valida que quien llama sea admin y actualiza updatedAt.',
        'deleteProduct: en vez de borrar el item, marca activo:false. Así no rompes pedidos históricos que guardan el productId.',
        'getMyOrders: usa Query con PK USER#<userId> para devolver solo los pedidos del usuario autenticado.',
        'getOrderById: lee el item por PK y SK, compara el userId y responde 403 si no coincide, salvo que el token tenga el grupo admin.',
        'updateOrderStatus: cambia entre PENDING, PAID, SHIPPED, DELIVERED y CANCELLED, y valida que la transición tenga sentido.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Conectar el checkout en Vue',
      items: [
        'En cartStore, el total y la cantidad ya son getters computed. Úsalos en la vista, no los recalcules en la plantilla.',
        'En /checkout, al confirmar, llama a ordersStore.crearPedido(items) con el token de Cognito en el header Authorization.',
        'Si la respuesta es 201, llama a cartStore.limpiar() y navega a /pedidos/:id.',
        'Si la respuesta es 409 o 400, muestra el mensaje del backend y deja el carrito intacto.',
        'Bloquea el botón mientras la petición está en curso para evitar dos pedidos por doble clic.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'La condición va en la base de datos',
      md: 'Comparar stock en JavaScript y después actualizar es una condición de carrera: dos compradores pueden leer el mismo stock. ConditionExpression hace que DynamoDB acepte la resta solo si stock >= cantidad en el momento de escribir.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'En esta sección conviene que CartItem emita increase, decrease y remove, y que la vista llame a la acción del store. El hijo nunca debe modificar el stock ni el total: solo avisa lo que el usuario quiere hacer.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 5,
    titulo: 'Crear producto y pedido',
    quiere:
      'crear las Lambdas createProduct y createOrder en TypeScript, con validación de stock mediante ConditionExpression, y conectar el checkout de Pinia para crear el pedido y limpiar el carrito',
    yaHice: 'los Pasos 0 a 4: frontend, DynamoDB, API Gateway, Cognito y guard de rutas',
    extra:
      'Mi tabla Shop-Orders tiene PK USER#<userId> y SK ORDER#<orderId>, y Shop-Products tiene PK PRODUCT#<productId>. Quiero que me expliques cómo devolver un 409 claro cuando no hay stock y cómo evitar pedidos duplicados por doble clic. No me hagas toda la tienda.',
  }),
  sugerenciaVue: {
    titulo: 'El hijo avisa, el store decide',
    porque:
      'CartItem se usa en el carrito, en el resumen del checkout y quizá en el detalle del pedido. Si el componente llama a la API, no se puede reutilizar. Con emits, cada vista decide si aumentar, quitar o solo mostrar; el estado real sigue en Pinia.',
    ejemplo: [
      "const emit = defineEmits<{",
      '  increase: [id: string]',
      '  decrease: [id: string]',
      '  remove: [id: string]',
      '}>()',
    ].join('\n'),
  },
}
