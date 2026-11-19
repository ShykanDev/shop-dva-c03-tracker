export interface Accion {
  /** Id estable y único, p. ej. 'paso-2.1' o 'cierre-costos.3'. */
  id: string
  texto: string
  detalle?: string
  /** Skills del examen que cubre esta acción, tal como aparecen en la spec. */
  skills?: string[]
}

export type BloqueGuia =
  | { tipo: 'texto'; md: string }
  | { tipo: 'lista'; titulo?: string; items: string[]; ordenada?: boolean }
  | { tipo: 'codigo'; lenguaje: string; codigo: string; nota?: string }
  | {
      tipo: 'nota'
      tono: 'info' | 'aviso' | 'peligro'
      titulo?: string
      md: string
    }

export interface SugerenciaVue {
  titulo: string
  porque: string
  ejemplo?: string
}

export interface Laboratorio {
  /** Id estable, p. ej. 'lab-1'. */
  id: string
  titulo: string
  objetivo: string
  como: string[]
  verifica: string
  limpieza?: string
  /** Prompt listo para Amazon Q, específico de este lab. */
  prompt: string
}

export interface Paso {
  id: string
  numero: number
  titulo: string
  resumen: string
  objetivo: string
  acciones: Accion[]
  verifica: Accion[]
  guia: BloqueGuia[]
  skills: string[]
  promptAmazonQ: string
  sugerenciaVue?: SugerenciaVue
  laboratorios?: Laboratorio[]
  notas?: string[]
}

export interface SeccionCierre {
  id: string
  titulo: string
  descripcion: string
  acciones: Accion[]
}

export interface DominioCobertura {
  id: string
  nombre: string
  peso: string
  estado: 'casi-completo' | 'parcial'
  cubre: string[]
  falta: string
  pasos: number[]
}

export type TipoRuta = 'pública' | 'protegida' | 'admin'

export interface RutaProyecto {
  ruta: string
  tipo: TipoRuta
  descripcion: string
}

export interface StoreProyecto {
  nombre: string
  estado: string
  acciones: string
}

export interface IndiceProyecto {
  nombre: string
  pk: string
  sk: string
  uso: string
}

export interface TablaProyecto {
  nombre: string
  pk: string
  sk: string
  atributos: string[]
  indices: IndiceProyecto[]
  nota: string
}

export interface BucketProyecto {
  nombre: string
  uso: string
  acceso: string
}

export interface FuncionProyecto {
  nombre: string
  proposito: string
}

export interface GrupoLambdas {
  grupo: string
  funciones: FuncionProyecto[]
}

export interface GrupoStack {
  grupo: string
  items: string[]
}

export interface ProyectoReferencia {
  nombre: string
  idea: string
  usuarios: { rol: string; hace: string }[]
  flujo: string[]
  stack: GrupoStack[]
  cuenta: {
    region: string
    creditos: string
    alarmas: string[]
    reglas: string[]
  }
  contratoLambda: string[]
  reglasAmazonQ: string[]
}
