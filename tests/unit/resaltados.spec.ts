import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CLAVE_RESALTADOS,
  aplicarResaltados,
  normalizarResaltados,
  quitarEnSegmento,
  resaltadosDeRuta,
  resaltarSegmento,
  reiniciarResaltadosEnMemoria,
  recargarResaltados,
  rutaActual,
  useResaltados,
  type SegmentoSeleccion,
} from '@/composables/useResaltados'

const segmento = (
  inicio: number,
  fin: number,
  ancla = 'main:nth-of-type(1)>p:nth-of-type(1)',
  ruta = '/guia/paso-1',
): SegmentoSeleccion => ({
  ancla,
  inicio,
  fin,
  texto: 'texto resaltado',
  ruta,
})

describe('resaltados persistentes', () => {
  beforeEach(() => {
    localStorage.clear()
    reiniciarResaltadosEnMemoria()
    history.replaceState({}, '', '/guia/paso-1')
  })

  it('usa su propia clave y no toca el progreso', () => {
    expect(CLAVE_RESALTADOS).toBe('shop-dva-c03:resaltados')
    localStorage.setItem('shop-dva-c03:progress', '{"version":1}')
    resaltarSegmento(segmento(0, 5), 'amarillo')
    expect(localStorage.getItem(CLAVE_RESALTADOS)).toBeTruthy()
    expect(localStorage.getItem('shop-dva-c03:progress')).toBe('{"version":1}')
  })

  it('guarda ruta, ancla, offsets, color y texto', () => {
    const [creado] = resaltarSegmento(segmento(4, 9), 'verde')
    expect(creado).toMatchObject({
      ruta: '/guia/paso-1',
      ancla: 'main:nth-of-type(1)>p:nth-of-type(1)',
      inicio: 4,
      fin: 9,
      color: 'verde',
      texto: 'texto resaltado',
    })

    const guardados = JSON.parse(localStorage.getItem(CLAVE_RESALTADOS) ?? '[]')
    expect(guardados).toHaveLength(1)
    expect(guardados[0].color).toBe('verde')
  })

  it('permite varios resaltados y filtra por ruta', () => {
    resaltarSegmento(segmento(0, 3), 'amarillo')
    resaltarSegmento(segmento(10, 15), 'azul')
    expect(useResaltados().value).toHaveLength(2)
    expect(resaltadosDeRuta('/guia/paso-1')).toHaveLength(2)
    expect(resaltadosDeRuta('/guia/paso-2')).toHaveLength(0)
  })

  it('quita solo los resaltados que se cruzan con el segmento', () => {
    resaltarSegmento(segmento(0, 10), 'amarillo')
    resaltarSegmento(segmento(20, 30), 'rosa')

    const quitados = quitarEnSegmento(segmento(5, 22))
    expect(quitados).toBe(2)
    expect(useResaltados().value).toHaveLength(0)
  })

  it('no quita resaltados de otra ancla', () => {
    resaltarSegmento(segmento(0, 10, 'main:nth-of-type(1)>p:nth-of-type(2)'), 'amarillo')
    expect(quitarEnSegmento(segmento(0, 10))).toBe(0)
    expect(useResaltados().value).toHaveLength(1)
  })

  it('sobrevive a la recarga', () => {
    resaltarSegmento(segmento(1, 4), 'amarillo')
    reiniciarResaltadosEnMemoria()
    expect(useResaltados().value).toHaveLength(0)
    recargarResaltados()
    expect(useResaltados().value).toHaveLength(1)
  })

  it('descarta datos corruptos sin lanzar', () => {
    localStorage.setItem(CLAVE_RESALTADOS, 'no es json')
    expect(() => recargarResaltados()).not.toThrow()
    expect(useResaltados().value).toEqual([])

    const normalizado = normalizarResaltados([
      { ruta: '/x', ancla: 'a', inicio: 0, fin: 3, color: 'verde' },
      { ruta: '/x', ancla: 'a', inicio: 5, fin: 5, color: 'verde' },
      { ruta: '/x', ancla: 'a', inicio: 0, fin: 3, color: 'morado' },
      null,
      'texto',
    ])
    expect(normalizado).toHaveLength(1)
    expect(normalizado[0].color).toBe('verde')
  })

  it('aplicarResaltados no falla si la API no existe', () => {
    const original = globalThis.CSS
    // @ts-expect-error: simulamos un navegador sin la API
    delete globalThis.CSS
    expect(aplicarResaltados('/guia/paso-1')).toBe(0)
    globalThis.CSS = original
  })

  it('guarda la ruta donde se seleccionó aunque el usuario navegue después', () => {
    // Bug real: el usuario selecciona en una guía y elige color tras cambiar de ruta.
    const capturadoEnGuia = segmento(0, 5, 'main:nth-of-type(1)>p:nth-of-type(1)', '/guia/paso-2')
    history.replaceState({}, '', '/cierre')
    const [creado] = resaltarSegmento(capturadoEnGuia, 'verde')
    expect(creado.ruta).toBe('/guia/paso-2')
    expect(resaltadosDeRuta('/guia/paso-2')).toHaveLength(1)
    expect(resaltadosDeRuta('/cierre')).toHaveLength(0)
  })

  it('quita usando la ruta del segmento y no la actual', () => {
    const capturado = segmento(0, 5, 'main:nth-of-type(1)>p:nth-of-type(1)', '/guia/paso-2')
    resaltarSegmento(capturado, 'verde')
    history.replaceState({}, '', '/cierre')
    expect(quitarEnSegmento(capturado)).toBe(1)
    expect(useResaltados().value).toHaveLength(0)
  })

  it('normaliza la ruta quitando el base del despliegue', () => {
    // En GitHub Pages el pathname incluye /shop-dva-c03-tracker/.
    const base = import.meta.env.BASE_URL
    if (base === '/') {
      history.replaceState({}, '', '/guia/paso-4')
      expect(rutaActual()).toBe('/guia/paso-4')
    } else {
      history.replaceState({}, '', `${base}guia/paso-4`)
      expect(rutaActual()).toBe('/guia/paso-4')
    }
  })

  it('resaltar sin navegador no rompe', () => {
    const spies = vi.spyOn(window, 'getSelection').mockReturnValue(null)
    expect(aplicarResaltados('/x')).toBe(0)
    spies.mockRestore()
  })
})
