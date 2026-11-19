import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso04: Paso = {
  id: 'paso-4',
  numero: 4,
  titulo: 'Cognito + IAM: login y registro',
  resumen:
    'Crear el User Pool con grupos admin y customer, conectar el login al frontend y proteger las rutas con un guard.',
  objetivo:
    'Sin login no se entra a /checkout; un cliente no entra a /admin; un admin sí. Las Lambdas solo pueden tocar los recursos de Shop.',
  acciones: [
    {
      id: 'paso-4.1',
      texto: 'Crear el Cognito User Pool con los grupos admin y customer',
      detalle:
        'App client público sin client secret, porque una SPA no puede guardar secretos.',
      skills: ['2.1.1', '2.1.2'],
    },
    {
      id: 'paso-4.2',
      texto: 'Conectar registro, login y logout al frontend y guardar el token en authStore',
      detalle:
        'El authStore expone usuario, tokens, grupos y estado de sesión.',
      skills: ['2.1.3', '2.1.5'],
    },
    {
      id: 'paso-4.3',
      texto: 'Proteger /checkout, /pedidos y /admin con un guard de Vue Router',
      detalle:
        'El guard lee meta.requiresAuth y meta.requiresAdmin. No dupliques la validación en cada componente.',
      skills: ['2.1.6'],
    },
    {
      id: 'paso-4.4',
      texto: 'Crear un rol IAM para Lambda con permisos solo sobre DynamoDB de Shop',
      detalle:
        'dynamodb:GetItem, PutItem, UpdateItem, Query, Scan, DeleteItem y BatchWriteItem sobre los ARNs de las tablas e índices.',
      skills: ['2.1.7'],
    },
  ],
  verifica: [
    {
      id: 'paso-4.v1',
      texto: 'Cliente sin sesión no entra a /checkout; cliente logueado no entra a /admin; admin sí entra',
      detalle:
        'Prueba los tres casos en una ventana privada. Si el cliente entra a /admin, el grupo no está llegando en el token o el guard no lo revisa.',
      skills: ['2.1.6'],
    },
  ],
  skills: ['2.1.1', '2.1.2', '2.1.3', '2.1.5', '2.1.6', '2.1.7'],
  guia: [
    {
      tipo: 'texto',
      md: 'Hasta ahora cualquiera puede leer el catálogo, y eso está bien. El problema empieza cuando alguien intenta comprar o administrar. Cognito resuelve quién eres; el guard de Vue Router y las autorizaciones de la Lambda resuelven qué puedes hacer. Nunca confíes solo en esconder un botón en el frontend.',
    },
    {
      tipo: 'lista',
      titulo: 'Crear el User Pool',
      items: [
        'Consola → Cognito → User pools → Create user pool.',
        'Sign-in options: Email. Password policy: la que trae por defecto está bien para aprender.',
        'MFA: opcional por ahora. En producción se activa; en el laboratorio no bloquees tu propio acceso.',
        'Self-registration: habilitado, porque la tienda necesita que el cliente cree su cuenta.',
        'App client: nombre shop-web, tipo Public client (SPA). No marques client secret.',
        'Callback URLs: http://localhost:5173 y la URL de CloudFront cuando exista. Logout URL igual.',
        'Después de crear el pool, entra a Groups y crea dos: admin y customer.',
        'Crea un usuario de prueba, asígnalo al grupo admin, y crea otro usuario para probar el rol customer.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Conectar el frontend',
      items: [
        'Instala el SDK de autenticación para navegador: npm install amazon-cognito-identity-js. Si prefieres Amplify, usa @aws-amplify/auth, pero no mezcles los dos.',
        'Configura el User Pool ID y el App Client ID en variables de entorno VITE_COGNITO_USER_POOL_ID y VITE_COGNITO_CLIENT_ID.',
        'En authStore implementa registro, confirmación por código, login, logout y carga de la sesión al iniciar la app.',
        'Decodifica el ID token para leer cognito:groups. No uses el access token para decidir roles del frontend: el grupo viene en el ID token.',
        'En el backend, recuerda la diferencia: en una REST API con autorizador de Cognito los claims llegan en event.requestContext.authorizer.claims; en una HTTP API con JWT authorizer llegan en event.requestContext.authorizer.jwt.claims.',
        'En la vista /login muestra un error claro cuando la contraseña no cumple la política o el usuario no está confirmado.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        "import { createRouter, createWebHistory } from 'vue-router'",
        "import { useAuthStore } from '@/stores/auth'",
        '',
        'const router = createRouter({',
        '  history: createWebHistory(),',
        '  routes: [',
        "    { path: '/checkout', component: () => import('@/views/Checkout.vue'), meta: { requiresAuth: true } },",
        "    { path: '/pedidos', component: () => import('@/views/MisPedidos.vue'), meta: { requiresAuth: true } },",
        "    { path: '/admin', component: () => import('@/views/Admin.vue'), meta: { requiresAuth: true, requiresAdmin: true } },",
        '  ],',
        '})',
        '',
        'router.beforeEach((to) => {',
        '  const auth = useAuthStore()',
        '  if (to.meta.requiresAuth && !auth.estaLogueado) {',
        "    return { path: '/login', query: { redirect: to.fullPath } }",
        '  }',
        '  if (to.meta.requiresAdmin && !auth.esAdmin) {',
        "    return { path: '/pedidos' }",
        '  }',
        '})',
        '',
        'export default router',
      ].join('\n'),
      nota: 'El guard del frontend es comodidad, no seguridad. La Lambda debe volver a validar el token y el grupo en cada operación sensible.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'json',
      codigo: [
        '{',
        '  "Version": "2012-10-17",',
        '  "Statement": [',
        '    {',
        '      "Effect": "Allow",',
        '      "Action": [',
        '        "dynamodb:GetItem",',
        '        "dynamodb:PutItem",',
        '        "dynamodb:UpdateItem",',
        '        "dynamodb:DeleteItem",',
        '        "dynamodb:Query",',
        '        "dynamodb:Scan",',
        '        "dynamodb:BatchWriteItem"',
        '      ],',
        '      "Resource": [',
        '        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Shop-Products",',
        '        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Shop-Products/index/*",',
        '        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Shop-Orders",',
        '        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Shop-Orders/index/*"',
        '      ]',
        '    }',
        '  ]',
        '}',
      ].join('\n'),
      nota: 'Sustituye ACCOUNT_ID por el tuyo. El recurso index/* es necesario para Query sobre GSI-Category y GSI-Status.',
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'Nunca pongas el client secret en la SPA',
      md: 'Cualquiera abre las DevTools y lo lee. Un app client de SPA va sin secreto; la seguridad real la da el token y la autorización del backend.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Declara las reglas en meta y resuélvelas en un único beforeEach. Si cada vista revisa los grupos por su cuenta, tarde o temprano una ruta queda desprotegida.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 4,
    titulo: 'Cognito + IAM: login y registro',
    quiere:
      'crear el User Pool con grupos admin y customer, conectar registro/login/logout en el frontend Vue, proteger /checkout, /pedidos y /admin con un guard, y crear un rol IAM de mínimo privilegio para las Lambdas',
    yaHice: 'los Pasos 0 a 3: cuenta segura, frontend base, tablas DynamoDB y Lambdas getProducts/getProductById',
    extra:
      'Quiero que me expliques cómo leer cognito:groups del ID token y por qué el guard del frontend no sustituye la validación en la Lambda. Muéstrame solo el guard y el authStore mínimo.',
  }),
  sugerenciaVue: {
    titulo: 'Un beforeEach, reglas en meta',
    porque:
      'Vue Router evalúa el guard antes de montar la vista, así no parpadea contenido protegido. Si la comprobación vive en onMounted dentro de cada vista, el usuario ve la pantalla un instante y la regla se duplica en cada archivo.',
    ejemplo: [
      'router.beforeEach((to) => {',
      '  const auth = useAuthStore()',
      '  if (to.meta.requiresAuth && !auth.estaLogueado) {',
      '    return { path: "/login", query: { redirect: to.fullPath } }',
      '  }',
      '  if (to.meta.requiresAdmin && !auth.esAdmin) return "/pedidos"',
      '})',
    ].join('\n'),
  },
}
