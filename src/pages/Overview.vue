<template>
  <div @dragover="onImport">
    <TheHeader title="Overview">
      <FlexSpacer />
      <ThemeSwitcher />
      <ButtonOptions
        :value="[
          { value: 'create-filtered-deck', text: 'Create filtered deck' },
          { value: 'check-database', text: 'Check database' },
          { value: 'check-media', text: 'Check media' },
          { value: 'empty-cards', text: 'Empty cards' },
          { value: 'restore-from-backup', text: 'Restore from backup' },
          { value: 'manage-note-types', text: 'Manage note types' },
          { value: 'import', text: 'Import' },
          { value: 'export-collection', text: 'Export collection' },
        ]"
        @item="onClick"
      />
    </TheHeader>

    <ModalImport v-model="showModalImport" />

    <span v-if="loading" class="p-4"
      >Loading decks <loading-icon class="ml-2" />
    </span>

    <List
      v-else-if="decks.length"
      no-gutters
      :value="decks"
      @long-press="onMenu"
    >
      <template #suffix-item="{ item }">
        <NumberDue
          :value="item.tables.col.decks[item.id].newToday[1]"
          color="blue"
        />
        <NumberDue
          :value="item.tables.col.decks[item.id].revToday[1]"
          color="red"
        />
        <NumberDue
          :value="item.tables.col.decks[item.id].lrnToday[1]"
          color="green"
        />
      </template>
    </List>

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
      @confirm="onRename"
      @close="showModalRename = false"
    >
      <input-text-field v-model="inputRename" v-autofocus label="New name" />
    </BaseModal>
  </div>
</template>

<script>
import List from 'components/List.vue'
import ModalImport from 'components/ModalImport.vue'
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import { idb, idbDecks, saveDirtySql } from '@/plugins/idb.js'
import ButtonOptions from 'components/ButtonOptions.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import NumberDue from '@/components/NumberDue.vue'
import ModalOptions from '@/components/ModalOptions.vue'
import ModalDelete from '@/components/ModalDelete.vue'
import BaseModal from '@/components/BaseModal.vue'
import InputTextField from '@/components/InputTextField.vue'
import { sqlDbDeck, sqlDeck } from '@/plugins/sql.js'
import { exportDeck } from '@/plugins/exporter.js'

export default {
  name: 'Overview',

  components: {
    InputTextField,
    BaseModal,
    ModalDelete,
    ModalOptions,
    NumberDue,
    LoadingIcon,
    ButtonOptions,
    TheHeader,
    List,
    ModalImport,
    ThemeSwitcher,
    FlexSpacer,
  },

  data() {
    return {
      decks: [],
      idbAllDecks: null,
      loading: false,
      showModalImport: false,
      showModalDelete: false,
      showModalRename: false,
      inputRename: '',
      modalOptionsItem: null,
      deckOptions: [
        {
          text: 'Rename',
          dispatch: () => {
            this.inputRename = this.modelOptionDeckTitle
            this.showModalRename = true
          },
        },
        {
          text: 'Export',
          dispatch: () => {
            this.onExport()
          },
        },
        { text: 'Delete', dispatch: () => (this.showModalDelete = true) },
      ],
    }
  },

  computed: {
    modelOptionDeckId() {
      return this.modalOptionsItem.id
    },

    modelOptionDeckDesc() {
      return this.modalOptionsItem.desc
    },

    modelOptionDeckTitle() {
      return this.modalOptionsItem.text
    },
  },

  async mounted() {
    await this.fetchAllDecks()

    await this.updateList()
    document.addEventListener('page/overview/update', this.updateList)
  },

  beforeUnmount() {
    document.removeEventListener('page/overview/update', this.updateList)
  },

  methods: {
    async fetchAllDecks() {
      this.idbAllDecks = await (await idbDecks).all()
    },

    async updateList() {
      this.closeImport()

      this.loading = true

      await this.fetchAllDecks()

      this.decks = this.idbAllDecks.map((entry) => {
        return {
          text: entry.name,
          desc: entry.tables.col.decks[entry.id].desc,
          ...entry,
        }
      })

      this.loading = false
    },

    onClick(item) {
      switch (item.value) {
        case 'import':
          return this.onImport()
        default:
          break
      }
    },

    onMenu(item) {
      this.modalOptionsItem = item
    },

    onImport() {
      this.showModalImport = true
    },

    async onDelete() {
      await (await idbDecks).del(this.modelOptionDeckId)
      this.showModalDelete = false

      this.modalOptionsItem = null
    },

    async onExport() {
      console.log('on export')
      const result = await exportDeck(this.modelOptionDeckId)
      console.log(result)
    },

    async onRename() {
      console.log(sqlDbDeck(this.modelOptionDeckId))

      console.time('get idb decks')
      const decks = JSON.parse(
        (await sqlDeck(this.modelOptionDeckId, 'select decks from col')).decks,
      )
      console.timeEnd('get idb decks')

      console.log(this.modelOptionDeckId, decks)
      decks[this.modelOptionDeckId].name = this.inputRename

      console.log('update', { decks })

      console.time('update sql collection')
      const result = await sqlDeck(
        this.modelOptionDeckId,
        'UPDATE col SET decks = $decks WHERE id = 1',
        {
          $decks: JSON.stringify(decks),
        },
      )
      console.timeEnd('update sql collection')

      console.time('update idb deck parsed')
      await (
        await idbDecks
      ).update(this.modelOptionDeckId, (result) => {
        result.name = this.inputRename
        result.tables.col.decks = decks
        return result
      })
      console.timeEnd('update idb deck parsed')

      console.time('save dirty collection to idb')
      await saveDirtySql(this.modelOptionDeckId)
      console.timeEnd('save dirty collection to idb')

      console.log({ result })
      console.log(this.inputRename)

      this.showModalRename = false
    },

    closeImport() {
      this.showModalImport = false
    },
  },
}
</script>
