import type { Paso } from '@/types/proyecto'
import { paso00 } from './paso-00'
import { paso01 } from './paso-01'
import { paso02 } from './paso-02'
import { paso03 } from './paso-03'
import { paso04 } from './paso-04'
import { paso05 } from './paso-05'
import { paso06 } from './paso-06'
import { paso07 } from './paso-07'
import { paso08 } from './paso-08'
import { paso09 } from './paso-09'
import { paso10 } from './paso-10'
import { paso11 } from './paso-11'
import { paso12 } from './paso-12'
import { paso13 } from './paso-13'
import { paso14 } from './paso-14'
import { paso15 } from './paso-15'

export const PASOS: Paso[] = [
  paso00,
  paso01,
  paso02,
  paso03,
  paso04,
  paso05,
  paso06,
  paso07,
  paso08,
  paso09,
  paso10,
  paso11,
  paso12,
  paso13,
  paso14,
  paso15,
]

export const PASO_POR_ID: Record<string, Paso> = Object.fromEntries(
  PASOS.map((paso) => [paso.id, paso]),
)

export function buscarPaso(id: string): Paso | undefined {
  return PASO_POR_ID[id]
}
