import { ref } from 'vue'

export const CLAVE_RESALTADOS = 'shop-dva-c03:resaltados'

export const COLORES_RESALTADO = ['amarillo', 'verde', 'azul', 'rosa'] as const
export type ColorResaltado = (typeof COLORES_RESALTADO)[number]

export interface Resaltado {
  id: string
  /** Ruta donde se resaltó, p. ej. /guia/paso-2. */
  ruta: string
  /** Ruta CSS desde <main> hasta el elemento que contiene la selección. */
  ancla: string
  /** Índice del primer carácter resaltado dentro del ancla. */
  inicio: number
  /** Índice del último carácter resaltado dentro del ancla. */
  fin: number
  color: ColorResaltado
  texto: string
  creado: string
}

export interface SegmentoSeleccion {
  ancla: string
  inicio: number
  fin: number
  texto: string
  /** Ruta donde se hizo la selección, capturada para no depender de dónde esté el usuario después. */
  ruta: string
}

/** La ruta en el formato que usa Vue Router: sin el base del despliegue. */
function rutaActual(): string {
  if (typeof window === 'undefined') return '/'
  const base = import.meta.env.BASE_URL || '/'
  let ruta = window.location.pathname
  // En GitHub Pages el pathname trae /shop-dva-c03-tracker/ delante.
  if (base !== '/' && ruta.startsWith(base)) {
    ruta = `/${ruta.slice(base.length)}`
  }
  return ruta.replace(/\/$/, '') || '/'
}

export { rutaActual }

function esColorValido(valor: unknown): valor is ColorResaltado {
  return (
    typeof valor === 'string' &&
    (COLORES_RESALTADO as readonly string[]).includes(valor)
  )
}

export function normalizarResaltados(crudo: unknown): Resaltado[] {
  if (!Array.isArray(crudo)) return []

  return crudo.flatMap((entrada): Resaltado[] => {
    if (typeof entrada !== 'object' || entrada === null) return []
    const candidato = entrada as Partial<Resaltado>
    if (
      typeof candidato.ruta !== 'string' ||
      typeof candidato.ancla !== 'string' ||
      typeof candidato.inicio !== 'number' ||
      typeof candidato.fin !== 'number' ||
      !esColorValido(candidato.color) ||
      candidato.fin <= candidato.inicio
    ) {
      return []
    }

    return [
      {
        id:
          typeof candidato.id === 'string'
            ? candidato.id
            : `hl-${candidato.inicio}-${candidato.fin}-${candidato.ruta}`,
        ruta: candidato.ruta,
        ancla: candidato.ancla,
        inicio: candidato.inicio,
        fin: candidato.fin,
        color: candidato.color,
        texto: typeof candidato.texto === 'string' ? candidato.texto : '',
        creado:
          typeof candidato.creado === 'string'
            ? candidato.creado
            : new Date().toISOString(),
      },
    ]
  })
}

function leerDeStorage(): Resaltado[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const crudo = localStorage.getItem(CLAVE_RESALTADOS)
    if (!crudo) return []
    return normalizarResaltados(JSON.parse(crudo))
  } catch {
    return []
  }
}

const resaltados = ref<Resaltado[]>(leerDeStorage())

function persistir(): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(CLAVE_RESALTADOS, JSON.stringify(resaltados.value))
  } catch {
    // Sin almacenamiento: los resaltados viven solo en memoria.
  }
}

/** La API de CSS Custom Highlight no existe en todos los navegadores. */
export function soportaResaltado(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof globalThis.Highlight === 'function'
  )
}

function raiz(): Element | null {
  return document.querySelector('main')
}

function nodosDeTexto(raizElemento: Element): Text[] {
  const walker = document.createTreeWalker(raizElemento, NodeFilter.SHOW_TEXT)
  const nodos: Text[] = []
  let nodo = walker.nextNode()
  while (nodo) {
    nodos.push(nodo as Text)
    nodo = walker.nextNode()
  }
  return nodos
}

