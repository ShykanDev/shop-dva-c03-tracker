import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso13: Paso = {
  id: 'paso-13',
  numero: 13,
  titulo: 'Frontend en producción',
  resumen:
    'Compilar Vue, subir el build a S3 y servir la tienda con CloudFront y HTTPS.',
  objetivo:
    'Abrir la tienda en la URL de CloudFront, iniciar sesión y completar una compra de punta a punta.',
  acciones: [
    {
      id: 'paso-13.1',
      texto: 'Compilar Vue con npm run build',
      detalle:
        'Antes del build, apunta VITE_API_URL y los IDs de Cognito al entorno de producción.',
      skills: [],
    },
    {
      id: 'paso-13.2',
      texto: 'Subir dist a S3 y servir con CloudFront + ACM',
      detalle:
        'S3 privado con Origin Access Control, CloudFront con certificado en us-east-1 y fallback de SPA a index.html.',
      skills: [],
    },
    {
      id: 'paso-13.3',
      texto: 'Borrar recursos de prueba y dejar solo lo necesario para la demo',
      detalle:
        'Tablas duplicadas, buckets temporales, servicios ECS apagados, alarmas de laboratorio y funciones huérfanas.',
      skills: [],
    },
  ],
  verifica: [
    {
      id: 'paso-13.v1',
      texto: 'La tienda abre en CloudFront, el login funciona y la compra completa funciona de punta a punta',
      detalle:
        'Prueba en una ventana privada, con un usuario cliente nuevo y con el usuario admin. Revisa la consola del navegador y la pestaña Network.',
      skills: [],
    },
  ],
  skills: [],
  guia: [
    {
      tipo: 'texto',
      md: 'Ya tienes la tienda funcionando en local. Este paso la vuelve accesible sin tu Mac: compilas el frontend, lo subes a S3 y lo sirves por CloudFront. La parte que más se olvida es el fallback de SPA: si CloudFront no devuelve index.html en rutas como /productos, al recargar la página aparece un 403 de S3.',
    },
    {
      tipo: 'lista',
      titulo: 'Build y subida',
      items: [
        'Crea .env.production con VITE_API_URL, VITE_COGNITO_USER_POOL_ID y VITE_COGNITO_CLIENT_ID del entorno de producción. No uses los de dev.',
        'Ejecuta npm run build. Revisa que no haya errores de TypeScript ni de Vue.',
        'Crea el bucket shop-frontend. Bloquea el acceso público: CloudFront leerá con Origin Access Control.',
        'Sube el contenido: aws s3 sync dist/ s3://shop-frontend --delete. El --delete limpia archivos viejos del bucket.',
        'Si usas Vite con base distinta de /, configura base en vite.config.ts antes del build. Si no, los assets se piden en la ruta equivocada.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'bash',
      codigo: [
        'npm run build',
        '',
        'aws s3 sync dist/ s3://shop-frontend --delete',
        '',
        '# Invalidar la caché de CloudFront después de cada despliegue',
        'aws cloudfront create-invalidation \\',
        '  --distribution-id <DISTRIBUTION_ID> \\',
        '  --paths "/*"',
      ].join('\n'),
      nota: 'No subas node_modules ni el código fuente. Solo el contenido de dist/. Si el bucket muestra archivos .ts, revisaste mal la carpeta.',
    },
    {
      tipo: 'lista',
      titulo: 'CloudFront + ACM',
      items: [
        'Consola → Certificate Manager. El certificado para CloudFront debe estar en us-east-1, aunque tu tienda viva en otra región.',
        'Solicita el certificado para tu dominio o para el dominio de CloudFront, valida por DNS y espera a que diga Issued.',
        'Consola → CloudFront → Create distribution. Origin: el bucket shop-frontend con Origin Access Control.',
        'Default root object: index.html. Viewer protocol policy: Redirect HTTP to HTTPS.',
        'Custom error responses: 403 y 404 → /index.html con código 200. Sin esto, recargar /productos rompe la SPA.',
        'Asocia el certificado ACM y tu dominio alternativo (CNAME) si tienes uno. Si no, usa el dominio *.cloudfront.net.',
        'Actualiza las callback URLs del App Client de Cognito con la URL de CloudFront. Si no, el login redirige a localhost.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'El orden importa',
      md: 'Primero el certificado, luego la distribución, luego el CNAME. Si cambias el dominio después, actualiza Cognito y la API. Un login que funciona en localhost y falla en CloudFront casi siempre es una callback URL sin actualizar.',
    },
    {
      tipo: 'lista',
      titulo: 'Limpieza antes de la demo',
      items: [
        'Borra tablas, buckets y colas de laboratorio que no uses. Deja solo Shop-Products, Shop-Orders, Shop-Orders-Queue, Shop-Orders-DLQ, shop-products-images y shop-frontend.',
        'Escala a 0 o elimina el servicio ECS del Paso 11.',
        'Revisa Billing → Cost Explorer por servicio. Si algo cobra sin explicación, investígalo antes de la demo.',
        'Revisa que no queden NAT Gateways, balanceadores ni instancias EC2 encendidas.',
        'Haz una compra de prueba y revisa CloudWatch y X-Ray una última vez.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Usa import.meta.env.PROD para cambiar el comportamiento entre desarrollo y producción, y define la URL de la API en .env.production. No dejes condicionales de localhost en el bundle de producción.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 13,
    titulo: 'Frontend en producción',
    quiere:
      'compilar Vue con npm run build, subir dist a S3 y servir la tienda con CloudFront + ACM, con fallback de SPA a index.html y callback URLs de Cognito actualizadas, y limpiar los recursos de prueba',
    yaHice: 'los Pasos 0 a 12: tienda completa, observabilidad, CI/CD, Fargate y optimización',
    extra:
      'Quiero que me expliques por qué /productos da 403 al recargar y cómo se configura el custom error response. También cómo invalidar la caché después de un despliegue y qué recursos debo borrar para no gastar créditos.',
  }),
  sugerenciaVue: {
    titulo: 'Una URL de API por entorno',
    porque:
      'En desarrollo llamas a localhost y a una API de dev; en producción, a otra. Si la URL está hardcodeada, el build de producción apunta al backend equivocado. Vite reemplaza import.meta.env en build, así que el mismo código sirve para ambos entornos.',
    ejemplo: [
      '// .env.production',
      'VITE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/Prod',
      '',
      '// src/services/api.ts',
      'const base = import.meta.env.VITE_API_URL',
      'export const api = (ruta: string) => fetch(`${base}${ruta}`)',
    ].join('\n'),
  },
}
