<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { DATOS_EXAMEN, DOMINIOS_COBERTURA } from '@/data/cierre'
import {
  BUCKETS,
  LAMBDAS,
  PROYECTO,
  RUTAS,
  STORES,
  TABLAS,
} from '@/data/proyecto'

const coloresRuta: Record<string, string> = {
  pública: 'bg-success-soft text-success',
  protegida: 'bg-warning-soft text-warning',
  admin: 'bg-accent-soft text-accent-deep',
}

const especificacionUrl = `${import.meta.env.BASE_URL}docs/especificacion-tecnica-dva-c03.txt`

const estadisticas = [
  { etiqueta: 'Preguntas', valor: `${DATOS_EXAMEN.preguntas}`, pista: `${DATOS_EXAMEN.preguntasPuntuadas} + ${DATOS_EXAMEN.preguntasNoPuntuadas} sin puntaje` },
  { etiqueta: 'Duración', valor: `${DATOS_EXAMEN.duracionMinutos} min`, pista: 'Sin pausas' },
  { etiqueta: 'Escala', valor: DATOS_EXAMEN.escala, pista: `Corte ${DATOS_EXAMEN.corte}` },
  { etiqueta: 'Dominios', valor: '4', pista: '30 / 26 / 22 / 22' },
  { etiqueta: 'Tareas', valor: `${DATOS_EXAMEN.tareas}`, pista: '3 por dominio' },
  { etiqueta: 'Habilidades', valor: `${DATOS_EXAMEN.habilidades}`, pista: 'Objetivos oficiales' },
]
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
    <header class="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
      <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
        Documentación técnica
      </p>
      <h1 class="mt-1.5 text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
        El proyecto, en una sola página
      </h1>
      <p class="mt-2 max-w-2xl text-[14.5px] leading-7 text-ink-2">
        Todo lo que define la especificación: usuarios, flujo, stack, rutas,
        stores, tablas, buckets, Lambdas, cuenta AWS y examen. Si una ruta, una
        tabla o una Lambda no está aquí, falta.
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <RouterLink
          to="/checklist"
          class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-deep"
        >
          <Icon name="list" :size="14" />
          Ir al checklist
        </RouterLink>
        <RouterLink
          to="/guia/paso-0"
          class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Icon name="book" :size="14" />
          Empezar la guía
        </RouterLink>
        <RouterLink
          to="/contratos"
          class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Icon name="list" :size="14" />
          Ver contratos técnicos
        </RouterLink>
        <a
          :href="especificacionUrl"
          download
          class="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Icon name="copy" :size="14" />
          Descargar especificación .txt
        </a>
      </div>
    </header>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Identidad del proyecto</h2>
      <p class="mt-2 text-[14px] leading-7 text-ink-2">
        <strong class="text-ink">{{ PROYECTO.nombre }}.</strong> {{ PROYECTO.idea }}
      </p>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <article v-for="usuario in PROYECTO.usuarios" :key="usuario.rol" class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[12.5px] font-semibold text-accent">{{ usuario.rol }}</p>
          <p class="mt-1 text-[13px] leading-6 text-ink-2">{{ usuario.hace }}</p>
        </article>
      </div>

      <p class="mt-5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Flujo real de uso</p>
      <ol class="mt-2 space-y-2">
        <li v-for="(pasoFlujo, i) in PROYECTO.flujo" :key="i" class="flex gap-3 text-[13.5px] leading-6 text-ink-2">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10.5px] font-bold text-accent">
            {{ i + 1 }}
          </span>
          <span>{{ pasoFlujo }}</span>
        </li>
      </ol>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Stack técnico</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="grupo in PROYECTO.stack" :key="grupo.grupo" class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[12.5px] font-semibold text-ink">{{ grupo.grupo }}</p>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="item in grupo.items"
              :key="item"
              class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink-2 ring-1 ring-inset ring-line"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[16px] font-semibold text-ink">Rutas del frontend</h2>
        <span class="ml-auto text-[11.5px] font-medium text-ink-3">
          {{ RUTAS.length }} rutas · 6 públicas · 3 protegidas · 4 admin
        </span>
      </div>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-[12.5px]">
          <thead>
            <tr class="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-3">
              <th class="py-2 pr-3 font-semibold">Ruta</th>
              <th class="py-2 pr-3 font-semibold">Tipo</th>
              <th class="py-2 font-semibold">Qué hace</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ruta in RUTAS" :key="ruta.ruta" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3 font-mono text-[12px] text-ink">{{ ruta.ruta }}</td>
              <td class="py-2.5 pr-3">
                <span class="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" :class="coloresRuta[ruta.tipo]">
                  {{ ruta.tipo }}
                </span>
              </td>
              <td class="py-2.5 text-ink-2">{{ ruta.descripcion }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-[12px] leading-5 text-ink-3">
        Protegidas: requieren login con Cognito. Admin: requieren login y el grupo admin. El guard del frontend es comodidad; la Lambda vuelve a validar el token y el grupo.
      </p>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Stores de Pinia</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="store in STORES" :key="store.nombre" class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="font-mono text-[12.5px] font-semibold text-accent">{{ store.nombre }}</p>
          <p class="mt-1 text-[12px] leading-5 text-ink-2">
            <strong class="text-ink">Estado:</strong> {{ store.estado }}
          </p>
          <p class="mt-1 text-[12px] leading-5 text-ink-2">
            <strong class="text-ink">Acciones:</strong> {{ store.acciones }}
          </p>
        </article>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Modelo de datos en DynamoDB</h2>
      <div class="mt-3 space-y-3">
        <article v-for="tabla in TABLAS" :key="tabla.nombre" class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[13px] font-semibold text-ink">{{ tabla.nombre }}</p>
            <span v-if="tabla.indices.length" class="rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent">
              {{ tabla.indices.length }} GSI
            </span>
            <span v-else class="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-medium text-ink-3 ring-1 ring-inset ring-line">
              sin GSI
            </span>
          </div>

          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <p class="rounded bg-surface px-2.5 py-1.5 font-mono text-[11.5px] text-ink-2 ring-1 ring-inset ring-line">
              PK: <strong class="text-ink">{{ tabla.pk }}</strong>
            </p>
            <p class="rounded bg-surface px-2.5 py-1.5 font-mono text-[11.5px] text-ink-2 ring-1 ring-inset ring-line">
              SK: <strong class="text-ink">{{ tabla.sk }}</strong>
            </p>
          </div>

          <div v-if="tabla.indices.length" class="mt-2 space-y-1.5">
            <p v-for="indice in tabla.indices" :key="indice.nombre" class="rounded bg-surface px-2.5 py-1.5 text-[11.5px] text-ink-2 ring-1 ring-inset ring-line">
              <strong class="font-mono text-ink">{{ indice.nombre }}</strong>
              · PK {{ indice.pk }} · SK {{ indice.sk }} · {{ indice.uso }}
            </p>
          </div>

          <p class="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Atributos</p>
          <div class="mt-1 flex flex-wrap gap-1">
            <span v-for="atributo in tabla.atributos" :key="atributo" class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink-2 ring-1 ring-inset ring-line">
              {{ atributo }}
            </span>
          </div>
          <p class="mt-2 text-[12px] leading-5 text-ink-3">{{ tabla.nota }}</p>
        </article>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Buckets de S3</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <article v-for="bucket in BUCKETS" :key="bucket.nombre" class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="font-mono text-[12.5px] font-semibold text-ink">{{ bucket.nombre }}</p>
          <p class="mt-1 text-[12px] leading-5 text-ink-2"><strong class="text-ink">Uso:</strong> {{ bucket.uso }}</p>
          <p class="mt-1 text-[12px] leading-5 text-ink-2"><strong class="text-ink">Acceso:</strong> {{ bucket.acceso }}</p>
        </article>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[16px] font-semibold text-ink">Lambdas, una por operación</h2>
        <span class="ml-auto text-[11.5px] font-medium text-ink-3">
          {{ LAMBDAS.reduce((total, grupo) => total + grupo.funciones.length, 0) }} funciones
        </span>
      </div>

      <div class="mt-3 space-y-3">
        <div v-for="grupo in LAMBDAS" :key="grupo.grupo" class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{{ grupo.grupo }}</p>
          <ul class="mt-2 divide-y divide-line/60">
            <li v-for="funcion in grupo.funciones" :key="funcion.nombre" class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 first:pt-1 last:pb-1">
              <span class="font-mono text-[12.5px] font-semibold text-accent">{{ funcion.nombre }}</span>
              <span class="text-[12.5px] leading-5 text-ink-2">{{ funcion.proposito }}</span>
            </li>
          </ul>
        </div>
      </div>

      <p class="mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Contrato de cada Lambda</p>
      <ul class="mt-2 grid gap-1.5 sm:grid-cols-2">
        <li v-for="regla in PROYECTO.contratoLambda" :key="regla" class="flex items-start gap-2 text-[12.5px] leading-5 text-ink-2">
          <Icon name="check" :size="13" class="mt-0.5 text-success" />
          {{ regla }}
        </li>
      </ul>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Cuenta AWS</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Región</p>
          <p class="mt-1 text-[13.5px] font-semibold text-ink">{{ PROYECTO.cuenta.region }}</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Créditos</p>
          <p class="mt-1 text-[13.5px] font-semibold text-ink">{{ PROYECTO.cuenta.creditos }}</p>
        </div>
        <div class="rounded-xl border border-line bg-canvas/50 p-4">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">Alarmas de billing</p>
          <p class="mt-1 text-[13.5px] font-semibold text-ink">{{ PROYECTO.cuenta.alarmas.join(' y ') }}</p>
        </div>
      </div>
      <ul class="mt-3 space-y-1.5">
        <li v-for="regla in PROYECTO.cuenta.reglas" :key="regla" class="flex items-start gap-2 text-[12.5px] leading-5 text-ink-2">
          <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
          {{ regla }}
        </li>
      </ul>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">El examen</h2>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div v-for="dato in estadisticas" :key="dato.etiqueta" class="rounded-xl border border-line bg-canvas/50 px-3.5 py-3">
          <p class="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">{{ dato.etiqueta }}</p>
          <p class="mt-1 text-[17px] font-bold leading-6 text-ink">{{ dato.valor }}</p>
          <p class="text-[10.5px] text-ink-3">{{ dato.pista }}</p>
        </div>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        <div
          v-for="dominio in DOMINIOS_COBERTURA"
          :key="dominio.id"
          class="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-canvas/50 px-3.5 py-2.5"
        >
          <span class="text-[12.5px] font-semibold text-ink">{{ dominio.nombre }}</span>
          <span class="rounded-full bg-surface px-1.5 py-0.5 text-[10.5px] font-bold text-ink-3 ring-1 ring-inset ring-line">
            {{ dominio.peso }}
          </span>
          <span
            class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
            :class="dominio.estado === 'casi-completo' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
          >
            {{ dominio.estado === 'casi-completo' ? 'Casi completo' : 'Parcial' }}
          </span>
        </div>
      </div>

      <p class="mt-3 text-[12.5px] leading-6 text-ink-2">
        El proyecto cubre aproximadamente el {{ DATOS_EXAMEN.cobertura }} del examen con código real.
        Las brechas se cierran con los labs del Paso 14. La verificación completa está en
        <RouterLink to="/cierre" class="font-semibold text-accent">Cierre</RouterLink>.
      </p>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Cómo preguntarle a Amazon Q</h2>
      <ol class="mt-2 space-y-2">
        <li v-for="(regla, i) in PROYECTO.reglasAmazonQ" :key="i" class="flex gap-3 text-[13px] leading-6 text-ink-2">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10.5px] font-bold text-accent">
            {{ i + 1 }}
          </span>
          <span>{{ regla }}</span>
        </li>
      </ol>
      <p class="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12px] leading-5 text-ink-3">
        Cada paso y cada lab tiene su prompt listo para copiar. La especificación original está en
        <a :href="especificacionUrl" target="_blank" rel="noopener" class="font-semibold text-accent">
          public/docs/especificacion-tecnica-dva-c03.txt
        </a>.
      </p>
    </section>
  </main>
</template>
