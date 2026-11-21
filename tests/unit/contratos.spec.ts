import { describe, expect, it } from 'vitest'
import { PASOS } from '@/data/pasos'
import { SECCIONES_CIERRE } from '@/data/cierre'
import {
  BUCKETS,
  LAMBDAS,
  NOMBRES_TABLA,
  RUTAS,
  STORES,
  TABLAS,
  VARIABLES,
  VARIABLES_LAMBDA,
  VARIABLES_VITE,
} from '@/data/contratos'
import {
  BUCKETS as BUCKETS_PROYECTO,
  LAMBDAS as LAMBDAS_PROYECTO,
  RUTAS as RUTAS_PROYECTO,
  STORES as STORES_PROYECTO,
  TABLAS as TABLAS_PROYECTO,
} from '@/data/proyecto'
import type { Paso } from '@/types/proyecto'

function textos(valor: unknown, salida: string[] = []): string[] {
  if (typeof valor === 'string') salida.push(valor)
  else if (Array.isArray(valor)) for (const item of valor) textos(item, salida)
  else if (typeof valor === 'object' && valor !== null) {
    for (const item of Object.values(valor)) textos(item, salida)
  }
  return salida
}

const textoPaso = (paso: Paso) => textos(paso).join('\n')
const guiaCompleta = PASOS.map(textoPaso).join('\n')
const idsAcciones = new Set([
  ...PASOS.flatMap((paso) => [
    ...paso.acciones.map((a) => a.id),
    ...paso.verifica.map((a) => a.id),
  ]),
  ...SECCIONES_CIERRE.flatMap((s) => s.acciones.map((a) => a.id)),
])

function pasoDe(numero: number): Paso {
  const paso = PASOS.find((p) => p.numero === numero)
  if (!paso) throw new Error(`No existe el Paso ${numero}`)
  return paso
}