function offsetDePunto(
  nodos: Text[],
  contenedor: Node,
  offset: number,
): number | null {
  if (contenedor.nodeType !== Node.TEXT_NODE) return null
  let total = 0
  for (const nodo of nodos) {
    if (nodo === contenedor) return total + offset
    total += nodo.data.length
  }
  return null
}

function rutaDeElemento(raizElemento: Element, elemento: Element): string {
  const partes: string[] = []
  let actual: Element | null = elemento

  while (actual && actual !== raizElemento) {
    const padre: Element | null = actual.parentElement
    if (!padre) return ''
    const hermanos: Element[] = Array.from(padre.children).filter(
      (hijo: Element) => hijo.tagName === actual!.tagName,
    )
    partes.unshift(
      `${actual.tagName.toLowerCase()}:nth-of-type(${hermanos.indexOf(actual) + 1})`,
    )
    actual = padre
  }

  return actual === raizElemento ? partes.join('>') : ''
}

function elementoDeRuta(raizElemento: Element, ruta: string): Element | null {
  if (!ruta) return raizElemento
  const encontrado = raizElemento.querySelector(ruta)
  return encontrado instanceof Element ? encontrado : null
}

function anclaDeRango(rango: Range): Element | null {
  const comun = rango.commonAncestorContainer
  const elemento =
    comun.nodeType === Node.TEXT_NODE ? comun.parentElement : (comun as Element)
  if (!elemento) return null
  // Un texto vacío o un nodo suelto no sirven como ancla estable.
  return elemento.closest('p, li, pre, td, th, h1, h2, h3, h4, blockquote, main') ?? elemento
}

/** Convierte la selección actual en segmentos con ancla, inicio y fin. */
export function seleccionActual(): SegmentoSeleccion | null {
  if (typeof window === 'undefined') return null
  const seleccion = window.getSelection()
  if (!seleccion || seleccion.rangeCount === 0 || seleccion.isCollapsed) return null

  const rango = seleccion.getRangeAt(0)
  const texto = rango.toString().trim()
  if (!texto) return null

  const raizElemento = raiz()
  if (!raizElemento) return null
  // Solo resaltamos dentro del contenido, nunca dentro de la propia herramienta.
  if (!raizElemento.contains(rango.commonAncestorContainer)) return null

  const ancla = anclaDeRango(rango)
  if (!ancla || !raizElemento.contains(ancla)) return null

  const nodos = nodosDeTexto(ancla)
  const inicio = offsetDePunto(nodos, rango.startContainer, rango.startOffset)
  const fin = offsetDePunto(nodos, rango.endContainer, rango.endOffset)
  if (inicio === null || fin === null || fin <= inicio) return null

  return {
    ancla: rutaDeElemento(raizElemento, ancla),
    inicio,
    fin,
    texto,
    ruta: rutaActual(),
  }
}

function rangoDeOffsets(ancla: Element, inicio: number, fin: number): Range | null {
  const nodos = nodosDeTexto(ancla)
  let total = 0
  let nodoInicio: Text | null = null
  let offsetInicio = 0
  let nodoFin: Text | null = null
  let offsetFin = 0

  for (const nodo of nodos) {
    const largo = nodo.data.length
    if (!nodoInicio && inicio < total + largo) {
      nodoInicio = nodo
      offsetInicio = inicio - total
    }
    if (!nodoFin && fin <= total + largo) {
      nodoFin = nodo
      offsetFin = fin - total
      break
    }
    total += largo
  }

  if (!nodoInicio || !nodoFin) return null

  const rango = document.createRange()
  rango.setStart(nodoInicio, Math.max(0, offsetInicio))
  rango.setEnd(nodoFin, Math.max(0, offsetFin))
  return rango
}

function nombreHighlight(color: ColorResaltado): string {
  return `hl-${color}`
}

