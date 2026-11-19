import { ref } from 'vue'

export const CLAVE_PROGRESO = 'shop-dva-c03:progress'

export interface EntradaProgreso {
  hecho: boolean
  fecha?: string
}

export interface ProgresoShopV1 {
  version: 1
  acciones: Record<string, EntradaProgreso>
  prompts: Record<string, EntradaProgreso>
}

function progresoVacio(): ProgresoShopV1 {
  return { version: 1, acciones: {}, prompts: {} }
}

function normalizarEntradas(valor: unknown): Record<string, EntradaProgreso> {
  const salida: Record<string, EntradaProgreso> = {}
  if (typeof valor !== 'object' || valor === null) return salida

  for (const [id, entrada] of Object.entries(valor as Record<string, unknown>)) {
    if (typeof entrada !== 'object' || entrada === null) continue
    const candidato = entrada as { hecho?: unknown; fecha?: unknown }
    if (candidato.hecho !== true) continue
    salida[id] = {
      hecho: true,
      fecha: typeof candidato.fecha === 'string' ? candidato.fecha : undefined,
    }
  }

  return salida
}

export function normalizarProgreso(crudo: unknown): ProgresoShopV1 {
  if (typeof crudo !== 'object' || crudo === null) return progresoVacio()
  const datos = crudo as Partial<ProgresoShopV1>
  return {
    version: 1,
    acciones: normalizarEntradas(datos.acciones),
    prompts: normalizarEntradas(datos.prompts),
  }
}

function leerDeStorage(): ProgresoShopV1 {
  try {
    if (typeof localStorage === 'undefined') return progresoVacio()
    const crudo = localStorage.getItem(CLAVE_PROGRESO)
    if (!crudo) return progresoVacio()
    return normalizarProgreso(JSON.parse(crudo))
  } catch {
    return progresoVacio()
  }
}

const progreso = ref<ProgresoShopV1>(leerDeStorage())

function persistir(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso.value))
  } catch {
    // Sin almacenamiento disponible: el progreso vive solo en memoria.
  }
}

export function alternarAccion(id: string): void {
  if (progreso.value.acciones[id]?.hecho) {
    delete progreso.value.acciones[id]
  } else {
    progreso.value.acciones[id] = {
      hecho: true,
      fecha: new Date().toISOString(),
    }
  }
  persistir()
}

export function alternarPrompt(id: string): void {
  if (progreso.value.prompts[id]?.hecho) {
    delete progreso.value.prompts[id]
  } else {
    progreso.value.prompts[id] = {
      hecho: true,
      fecha: new Date().toISOString(),
    }
  }
  persistir()
}

export function estaHecha(id: string): boolean {
  return progreso.value.acciones[id]?.hecho === true
}

export function estaPromptHecho(id: string): boolean {
  return progreso.value.prompts[id]?.hecho === true
}

export function recargarProgreso(): void {
  progreso.value = leerDeStorage()
}

export interface ResumenImportacion {
  acciones: number
  prompts: number
}

/** Serializa el progreso con formato legible para respaldo o traslado. */
export function exportarProgreso(): string {
  return JSON.stringify(progreso.value, null, 2)
}

/**
 * Reemplaza el progreso actual con un respaldo exportado por esta app.
 * Valida la forma mínima y lanza un error legible si el archivo no sirve.
 */
export function importarProgreso(crudo: unknown): ResumenImportacion {
  if (typeof crudo !== 'object' || crudo === null || Array.isArray(crudo)) {
    throw new Error('El archivo no contiene un objeto de progreso válido.')
  }

  const datos = crudo as Record<string, unknown>
  const tieneAcciones =
    typeof datos.acciones === 'object' && datos.acciones !== null && !Array.isArray(datos.acciones)
  const tienePrompts =
    typeof datos.prompts === 'object' && datos.prompts !== null && !Array.isArray(datos.prompts)

  if (!tieneAcciones && !tienePrompts) {
    throw new Error('El archivo no tiene las secciones acciones o prompts.')
  }

  const normalizado = normalizarProgreso(crudo)
  const resumen = {
    acciones: Object.keys(normalizado.acciones).length,
    prompts: Object.keys(normalizado.prompts).length,
  }

  if (datos.version !== 1 && resumen.acciones === 0 && resumen.prompts === 0) {
    throw new Error('El archivo no parece un respaldo de Shop DVA-C03.')
  }

  progreso.value = normalizado
  persistir()
  return resumen
}

export function reiniciarProgreso(): void {
  progreso.value = progresoVacio()
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CLAVE_PROGRESO)
    }
  } catch {
    // Sin almacenamiento disponible.
  }
}

export function useProgreso() {
  return progreso
}

/** Solo para tests: deja el estado en blanco sin tocar localStorage. */
export function reiniciarProgresoEnMemoria(): void {
  progreso.value = progresoVacio()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (evento) => {
    if (evento.key === CLAVE_PROGRESO) recargarProgreso()
  })
}
