<template>
  <div @dragover="onImport">
    <TheHeader title="Overview">
      <FlexSpacer />
      <ButtonIconReload />
      <ThemeSwitcher />
      <ButtonIcon icon="fas fa-spider" @click="toggleDebugging" />
      <ButtonOptions
        :value="[
          { value: 'import', text: 'Import' },
          { value: 'export-collection', text: 'Export collection' },
        ]"
        @item="onClick"
      />
    </TheHeader>

    <ButtonFloating :model-value="optionsFloating" />
    <DebuggingTimeControls
      v-if="showDebugging"
      position="bottom-left"
      :on-time-change="updateDeckList"
    />

    <div
      class="fixed bottom-2.5 left-2.5 z-10 text-[0.7rem] text-inherit opacity-60"
    >
      Build: {{ commitHash }} - {{ buildDate }}
    </div>

    <MainContent
      v-keep-scroll="'overview'"
      :pull-to-refresh="() => pullToRefresh()"
    >
      <ModalImport v-model="showModalImport" @close="closeImport" />

      <span v-if="loading" class="p-4"
        >Loading decks <LoadingIcon class="ml-2" />
      </span>

      <div v-else-if="decks && decks.children && decks.children.length">
        <ListTree
          no-gutters
          :model-value="decks"
          item-text-key="id"
          @item="onDeck"
          @long-press="onMenu"
        >
          <template #suffix-item="{ item }">
            <NumberDue :value="item.newToday?.[1]" color="blue" />
            <NumberDue :value="item.revToday?.[1]" color="red" />
            <NumberDue :value="item.lrnToday?.[1]" color="green" />
          </template>
        </ListTree>
      </div>

      <span v-else class="block p-4 leading-10"
        >No decks available. Download
        <a
          class="text-blue-700 dark:text-blue-300"
          target="_blank"
          href="https://ankiweb.net/shared/decks/"
        >
          shared decks here
        </a>
        and import them here
      </span>

      <ModalOptions
        :model-value="modalOptionsItem"
        :items="deckOptions"
        @close="closeModalOptions"
      >
        <div v-if="modalOptionsItem" class="p-4">
          ID: {{ modelOptionDeckId }}
          <span class="block" v-html="modelOptionDeckDesc" />
        </div>
        <div class="px-2 font-bold">Options:</div>
      </ModalOptions>

      <ModalDelete
        :model-value="showModalDelete"
        @confirm="onDelete"
        @close="showModalDelete = false"
      >
      </ModalDelete>

      <BaseModal
        :model-value="showModalRename"
        confirm="Rename"
        title="Rename"
        :loading="loadingOnRename"
        @confirm="onRename"
        @close="showModalRename = false"
      >
        <input-text-field
          v-model="inputRename"
          v-autofocus
          :disabled="loadingOnRename"
          label="New name"
          @enter="onRename"
        />
      </BaseModal>
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import ModalImport from '@/components/ModalImport.vue'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { idbDecks, saveDirtySql } from '@/plugins/idb'
import ButtonOptions from '@/components/ButtonOptions.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import NumberDue from '@/components/NumberDue.vue'
import ModalOptions from '@/components/ModalOptions.vue'
import ModalDelete from '@/components/ModalDelete.vue'
import BaseModal from '@/components/BaseModal.vue'
import InputTextField from '@/components/InputTextField.vue'
import { sqlDbDeck, sqlDeck } from '@/plugins/sql.js'
import { exportDeck } from '@/plugins/exporter.js'
import MainContent from '@/components/MainContent.vue'
import ButtonIconReload from '@/components/ButtonIconReload.vue'
import ButtonFloating from '@/components/ButtonFloating.vue'
import ListTree from '@/components/ListTree.vue'
import { wankidb } from '@/plugins/wankidb/db'
import { getDueCounts } from '@/plugins/reviewer'
import { Deck } from 'plugins/wankidb/types.ts'
import DebuggingTimeControls from '@/components/DebuggingTimeControls.vue'
import { refstorage } from '@/store/globalstate'
import ButtonIcon from 'components/ButtonIcon.vue'

// Build date from Vite environment variable
const buildDate = __BUILD_DATE__
const commitHash = __COMMIT_HASH__

const router = useRouter()

// Data properties
const decks = ref<any[]>([])
const idbAllDecks = ref<any>(null)
const loading = ref(false)
const showModalImport = ref(false)
const showModalDelete = ref(false)
const showModalRename = ref(false)
const loadingOnRename = ref(false)
const loadingOnExport = ref(false)
// Use computed to reactively get the debugging state from refstorage
// Initialize debugging state in refstorage if not already initialized
refstorage.init('testing.debugging', false)
const showDebugging = computed(() => refstorage.get('testing.debugging', false))
const inputRename = ref<string>('')
const modalOptionsItem = ref<{ deck: Deck } | null>(null)
const optionsFloating = ref([
  {
    text: 'Get shared deck',
    icon: 'fas fa-cloud-download-alt',
    href: 'https://ankiweb.net/shared/decks/',
  },
  { text: 'Create deck', icon: 'fas fa-folder-plus' },
  { text: 'Add note', icon: 'fas fa-plus' },
])

// Computed properties
const modelOptionDeckId = computed(() => {
  return modalOptionsItem.value?.deck?.id
})

const modelOptionDeckDesc = computed(() => {
  return modalOptionsItem.value?.deck?.desc
})

const modelOptionDeckTitle = computed(() => {
  return modalOptionsItem.value?.deck?.name
})

