export const CONTEXTO_PROYECTO = [
  'Contexto del proyecto:',
  '- Proyecto: Shop, una tienda en línea serverless para preparar el examen AWS DVA-C03.',
  '- Frontend: Vue 3 + TypeScript + Vite + Pinia + Tailwind + Vue Router.',
  '- Backend: AWS Lambda con Node.js 20 en TypeScript, desplegado con AWS SAM.',
  '- Servicios: API Gateway REST, DynamoDB on-demand, S3, Cognito, SQS + DLQ, SNS, EventBridge, CloudWatch, X-Ray, CodePipeline / CodeBuild / CodeDeploy, ECR + ECS Fargate y ACM.',
  '- Región: us-east-1. Créditos disponibles: 180 USD. Nada de recursos caros encendidos y borrar cada lab al terminar.',
].join('\n')

export interface DatosPrompt {
  paso: number
  titulo: string
  quiere: string
  yaHice?: string
  extra?: string
}

export function construirPrompt({
  paso,
  titulo,
  quiere,
  yaHice = 'los pasos anteriores',
  extra,
}: DatosPrompt): string {
  const lineas = [
    CONTEXTO_PROYECTO,
    '',
    'Estoy usando Amazon Q como apoyo para este paso.',
    `Estoy en el Paso ${paso} — ${titulo}.`,
    `Ya completé: ${yaHice}.`,
    `Quiero lograr: ${quiere}.`,
  ]

  if (extra) {
    lineas.push('', extra)
  }

  lineas.push(
    '',
    'Me da este error o no entiendo esto: [pega aquí el error o tu duda].',
    '¿Qué debo revisar primero y por qué? Guíame solo en este paso: no me hagas el proyecto completo y no me des el código de los pasos siguientes.',
  )

  return lineas.join('\n')
}
