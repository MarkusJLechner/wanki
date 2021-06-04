<template>
  <div>
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

    <h1>Overview</h1>
  </div>
</template>

<script>
import TheHeader from 'components/TheHeader.vue'
import FlexSpacer from 'components/FlexSpacer.vue'
import ThemeSwitcher from 'components/ThemeSwitcher.vue'
import ButtonOptions from 'components/ButtonOptions.vue'
import ModalImport from 'components/ModalImport.vue'

export default {
  components: {
    ModalImport,
    ButtonOptions,
    ThemeSwitcher,
    FlexSpacer,
    TheHeader,
  },

  data() {
    return {
      showModalImport: false,
    }
  },

  methods: {
    onClick(item) {
      switch (item.value) {
      case 'import':
        return this.onImport()
      default:
        break
      }
      console.log(item)
    },

    async onImport() {
      this.showModalImport = true
    },
  },
}
</script>
