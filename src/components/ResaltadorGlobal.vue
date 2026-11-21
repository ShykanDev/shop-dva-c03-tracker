<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from './Icon.vue'
import {
  COLORES_RESALTADO,
  aplicarResaltados,
  hayResaltadoEnSegmento,
  quitarEnSegmento,
  resaltadosDeRuta,
  resaltarSegmento,
  seleccionActual,
  soportaResaltado,
  useResaltados,
  type ColorResaltado,
  type SegmentoSeleccion,
} from '@/composables/useResaltados'

const route = useRoute()
const resaltados = useResaltados()

const soportado = soportaResaltado()

const segmento = ref<SegmentoSeleccion | null>(null)
const posicion = ref({ x: 0, y: 0 })
const visible = ref(false)
const aviso = ref<string | null>(null)

const motivoNoSoportado =
  'Tu navegador no soporta CSS Custom Highlight. Usa Chrome, Edge o Safari recientes.'

const conflicto = computed(() =>
  segmento.value ? hayResaltadoEnSegmento(segmento.value) : false,
)

const colores: { id: ColorResaltado; clase: string; nombre: string }[] = [
  { id: 'amarillo', clase: 'bg-hl-amarillo', nombre: 'Amarillo' },
  { id: 'verde', clase: 'bg-hl-verde', nombre: 'Verde' },
  { id: 'azul', clase: 'bg-hl-azul', nombre: 'Azul' },
  { id: 'rosa', clase: 'bg-hl-rosa', nombre: 'Rosa' },
]

// Margen para que la barra no quede pegada al borde de la pantalla.
const MARGEN = 12
const ANCHO_APROX = 300
const ALTO_APROX = 92

function dentroDeHerramienta(nodo: EventTarget | null): boolean {
  if (!(nodo instanceof Node)) return false
  const elemento =
    nodo.nodeType === Node.TEXT_NODE ? nodo.parentElement : nodo
  return elemento instanceof Element
    ? Boolean(elemento.closest('[data-resaltador]'))
    : false
}

function alSoltar(evento: PointerEvent) {
  // Ignora el gesto dentro de la propia herramienta.
  if (dentroDeHerramienta(evento.target)) return

  // Espera a que el navegador fije la selección tras el pointerup.
  window.setTimeout(() => {
    const capturado = seleccionActual()

    if (!capturado) {
      // Sin selección el panel se cierra, pero no si el foco está en el panel.
      if (!visible.value) return
      visible.value = false
      segmento.value = null
      return
    }

    segmento.value = capturado
    visible.value = true

    const ancho = window.innerWidth
    const alto = window.innerHeight
    posicion.value = {
      x: Math.max(MARGEN, Math.min(evento.clientX + 8, ancho - ANCHO_APROX - MARGEN)),
      y:
        evento.clientY + ALTO_APROX > alto - MARGEN
          ? Math.max(MARGEN, evento.clientY - ALTO_APROX - 8)
          : evento.clientY + 12,
    }
  }, 10)
}

function alPulsarTecla(evento: KeyboardEvent) {
  if (evento.key === 'Escape') {
    visible.value = false
    segmento.value = null
    return
  }
  const conModificador = (evento.metaKey || evento.ctrlKey) && evento.shiftKey
  if (!conModificador) return

  // Cmd/Ctrl + Shift + 1..4 resalta la selección sin ratón.
  const indice = Number(evento.key) - 1
  const color = COLORES_RESALTADO[indice]
  if (!color) return

  const capturado = seleccionActual()
  if (!capturado) return
  evento.preventDefault()
  resaltarSegmento(capturado, color)
  visible.value = false
  segmento.value = null
}

function elegir(color: ColorResaltado) {
  if (!segmento.value) return
  if (!soportado) {
    aviso.value = motivoNoSoportado
    return
  }
  if (conflicto.value) {
    quitarEnSegmento(segmento.value)
    segmento.value = null
    visible.value = false
    aviso.value = 'Resaltado quitado'
    return
  }

  resaltarSegmento(segmento.value, color)
  aviso.value = null
  segmento.value = null
  visible.value = false
  if (window.getSelection()) window.getSelection()?.removeAllRanges()
}

function quitar() {
  if (!segmento.value) return
  const quitados = quitarEnSegmento(segmento.value)
  aviso.value = quitados > 0 ? 'Resaltado quitado' : null
  segmento.value = null
  visible.value = false
}

function cerrar() {
  visible.value = false
  segmento.value = null
}

function pintarRuta() {
  aplicarResaltados(route.path.replace(/\/$/, '') || '/')
}

watch(() => route.path, () => pintarRuta())

// Si el contenido cambia (p. ej. se despliega un paso), los rangos deben recalcularse.
const intervalo = window.setInterval(pintarRuta, 1200)

onMounted(() => {
  pintarRuta()
  document.addEventListener('pointerup', alSoltar)
  document.addEventListener('keydown', alPulsarTecla)
  window.addEventListener('scroll', cerrar, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('pointerup', alSoltar)
  document.removeEventListener('keydown', alPulsarTecla)
  window.removeEventListener('scroll', cerrar)
  window.clearInterval(intervalo)
})

const total = computed(() => resaltadosDeRuta(route.path.replace(/\/$/, '') || '/').length)
</script>

<template>
  <div data-resaltador class="pointer-events-none fixed inset-0 z-[80]">
    <div
      v-if="visible && segmento"
      class="pointer-events-auto absolute w-[292px] rounded-xl border border-line bg-surface p-2.5 shadow-[0_8px_30px_-8px_rgba(16,24,40,0.28)]"
      :style="{ left: `${posicion.x}px`, top: `${posicion.y}px` }"
      role="toolbar"
      aria-label="Herramienta de resaltado"
    >
      <div class="flex items-center gap-1.5">
        <span class="mr-auto pl-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
          {{ conflicto ? 'Quitar resaltado' : 'Resaltar texto' }}
        </span>
        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-canvas hover:text-ink"
          aria-label="Cerrar"
          @click="cerrar"
        >
          <Icon name="reset" :size="12" />
        </button>
      </div>

      <div class="mt-1.5 flex items-center gap-1.5">
        <button
          v-for="color in colores"
          :key="color.id"
          type="button"
          :data-color="color.id"
          :aria-label="`Resaltar en ${color.nombre}`"
          :title="`Resaltar en ${color.nombre}`"
          class="group flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ring-line transition-transform hover:scale-105"
          :class="color.clase"
          @click="aviso = null; elegir(color.id)"
        >
          <Icon
            :name="conflicto ? 'check' : 'highlighter'"
            :size="13"
            class="text-ink/70"
          />
        </button>

        <span class="mx-1 h-5 w-px bg-line" aria-hidden="true" />

        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
          @click="quitar"
        >
          <Icon name="trash" :size="12" />
          Quitar
        </button>
      </div>

      <p class="mt-1 truncate pl-1 text-[10.5px] text-ink-3">
        {{ segmento.texto.slice(0, 60) }}{{ segmento.texto.length > 60 ? '…' : '' }}
      </p>
    </div>

    <div
      v-if="aviso || (segmento && !soportado)"
      class="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-surface px-3 py-2 text-[12px] font-medium text-ink-2 shadow-soft ring-1 ring-inset ring-line"
      role="status"
      aria-live="polite"
    >
      {{ aviso ?? motivoNoSoportado }}
    </div>
  </div>
</template>
