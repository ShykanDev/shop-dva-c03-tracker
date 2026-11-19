import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CierreView from '@/views/CierreView.vue'
import { estaHecha, estaPromptHecho, reiniciarProgresoEnMemoria } from '@/composables/useProgreso'

function montarCierre() {
  return shallowMount(CierreView, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
      },
    },
  })
}

describe('respaldo de progreso en Cierre', () => {
  beforeEach(() => {
    localStorage.clear()
    reiniciarProgresoEnMemoria()
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:progreso'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('muestra los botones de exportar e importar', () => {
    const wrapper = montarCierre()
    expect(wrapper.find('[data-testid="exportar-progreso"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="importar-progreso"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="input-importar"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Respaldo de progreso')
  })

  it('exporta un Blob JSON con el progreso actual', async () => {
    const wrapper = montarCierre()
    await wrapper.get('[data-testid="exportar-progreso"]').trigger('click')

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    const texto = await new Promise<string>((resolve, reject) => {
      const lector = new FileReader()
      lector.onload = () =>
        resolve(typeof lector.result === 'string' ? lector.result : '')
      lector.onerror = () => reject(lector.error)
      lector.readAsText(blob)
    })
    expect(texto).toContain('"version": 1')
    expect(texto).toContain('"acciones"')
    expect(wrapper.text()).toContain('Progreso exportado')
  })

  it('importa un JSON válido y actualiza el estado', async () => {
    const wrapper = montarCierre()
    const archivo = new File(
      [
        JSON.stringify({
          version: 1,
          acciones: { 'paso-2.1': { hecho: true, fecha: '2026-11-19T00:00:00.000Z' } },
          prompts: { 'paso-2.prompt': { hecho: true } },
        }),
      ],
      'progreso.json',
      { type: 'application/json' },
    )

    const input = wrapper.get('[data-testid="input-importar"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [archivo],
    })
    await input.trigger('change')
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Progreso importado: 1 acciones y 1 prompts.')
    })
    expect(estaHecha('paso-2.1')).toBe(true)
    expect(estaPromptHecho('paso-2.prompt')).toBe(true)
  })

  it('muestra un error legible si el archivo no es JSON', async () => {
    const wrapper = montarCierre()
    const archivo = new File(['esto no es json'], 'malo.json', {
      type: 'application/json',
    })

    const input = wrapper.get('[data-testid="input-importar"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [archivo],
    })
    await input.trigger('change')
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('no es un JSON válido')
    })
  })
})
