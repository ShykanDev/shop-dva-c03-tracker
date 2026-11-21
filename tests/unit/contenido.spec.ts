import { describe, expect, it } from 'vitest'
import { PASOS } from '@/data/pasos'
import {
  DOMINIOS_COBERTURA,
  FUERA_DE_ALCANCE,
  SECCIONES_CIERRE,
  TEMAS_OPCIONALES,
} from '@/data/cierre'
import { TOTAL_ACCIONES, TOTAL_LABS, TOTAL_PROMPTS, accionesDePaso, promptsDePaso } from '@/composables/useTotales'
import type { Paso } from '@/types/proyecto'

function textosDe(valor: unknown, salida: string[] = []): string[] {
  if (typeof valor === 'string') {
    salida.push(valor)
  } else if (Array.isArray(valor)) {
    for (const item of valor) textosDe(item, salida)
  } else if (typeof valor === 'object' && valor !== null) {
    for (const item of Object.values(valor)) textosDe(item, salida)
  }
  return salida
}

const todoElTexto = textosDe({
  pasos: PASOS,
  cierre: SECCIONES_CIERRE,
  cobertura: DOMINIOS_COBERTURA,
  fuera: FUERA_DE_ALCANCE,
  opcionales: TEMAS_OPCIONALES,
}).join('\n')

const SKILLS_ESPERADAS: Record<string, string[]> = {
  'paso-0': [],
  'paso-1': [],
  'paso-2': ['1.3.1', '1.3.2', '1.3.4'],
  'paso-3': ['1.1.1', '1.1.2', '1.1.4', '1.1.5', '1.2.2', '1.2.4', '3.1.5'],
  'paso-4': ['2.1.1', '2.1.2', '2.1.3', '2.1.5', '2.1.6', '2.1.7'],
  'paso-5': ['1.1.5', '1.1.7', '1.2.3', '1.3.4', '2.1.4', '2.2.1', '2.2.6'],
  'paso-6': ['1.3.1', '2.1.4', '2.2.1', '2.2.3'],
  'paso-7': ['1.1.2', '1.1.8', '1.2.3', '4.1.1', '4.3.3'],
  'paso-8': ['1.1.8', '2.2.7', '3.1.4'],
  'paso-9': ['4.1.2', '4.1.3', '4.2.1', '4.2.2', '4.2.3', '4.2.4', '4.2.5'],
  'paso-10': [
    '3.1.1',
    '3.1.3',
    '3.1.4',
    '3.2.1',
    '3.2.4',
    '3.3.1',
    '3.3.3',
    '3.3.4',
    '3.3.5',
    '3.3.6',
    '3.3.7',
    '3.3.8',
  ],
  'paso-11': ['3.1.2', '3.3.2'],
  'paso-12': ['4.3.1', '4.3.2', '4.3.4', '4.3.5', '2.2.1', '2.2.2', '2.2.4'],
  'paso-13': [],
  'paso-14': [],
  'paso-15': [],
}