describe('contratos: cada recurso nombrado está definido', () => {
  it('las 14 Lambdas de la spec tienen una acción marcable que las implementa', () => {
    const faltantes = LAMBDAS.filter((lambda) => !idsAcciones.has(lambda.accion))
    expect(
      faltantes.map((lambda) => `${lambda.nombre} → ${lambda.accion}`),
    ).toEqual([])
  })

  it('cada Lambda aparece en la guía de su propio paso', () => {
    const faltantes = LAMBDAS.filter(
      (lambda) => !textoPaso(pasoDe(lambda.paso)).includes(lambda.nombre),
    )
    expect(faltantes.map((lambda) => `${lambda.nombre} (paso ${lambda.paso})`)).toEqual([])
  })

  it('cada Lambda con ruta HTTP declara su ruta en su paso', () => {
    const faltantes = LAMBDAS.filter(
      (lambda) =>
        lambda.ruta !== undefined &&
        !textoPaso(pasoDe(lambda.paso)).includes(lambda.ruta as string),
    )
    expect(faltantes.map((lambda) => `${lambda.nombre} ${lambda.ruta}`)).toEqual([])
  })

  it('los 5 stores tienen archivo, export, id, estado y acciones; y aparecen en su paso', () => {
    expect(STORES).toHaveLength(5)
    const problemas: string[] = []

    for (const store of STORES) {
      if (!store.archivo.startsWith('src/stores/')) problemas.push(`${store.id}: archivo`)
      if (!store.export.startsWith('use') || !store.export.endsWith('Store')) {
        problemas.push(`${store.id}: export`)
      }
      if (Object.keys(store.estado).length === 0) problemas.push(`${store.id}: estado`)
      if (store.acciones.length === 0) problemas.push(`${store.id}: acciones`)

      const guia = textoPaso(pasoDe(store.paso))
      if (!guia.includes(store.archivo)) problemas.push(`${store.id}: falta el archivo en la guía`)
      if (!guia.includes(store.export)) problemas.push(`${store.id}: falta el export en la guía`)
    }

    expect(problemas).toEqual([])
  })

  it('cada store tiene un snippet de código en su paso', () => {
    const faltantes = STORES.filter((store) => {
      const paso = pasoDe(store.paso)
      return !paso.guia.some(
        (bloque) => bloque.tipo === 'codigo' && bloque.codigo.includes(store.export),
      )
    })
    expect(faltantes.map((store) => store.id)).toEqual([])
  })

  it('las 13 rutas de frontend tienen archivo de vista y aparecen en el Paso 1', () => {
    expect(RUTAS).toHaveLength(13)
    const guia = textoPaso(pasoDe(1))
    const problemas = RUTAS.filter(
      (ruta) => !guia.includes(ruta.ruta) || !guia.includes(ruta.vista),
    )
    expect(problemas.map((ruta) => `${ruta.ruta} → ${ruta.vista}`)).toEqual([])
  })

  it('todas las rutas HTTP de la API son únicas por método y ruta', () => {
    const vistas = new Set<string>()
    for (const lambda of LAMBDAS) {
      if (!lambda.ruta) continue
      const clave = `${lambda.metodo} ${lambda.ruta}`
      expect(vistas.has(clave), `ruta duplicada: ${clave}`).toBe(false)
      vistas.add(clave)
    }
  })

  it('ninguna variable de entorno se usa sin estar declarada', () => {
    const usadas = new Set<string>()
    for (const coincidencia of guiaCompleta.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
      usadas.add(coincidencia[1])
    }
    for (const coincidencia of guiaCompleta.matchAll(/import\.meta\.env\.([A-Z0-9_]+)/g)) {
      usadas.add(coincidencia[1])
    }
    // BASE_URL, MODE, DEV y PROD son de Vite. VITE_ aparece como prefijo
    // literal cuando una guía explica el patrón import.meta.env.VITE_*.
    const deVite = new Set(['BASE_URL', 'MODE', 'DEV', 'PROD', 'VITE_'])
    const declaradas = new Set(VARIABLES.map((variable) => variable.nombre))
    const sinDeclarar = [...usadas].filter(
      (nombre) => !declaradas.has(nombre) && !deVite.has(nombre),
    )
    expect(sinDeclarar).toEqual([])
  })

  it('cada variable declarada se explica en el paso donde se crea', () => {
    const problemas: string[] = []
    for (const variable of VARIABLES) {
      const guia = textoPaso(pasoDe(variable.paso))
      const mencionada =
        guia.includes(variable.nombre) ||
        variable.nombre === 'ENTORNO'
      if (!mencionada) problemas.push(`${variable.nombre} → paso ${variable.paso}`)
    }
    expect(problemas).toEqual([])
  })

  it('los nombres de tabla no se contradicen entre pasos', () => {
    // Shop-Products-${Entorno} solo es válido en el Paso 10, donde se define.
    const sinSufijo = guiaCompleta
      .split('\n')
      .join('\n')
      .match(/Shop-Products-\$\{Entorno\}/g)?.length ?? 0
    const guia10 = textoPaso(pasoDe(10))
    expect(sinSufijo).toBe(guia10.match(/Shop-Products-\$\{Entorno\}/g)?.length ?? 0)

    for (const nombre of NOMBRES_TABLA) {
      expect(guiaCompleta, `falta ${nombre}`).toContain(nombre)
    }
  })

  it('las tablas obligatorias y opcionales están marcadas y el cleanup es coherente', () => {
    const opcional = TABLAS.find((tabla) => !tabla.obligatoria)
    expect(opcional?.nombre).toBe('Shop-Cart')
    // Si el cleanup escanea Shop-Cart, el Paso 8 debe decir qué hacer cuando no existe.
    const guia8 = textoPaso(pasoDe(8))
    expect(guia8).toContain('Shop-Cart')
    expect(guia8.toLowerCase()).toMatch(/si decides no crear/)
  })

  it('las Lambdas declaran sus variables y todas existen', () => {
    const declaradas = new Set(VARIABLES_LAMBDA)
    const problemas: string[] = []
    for (const lambda of LAMBDAS) {
      for (const variable of lambda.variables) {
        if (!declaradas.has(variable)) problemas.push(`${lambda.nombre}: ${variable}`)
      }
    }
    expect(problemas).toEqual([])
  })

  it('las variables de Vite son las que usa el frontend', () => {
    expect(VARIABLES_VITE).toEqual([
      'VITE_API_URL',
      'VITE_COGNITO_USER_POOL_ID',
      'VITE_COGNITO_CLIENT_ID',
    ])
    const guia = guiaCompleta
    for (const nombre of VARIABLES_VITE) {
      expect(guia, `falta ${nombre} en las guías`).toContain(nombre)
    }
  })

  it('el Paso 10 no referencia recursos que no define', () => {
    const guia10 = textoPaso(pasoDe(10))
    // Si el template usa !Ref ShopApi, debe existir el recurso ShopApi.
    expect(guia10).toContain('ShopApi')
    expect(guia10).toMatch(/ShopApi:\s*\n\s*Type:\s*AWS::Serverless::Api/)
    // Si usa ${Entorno}, debe declarar Parameters.
    expect(guia10).toContain('Parameters:')
    expect(guia10).toContain('Entorno')
  })

  it('el authorizer de Cognito se explica donde se leen los claims', () => {
    for (const numero of [4, 5, 6]) {
      const guia = textoPaso(pasoDe(numero))
      if (!guia.includes('authorizer.claims')) continue
      expect(guia, `Paso ${numero} lee claims sin explicar el authorizer`).toMatch(
        /Authorizer|authorizer/i,
      )
    }
  })

  it('createOrder no confía en el precio que envía el cliente', () => {
    const guia5 = textoPaso(pasoDe(5))
    expect(guia5).toMatch(/precio.*DynamoDB|DynamoDB.*precio/i)
  })

  it('el frontend filtra productos inactivos o no los marca como borrados', () => {
    const guia5 = textoPaso(pasoDe(5))
    expect(guia5).toMatch(/activo/)
    expect(guia5).toMatch(/filtra|inactivo/i)
  })

  it('checklist, /proyecto y contratos cuentan lo mismo', () => {
    const nombresProyecto = LAMBDAS_PROYECTO.flatMap((grupo) =>
      grupo.funciones.map((funcion) => funcion.nombre),
    ).sort()
    const nombresContrato = LAMBDAS.map((lambda) => lambda.nombre).sort()
    expect(nombresProyecto).toEqual(nombresContrato)

    expect(STORES_PROYECTO).toHaveLength(STORES.length)
    expect(RUTAS_PROYECTO).toHaveLength(RUTAS.length)
    expect(TABLAS_PROYECTO.map((t) => t.nombre).sort()).toEqual(
      TABLAS.map((t) => t.nombre).sort(),
    )
    expect(BUCKETS_PROYECTO.map((b) => b.nombre).sort()).toEqual(
      BUCKETS.map((b) => b.nombre).sort(),
    )
  })

  it('todas las Lambdas tienen ruta HTTP salvo las de evento', () => {
    const problemas = LAMBDAS.filter(
      (lambda) =>
        (lambda.metodo === 'evento' && lambda.ruta !== undefined) ||
        (lambda.metodo !== 'evento' && !lambda.ruta),
    )
    expect(problemas.map((lambda) => lambda.nombre)).toEqual([])
  })

  it('las rutas de admin exigen auth admin y las de evento no exigen auth', () => {
    const problemas = LAMBDAS.filter((lambda) => {
      const esAdmin = lambda.ruta?.startsWith('/admin') ?? false
      if (esAdmin && lambda.auth !== 'admin') return true
      if (lambda.metodo === 'evento' && lambda.auth !== 'n/a') return true
      return false
    })
    expect(problemas.map((lambda) => `${lambda.nombre}: ${lambda.auth}`)).toEqual([])
  })
})
