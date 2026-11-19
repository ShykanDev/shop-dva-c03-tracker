import { computed } from 'vue'
import { PASOS } from '@/data/pasos'
import { SECCIONES_CIERRE } from '@/data/cierre'
import type { Paso } from '@/types/proyecto'
import { estaHecha, estaPromptHecho, useProgreso } from './useProgreso'

export function accionesDePaso(paso: Paso): string[] {
  return [
    ...paso.acciones.map((accion) => accion.id),
    ...paso.verifica.map((accion) => accion.id),
  ]
}

export function promptsDePaso(paso: Paso): string[] {
  const ids = [`${paso.id}.prompt`]
  for (const laboratorio of paso.laboratorios ?? []) {
    ids.push(`${paso.id}.${laboratorio.id}.prompt`)
  }
  return ids
}

export const TOTAL_ACCIONES =
  PASOS.reduce((total, paso) => total + accionesDePaso(paso).length, 0) +
  SECCIONES_CIERRE.reduce(
    (total, seccion) => total + seccion.acciones.length,
    0,
  )

export const TOTAL_PROMPTS = PASOS.reduce(
  (total, paso) => total + promptsDePaso(paso).length,
  0,
)

export const TOTAL_LABS = PASOS.reduce(
  (total, paso) => total + (paso.laboratorios?.length ?? 0),
  0,
)

const IDS_ACCIONES = new Set([
  ...PASOS.flatMap((paso) => accionesDePaso(paso)),
  ...SECCIONES_CIERRE.flatMap((seccion) =>
    seccion.acciones.map((accion) => accion.id),
  ),
])

const IDS_PROMPTS = new Set(PASOS.flatMap((paso) => promptsDePaso(paso)))

export function useTotales() {
  const progreso = useProgreso()

  const accionesCompletadas = computed(
    () => [...IDS_ACCIONES].filter((id) => estaHecha(id)).length,
  )

  const promptsCompletados = computed(
    () => [...IDS_PROMPTS].filter((id) => estaPromptHecho(id)).length,
  )

  const porcentajeGlobal = computed(() =>
    TOTAL_ACCIONES === 0
      ? 0
      : Math.round((accionesCompletadas.value / TOTAL_ACCIONES) * 100),
  )

  function pasoCompletado(paso: Paso): boolean {
    const ids = accionesDePaso(paso)
    return ids.length > 0 && ids.every((id) => estaHecha(id))
  }

  function progresoPaso(paso: Paso): { hechas: number; total: number; pct: number } {
    const ids = accionesDePaso(paso)
    const hechas = ids.filter((id) => estaHecha(id)).length
    return {
      hechas,
      total: ids.length,
      pct: ids.length === 0 ? 0 : Math.round((hechas / ids.length) * 100),
    }
  }

  function pasoConPromptCompletado(paso: Paso): boolean {
    return (
      pasoCompletado(paso) &&
      promptsDePaso(paso).every((id) => estaPromptHecho(id))
    )
  }

  const siguientePaso = computed<Paso | undefined>(() =>
    PASOS.find((paso) => !pasoCompletado(paso)),
  )

  return {
    accionesCompletadas,
    promptsCompletados,
    porcentajeGlobal,
    pasoCompletado,
    pasoConPromptCompletado,
    progresoPaso,
    siguientePaso,
  }
}
