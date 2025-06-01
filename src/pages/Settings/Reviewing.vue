<template>
  <div>
    <TheHeader title="Reviewing" back-button> </TheHeader>

    <Group value="Audio">
      <List :value="listItemsAudio" />
    </Group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import List from '@/components/List.vue'
import Group from '@/components/Group.vue'
import { defaultSettings } from '@/plugins/defaultSettings'
import type { ListItem } from 'components/List.ts'

const listItemsAudio = ref<ListItem[]>([
  {
    text: 'Show native Audio-Controls',
    subtext: 'Native controls have more functionality',
    toggle: defaultSettings.reviewing.audioControls.key,
  },
  {
    text: 'Auto play audio',
    subtext: 'Automatically play question or answer audio if provided',
    toggle: defaultSettings.reviewing.autoPlayAudio.key,
  },
  {
    text: 'Align Audio buttons right',
    subtext: 'Easier to reach with the right hand',
    toggle: defaultSettings.reviewing.alignAudioButtonsRight.key,
  },
  {
    text: 'Audio start delay',
    subtext: 'Time in milliseconds',
    kind: 'textfield',
    title: 'Audio start delay',
    label: 'Time in ms',
    placeholder: 'Milliseconds',
    storeLocal: defaultSettings.reviewing.autoPlayAudioDelay.key,
  },
])
</script>
