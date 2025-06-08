<template>
  <div>
    <TheHeader title="FSRS" back-button></TheHeader>
    <MainContent>
      <Group value="Parameters">
        <List :value="listItems" />
      </Group>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import MainContent from '@/components/MainContent.vue'
import Group from '@/components/Group.vue'
import List from '@/components/List.vue'
import { getParameters, saveParameters } from '@/plugins/fsrs'
import type { FSRSParameters } from 'ts-fsrs'
import type { ListItem } from '@/components/List'

const params = ref<FSRSParameters | null>(null)

onMounted(async () => {
  params.value = await getParameters()
})

function update<K extends keyof FSRSParameters>(key: K, value: any): void {
  if (!params.value) return
  if (key === 'w') {
    params.value.w = String(value)
      .split(/[, ]+/)
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n))
  } else if (key === 'learning_steps' || key === 'relearning_steps') {
    params.value[key] = String(value).split(/[, ]+/).filter(Boolean) as any
  } else if (key === 'enable_fuzz' || key === 'enable_short_term') {
    params.value[key] = Boolean(value)
  } else if (key === 'maximum_interval' || key === 'request_retention') {
    params.value[key] = Number(value)
  } else {
    // generic assignment
    ;(params.value as any)[key] = value
  }
  void saveParameters(params.value)
}

const listItems = ref<ListItem[]>([
  {
    text: 'Request retention',
    kind: 'textfield',
    type: 'number',
    title: 'Request retention',
    storeDb: {
      get: () => params.value?.request_retention,
      save: (v: string) => update('request_retention', v),
    },
  },
  {
    text: 'Maximum interval',
    kind: 'textfield',
    type: 'number',
    title: 'Maximum interval',
    storeDb: {
      get: () => params.value?.maximum_interval,
      save: (v: string) => update('maximum_interval', v),
    },
  },
  {
    text: 'Weights',
    kind: 'textfield',
    placeholder: 'space separated numbers',
    title: 'Weights',
    storeDb: {
      get: () => params.value?.w.join(' ') ?? '',
      save: (v: string) => update('w', v),
    },
  },
  {
    text: 'Enable fuzz',
    storeDb: {
      get: () => params.value?.enable_fuzz ?? false,
      save: (v: boolean) => update('enable_fuzz', v),
    },
  },
  {
    text: 'Enable short term',
    storeDb: {
      get: () => params.value?.enable_short_term ?? true,
      save: (v: boolean) => update('enable_short_term', v),
    },
  },
  {
    text: 'Learning steps',
    kind: 'textfield',
    placeholder: 'e.g. 1m 10m',
    title: 'Learning steps',
    storeDb: {
      get: () => (params.value?.learning_steps ?? []).join(' '),
      save: (v: string) => update('learning_steps', v),
    },
  },
  {
    text: 'Relearning steps',
    kind: 'textfield',
    placeholder: 'e.g. 10m 1h',
    title: 'Relearning steps',
    storeDb: {
      get: () => (params.value?.relearning_steps ?? []).join(' '),
      save: (v: string) => update('relearning_steps', v),
    },
  },
])
</script>