describe('contenido del proyecto', () => {
  it('tiene exactamente los pasos 0 a 15, sin huecos ni duplicados', () => {
    expect(PASOS).toHaveLength(16)
    expect(PASOS.map((paso) => paso.numero)).toEqual(
      Array.from({ length: 16 }, (_, i) => i),
    )
    expect(new Set(PASOS.map((paso) => paso.id)).size).toBe(16)
  })

  it('cuadra el conteo de acciones, labs y prompts', () => {
    expect(TOTAL_LABS).toBe(8)
    expect(TOTAL_PROMPTS).toBe(24)
    expect(SECCIONES_CIERRE.reduce((t, s) => t + s.acciones.length, 0)).toBe(15)
    const accionesDePasos = PASOS.reduce(
      (total, paso) => total + accionesDePaso(paso).length,
      0,
    )
    expect(accionesDePasos).toBe(88)
    expect(TOTAL_ACCIONES).toBe(103)
  })

  it('usa ids únicos en acciones, verificaciones, labs, cierre y prompts', () => {
    const ids: string[] = []
    for (const paso of PASOS) {
      ids.push(...accionesDePaso(paso))
      ids.push(...promptsDePaso(paso))
      for (const lab of paso.laboratorios ?? []) ids.push(lab.id)
    }
    for (const seccion of SECCIONES_CIERRE) {
      ids.push(...seccion.acciones.map((accion) => accion.id))
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('mantiene las skills de la especificación por paso', () => {
    for (const paso of PASOS) {
      expect(paso.skills, paso.id).toEqual(SKILLS_ESPERADAS[paso.id])
    }
  })

  it('cada paso tiene acciones, guía real y prompt de Amazon Q', () => {
    for (const paso of PASOS) {
      expect(paso.acciones.length, paso.id).toBeGreaterThan(0)
      expect(paso.verifica.length, paso.id).toBeGreaterThan(0)
      expect(paso.guia.length, paso.id).toBeGreaterThan(0)
      expect(
        paso.guia.some((bloque) => bloque.tipo === 'lista' || bloque.tipo === 'codigo'),
        `${paso.id} sin cómo`,
      ).toBe(true)
      expect(paso.promptAmazonQ).toContain('Amazon Q')
      expect(paso.promptAmazonQ).toContain('us-east-1')
      expect(paso.promptAmazonQ).toContain('[pega aquí el error o tu duda]')
      expect(paso.objetivo.length).toBeGreaterThan(20)
    }
  })

  it('cada acción tiene texto, id coherente y detalle cuando aplica', () => {
    for (const paso of PASOS) {
      for (const accion of [...paso.acciones, ...paso.verifica]) {
        expect(accion.id.startsWith(`${paso.id}.`), accion.id).toBe(true)
        expect(accion.texto.trim().length, accion.id).toBeGreaterThan(10)
      }
    }
  })

  it('el Paso 14 contiene exactamente los 8 labs, cada uno completo', () => {
    const paso14 = PASOS.find((paso) => paso.id === 'paso-14') as Paso
    expect(paso14.laboratorios).toHaveLength(8)
    for (const lab of paso14.laboratorios ?? []) {
      expect(lab.como.length, lab.id).toBeGreaterThanOrEqual(5)
      expect(lab.verifica.trim().length, lab.id).toBeGreaterThan(20)
      expect(lab.limpieza?.trim().length ?? 0, lab.id).toBeGreaterThan(10)
      expect(lab.prompt, lab.id).toContain('Amazon Q')
      expect(lab.prompt, lab.id).toContain('us-east-1')
    }
  })

  it('conserva rutas, tablas, Lambdas y servicios de la especificación', () => {
    const requeridos = [
      '/productos',
      '/producto/:id',
      '/login',
      '/registro',
      '/carrito',
      '/checkout',
      '/pedidos',
      '/admin/productos',
      '/admin/pedidos',
      'Shop-Products',
      'Shop-Orders',
      'Shop-Cart',
      'GSI-Category',
      'GSI-Status',
      'shop-products-images',
      'shop-frontend',
      'createProduct',
      'getProducts',
      'getProductById',
      'updateProduct',
      'deleteProduct',
      'createOrder',
      'getMyOrders',
      'getOrderById',
      'updateOrderStatus',
      'getUploadUrl',
      'getProductImageUrl',
      'processOrder',
      'sendOrderNotification',
      'cleanupExpiredCarts',
      'Cognito',
      'SQS',
      'SNS',
      'EventBridge',
      'Secrets Manager',
      'Parameter Store',
      'CloudWatch',
      'X-Ray',
      'CodePipeline',
      'CodeBuild',
      'CodeDeploy',
      'ECR',
      'Fargate',
      'CloudFront',
      'ACM',
    ]
    for (const requerido of requeridos) {
      expect(todoElTexto, `falta ${requerido}`).toContain(requerido)
    }
  })

  it('no incluye planificación por semana ni límites diarios', () => {
    const prohibidos = [
      'por semana',
      'cada semana',
      'semana 1',
      'semana 2',
      'límite diario',
      'límite por día',
      'por día',
      'deadline',
    ]
    for (const prohibido of prohibidos) {
      expect(todoElTexto.toLowerCase()).not.toContain(prohibido)
    }
  })

  it('la cobertura declara los 4 dominios con su peso y sus brechas', () => {
    expect(DOMINIOS_COBERTURA).toHaveLength(4)
    const pesos = DOMINIOS_COBERTURA.map((dominio) => dominio.peso)
    expect(pesos).toEqual(['30 %', '26 %', '22 %', '22 %'])
    for (const dominio of DOMINIOS_COBERTURA) {
      expect(dominio.cubre.length).toBeGreaterThan(0)
      expect(dominio.falta.length).toBeGreaterThan(10)
      expect(dominio.pasos.length).toBeGreaterThan(0)
    }
    expect(FUERA_DE_ALCANCE).toEqual(['SageMaker AI', 'Amazon Polly', 'Amazon Rekognition'])
    expect(TEMAS_OPCIONALES.length).toBe(6)
  })
})
