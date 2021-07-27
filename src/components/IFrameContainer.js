import { h, ref, createApp, onMounted, onBeforeUpdate, watch } from 'vue'

export default {
  name: 'IFrameContainer',
  props: {
    css: {
      type: String,
      default: '',
    },

    bodyClass: {
      type: String,
      default: '',
    },
  },

  setup(props, { slots }) {
    const iframeRef = ref(null)
    const iframeBody = ref(null)
    const iframeHead = ref(null)
    const iframeStyle = ref(null)
    let iframeApp = null

    onMounted(() => {
      iframeBody.value = iframeRef.value.contentDocument.body
      iframeHead.value = iframeRef.value.contentDocument.head
      const el = document.createElement('div')
      iframeBody.value.appendChild(el)
      iframeStyle.value = document.createElement('style')
      iframeStyle.value.innerHTML = props.css
      iframeHead.value.appendChild(iframeStyle.value)
      if (props.bodyClass) {
        iframeBody.value.setAttribute('class', props.bodyClass)
      }

      watch(
        () => props.bodyClass,
        (value) => {
          iframeBody.value.setAttribute('class', value)
        },
      )

      iframeApp = createApp({
        name: 'IframeRender',
        setup() {
          return () => slots.default()
        },
      }).mount(el)
    })
    onBeforeUpdate(() => {
      if (!iframeApp || !iframeRef.value) {
        return
      }
      if (props.css) {
        iframeStyle.value.innerHTML = props.css
      }
    })
    return () => h('iframe', { ref: iframeRef })
  },
}
