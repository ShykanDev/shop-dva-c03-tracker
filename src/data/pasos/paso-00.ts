import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso00: Paso = {
  id: 'paso-0',
  numero: 0,
  titulo: 'Cuenta segura',
  resumen:
    'Proteger la cuenta root, poner alarmas de gasto y crear tu usuario de trabajo antes de tocar AWS.',
  objetivo:
    'Trabajar con un usuario IAM propio, con MFA y con dos alarmas de billing activas, dentro de una cuenta que no usa root para programar.',
  acciones: [
    {
      id: 'paso-0.1',
      texto: 'Activar MFA en el usuario root',
      detalle:
        'Consola → menú de cuenta (arriba a la derecha) → Security credentials → Assign MFA device. Usa una app de autenticación.',
    },
    {
      id: 'paso-0.2',
      texto: 'Crear alarma de billing en 5 USD',
      detalle:
        'Billing and Cost Management → Budgets → Create budget → Monthly cost budget.',
    },
    {
      id: 'paso-0.3',
      texto: 'Crear alarma de billing en 20 USD',
      detalle:
        'Segunda alarma con el mismo procedimiento. La primera avisa temprano; la segunda es el freno.',
    },
    {
      id: 'paso-0.4',
      texto: 'Revisar en Billing > Credits la fecha de vencimiento de los 180 USD y anotarla',
      detalle:
        'Anótala fuera de AWS. Si el crédito vence, el proyecto deja de ser gratis.',
    },
    {
      id: 'paso-0.5',
      texto: 'Crear un usuario IAM para trabajar y dejar de usar root',
      detalle:
        'IAM → Users → Create user. Activa acceso a consola, MFA y permisos de administrador solo al inicio.',
    },
  ],
  verifica: [
    {
      id: 'paso-0.v1',
      texto: 'Repo GitHub shop-dva-c03 creado con .gitignore para node_modules, .env y dist',
      detalle:
        'El repositorio es la fuente del pipeline del Paso 10. Si el .gitignore falta ahora, después se filtran secretos.',
    },
    {
      id: 'paso-0.v2',
      texto: 'Entrar a la consola con el usuario IAM (no root) y confirmar que las alarmas aparecen',
      detalle:
        'Cierra la sesión root. Si sigues entrando como root, el resto del proyecto se construye sobre una mala práctica.',
    },
  ],
  skills: [],
  guia: [
    {
      tipo: 'texto',
      md: 'Antes de escribir código vamos a dejar la cuenta en un estado seguro. La regla es simple: root solo se usa para crear el usuario de trabajo y para revisar facturación. Todo lo demás se hace con un usuario IAM con MFA y, más adelante, con permisos de mínimo privilegio.',
    },
    {
      tipo: 'lista',
      titulo: 'Cómo hacerlo en la consola',
      items: [
        'Entra a la consola de AWS con el usuario root y abre el menú de tu cuenta (arriba a la derecha). Entra en Security credentials → Assign MFA device. Elige Authenticator app, escanea el código y confirma dos códigos consecutivos.',
        'Abre Billing and Cost Management. En el menú lateral entra a Budgets → Create budget → Monthly cost budget. Pon 5 USD y un correo que revises. Repite el proceso con 20 USD.',
        'En Billing, entra a Credits. Ahí aparece el saldo de 180 USD y su fecha de vencimiento. Anótala en un lugar fuera de AWS.',
        'Ve a IAM → Users → Create user. Nombre sugerido: alejandro-dev. Marca Provide user access to the AWS Management Console. No uses root para programar.',
        'En el mismo usuario, activa MFA (Security credentials → Assign MFA device).',
        'Adjunta la política AdministratorAccess solo para aprender. En el Paso 4 la bajaremos a permisos de mínimo privilegio para las Lambdas.',
        'Crea el repositorio en GitHub con el nombre shop-dva-c03. Añade el .gitignore antes del primer commit.',
        'Cierra la sesión de root y vuelve a entrar con alejandro-dev. Si algo de facturación no aparece, revisa que el usuario tenga permisos de Billing.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: '.gitignore',
      codigo: [
        'node_modules/',
        'dist/',
        '.env',
        '.env.*',
        '!.env.example',
        '.aws-sam/',
        '*.zip',
        '.DS_Store',
      ].join('\n'),
      nota: 'El archivo .env nunca se sube. Los secretos reales van a Secrets Manager o Parameter Store en el Paso 8.',
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'No te quedes en root',
      md: 'Si sigues programando con root, cualquier error de permisos del examen te va a parecer normal. La cuenta de trabajo con IAM es parte del aprendizaje de seguridad del Dominio 2.',
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Qué revisar si no ves Billing',
      md: 'El usuario IAM necesita permisos de facturación. Si la consola te muestra "no autorizado", vuelve a root solo para adjuntar la política de Billing y regresa a tu usuario de trabajo.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 0,
    titulo: 'Cuenta segura',
    quiere:
      'dejar la cuenta lista para el proyecto: MFA en root, alarmas de billing en 5 y 20 USD, revisar el vencimiento de los créditos, crear mi usuario IAM de trabajo y el repo shop-dva-c03 con .gitignore',
    yaHice: 'nada todavía; esta es la preparación inicial',
    extra:
      'Dime el orden correcto de estos pasos y qué error típico aparece al activar MFA o al crear el usuario IAM. No quiero usar root para programar.',
  }),
}
