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

    <List v-else-if="decks.length" :value="decks" @long-press="onMenu">
      <template #suffix-item>
        <NumberDue :value="0" color="blue" />
        <NumberDue :value="2" color="red" />
        <NumberDue :value="2" color="green" />
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

export default {
  name: 'Overview',

  components: {
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
      loading: false,
      showModalImport: false,
    }
  },

  mounted() {
    this.updateList()
    document.addEventListener('page/overview/update', this.updateList)
  },

  unmounted() {
    document.removeEventListener('page/overview/update', this.updateList)
  },

  methods: {
    async updateList() {
      this.closeImport()
      this.loading = true

      const deck = await database.deck

      this.decks = (await deck.all()).map((item) => {
        return {
          text: item.name,
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
      console.log(item)
    },

    onMenu(item) {
      console.log('menu', item)
    },

    onImport() {
      this.showModalImport = true
    },

    closeImport() {
      this.showModalImport = false
    },
  },
}
</script>
