import {
  createWebHashHistory,
  createRouter,
  RouteRecordRaw,
  RouteLocationNormalized,
} from 'vue-router'
import type { RouterScrollBehavior } from 'vue-router'

if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/service-worker.js')
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Overview',
    component: () => import('pages/Overview.vue'),
  },
  {
    path: '/browser',
    name: 'Browser',
    component: () => import('pages/Browser.vue'),
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('pages/Help.vue'),
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('pages/Support.vue'),
  },
  {
    path: '/shared',
    name: 'shared',
    component: () => import('@/pages/Shared.vue'),
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('pages/Statistics.vue'),
  },
  {
    path: '/review/on',
    name: 'Review',
    component: () => import('pages/Review.vue'),
  },
  {
    path: '/deck/options',
    name: 'DeckOptions',
    component: () => import('pages/DeckOptions.vue'),
  },
  {
    path: '/card/info',
    name: 'CardInfo',
    component: () => import('pages/CardInfo.vue'),
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('pages/Error.vue'),
  },

  {
    path: '/settings/overview',
    name: 'Settings',
    component: () => import('pages/Settings.vue'),
  },

  {
    path: '/setting/wanki/general',
    name: 'GeneralSettings',
    component: () => import('pages/Settings/GeneralSettings.vue'),
  },
  {
    path: '/setting/wanki/advanced',
    name: 'Advanced',
    component: () => import('pages/Settings/Advanced.vue'),
  },
  {
    path: '/setting/wanki/appearance',
    name: 'Appearance',
    component: () => import('pages/Settings/Appearance.vue'),
  },
  {
    path: '/setting/wanki/gestures',
    name: 'Gestures',
    component: () => import('pages/Settings/Gestures.vue'),
  },
  {
    path: '/setting/wanki/reviewing',
    name: 'Reviewing',
    component: () => import('pages/Settings/Reviewing.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    savedPosition: Parameters<RouterScrollBehavior>[2],
  ) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
