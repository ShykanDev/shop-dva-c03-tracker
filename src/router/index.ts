import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/checklist' },
  {
    path: '/checklist',
    name: 'checklist',
    component: () => import('@/views/ChecklistView.vue'),
  },
  { path: '/guia', redirect: '/guia/paso-0' },
  {
    path: '/guia/:pasoId',
    name: 'guia',
    component: () => import('@/views/GuiaView.vue'),
    props: true,
  },
  {
    path: '/proyecto',
    name: 'proyecto',
    component: () => import('@/views/ProyectoView.vue'),
  },
  {
    path: '/cierre',
    name: 'cierre',
    component: () => import('@/views/CierreView.vue'),
  },
  { path: '/:pathMatch(.*)*', redirect: '/checklist' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 88 }
    return { top: 0 }
  },
})

export default router