const deckOptions = computed(() => [
  {
    text: 'Rename',
    dispatch: () => {
      inputRename.value = modelOptionDeckTitle.value
      showModalRename.value = true
    },
  },
  {
    text: 'Export',
    loading: () => loadingOnExport.value,
    dispatch: () => {
      void onExport()
    },
  },
  {
    text: 'Deck options',
    route: '/deck/options',
    routeQuery: { deckid: modelOptionDeckId.value },
  },
  { text: 'Delete', dispatch: () => (showModalDelete.value = true) },
])

async function closeModalOptions() {
  modalOptionsItem.value = null
}

// Methods
function pullToRefresh(): void {
  console.log('refresh list')
  void updateDeckList()
}

async function updateDeckList(): Promise<void> {
  const deckArray = await wankidb.decks.toArray()
  const deckData = await Promise.all(
    deckArray.map(async (deck: any) => {
      const [n, r, l] = await getDueCounts(deck.id)
      return {
        text: deck.name.split('::'),
        ...deck,
        newToday: [deck.newToday?.[0] ?? 0, n],
        revToday: [deck.revToday?.[0] ?? 0, r],
        lrnToday: [deck.lrnToday?.[0] ?? 0, l],
      }
    }),
  )

  const mapper: Record<string, any> = {}
  const root = { children: [] }

  for (const deck of deckData) {
    const splits = deck.name.split('::')
    let path = ''

    splits.reduce((parent: any, id: string, i: number) => {
      path += `${id}`

      if (!mapper[path]) {
        const o: any = { id, deck }
        if (i === splits.length - 1) {
          o.newToday = deck.newToday
          o.revToday = deck.revToday
          o.lrnToday = deck.lrnToday
        }
        mapper[path] = o // set the new object with unique path
        parent.children = parent.children || []
        parent.children.push(o)
      }

      return mapper[path]
    }, root)
  }

  decks.value = root // .children

  console.log(root)
}

async function fetchAllDecks(): Promise<void> {
  idbAllDecks.value = await (await idbDecks).all()
}

async function updateList(): Promise<void> {
  loading.value = true

  await fetchAllDecks()

  decks.value = idbAllDecks.value.map((entry: any) => {
    return {
      id: entry.id,
      text: entry.name,
      desc: entry.tables.col.decks[entry.id].desc,
      decks: entry.tables.col.decks,
    }
  })

  if (modalOptionsItem.value) {
    modalOptionsItem.value = decks.value.find(
      (entry: any) => entry.id === modalOptionsItem.value.id,
    )
  }

  loading.value = false
}

// Toggle debugging mode using refstorage
function toggleDebugging(): void {
  refstorage.toggle('testing.debugging')
}

function onClick(item: any): void {
  switch (item.value) {
    case 'import':
      return onImport()
    default:
      break
  }
}

function onDeck(item: any): void {
  console.log(item)

  void router.push({ path: '/review/on', query: { deckid: item.deck.id } })
}

function onMenu(item: any): void {
  modalOptionsItem.value = item
}

function onImport(): void {
  showModalImport.value = true
}

async function onDelete(): Promise<void> {
  await wankidb.decks.delete(modelOptionDeckId.value)
  // await (await idbDecks).del(modelOptionDeckId.value)
  showModalDelete.value = false

  modalOptionsItem.value = null
}

async function onExport(): Promise<void> {
  loadingOnExport.value = true
  await exportDeck(modelOptionDeckId.value)
  loadingOnExport.value = false
}

async function onRename(): Promise<void> {
  loadingOnRename.value = true

  console.log(sqlDbDeck(modelOptionDeckId.value))

  console.time('get idb decks')
  const decks = JSON.parse(
    (await sqlDeck(modelOptionDeckId.value, 'select decks from col')).decks,
  )
  console.timeEnd('get idb decks')

  console.log(modelOptionDeckId.value, decks)
  decks[modelOptionDeckId.value].name = inputRename.value

  console.log('update', { decks })

  console.time('update sql collection')
  const result = await sqlDeck(
    modelOptionDeckId.value,
    'UPDATE col SET decks = $decks WHERE id = 1',
    {
      $decks: JSON.stringify(decks),
    },
  )
  console.timeEnd('update sql collection')

  console.time('update idb deck parsed')
  await (
    await idbDecks
  ).update(modelOptionDeckId.value, (result: any) => {
    result.name = inputRename.value
    result.tables.col.decks = decks
    return result
  })
  console.timeEnd('update idb deck parsed')

  console.time('save dirty collection to idb')
  await saveDirtySql(modelOptionDeckId.value)
  console.timeEnd('save dirty collection to idb')

  console.log({ result })
  console.log(inputRename.value)

  showModalRename.value = false

  loadingOnRename.value = false
}

function closeImport(): void {
  showModalImport.value = false
}

// Lifecycle hooks
onMounted(async () => {
  // await fetchAllDecks()
  // await updateList()

  await updateDeckList()

  wankidb.decks.hook('creating', function () {
    console.log('creating')
    this.onsuccess = function () {
      void updateDeckList()
    }
  })
  wankidb.decks.hook('deleting', function () {
    console.log('deleting')
    this.onsuccess = function () {
      void updateDeckList()
    }
  })
  wankidb.decks.hook('updating', function () {
    console.log('updating')
    this.onsuccess = function () {
      void updateDeckList()
    }
  })

  document.addEventListener('page/overview/update', updateDeckList)
})

onBeforeUnmount(() => {
  document.removeEventListener('page/overview/update', updateDeckList)
})

// Refresh data when component is re-activated (when navigating back from review)
onActivated(() => {
  void updateDeckList()
})
</script>
