import {
  createWebHashHistory,
  createRouter,
  RouteRecordRaw,
  RouteLocationNormalized,
  Position,
  PositionResult,
} from 'vue-router'

if (!import.meta.hot) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker')
  }
}

import Overview from 'pages/Overview.vue'
import Browser from 'pages/Browser.vue'
import Help from 'pages/Help.vue'
import Support from 'pages/Support.vue'
import Statistics from 'pages/Statistics.vue'
import Review from 'pages/Review.vue'
import CardInfo from 'pages/CardInfo.vue'
import DeckOptions from 'pages/DeckOptions.vue'
import Error from 'pages/Error.vue'
import Settings from 'pages/Settings.vue'
import GeneralSettings from 'pages/Settings/GeneralSettings.vue'
import Advanced from 'pages/Settings/Advanced.vue'
import Appearance from 'pages/Settings/Appearance.vue'
import Gestures from 'pages/Settings/Gestures.vue'
import Reviewing from 'pages/Settings/Reviewing.vue'
import Shared from '@/pages/Shared.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Overview',
    component: Overview,
    // component: () => import('pages/Overview.vue'),
  },
  {
    path: '/browser',
    name: 'Browser',
    component: Browser,
    // component: () => import('pages/Browser.vue'),
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    // component: () => import('pages/Help.vue'),
  },
  {
    path: '/support',
    name: 'Support',
    component: Support,
    // component: () => import('pages/Support.vue'),
  },
  {
    path: '/shared',
    name: 'shared',
    component: Shared,
    // component: () => import('pages/Support.vue'),
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    // component: () => import('pages/Statistics.vue'),
  },
  {
    path: '/review/on',
    name: 'Review',
    component: Review,
    // component: () => import('pages/Review.vue'),
  },
  {
    path: '/deck/options',
    name: 'DeckOptions',
    component: DeckOptions,
  },
  {
    path: '/card/info',
    name: 'CardInfo',
    component: CardInfo,
  },
  {
    path: '/:catchAll(.*)',
    component: Error,
    // component: () => import('pages/Error.vue'),
  },

  {
    path: '/settings/overview',
    name: 'Settings',
    component: Settings,
    // component: () => import('pages/Settings.vue'),
  },

  {
    path: '/setting/wanki/general',
    name: 'GeneralSettings',
    component: GeneralSettings,
    // component: () => import('pages/Settings/GeneralSettings.vue'),
  },
  {
    path: '/setting/wanki/advanced',
    name: 'Advanced',
    component: Advanced,
    // component: () => import('pages/Settings/Advanced.vue'),
  },
  {
    path: '/setting/wanki/appearance',
    name: 'Appearance',
    component: Appearance,
    // component: () => import('pages/Settings/Appearance.vue'),
  },
  {
    path: '/setting/wanki/gestures',
    name: 'Gestures',
    component: Gestures,
    // component: () => import('pages/Settings/Gestures.vue'),
  },
  {
    path: '/setting/wanki/reviewing',
    name: 'Reviewing',
    component: Reviewing,
    // component: () => import('pages/Settings/Reviewing.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to: RouteLocationNormalized, from: RouteLocationNormalized, savedPosition?: Position): PositionResult | void {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
