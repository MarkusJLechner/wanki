<template>
  <ButtonIcon icon="fas fa-redo-alt" @click="reload" />
</template>

<script>
import ButtonIcon from 'components/ButtonIcon.vue'

export default {
  name: 'ButtonIconReload',

  components: { ButtonIcon },

  methods: {
    reload() {
      location.reload(true)
    },
  },
}
</script>
