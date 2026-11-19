import { beforeEach, describe, expect, it } from 'vitest'
import {
  CLAVE_PROGRESO,
  alternarAccion,
  alternarPrompt,
  estaHecha,
  estaPromptHecho,
  exportarProgreso,
  importarProgreso,
  normalizarProgreso,
  recargarProgreso,
  reiniciarProgreso,
  reiniciarProgresoEnMemoria,
  useProgreso,
} from '@/composables/useProgreso'

describe('progreso persistente', () => {
  beforeEach(() => {
    localStorage.clear()
    reiniciarProgresoEnMemoria()
  })

  it('usa la clave shop-dva-c03:progress', () => {
    expect(CLAVE_PROGRESO).toBe('shop-dva-c03:progress')
    alternarAccion('paso-2.1')
    expect(localStorage.getItem('shop-dva-c03:progress')).toBeTruthy()
  })

  it('marca y desmarca una acción, persistiendo el cambio', () => {
    alternarAccion('paso-2.1')
    expect(estaHecha('paso-2.1')).toBe(true)

    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) ?? '{}')
    expect(guardado.acciones['paso-2.1'].hecho).toBe(true)
    expect(typeof guardado.acciones['paso-2.1'].fecha).toBe('string')

    reiniciarProgresoEnMemoria()
    recargarProgreso()
    expect(estaHecha('paso-2.1')).toBe(true)

    alternarAccion('paso-2.1')
    expect(estaHecha('paso-2.1')).toBe(false)
    const despues = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) ?? '{}')
    expect(despues.acciones['paso-2.1']).toBeUndefined()
  })

  it('los prompts se marcan de forma independiente de las acciones', () => {
    alternarPrompt('paso-2.prompt')
    expect(estaPromptHecho('paso-2.prompt')).toBe(true)
    expect(estaHecha('paso-2.prompt')).toBe(false)
    expect(Object.keys(useProgreso().value.prompts)).toEqual(['paso-2.prompt'])
  })

  it('tolera JSON corrupto y formas inválidas sin lanzar', () => {
    localStorage.setItem(CLAVE_PROGRESO, '{esto no es json')
    expect(() => recargarProgreso()).not.toThrow()
    expect(useProgreso().value.acciones).toEqual({})

    localStorage.setItem(
      CLAVE_PROGRESO,
      JSON.stringify({
        version: 9,
        acciones: { a: { hecho: true }, b: { hecho: 'si' }, c: null },
        prompts: 'no',
      }),
    )
    recargarProgreso()
    expect(useProgreso().value.acciones).toEqual({
      a: { hecho: true, fecha: undefined },
    })
    expect(useProgreso().value.prompts).toEqual({})
  })

  it('normaliza solo entradas explícitamente completadas', () => {
    const normalizado = normalizarProgreso({
      acciones: {
        'paso-1.1': { hecho: true, fecha: '2026-11-19T00:00:00.000Z' },
        'paso-1.2': { hecho: false },
        'paso-1.3': { hecho: true, fecha: 42 },
      },
    })
    expect(Object.keys(normalizado.acciones)).toEqual(['paso-1.1', 'paso-1.3'])
    expect(normalizado.acciones['paso-1.3'].fecha).toBeUndefined()
  })

  it('reiniciar borra solo la clave de esta app', () => {
    localStorage.setItem('otra-app', 'no tocar')
    alternarAccion('paso-0.1')
    reiniciarProgreso()
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBeNull()
    expect(localStorage.getItem('otra-app')).toBe('no tocar')
    expect(useProgreso().value.acciones).toEqual({})
  })

  it('exporta un JSON legible y lo reimporta en otro estado', () => {
    alternarAccion('paso-2.1')
    alternarPrompt('paso-2.prompt')

    const json = exportarProgreso()
    expect(json).toContain('\n  "version": 1')
    const crudo = JSON.parse(json)
    expect(crudo.acciones['paso-2.1'].hecho).toBe(true)

    reiniciarProgresoEnMemoria()
    expect(estaHecha('paso-2.1')).toBe(false)

    const resumen = importarProgreso(crudo)
    expect(resumen).toEqual({ acciones: 1, prompts: 1 })
    expect(estaHecha('paso-2.1')).toBe(true)
    expect(estaPromptHecho('paso-2.prompt')).toBe(true)

    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) ?? '{}')
    expect(guardado.acciones['paso-2.1'].hecho).toBe(true)
  })

  it('acepta un respaldo vacío pero con formato correcto', () => {
    const resumen = importarProgreso({ version: 1, acciones: {}, prompts: {} })
    expect(resumen).toEqual({ acciones: 0, prompts: 0 })
    expect(useProgreso().value.acciones).toEqual({})
  })

  it('rechaza archivos que no son un respaldo', () => {
    expect(() => importarProgreso('texto')).toThrow(/objeto de progreso/)
    expect(() => importarProgreso([])).toThrow(/objeto de progreso/)
    expect(() => importarProgreso({ foo: 1 })).toThrow(/acciones o prompts/)
  })
})
