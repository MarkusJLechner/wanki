<template>
  <div>
    <TheHeader title="General Settings" back-button>
      <FlexSpacer />
      <ThemeSwitcher />
    </TheHeader>

    <MainContent>
      <Group value="Sync">
        <List :value="listItemsSync" />
      </Group>

      <Group value="Wanki">
        <List :value="listItemsWanki" />
      </Group>

      <Group value="Notifications">
        <List :value="listItemsNotifications" />
      </Group>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import List from '@/components/List.vue'
import Group from '@/components/Group.vue'
import MainContent from '@/components/MainContent.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import type { ListItem } from 'components/List.ts'

const listItemsSync: ListItem[] = [
  {
    text: 'AnkiWeb account',
    subtext: 'myaccount@email.com',
  },
  {
    text: 'Fetch media on sync',
    subtext: 'Automatically fetch missing media when syncing',
    toggle: 'setting.general.fetch-sync',
  },
  {
    text: 'Automatic synchronization',
    subtext:
      'Sync automatically on app start/exit if the last sync was more than 10 minutes ago',
    toggle: 'setting.general.automatic-sync',
    toggleDefault: true,
  },
  {
    text: 'Display synchronization status',
    subtext: 'Change the sync icon when changes can be uploaded',
    toggle: 'setting.general.display-sync-status',
    toggleDefault: true,
  },
]

const listItemsWanki: ListItem[] = [
  {
    text: 'Deck for new cards',
    radio: {
      title: 'Deck for new cards',
      key: 'setting.general.use-card',
      default: 'current-deck',
      items: [
        {
          text: 'Use current deck',
          value: 'current-deck',
        },
        { text: 'Decide by note type', value: 'note-type' },
      ],
    },
  },
  {
    text: 'Language',
    icon: 'fas fa-language',
    radio: {
      title: 'Language',
      key: 'setting.general.language',
      default: 'english',
      items: [
        { text: 'English', value: 'english' },
        { text: 'Deutsch', value: 'german' },
        { text: '日本語', value: 'japanese' },
      ],
    },
  },
  {
    text: 'Share feature usage',
    subtext:
      'You can contribute to Wanki by helping the development team see which features people use',
    toggle: 'setting.general.share.feature',
  },
  {
    text: 'Error reporting mode',
    radio: {
      title: 'Error reporting mode',
      key: 'setting.general.error-reporting',
      default: 'always',
      items: [
        {
          text: 'Always report',
          value: 'always',
        },
        { text: 'Never report', value: 'never' },
        { text: 'Ask me', value: 'ask' },
      ],
    },
  },
]

const listItemsNotifications: ListItem[] = [
  {
    text: 'Notify when',
    radio: {
      title: 'Error reporting mode',
      key: 'setting.general.notify',
      default: 'never',
      items: [
        { text: 'Never notify', value: 'never' },
        { text: 'Pending messages available', value: 'pending' },
        { text: 'More than 10 cards due', value: '10-due' },
        { text: 'More than 25 cards due', value: '25-due' },
        { text: 'More than 50 cards due', value: '50-due' },
        { text: 'More than 75 cards due', value: '75-due' },
        { text: 'More than 100 cards due', value: '100-due' },
        { text: 'More than 150 cards due', value: '150-due' },
        { text: 'More than 200 cards due', value: '200-due' },
        { text: 'More than 500 cards due', value: '500-due' },
      ],
    },
  },
  {
    text: 'Vibrate',
    toggle: 'setting.general.vibrate',
  },
  {
    text: 'Blink light',
    toggle: 'setting.general.blink-light',
  },
]
</script>
