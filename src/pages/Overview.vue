<template>
  <div @dragover="onImport">
    <TheHeader title="Overview">
      <FlexSpacer />
      <ButtonIconReload />
      <ThemeSwitcher />
      <ButtonOptions
        :value="[
          { value: 'import', text: 'Import' },
          { value: 'export-collection', text: 'Export collection' },
        ]"
        @item="onClick"
      />
    </TheHeader>

    <ButtonFloating :model-value="optionsFloating" />

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

      <span v-else class="p-4 leading-10 block"
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
        @close="modalOptionsItem = null"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import List from '@/components/List.vue'
import ModalImport from '@/components/ModalImport.vue'
import TheHeader from '@/components/TheHeader.vue'
import FlexSpacer from '@/components/FlexSpacer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { idbDecks, saveDirtySql } from '@/plugins/idb.js'
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
const inputRename = ref('')
const modalOptionsItem = ref<any>(null)
const optionsFloating = ref([
  {
    text: 'Get shared deck',
    icon: 'fas fa-cloud-download-alt',
    href: 'https://ankiweb.net/shared/decks/',
  },
  { text: 'Create deck', icon: 'fas fa-folder-plus' },
  { text: 'Add note', icon: 'fas fa-plus' },
])
const deckOptions = ref([
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
      onExport()
    },
  },
  { text: 'Delete', dispatch: () => (showModalDelete.value = true) },
])

// Computed properties
const modelOptionDeckId = computed(() => {
  return modalOptionsItem.value?.id
})

const modelOptionDeckDesc = computed(() => {
  return modalOptionsItem.value?.desc
})

const modelOptionDeckTitle = computed(() => {
  return modalOptionsItem.value?.text
})

// Methods
function pullToRefresh(): void {
  console.log('refresh list')
  updateDeckList()
}

async function updateDeckList(): Promise<void> {
  const deckArray = await wankidb.decks.toArray()
  decks.value = deckArray.map((deck: any) => {
    return {
      text: deck.name.split('::'),
      ...deck,
    }
  })

  const mapper: Record<string, any> = {}
  let root = { children: [] }

  for (const deck of decks.value) {
    let splits = deck.name.split('::'),
      path = ''

    splits.reduce((parent: any, id: string, i: number) => {
      path += `${id}`

      if (!mapper[path]) {
        const o = { id, deck }
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

  router.push({ path: '/review/on', query: { deckid: item.deck.id } })
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
      updateDeckList()
    }
  })
  wankidb.decks.hook('deleting', function () {
    console.log('deleting')
    this.onsuccess = function () {
      updateDeckList()
    }
  })
  wankidb.decks.hook('updating', function () {
    console.log('updating')
    this.onsuccess = function () {
      updateDeckList()
    }
  })

  document.addEventListener('page/overview/update', updateDeckList)
})

onBeforeUnmount(() => {
  document.removeEventListener('page/overview/update', updateDeckList)
})
</script>
