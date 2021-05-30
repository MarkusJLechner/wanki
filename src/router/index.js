import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Overview',
    component: () => import('../pages/Overview.vue'),
  },
  {
    path: '/browser',
    name: 'Browser',
    component: () => import('../pages/Browser.vue'),
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../pages/Help.vue'),
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('../pages/Support.vue'),
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../pages/Statistics.vue'),
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../pages/Review.vue'),
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../pages/Error.vue'),
  },

  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
  },

  {
    path: '/setting/general',
    name: 'GeneralSettings',
    component: () => import('../pages/Settings/GeneralSettings.vue'),
  },
  {
    path: '/setting/advanced',
    name: 'Advanced',
    component: () => import('../pages/Settings/Advanced.vue'),
  },
  {
    path: '/setting/appearance',
    name: 'Appearance',
    component: () => import('../pages/Settings/Appearance.vue'),
  },
  {
    path: '/setting/gestures',
    name: 'Gestures',
    component: () => import('../pages/Settings/Gestures.vue'),
  },
  {
    path: '/setting/reviewing',
    name: 'Reviewing',
    component: () => import('../pages/Settings/Reviewing.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
