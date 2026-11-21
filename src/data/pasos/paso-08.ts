import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso08: Paso = {
  id: 'paso-8',
  numero: 8,
  titulo: 'EventBridge y secretos',
  resumen:
    'Programar la limpieza de carritos y sacar la configuración y las claves fuera del código.',
  objetivo:
    'La limpieza corre por horario y ninguna credencial vive en el repositorio ni en el bundle del frontend.',
  acciones: [
    {
      id: 'paso-8.1',
      texto: 'Crear la regla de EventBridge que dispara cleanupExpiredCarts cada día',
      detalle:
        'Usa una expresión cron, por ejemplo cron(0 3 * * ? *), y apunta la regla a la Lambda con permiso de invocación.',
      skills: ['1.1.8', '3.1.4'],
    },
    {
      id: 'paso-8.2',
      texto: 'Guardar una clave de prueba en Secrets Manager y leerla desde Lambda',
      detalle:
        'La Lambda usa GetSecretValue. Nunca copies el valor al código ni a una variable de entorno del repositorio.',
      skills: ['2.2.7'],
    },
    {
      id: 'paso-8.3',
      texto: 'Guardar configuración por entorno en Parameter Store y leerla desde Lambda',
      detalle:
        'Por ejemplo /shop/dev/apiUrl y /shop/prod/apiUrl. Usa SecureString si el valor es sensible.',
      skills: ['3.1.4'],
    },
  ],
  verifica: [
    {
      id: 'paso-8.v1',
      texto: 'La limpieza corre y ningún secreto aparece en el código ni en GitHub',
      detalle:
        'Busca en el repo: password, secret, api_key. Si aparece un valor real, bórralo del historial y rota la clave.',
      skills: ['2.2.7'],
    },
  ],
  skills: ['1.1.8', '2.2.7', '3.1.4'],
  guia: [
    {
      tipo: 'texto',
      md: 'Dos cosas que parecen menores y son centrales en el examen: ejecutar trabajo por horario sin un servidor encendido y no hardcodear secretos. EventBridge es el despertador; Secrets Manager y Parameter Store son la caja fuerte. La Lambda solo pide lo que necesita en el momento en que lo necesita.',
    },
    {
      tipo: 'lista',
      titulo: 'Regla diaria en EventBridge',
      items: [
        'Consola → EventBridge → Rules → Create rule. Nombre: Shop-Cleanup-Carts.',
        'Event source: Schedule. Schedule pattern: cron(0 3 * * ? *). Eso es todos los días a las 03:00 UTC.',
        'Target: la Lambda cleanupExpiredCarts. Si la creas desde la consola, EventBridge te ofrece crear el permiso de invocación.',
        'Declara CARTS_TABLE como variable de entorno de cleanupExpiredCarts. La tabla es Shop-Cart.',
        'Para probar sin esperar un día, invoca la Lambda a mano desde la consola. El horario no es requisito para validar la lógica.',
        'En la Lambda, borra carritos con expiresAt anterior a ahora y también registra cuántos borró. Un cleanup silencioso no se puede auditar.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'Antes de programar la regla: ¿tienes Shop-Cart?',
      md: 'El Paso 2 marcó Shop-Cart como opcional. Si decides no crear la tabla, no dejes esta regla activa: fallará todos los días y ensuciará CloudWatch. Dos opciones válidas: (a) crea Shop-Cart con PK USER#<userId>, SK CART y el atributo expiresAt en epoch, o (b) no crees la regla y documenta en el README por qué no aplica. No hay una tercera: una regla que falla a diario no es una demo.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        "import { DynamoDBClient } from '@aws-sdk/client-dynamodb'",
        "import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'",
        '',
        'const cliente = DynamoDBDocumentClient.from(new DynamoDBClient({}))',
        '',
        'export const handler = async () => {',
        '  const ahora = Math.floor(Date.now() / 1000)',
        '  let borrados = 0',
        '  let ultimaKey: Record<string, unknown> | undefined',
        '',
        '  do {',
        '    const pagina = await cliente.send(new ScanCommand({',
        "      TableName: 'Shop-Cart',",
        "      FilterExpression: 'expiresAt < :ahora',",
        "      ExpressionAttributeValues: { ':ahora': ahora },",
        '      ExclusiveStartKey: ultimaKey,',
        '    }))',
        '',
        '    for (const item of pagina.Items ?? []) {',
        '      await cliente.send(new DeleteCommand({',
        "        TableName: 'Shop-Cart',",
        '        Key: { PK: item.PK, SK: item.SK },',
        '      }))',
        '      borrados += 1',
        '    }',
        '',
        '    ultimaKey = pagina.LastEvaluatedKey as Record<string, unknown> | undefined',
        '  } while (ultimaKey)',
        '',
        '  console.log(JSON.stringify({ accion: "cleanupExpiredCarts", borrados }))',
        '  return { borrados }',
        '}',
      ].join('\n'),
      nota: 'Además del cleanup programado, activa TTL en Shop-Cart con el atributo expiresAt (epoch en segundos). DynamoDB lo borra solo, aunque no de forma instantánea. Si decides no crear Shop-Cart, no dejes esta Lambda programada fallando todos los días: apunta el ejercicio a otra tabla o pausa la regla.',
    },
    {
      tipo: 'lista',
      titulo: 'Secrets Manager y Parameter Store',
      items: [
        'Consola → Secrets Manager → Store a new secret → Other type of secret. Nombre: shop/dev/test-key. Guarda un valor de prueba.',
        'En la Lambda de prueba, llama a GetSecretValue con ese SecretId. No imprimas el secreto completo en CloudWatch: registra solo que se obtuvo.',
        'Consola → Systems Manager → Parameter Store → Create parameter. Nombre: /shop/dev/apiUrl, tipo String. Crea /shop/prod/apiUrl cuando tengas la URL de producción.',
        'Lee con GetParameter y WithDecryption: true si usas SecureString.',
        'Ajusta el rol de la Lambda: solo secretsmanager:GetSecretValue sobre ese secreto y ssm:GetParameter sobre ese prefijo. Nada de comodines *.',
        'Añade al README la lista de variables y de dónde salen. Que el siguiente paso no adivine.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        "import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'",
        "import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'",
        '',
        'const secrets = new SecretsManagerClient({ region: "us-east-1" })',
        'const ssm = new SSMClient({ region: "us-east-1" })',
        '',
        'export async function leerConfiguracion(entorno: "dev" | "prod") {',
        '  const [secreto, parametro] = await Promise.all([',
        '    secrets.send(new GetSecretValueCommand({ SecretId: `shop/${entorno}/test-key` })),',
        '    ssm.send(new GetParameterCommand({ Name: `/shop/${entorno}/apiUrl` })),',
        '  ])',
        '',
        '  return {',
        '    testKey: secreto.SecretString,',
        '    apiUrl: parametro.Parameter?.Value,',
        '  }',
        '}',
      ].join('\n'),
      nota: 'Para secretos de producción, considera cachear el valor en memoria durante la vida del contenedor para no llamar a Secrets Manager en cada invocación.',
    },
    {
      tipo: 'nota',
      tono: 'peligro',
      titulo: 'El secreto no va en el bundle',
      md: 'En una SPA, todo lo que pongas en VITE_* termina en el JavaScript del navegador. Las variables VITE_ solo sirven para configuración pública (URLs, IDs de Cognito). Las claves reales viven en Secrets Manager y las usa la Lambda.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'En el frontend, lee la URL de la API desde import.meta.env.VITE_API_URL y no la escribas en cada archivo. Cambiar de dev a prod debe ser cambiar el .env, no buscar strings por todo el proyecto.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 8,
    titulo: 'EventBridge y secretos',
    quiere:
      'crear una regla diaria de EventBridge para cleanupExpiredCarts, guardar una clave de prueba en Secrets Manager, guardar configuración por entorno en Parameter Store y leer ambas desde Lambda sin hardcodear nada',
    yaHice: 'los Pasos 0 a 7: frontend, DynamoDB, API, Cognito, pedidos, fotos y SQS/DLQ/SNS',
    extra:
      'Quiero que me expliques la diferencia entre Secrets Manager y Parameter Store, cuándo usar SecureString y por qué TTL de DynamoDB no sustituye al cleanup programado. Muéstrame solo el handler y la política IAM mínima.',
  }),
  sugerenciaVue: {
    titulo: 'Configuración pública por import.meta.env',
    porque:
      'Vite reemplaza import.meta.env.VITE_* en tiempo de build. Eso te deja una URL por entorno sin tocar código, y deja claro qué es público. Si necesitas un valor privado, no lo pongas aquí: pásalo por el backend.',
    ejemplo: [
      'const API_URL = import.meta.env.VITE_API_URL',
      'const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID',
      '',
      'if (!API_URL) throw new Error("Falta VITE_API_URL")',
    ].join('\n'),
  },
}
