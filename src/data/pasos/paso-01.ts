import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso01: Paso = {
  id: 'paso-1',
  numero: 1,
  titulo: 'Frontend base Vue 3',
  resumen:
    'Crear la app Vue con Vite, Tailwind y Vue Router, dejar las rutas vacías y los cinco stores Pinia listos.',
  objetivo:
    'Abrir la app en desarrollo, navegar entre las rutas aunque estén vacías y comprobar que Pinia conserva el carrito en localStorage.',
  acciones: [
    {
      id: 'paso-1.1',
      texto: 'Crear la app Vue 3 + TypeScript + Vite + Pinia + Tailwind + Vue Router',
      detalle:
        'Puedes usar el scaffold oficial o montar los archivos a mano. Lo importante es que las cinco piezas queden conectadas.',
    },
    {
      id: 'paso-1.2',
      texto: 'Crear las 13 rutas: 6 públicas, 3 protegidas y 4 de admin',
      detalle:
        'Todas pueden apuntar a una vista placeholder al inicio. Las protegidas y las de admin se aseguran en el Paso 4.',
    },
    {
      id: 'paso-1.3',
      texto: 'Crear los 5 stores Pinia vacíos: auth, cart, products, orders y admin',
      detalle:
        'Cada store con su estado inicial tipado. El carrito debe persistir en localStorage.',
    },
    {
      id: 'paso-1.4',
      texto: 'Crear los componentes ProductCard, CartItem, OrderCard, AppHeader y AppButton',
      detalle:
        'Aún sin datos reales: maqueta visual con props tipadas. En el Paso 3 se conectan a DynamoDB.',
    },
  ],
  verifica: [
    {
      id: 'paso-1.v1',
      texto: 'npm run dev abre la app, las 13 rutas cargan y Tailwind se ve aplicado',
      detalle:
        'Si Tailwind no aplica, revisa el plugin @tailwindcss/vite y el @import "tailwindcss" en el CSS.',
    },
    {
      id: 'paso-1.v2',
      texto: 'Agregar un producto al carrito y recargar: el carrito sigue ahí',
      detalle:
        'Pinia guarda en memoria; la persistencia en localStorage la agregas en el store cart con un watch.',
    },
  ],
  skills: [],
  guia: [
    {
      tipo: 'texto',
      md: 'El objetivo de este paso no es la tienda bonita: es tener el esqueleto completo para que cada paso siguiente conecte una pieza sin reordenar la casa. Si una ruta falta ahora, el guard del Paso 4 y el panel del Paso 5 se construyen sobre arena.',
    },
    {
      tipo: 'lista',
      titulo: 'Cómo crear el proyecto',
      items: [
        'Crea la carpeta del frontend: npm create vite@latest shop-frontend -- --template vue-ts. Entra y ejecuta npm install.',
        'Instala Tailwind v4 y su plugin de Vite: npm install -D tailwindcss @tailwindcss/vite.',
        'Instala Pinia y Vue Router: npm install pinia vue-router.',
        'En vite.config.ts agrega tailwindcss() a plugins. En src/style.css pone @import "tailwindcss"; como primera línea.',
        'En src/main.ts registra createPinia() y el router antes de montar la app.',
        'Crea las carpetas src/stores, src/views, src/components, src/router y src/services.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Las 13 rutas del proyecto',
      items: [
        'Públicas: /, /productos, /producto/:id, /login, /registro, /carrito.',
        'Protegidas: /checkout, /pedidos, /pedidos/:id.',
        'Admin: /admin, /admin/productos, /admin/productos/nuevo, /admin/pedidos.',
        'Cada ruta con import() dinámico en el router: el panel admin no debe pesar en la carga inicial de la tienda.',
        'Las rutas protegidas llevan meta: { requiresAuth: true }. Las de admin llevan meta: { requiresAuth: true, requiresAdmin: true }.',
      ],
    },
    {
      tipo: 'codigo',
      lenguaje: 'ts',
      codigo: [
        "import { defineStore } from 'pinia'",
        '',
        'export interface CartItem {',
        '  productId: string',
        '  name: string',
        '  price: number',
        '  qty: number',
        '  imageKey?: string',
        '}',
        '',
        "export const useCartStore = defineStore('cart', {",
        '  state: () => ({',
        '    items: [] as CartItem[],',
        '    cargado: false,',
        '  }),',
        '  getters: {',
        '    total: (state) => state.items.reduce((suma, item) => suma + item.price * item.qty, 0),',
        '    cantidad: (state) => state.items.reduce((suma, item) => suma + item.qty, 0),',
        '  },',
        '  actions: {',
        '    agregar(item: CartItem) {',
        '      const existente = this.items.find((i) => i.productId === item.productId)',
        '      if (existente) existente.qty += item.qty',
        '      else this.items.push({ ...item })',
        '    },',
        '    quitar(productId: string) {',
        '      this.items = this.items.filter((i) => i.productId !== productId)',
        '    },',
        '    limpiar() { this.items = [] },',
        '  },',
        '})',
      ].join('\n'),
      nota: 'Para persistir: guarda JSON.stringify(items) en un watch y restaúralo al crear el store con la opción persist de Pinia o un plugin pequeño.',
    },
    {
      tipo: 'lista',
      titulo: 'Contrato mínimo de los 5 componentes',
      items: [
        'ProductCard: props product (id, name, price, stock, imageKey) y emit add. No llama a la API; solo presenta.',
        'CartItem: props item y emits increase, decrease, remove. El carrito real vive en el store.',
        'OrderCard: props order (id, total, status, createdAt) y slot para acciones.',
        'AppHeader: props title opcional, slots start y end; contiene la navegación principal.',
        'AppButton: props variant (solid, outline, clear), size, block, disabled; slots start y end.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Sugerencia de Vue',
      md: 'En esta sección conviene usar props en ProductCard, emits en CartItem y slots en AppButton. La razón es que el componente de presentación no debe saber de HTTP ni de Pinia: recibe datos, avisa con un evento y el padre decide.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 1,
    titulo: 'Frontend base Vue 3',
    quiere:
      'crear la app Vue 3 + TypeScript + Vite con Pinia, Tailwind y Vue Router; dejar las 13 rutas del proyecto, los 5 stores vacíos y los 5 componentes base',
    yaHice: 'el Paso 0: cuenta segura, MFA, alarmas de billing y repo shop-dva-c03',
    extra:
      'Las rutas son: públicas /, /productos, /producto/:id, /login, /registro, /carrito; protegidas /checkout, /pedidos, /pedidos/:id; admin /admin, /admin/productos, /admin/productos/nuevo, /admin/pedidos. Quiero que me expliques la estructura de carpetas y un ejemplo mínimo de ProductCard con props y de CartItem con emits.',
  }),
  sugerenciaVue: {
    titulo: 'Props para presentar, emits para avisar, Pinia para recordar',
    porque:
      'ProductCard y CartItem deben poder reutilizarse en el catálogo, en el carrito y en el detalle. Si el componente hijo llama a la API o modifica el stock directamente, se vuelve imposible de testear. La regla es: props para bajar datos, emits para subir intenciones, Pinia para el estado compartido y computed para totales.',
    ejemplo: [
      '<script setup lang="ts">',
      "import type { Product } from '@/types'",
      'const props = defineProps<{ product: Product }>()',
      "const emit = defineEmits<{ add: [id: string] }>()",
      '</script>',
    ].join('\n'),
  },
}
