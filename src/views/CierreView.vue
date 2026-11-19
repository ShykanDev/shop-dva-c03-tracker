<script setup lang="ts">
import { computed } from 'vue'
import CheckItem from '@/components/CheckItem.vue'
import Icon from '@/components/Icon.vue'
import ProgresoBar from '@/components/ProgresoBar.vue'
import {
  DATOS_EXAMEN,
  DOMINIOS_COBERTURA,
  FUERA_DE_ALCANCE,
  SECCIONES_CIERRE,
  TEMAS_OPCIONALES,
} from '@/data/cierre'
import { alternarAccion, estaHecha, reiniciarProgreso } from '@/composables/useProgreso'
import { TOTAL_ACCIONES, useTotales } from '@/composables/useTotales'

const { accionesCompletadas, porcentajeGlobal } = useTotales()

const secciones = computed(() =>
  SECCIONES_CIERRE.map((seccion) => ({
    ...seccion,
    hechas: seccion.acciones.filter((accion) => estaHecha(accion.id)).length,
  })),
)

function reiniciar() {
  const confirmado = window.confirm(
    '¿Borrar todo el progreso de Shop DVA-C03 guardado en este navegador? Esta acción no se puede deshacer.',
  )
  if (confirmado) reiniciarProgreso()
}
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
    <header class="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
      <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
        Cierre y verificación
      </p>
      <h1 class="mt-1.5 text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
        ¿Está listo el proyecto?
      </h1>
      <p class="mt-2 max-w-2xl text-[14.5px] leading-7 text-ink-2">
        Terminar los pasos no es lo mismo que estar listo. Aquí están los
        criterios de la especificación, las reglas de costo y la cobertura real
        del examen.
      </p>
      <RouterLink
        to="/proyecto"
        class="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent"
      >
        <Icon name="code" :size="14" />
        Ver rutas, tablas, Lambdas y stack en la documentación técnica
      </RouterLink>

      <div class="mt-5 grid gap-3 sm:grid-cols-4">
        <div class="rounded-xl border border-line bg-canvas/60 px-3.5 py-3">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Examen</p>
          <p class="mt-1 text-[16px] font-bold text-ink">{{ DATOS_EXAMEN.codigo }}</p>
          <p class="text-[11.5px] text-ink-3">{{ DATOS_EXAMEN.preguntas }} preguntas</p>
          <p class="text-[10.5px] text-ink-3">{{ DATOS_EXAMEN.tareas }} tareas · {{ DATOS_EXAMEN.habilidades }} habilidades</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/60 px-3.5 py-3">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Tiempo</p>
          <p class="mt-1 text-[16px] font-bold text-ink">{{ DATOS_EXAMEN.duracionMinutos }} min</p>
          <p class="text-[11.5px] text-ink-3">{{ DATOS_EXAMEN.preguntasPuntuadas }} + {{ DATOS_EXAMEN.preguntasNoPuntuadas }} sin puntaje</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/60 px-3.5 py-3">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Escala</p>
          <p class="mt-1 text-[16px] font-bold text-ink">{{ DATOS_EXAMEN.escala }}</p>
          <p class="text-[11.5px] text-ink-3">corte {{ DATOS_EXAMEN.corte }}</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/60 px-3.5 py-3">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Tu avance</p>
          <p class="mt-1 text-[16px] font-bold tabular-nums text-ink">{{ accionesCompletadas }} / {{ TOTAL_ACCIONES }}</p>
          <p class="text-[11.5px] text-ink-3">acciones</p>
        </div>
      </div>

      <div class="mt-4">
        <ProgresoBar
          :valor="porcentajeGlobal"
          etiqueta="Avance global"
          :tono="porcentajeGlobal === 100 ? 'success' : 'accent'"
        />
      </div>
    </header>

    <div class="mt-5 space-y-4">
      <section
        v-for="seccion in secciones"
        :id="seccion.id"
        :key="seccion.id"
        class="scroll-mt-28 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6"
      >
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-[16px] font-semibold text-ink">{{ seccion.titulo }}</h2>
          <span class="ml-auto rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-3 ring-1 ring-inset ring-line">
            {{ seccion.hechas }} / {{ seccion.acciones.length }}
          </span>
        </div>
        <p class="mt-1 text-[13px] leading-6 text-ink-3">{{ seccion.descripcion }}</p>
        <div class="mt-3 divide-y divide-line/70">
          <CheckItem
            v-for="accion in seccion.acciones"
            :key="accion.id"
            :accion="accion"
            :hecho="estaHecha(accion.id)"
            @toggle="alternarAccion"
          />
        </div>
      </section>
    </div>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Cobertura por dominio</h2>
      <p class="mt-1 text-[13px] leading-6 text-ink-3">{{ DATOS_EXAMEN.dominios }}</p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <article
          v-for="dominio in DOMINIOS_COBERTURA"
          :key="dominio.id"
          class="rounded-xl border border-line bg-canvas/50 p-4"
        >
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-[13.5px] font-semibold text-ink">{{ dominio.nombre }}</h3>
            <span class="rounded-full bg-surface px-1.5 py-0.5 text-[10.5px] font-bold text-ink-3 ring-1 ring-inset ring-line">
              {{ dominio.peso }}
            </span>
            <span
              class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="
                dominio.estado === 'casi-completo'
                  ? 'bg-success-soft text-success'
                  : 'bg-warning-soft text-warning'
              "
            >
              {{ dominio.estado === 'casi-completo' ? 'Casi completo' : 'Parcial' }}
            </span>
          </div>

          <div class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="servicio in dominio.cubre"
              :key="servicio"
              class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink-2 ring-1 ring-inset ring-line"
            >
              {{ servicio }}
            </span>
          </div>

          <p class="mt-2 text-[12px] leading-5 text-ink-2">
            <strong class="text-warning">Falta:</strong> {{ dominio.falta }}
          </p>

          <p class="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-ink-3">
            Repasar:
            <RouterLink
              v-for="numero in dominio.pasos"
              :key="numero"
              :to="`/guia/paso-${numero}`"
              class="rounded bg-accent-soft px-1.5 py-0.5 font-semibold text-accent"
            >
              Paso {{ numero }}
            </RouterLink>
          </p>
        </article>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="flex items-center gap-2 text-[12.5px] font-semibold text-danger">
            <Icon name="alert" :size="14" />
            Fuera de alcance: no estudiar
          </p>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="tema in FUERA_DE_ALCANCE"
              :key="tema"
              class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink-3 ring-1 ring-inset ring-line"
            >
              {{ tema }}
            </li>
          </ul>
        </div>
        <div class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
            <Icon name="book" :size="14" />
            Labs opcionales del Paso 14
          </p>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="tema in TEMAS_OPCIONALES"
              :key="tema"
              class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink-3 ring-1 ring-inset ring-line"
            >
              {{ tema }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div>
        <p class="text-[13.5px] font-semibold text-ink">Reiniciar progreso</p>
        <p class="mt-0.5 text-[12px] text-ink-3">
          Borra solo la clave shop-dva-c03:progress de este navegador.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-[12.5px] font-semibold text-danger transition-colors hover:bg-danger-soft"
        @click="reiniciar"
      >
        <Icon name="reset" :size="14" />
        Reiniciar
      </button>
    </section>
  </main>
</template>
