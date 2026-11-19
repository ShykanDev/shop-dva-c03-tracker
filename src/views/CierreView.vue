<script setup lang="ts">
import { computed, ref } from 'vue'
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
import {
  alternarAccion,
  estaHecha,
  exportarProgreso,
  importarProgreso,
  reiniciarProgreso,
} from '@/composables/useProgreso'
import { TOTAL_ACCIONES, useTotales } from '@/composables/useTotales'

const { accionesCompletadas, promptsCompletados, porcentajeGlobal } = useTotales()

const archivoRef = ref<HTMLInputElement | null>(null)
const mensajeRespaldo = ref<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

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

function exportar() {
  const blob = new Blob([exportarProgreso()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `shop-dva-c03-progreso-${new Date().toISOString().slice(0, 10)}.json`
  enlace.style.display = 'none'
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  mensajeRespaldo.value = {
    tipo: 'ok',
    texto: 'Progreso exportado. Guarda el JSON como respaldo.',
  }
}

function abrirImportacion() {
  archivoRef.value?.click()
}

function leerComoTexto(archivo: File): Promise<string> {
  if (typeof archivo.text === 'function') return archivo.text()
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () =>
      resolve(typeof lector.result === 'string' ? lector.result : '')
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.readAsText(archivo)
  })
}

async function importarArchivo(evento: Event) {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  try {
    if (archivo.size > 1_000_000) {
      throw new Error('El archivo supera 1 MB. Usa el JSON exportado por esta app.')
    }

    let crudo: unknown
    try {
      crudo = JSON.parse(await leerComoTexto(archivo))
    } catch {
      throw new Error('El archivo no es un JSON válido.')
    }

    const hayProgreso =
      accionesCompletadas.value > 0 || promptsCompletados.value > 0
    if (
      hayProgreso &&
      !window.confirm(
        'Esto reemplaza el progreso actual de este navegador. ¿Continuar?',
      )
    ) {
      return
    }

    const resumen = importarProgreso(crudo)
    mensajeRespaldo.value = {
      tipo: 'ok',
      texto: `Progreso importado: ${resumen.acciones} acciones y ${resumen.prompts} prompts.`,
    }
  } catch (error) {
    mensajeRespaldo.value = {
      tipo: 'error',
      texto:
        error instanceof Error
          ? error.message
          : 'No se pudo importar el archivo.',
    }
  } finally {
    input.value = ''
  }
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

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-xl">
          <h2 class="text-[16px] font-semibold text-ink">Respaldo de progreso</h2>
          <p class="mt-1 text-[13px] leading-6 text-ink-3">
            Descarga un JSON legible con tus {{ accionesCompletadas }} de
            {{ TOTAL_ACCIONES }} acciones y {{ promptsCompletados }} prompts.
            Impórtalo en otro navegador o en otra Mac para continuar donde ibas.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="exportar-progreso"
            class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-deep"
            @click="exportar"
          >
            <Icon name="download" :size="14" />
            Exportar progreso
          </button>
          <button
            type="button"
            data-testid="importar-progreso"
            class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-accent/40 hover:text-accent"
            @click="abrirImportacion"
          >
            <Icon name="upload" :size="14" />
            Importar progreso
          </button>
          <input
            ref="archivoRef"
            data-testid="input-importar"
            type="file"
            accept="application/json,.json"
            class="sr-only"
            @change="importarArchivo"
          />
        </div>
      </div>

      <p
        v-if="mensajeRespaldo"
        role="status"
        aria-live="polite"
        class="mt-3 rounded-lg px-3 py-2 text-[12px] font-medium"
        :class="
          mensajeRespaldo.tipo === 'ok'
            ? 'bg-success-soft text-success'
            : 'bg-danger-soft text-danger'
        "
      >
        {{ mensajeRespaldo.texto }}
      </p>

      <p class="mt-2 text-[11px] leading-5 text-ink-3">
        El archivo se genera en tu equipo y no se envía a ningún servidor.
        Formato: JSON con version, acciones y prompts.
      </p>
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
