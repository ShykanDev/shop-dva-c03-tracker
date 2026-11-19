import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DATOS_EXAMEN } from '@/data/cierre'
import {
  BUCKETS,
  LAMBDAS,
  PROYECTO,
  RUTAS,
  STORES,
  TABLAS,
} from '@/data/proyecto'

const especificacion = readFileSync(
  resolve(process.cwd(), 'public/docs/especificacion-tecnica-dva-c03.txt'),
  'utf8',
)

describe('documentación técnica', () => {
  it('declara las 13 rutas con su tipo', () => {
    expect(RUTAS).toHaveLength(13)
    expect(RUTAS.filter((ruta) => ruta.tipo === 'pública')).toHaveLength(6)
    expect(RUTAS.filter((ruta) => ruta.tipo === 'protegida')).toHaveLength(3)
    expect(RUTAS.filter((ruta) => ruta.tipo === 'admin')).toHaveLength(4)
  })

  it('declara los 5 stores de Pinia', () => {
    expect(STORES.map((store) => store.nombre)).toEqual([
      'authStore',
      'cartStore',
      'productsStore',
      'ordersStore',
      'adminStore',
    ])
  })

  it('declara las 3 tablas con sus claves e índices', () => {
    expect(TABLAS.map((tabla) => tabla.nombre)).toEqual([
      'Shop-Products',
      'Shop-Orders',
      'Shop-Cart',
    ])
    expect(TABLAS[0].pk).toBe('PRODUCT#<productId>')
    expect(TABLAS[0].indices[0].nombre).toBe('GSI-Category')
    expect(TABLAS[1].pk).toBe('USER#<userId>')
    expect(TABLAS[1].sk).toBe('ORDER#<orderId>')
    expect(TABLAS[1].indices[0].nombre).toBe('GSI-Status')
    expect(TABLAS[2].nombre).toBe('Shop-Cart')
  })

  it('declara los 2 buckets de S3', () => {
    expect(BUCKETS.map((bucket) => bucket.nombre)).toEqual([
      'shop-products-images',
      'shop-frontend',
    ])
  })

  it('declara las 14 Lambdas en 4 grupos', () => {
    expect(LAMBDAS).toHaveLength(4)
    const funciones = LAMBDAS.flatMap((grupo) => grupo.funciones)
    expect(funciones).toHaveLength(14)
    expect(funciones.map((funcion) => funcion.nombre).sort()).toEqual(
      [
        'createProduct',
        'createOrder',
        'cleanupExpiredCarts',
        'deleteProduct',
        'getMyOrders',
        'getOrderById',
        'getProductImageUrl',
        'getProductById',
        'getProducts',
        'getUploadUrl',
        'processOrder',
        'sendOrderNotification',
        'updateOrderStatus',
        'updateProduct',
      ].sort(),
    )
  })

  it('conserva los datos oficiales del examen', () => {
    expect(DATOS_EXAMEN).toMatchObject({
      codigo: 'DVA-C03',
      preguntas: 65,
      preguntasPuntuadas: 50,
      preguntasNoPuntuadas: 15,
      duracionMinutos: 130,
      corte: 720,
      tareas: 12,
      habilidades: 72,
    })
  })

  it('la especificación .txt existe con todas las secciones y pasos', () => {
    const secciones = [
      'SUPER MENSAJE',
      'VERIFICACION FINAL',
      'QUE PROYECTO VAMOS A HACER',
      'STACK TECNICO',
      'RUTAS ESPERADAS',
      'MODELO DE DATOS',
      'LAMBDAS',
      'ORDEN DE CONSTRUCCION',
      'COMO PREGUNTARLE A AMAZON Q',
      'DEFINICION DE TERMINADO',
      'COSTOS Y LIMPIEZA',
      'FIN DEL SUPER MENSAJE',
    ]
    for (const seccion of secciones) {
      expect(especificacion, `falta ${seccion}`).toContain(seccion)
    }
    for (let numero = 0; numero <= 15; numero += 1) {
      expect(especificacion, `falta el Paso ${numero}`).toContain(
        `PASO ${numero} `,
      )
    }
  })

  it('el .txt contiene todas las rutas, tablas y Lambdas de la vista', () => {
    for (const ruta of RUTAS) {
      expect(especificacion, `falta la ruta ${ruta.ruta}`).toContain(ruta.ruta)
    }
    for (const tabla of TABLAS) {
      expect(especificacion, `falta la tabla ${tabla.nombre}`).toContain(
        tabla.nombre,
      )
    }
    for (const grupo of LAMBDAS) {
      for (const funcion of grupo.funciones) {
        expect(especificacion, `falta la Lambda ${funcion.nombre}`).toContain(
          funcion.nombre,
        )
      }
    }
  })

  it('la referencia del proyecto está completa', () => {
    expect(PROYECTO.usuarios).toHaveLength(2)
    expect(PROYECTO.flujo).toHaveLength(6)
    expect(PROYECTO.stack.map((grupo) => grupo.grupo)).toEqual([
      'Frontend',
      'Backend y AWS',
    ])
    expect(PROYECTO.contratoLambda).toHaveLength(6)
    expect(PROYECTO.reglasAmazonQ.length).toBeGreaterThanOrEqual(5)
    expect(PROYECTO.cuenta.region).toContain('us-east-1')
    expect(PROYECTO.cuenta.creditos).toContain('180')
  })
})
