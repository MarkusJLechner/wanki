<template>
  <ButtonIcon :icon="icon" @click="switchTheme" />
</template>

<script>
import ButtonIcon from 'components/ButtonIcon.vue'
import { refstorage } from 'store/globalstate'
import { watch } from 'vue'

export default {
  components: { ButtonIcon },

  data() {
    return {
      icon: '',
      iconLight: 'far fa-sun',
      iconDark: 'far fa-moon',
    }
  },

  mounted() {
    if (refstorage.get('darkTheme', false)) {
      this.icon = this.iconLight
    } else {
      this.icon = this.iconDark
    }
    watch(refstorage.ref('darkTheme'), (value) => {
      if (value) {
        this.icon = this.iconLight
      } else {
        this.icon = this.iconDark
      }
    })
  },

  methods: {
    switchTheme() {
      refstorage.toggle('darkTheme')
    },
  },
}
</script>

<style scoped></style>
