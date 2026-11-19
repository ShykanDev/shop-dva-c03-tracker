import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso11: Paso = {
  id: 'paso-11',
  numero: 11,
  titulo: 'Contenedores ECR/ECS/Fargate',
  resumen:
    'Empaquetar un solo servicio en Docker, subirlo a ECR y correrlo en Fargate sin administrar servidores.',
  objetivo:
    'El servicio contenedorizado responde por HTTP y sabes explicar ECR vs ECS vs EKS y Fargate vs EC2.',
  acciones: [
    {
      id: 'paso-11.1',
      texto: 'Crear la imagen Docker de un solo servicio',
      detalle:
        'Por ejemplo, un servicio de recomendaciones o de transformación de imágenes. No contenedorices toda la tienda.',
      skills: ['3.1.2'],
    },
    {
      id: 'paso-11.2',
      texto: 'Subir la imagen a ECR con tag y configurar lifecycle policy',
      detalle:
        'Usa un tag inmutable por commit y una regla que borre imágenes sin tag después de N días.',
      skills: ['3.1.2', '3.3.2'],
    },
    {
      id: 'paso-11.3',
      texto: 'Desplegar en ECS con Fargate usando una task definition',
      detalle:
        'Sin servidores que administrar. Configura CPU, memoria, puerto y logs en CloudWatch.',
      skills: ['3.3.2'],
    },
  ],
  verifica: [
    {
      id: 'paso-11.v1',
      texto: 'El servicio responde y el servicio ECS queda apagado al terminar el lab',
      detalle:
        'Escala a 0 o elimina el servicio. Fargate cobra por tarea encendida aunque no reciba tráfico.',
      skills: ['3.3.2'],
    },
  ],
  skills: ['3.1.2', '3.3.2'],
  guia: [
    {
      tipo: 'texto',
      md: 'Este paso existe para que sepas cuándo un contenedor tiene sentido. La tienda principal es serverless: Lambda + API Gateway. Pero un servicio con dependencias pesadas, un proceso largo o una librería que no cabe bien en un .zip puede vivir en un contenedor. ECR guarda la imagen; ECS la ejecuta; Fargate te evita administrar la instancia. Y EKS es Kubernetes, que no necesitas para este proyecto.',
    },
    {
      tipo: 'lista',
      titulo: 'Imagen y ECR',
      items: [
        'Crea una carpeta service-recommendations con un index.js mínimo que responda GET /health y GET /recommendations.',
        'Escribe un Dockerfile con node:20-alpine, copia package.json, instala dependencias, copia el código y expón el puerto 3000.',
        'Consola → ECR → Create repository. Nombre: shop-recommendations. Activa tag immutability para no reescribir tags.',
        'Autentica Docker: aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com.',
        'Construye y etiqueta: docker build -t shop-recommendations . y docker tag shop-recommendations:latest <REPO_URI>:v1.',
        'Sube con docker push <REPO_URI>:v1 y confirma que la imagen aparece en ECR.',
        'Crea una lifecycle policy que borre imágenes sin tag después de 14 días. Las imágenes con tag se conservan para auditoría.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'dockerfile',
      codigo: [
        'FROM node:20-alpine',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci --omit=dev',
        'COPY . .',
        'ENV PORT=3000',
        'EXPOSE 3000',
        'CMD ["node", "index.js"]',
      ].join('\n'),
      nota: 'No copies node_modules desde tu Mac: se instalan dentro de la imagen. Usa .dockerignore con node_modules, .git y .env.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'bash',
      codigo: [
        '# Login, build, tag y push',
        'ACCOUNT=$(aws sts get-caller-identity --query Account --output text)',
        'REGION=us-east-1',
        'REPO=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/shop-recommendations',
        '',
        'aws ecr get-login-password --region $REGION \\',
        '  | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com',
        '',
        'docker build -t shop-recommendations .',
        'docker tag shop-recommendations:latest $REPO:v1',
        'docker push $REPO:v1',
      ].join('\n'),
      nota: 'Si el push falla por permisos, revisa que tu usuario IAM pueda hacer ecr:GetAuthorizationToken, InitiateLayerUpload, UploadLayerPart y CompleteLayerUpload.',
    },
    {
      tipo: 'lista',
      titulo: 'Task definition y servicio en Fargate',
      items: [
        'Consola → ECS → Task definitions → Create new task definition. Launch type: Fargate.',
        'Task size: 0.25 vCPU y 0.5 GB para el laboratorio. No sobredimensiones: pagas por tarea.',
        'Container: imagen de ECR, puerto 3000, variable PORT=3000 y log driver awslogs con un grupo /ecs/shop-recommendations.',
        'Crea un cluster ECS con Fargate. Crea un servicio con 1 tarea y una red con subred pública y security group que permita el puerto 3000 desde tu IP.',
        'Si usas un Application Load Balancer, recuerda que el ALB también cuesta. Para el lab, una IP pública y una tarea es suficiente.',
        'Prueba con curl http://<IP_PUBLICA>:3000/health y revisa los logs en CloudWatch.',
        'Al terminar: ECS → Service → Update → Desired tasks: 0. Luego elimina el servicio y el cluster.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'peligro',
      titulo: 'Apaga el servicio hoy mismo',
      md: 'Fargate cobra por vCPU y memoria mientras la tarea existe, aunque no reciba peticiones. Un servicio olvidado un fin de semana se come los créditos. El paso no está terminado hasta que el servicio está en 0 tareas y el cluster eliminado.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'ECR vs ECS vs EKS, Fargate vs EC2',
      md: 'ECR es el registro de imágenes. ECS es el orquestador de contenedores de AWS. EKS es Kubernetes administrado. Fargate ejecuta contenedores sin que veas la instancia; EC2 te da la instancia para que la administres. Para este proyecto, ECR + ECS + Fargate es lo más simple.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'Si el frontend consume este servicio, envuelve la llamada en un composable con estado (disponible, cargando, error) en vez de hacer fetch directo en la vista. Así puedes mostrar "servicio de recomendaciones no disponible" sin romper el catálogo.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 11,
    titulo: 'Contenedores ECR/ECS/Fargate',
    quiere:
      'crear un Dockerfile para un solo servicio, subir la imagen a ECR con tag y lifecycle policy, y desplegarla en ECS con Fargate usando una task definition, para después apagarla',
    yaHice: 'los Pasos 0 a 10: tienda serverless completa, observabilidad, SAM y CI/CD',
    extra:
      'Quiero entender ECR vs ECS vs EKS y Fargate vs EC2. Explícame qué cobra Fargate mientras el servicio está encendido y cómo apagarlo sin borrar la task definition. Muéstrame solo el Dockerfile y los comandos de ECR.',
  }),
  sugerenciaVue: {
    titulo: 'Un composable para un servicio no crítico',
    porque:
      'Las recomendaciones son un extra: si el contenedor está apagado, la tienda debe seguir vendiendo. Un composable con estado de disponibilidad permite degradar la sección sin lanzar un error global.',
    ejemplo: [
      'const disponible = ref(true)',
      '',
      'async function cargar() {',
      '  try {',
      '    const r = await fetch(`${import.meta.env.VITE_RECOMMENDATIONS_URL}/health`)',
      '    disponible.value = r.ok',
      '  } catch {',
      '    disponible.value = false',
      '  }',
      '}',
    ].join('\n'),
  },
}
