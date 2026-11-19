<script setup lang="ts">
import { computed } from 'vue'
import PasoCard from '@/components/PasoCard.vue'
import ProgresoBar from '@/components/ProgresoBar.vue'
import Icon from '@/components/Icon.vue'
import EstadoChip from '@/components/EstadoChip.vue'
import { PASOS } from '@/data/pasos'
import { SECCIONES_CIERRE } from '@/data/cierre'
import { alternarAccion } from '@/composables/useProgreso'
import {
  TOTAL_ACCIONES,
  TOTAL_PROMPTS,
  useTotales,
} from '@/composables/useTotales'

const {
  accionesCompletadas,
  promptsCompletados,
  porcentajeGlobal,
  progresoPaso,
  siguientePaso,
} = useTotales()

const totalPasos = PASOS.length
const pasosCompletos = computed(
  () =>
    PASOS.filter((paso) => progresoPaso(paso).hechas === progresoPaso(paso).total)
      .length,
)

const continuar = computed(() =>
  siguientePaso.value ? `/guia/${siguientePaso.value.id}` : '/cierre',
)

const continuarTexto = computed(() =>
  siguientePaso.value
    ? `Continuar en Paso ${siguientePaso.value.numero} — ${siguientePaso.value.titulo}`
    : 'Ir al cierre y revisar la definición de terminado',
)

const totalCierre = computed(() =>
  SECCIONES_CIERRE.reduce((total, seccion) => total + seccion.acciones.length, 0),
)
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
    <section class="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
      <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
        Proyecto Shop · DVA-C03
      </p>
      <h1 class="mt-1.5 text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
        Checklist del proyecto
      </h1>
      <p class="mt-2 max-w-2xl text-[14.5px] leading-7 text-ink-2">
        Todo lo que hay que hacer, en orden: Paso 0 al Paso 15, los 8 labs
        aparte y el cierre. Marca una acción y queda guardada en este navegador.
        No hay fechas por semana ni límites por día.
      </p>

      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-line bg-canvas/60 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Progreso total
          </p>
          <p class="mt-1 text-[22px] font-bold leading-7 tabular-nums text-ink">
            {{ accionesCompletadas }}<span class="text-[14px] font-medium text-ink-3"> / {{ TOTAL_ACCIONES }}</span>
          </p>
          <p class="text-[11.5px] text-ink-3">acciones completadas</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/60 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Pasos completados
          </p>
          <p class="mt-1 text-[22px] font-bold leading-7 tabular-nums text-ink">
            {{ pasosCompletos }}<span class="text-[14px] font-medium text-ink-3"> / {{ totalPasos }}</span>
          </p>
          <p class="text-[11.5px] text-ink-3">8 labs dentro del Paso 14</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/60 px-4 py-3">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
            Prompts Amazon Q
          </p>
          <p class="mt-1 text-[22px] font-bold leading-7 tabular-nums text-ink">
            {{ promptsCompletados }}<span class="text-[14px] font-medium text-ink-3"> / {{ TOTAL_PROMPTS }}</span>
          </p>
          <p class="text-[11.5px] text-ink-3">fallback listo para copiar</p>
        </div>
      </div>

      <div class="mt-5">
        <ProgresoBar
          :valor="porcentajeGlobal"
          etiqueta="Avance global de acciones"
          :tono="porcentajeGlobal === 100 ? 'success' : 'accent'"
        />
      </div>

      <RouterLink
        :to="continuar"
        class="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-deep"
      >
        <Icon name="chevron-right" :size="16" />
        {{ continuarTexto }}
      </RouterLink>
    </section>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-[15px] font-semibold text-ink">Pasos en orden</h2>
      <p class="text-[11.5px] text-ink-3">
        Un chip <EstadoChip mostrar texto="Completado" class="align-middle" /> aparece cuando terminas un paso.
      </p>
    </div>

    <div class="mt-3 space-y-4">
      <PasoCard
        v-for="paso in PASOS"
        :key="paso.id"
        :paso="paso"
        @toggle="alternarAccion"
      />
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <RouterLink
        to="/cierre"
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-accent/40"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon name="flag" :size="18" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[14px] font-semibold text-ink">Cierre del proyecto</span>
          <span class="mt-0.5 block text-[12.5px] leading-5 text-ink-3">
            Terminado, costos y cobertura · {{ totalCierre }} criterios.
          </span>
        </span>
        <Icon name="chevron-right" :size="17" class="text-ink-3" />
      </RouterLink>

      <RouterLink
        to="/proyecto"
        class="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-accent/40"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon name="code" :size="18" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[14px] font-semibold text-ink">Documentación técnica</span>
          <span class="mt-0.5 block text-[12.5px] leading-5 text-ink-3">
            Rutas, tablas, Lambdas, stores y stack.
          </span>
        </span>
        <Icon name="chevron-right" :size="17" class="text-ink-3" />
      </RouterLink>
    </div>
  </main>
</template>
