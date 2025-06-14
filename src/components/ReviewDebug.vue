<template>
  <div
    v-if="card"
    class="fixed right-0 bottom-62 left-0 z-20 -mt-3 h-64 overflow-y-auto rounded-t-lg bg-black/80 px-6 py-4 text-xs opacity-95 shadow-2xl backdrop-blur-md"
  >
    <div class="mb-3">
      <div class="mb-2 flex gap-4">
        <div class="font-semibold text-yellow-500">{{ t('Deck ID:') }}</div>
        <div class="text-yellow-100">{{ deck?.id }}</div>
      </div>
      <div class="mb-2 flex gap-4">
        <div class="font-semibold text-yellow-400">{{ t('Deck Name:') }}</div>
        <div class="text-yellow-100">{{ deck?.name }}</div>
      </div>
    </div>
    <div class="mb-3">
      <div class="mb-1 font-bold text-blue-300">{{ t('Card') }}</div>
      <div
        class="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-blue-900/30 p-3 md:grid-cols-3"
      >
        <template v-for="(value, key) in cardFields" :key="key">
          <div class="font-medium text-blue-200">{{ key }}:</div>
          <div class="col-span-1 break-all text-blue-50 md:col-span-2">
            <span v-if="key === 'mod (date)' || key === 'due (date)'">{{
              value
            }}</span>
            <span v-else>{{ value }}</span>
          </div>
        </template>
        <Promise :promise="card.dueDate">
          <template #default="{ result }">
            <div class="font-medium text-blue-200">dueDate:</div>
            <div class="col-span-1 break-all text-blue-50 md:col-span-2">
              {{ result?.toLocaleString() }}
            </div>
          </template>
        </Promise>
      </div>
    </div>
    <div class="mb-3" v-if="note">
      <div class="mb-1 font-bold text-blue-300">{{ t('Note') }}</div>
      <div class="grid gap-y-1 rounded-md bg-green-900/20 p-3">
        <div v-html="getFields().join(' ')" class="mb-1"></div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">Tags:</span>
          <span class="text-green-50">{{ note.tags }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">flags:</span>
          <span class="text-green-50">{{ note.flags }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">usn:</span>
          <span class="text-green-50">{{ note.usn }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">csum:</span>
          <span class="text-green-50">{{ note.csum }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">mid:</span>
          <span class="text-green-50">{{ note.mid }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">mod:</span>
          <span class="text-green-50">{{ note.mod }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-green-200">mod (date):</span>
          <span class="text-green-50">{{
            new Date(card.mod * 1000).toLocaleString()
          }}</span>
        </div>
      </div>
      <Promise :promise="card.model">
        <template #default="{ result: model, loading }">
          <div class="mt-3 mb-1 font-bold text-blue-300">{{ t('Model') }}</div>
          <div v-if="loading" class="text-blue-200">{{ t('loading…') }}</div>
          <div v-else class="grid gap-y-1 rounded-md bg-indigo-900/20 p-3">
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">id:</span
              ><span class="text-indigo-50">{{ model.id }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">vers:</span
              ><span class="text-indigo-50">{{ model.vers }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">name:</span
              ><span class="text-indigo-50">{{ model.name }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">tags:</span
              ><span class="text-indigo-50">{{ model.tags }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">did:</span
              ><span class="text-indigo-50">{{ model.did }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">usn:</span
              ><span class="text-indigo-50">{{ model.usn }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">req:</span
              ><span class="text-indigo-50">{{ model.req }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">flds:</span
              ><span class="text-indigo-50">{{ model.flds }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">sortf:</span
              ><span class="text-indigo-50">{{ model.sortf }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">tmpls:</span
              ><span class="text-indigo-50">{{ model.tmpls }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">mod:</span
              ><span class="text-indigo-50">{{ model.mod }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">latexPost:</span
              ><span class="text-indigo-50">{{ model.latexPost }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">type:</span
              ><span class="text-indigo-50">{{ model.type }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">css:</span
              ><span class="text-indigo-50">{{ model.css }}</span>
            </div>
            <div class="flex gap-2">
              <span class="font-medium text-indigo-200">latexPre:</span
              ><span class="text-indigo-50">{{ model.latexPre }}</span>
            </div>
          </div>
        </template>
      </Promise>
    </div>
    <div v-if="deck" class="mb-1">
      <div class="mb-1 font-bold text-blue-300">{{ t('Deck') }}</div>
      <div class="grid gap-y-1 rounded-md bg-yellow-900/20 p-3">
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">browserCollapsed:</span
          ><span class="text-yellow-50">{{ deck.browserCollapsed }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">collapsed:</span
          ><span class="text-yellow-50">{{ deck.collapsed }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">conf:</span
          ><span class="text-yellow-50">{{ deck.conf }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">desc:</span
          ><span class="text-yellow-50">{{ deck.desc }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">dyn:</span
          ><span class="text-yellow-50">{{ deck.dyn }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">extendNew:</span
          ><span class="text-yellow-50">{{ deck.extendNew }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">extendRev:</span
          ><span class="text-yellow-50">{{ deck.extendRev }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">id:</span
          ><span class="text-yellow-50">{{ deck.id }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">lrnToday:</span
          ><span class="text-yellow-50">{{ deck.lrnToday }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">mod:</span
          ><span class="text-yellow-50">{{ deck.mod }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">mod (date):</span
          ><span class="text-yellow-50">{{
            new Date(deck.mod * 1000).toLocaleString()
          }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">name:</span
          ><span class="text-yellow-50">{{ deck.name }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">newToday:</span
          ><span class="text-yellow-50">{{ deck.newToday }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">revToday:</span
          ><span class="text-yellow-50">{{ deck.revToday }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">timeToday:</span
          ><span class="text-yellow-50">{{ deck.timeToday }}</span>
        </div>
        <div class="flex gap-2">
          <span class="font-medium text-yellow-200">usn:</span
          ><span class="text-yellow-50">{{ deck.usn }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Promise from '@/components/Promise.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  card?: Record<string, any> | null
  note?: Record<string, any> | null
  deck?: Record<string, any> | null
}

const props = withDefaults(defineProps<Props>(), {
  card: null,
  note: null,
  deck: null,
})

function getFields(): string[] {
  if (!props.note) return []
  return props.note.flds.split('\u001f')
}

const cardFields = computed(() => {
  if (!props.card) return {}
  const c = props.card
  return {
    [t('id')]: c.id,
    [t('nid')]: c.nid,
    [t('did')]: c.did,
    [t('ord')]: c.ord,
    [t('mod')]: c.mod,
    [t('mod (date)')]: new Date(c.mod * 1000).toLocaleString(),
    [t('usn')]: c.usn,
    [t('type')]: c.type,
    [t('cardType')]: c.cardType,
    [t('queue')]: c.queue,
    [t('queueType')]: c.queueType,
    [t('due')]: c.due,
    [t('due (date)')]: new Date(c.due).toLocaleString(),
    [t('ivl')]: c.ivl,
    [t('factor')]: c.factor,
    [t('reps')]: c.reps,
    [t('lapses')]: c.lapses,
    [t('left')]: c.left,
    [t('odue')]: c.odue,
    [t('odid')]: c.odid,
    [t('flags')]: c.flags,
    [t('data')]: c.data,
  }
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 6px;
}
</style>
