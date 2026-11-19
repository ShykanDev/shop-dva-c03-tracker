import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CheckItem from '@/components/CheckItem.vue'
import EstadoChip from '@/components/EstadoChip.vue'
import PromptAmazonQ from '@/components/PromptAmazonQ.vue'
import { reiniciarProgresoEnMemoria } from '@/composables/useProgreso'

const accion = {
  id: 'paso-2.1',
  texto: 'Crear la tabla Shop-Products con su GSI',
  detalle: 'PK PRODUCT#<productId>',
  skills: ['1.3.1'],
}

describe('componentes', () => {
  beforeEach(() => {
    localStorage.clear()
    reiniciarProgresoEnMemoria()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('CheckItem emite toggle y expone aria-checked', async () => {
    const wrapper = mount(CheckItem, { props: { accion, hecho: false } })
    const checkbox = wrapper.get('[role="checkbox"]')
    expect(checkbox.attributes('aria-checked')).toBe('false')
    await checkbox.trigger('click')
    expect(wrapper.emitted('toggle')?.[0]).toEqual(['paso-2.1'])
    expect(wrapper.text()).toContain('Shop-Products')
    expect(wrapper.text()).toContain('1.3.1')
  })

  it('CheckItem muestra el chip Completado solo cuando está hecho', () => {
    const pendiente = mount(CheckItem, { props: { accion, hecho: false } })
    expect(pendiente.find('[data-testid="estado-chip"]').exists()).toBe(false)

    const hecho = mount(CheckItem, { props: { accion, hecho: true } })
    expect(hecho.find('[data-testid="estado-chip"]').text()).toContain('Completado')
    expect(hecho.get('[role="checkbox"]').attributes('aria-checked')).toBe('true')
    expect(hecho.html()).not.toContain('line-through')
  })

  it('EstadoChip se oculta cuando no aplica', () => {
    const oculto = mount(EstadoChip, { props: { mostrar: false } })
    expect(oculto.find('[data-testid="estado-chip"]').exists()).toBe(false)
    const visible = mount(EstadoChip, { props: { mostrar: true } })
    expect(visible.text()).toContain('Completado')
  })

  it('PromptAmazonQ copia el texto y muestra feedback', async () => {
    const wrapper = mount(PromptAmazonQ, {
      props: { promptId: 'paso-2.prompt', texto: 'Prompt de prueba', titulo: 'Paso 2' },
    })

    const botones = wrapper.findAll('button')
    await botones[0].trigger('click')
    await flushPromises()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Prompt de prueba')
    expect(wrapper.text()).toContain('Copiado')
  })

  it('PromptAmazonQ se puede marcar como completado', async () => {
    const wrapper = mount(PromptAmazonQ, {
      props: { promptId: 'paso-2.prompt', texto: 'Prompt de prueba' },
    })

    expect(wrapper.find('[data-testid="estado-chip"]').exists()).toBe(false)
    await wrapper.findAll('button')[1].trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="estado-chip"]').text()).toContain('Completado')
    expect(wrapper.get('[role="checkbox"]').attributes('aria-checked')).toBe('true')
  })
})
