<template>
  <div
    class="
      flex
      bg-gray-300
      dark:bg-gray-700 dark:text-white
      text-gray-900
      items-center
      py-1
    "
  >
    <div v-if="backButton">
      <ButtonIcon icon="fas fa-arrow-left" @click="onBackButton" />
    </div>
    <slot name="sidepanel">
      <Sidepanel v-if="!backButton" :items="sidepanel" />
    </slot>

    <slot name="title">
      <span class="block pl-3">{{ title }}</span>
    </slot>
    <slot> </slot>
  </div>
</template>

<script>
import { refstorage } from 'store/globalstate'
import ButtonIcon from 'components/ButtonIcon.vue'
import Sidepanel from '@/components/Sidepanel.vue'
import SidepanelHeader from '@/components/SidepanelHeader.vue'
import { wipeDatabase } from '@/plugins/wankidb/db.js'
import { shallowRef } from 'vue'

export default {
  components: { Sidepanel, ButtonIcon },

  props: {
    title: {
      type: String,
      default: '',
    },

    backButton: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      sidepanel: [
        {
          component: shallowRef(SidepanelHeader),
          type: 'block',
          class: 'w-full h-14 mb-2 bg-gray-300 dark:bg-gray-800 bg-opacity-40',
          route: '/',
        },
        { icon: 'fas fa-list', text: 'Decks', route: '/' },
        { icon: 'fas fa-search', text: 'Card Browser', route: 'browser' },
        { icon: 'fas fa-chart-pie', text: 'Statistics', route: 'statistics' },
        { type: 'seperator' },
        {
          doNotClose: true,
          toggle: 'darkTheme',
          icon: () =>
            refstorage.get('darkTheme', false) ? 'fas fa-sun' : 'fas fa-moon',
          text: 'Dark mode',
        },
        { icon: 'fas fa-cog', text: 'Settings', route: '/settings/overview' },
        { icon: 'fas fa-question-circle', text: 'Help', route: 'help' },
        { icon: 'fas fa-life-ring', text: 'Support Wanki', route: 'support' },
        {
          icon: 'fas fa-redo-alt',
          text: 'Reload from Server',
          dispatch: () => location.reload(true),
        },
        {
          icon: 'fas fa-fire-alt',
          text: 'Wipe Database',
          dispatch: () => this.wipeDatabase(),
        },
      ],
    }
  },

  methods: {
    onBackButton() {
      this.$router.back()
    },

    async wipeDatabase() {
      await wipeDatabase()
      location.reload(true)
    },
  },
}
</script>
