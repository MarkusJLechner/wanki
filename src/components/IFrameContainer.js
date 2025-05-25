import {
  h,
  ref,
  createApp,
  onMounted,
  onBeforeUpdate,
  watch,
  onUnmounted,
} from 'vue'

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
    let resizeObserver = null

    // Function to adjust iframe height based on content
    const adjustIframeHeight = () => {
      if (iframeRef.value && iframeBody.value) {
        const height = iframeBody.value.scrollHeight
        iframeRef.value.height = `${height}px`
      }
    }

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

      // Create a ResizeObserver to monitor content size changes
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          adjustIframeHeight()
        })
        resizeObserver.observe(iframeBody.value)
      }

      // Set up a MutationObserver to detect DOM changes
      const mutationObserver = new MutationObserver(() => {
        adjustIframeHeight()
      })

      mutationObserver.observe(iframeBody.value, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      })

      // Initial height adjustment
      adjustIframeHeight()

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
      adjustIframeHeight()
    })

    onUnmounted(() => {
      // Clean up observers
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    })

    return () => h('iframe', { ref: iframeRef })
  },
}
