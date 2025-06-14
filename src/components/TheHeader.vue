<template>
  <div
    class="flex items-center bg-gray-300 py-1 text-gray-900 dark:bg-gray-700 dark:text-white"
  >
    <div v-if="backButton">
      <ButtonIcon icon="fas fa-arrow-left" @click="onBackButton" />
    </div>
    <slot name="sidepanel">
      <Sidepanel v-if="!backButton" :items="items" />
    </slot>

    <slot name="title">
      <span class="block pl-3">{{ title }}</span>
    </slot>
    <slot> </slot>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { refstorage } from '@/store/globalstate'
import ButtonIcon from '@/components/ButtonIcon.vue'
import Sidepanel from '@/components/Sidepanel.vue'
import SidepanelHeader from '@/components/SidepanelHeader.vue'
import { wipeDatabase } from '@/plugins/wankidb/db'
import type { ListItem } from 'components/List.ts'
import { defaultSettings } from 'plugins/defaultSettings.ts'

interface Props {
  title?: string
  backButton?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  backButton: false,
})

const router = useRouter()

const onBackButton = () => {
  router.back()
}

const handleWipeDatabase = async () => {
  await wipeDatabase()
  location.reload()
}

const items: (ListItem & { doNotClose?: boolean })[] = [
  {
    component: SidepanelHeader,
    type: 'block',
    class: 'w-full h-14 mb-2 bg-gray-300/40 dark:bg-gray-800/40',
    route: '/',
  },
  { icon: 'fas fa-list', text: 'Decks', route: '/' },
  { icon: 'fas fa-search', text: 'Card Browser', route: '/browser' },
  { icon: 'fas fa-chart-pie', text: 'Statistics', route: '/statistics' },
  { type: 'seperator' },
  {
    doNotClose: true,
    toggle: 'darkTheme',
    icon: () =>
      refstorage.get('darkTheme', defaultSettings.darkTheme)
        ? 'fas fa-sun'
        : 'fas fa-moon',
    text: 'Dark mode',
  },
  { icon: 'fas fa-cog', text: 'Settings', route: '/settings/overview' },
  { icon: 'fas fa-question-circle', text: 'Help', route: '/help' },
  { icon: 'fas fa-life-ring', text: 'Support Wanki', route: '/support' },
  {
    icon: 'fas fa-redo-alt',
    text: 'Reload from Server',
    dispatch: () => location.reload(),
  },
  {
    icon: 'fas fa-fire-alt',
    text: 'Wipe Database',
    dispatch: () => handleWipeDatabase(),
  },
]
</script>