/** Reconstruye los rangos de una ruta y los pinta con la API de Highlight. */
export function aplicarResaltados(ruta: string): number {
  if (!soportaResaltado()) return 0

  const raizElemento = raiz()
  const porColor = new Map<ColorResaltado, Range[]>(COLORES_RESALTADO.map((color) => [color, []]))
  let aplicados = 0

  if (raizElemento) {
    for (const resaltado of resaltados.value) {
      if (resaltado.ruta !== ruta) continue
      const ancla = elementoDeRuta(raizElemento, resaltado.ancla)
      if (!ancla) continue
      const rango = rangoDeOffsets(ancla, resaltado.inicio, resaltado.fin)
      if (!rango) continue
      porColor.get(resaltado.color)?.push(rango)
      aplicados += 1
    }
  }

  for (const color of COLORES_RESALTADO) {
    const rangos = porColor.get(color) ?? []
    if (rangos.length === 0) {
      CSS.highlights.delete(nombreHighlight(color))
    } else {
      CSS.highlights.set(nombreHighlight(color), new Highlight(...rangos))
    }
  }

  return aplicados
}

/** Resalta un segmento ya capturado. Devuelve el resaltado creado. */
export function resaltarSegmento(
  segmento: SegmentoSeleccion,
  color: ColorResaltado,
): Resaltado[] {
  const nuevos: Resaltado[] = [
    {
      id: `hl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ruta: segmento.ruta,
      ancla: segmento.ancla,
      inicio: segmento.inicio,
      fin: segmento.fin,
      color,
      texto: segmento.texto,
      creado: new Date().toISOString(),
    },
  ]

  resaltados.value = [...resaltados.value, ...nuevos]
  persistir()
  aplicarResaltados(rutaActual())
  return nuevos
}

/** Resalta la selección actual con el color pedido. */
export function resaltarSeleccion(color: ColorResaltado): Resaltado[] {
  const segmento = seleccionActual()
  return segmento ? resaltarSegmento(segmento, color) : []
}

/** Quita los resaltados que se cruzan con un segmento capturado. */
export function quitarEnSegmento(segmento: SegmentoSeleccion): number {
  const antes = resaltados.value.length
  resaltados.value = resaltados.value.filter(
    (resaltado) =>
      !(
        resaltado.ruta === segmento.ruta &&
        resaltado.ancla === segmento.ancla &&
        resaltado.inicio < segmento.fin &&
        resaltado.fin > segmento.inicio
      ),
  )
  persistir()
  aplicarResaltados(rutaActual())
  return antes - resaltados.value.length
}

/** Quita el resaltado que se cruza con la selección actual, si existe. */
export function quitarEnSeleccion(): number {
  const segmento = seleccionActual()
  return segmento ? quitarEnSegmento(segmento) : 0
}

/** ¿La página del segmento tiene algún resaltado que se cruce con él? */
export function hayResaltadoEnSegmento(segmento: SegmentoSeleccion): boolean {
  return resaltados.value.some(
    (resaltado) =>
      resaltado.ruta === segmento.ruta &&
      resaltado.ancla === segmento.ancla &&
      resaltado.inicio < segmento.fin &&
      resaltado.fin > segmento.inicio,
  )
}

export function quitarResaltado(id: string, ruta: string): void {
  resaltados.value = resaltados.value.filter((resaltado) => resaltado.id !== id)
  persistir()
  aplicarResaltados(ruta)
}

export function resaltadosDeRuta(ruta: string): Resaltado[] {
  return resaltados.value.filter((resaltado) => resaltado.ruta === ruta)
}

export function useResaltados() {
  return resaltados
}

/** Solo para tests: deja el estado en blanco sin tocar localStorage. */
export function reiniciarResaltadosEnMemoria(): void {
  resaltados.value = []
}

export function recargarResaltados(): void {
  resaltados.value = leerDeStorage()
}
