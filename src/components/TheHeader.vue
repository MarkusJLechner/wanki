<template>
  <div
    class="
      flex
      bg-gray-300
      dark:bg-gray-700
      dark:text-white
      text-gray-900
      items-center
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

    sidepanel: {
      type: Array,
      default: () => [
        {
          type: 'block',
          class: 'w-full h-14 mb-2',
          style:
            'background-color: #000000;opacity: 1;background: linear-gradient(135deg, #3a6ed755 25%, transparent 25%) -21px 0/ 42px 42px, linear-gradient(225deg, #3a6ed7 25%, transparent 25%) -21px 0/ 42px 42px, linear-gradient(315deg, #3a6ed755 25%, transparent 25%) 0px 0/ 42px 42px, linear-gradient(45deg, #3a6ed7 25%, #000000 25%) 0px 0/ 42px 42px;',
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
      ],
    },
  },

  methods: {
    onBackButton() {
      this.$router.back()
    },
  },
}
</script>
