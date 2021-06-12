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
        <NumberDue :value="item.data.col.newToday[1]" color="blue" />
        <NumberDue :value="item.data.col.revToday[1]" color="red" />
        <NumberDue :value="item.data.col.lrnToday[1]" color="green" />
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
import { database } from 'plugins/storage.js'
import ButtonOptions from 'components/ButtonOptions.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import NumberDue from '@/components/NumberDue.vue'
import ModalOptions from '@/components/ModalOptions.vue'
import ModalDelete from '@/components/ModalDelete.vue'
import BaseModal from '@/components/BaseModal.vue'
import InputTextField from '@/components/InputTextField.vue'

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
      decksDb: null,
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
        { text: 'Delete', dispatch: () => (this.showModalDelete = true) },
      ],
    }
  },

  computed: {
    modelOptionDeckId() {
      return this.modalOptionsItem.data.col.id
    },

    modelOptionDeckDesc() {
      return this.modalOptionsItem.data.col.desc
    },

    modelOptionDeckTitle() {
      return this.modalOptionsItem.text
    },
  },

  async mounted() {
    this.decksDb = await database.decks
    await this.updateList()
    document.addEventListener('page/overview/update', this.updateList)
  },

  beforeUnmount() {
    document.removeEventListener('page/overview/update', this.updateList)
  },

  methods: {
    async updateList() {
      this.closeImport()
      this.loading = true

      this.decks = (await this.decksDb.all()).map((item) => {
        return {
          text: item.name,
          data: {
            col: item.col,
            apkg: item.apkg,
          },
        }
      })

      this.loading = false

      console.log(this.decks)
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
      this.showModalDelete = false
      await this.decksDb.del(this.modelOptionDeckId)
      this.modalOptionsItem = null
    },

    async onRename() {
      const db = await database.sqlLite('decks', this.modelOptionDeckId)
      console.log(db)
      console.log(this.inputRename)
    },

    closeImport() {
      this.showModalImport = false
    },
  },
}
</script>
