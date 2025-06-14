import {
  h,
  ref,
  createApp,
  onMounted,
  onBeforeUpdate,
  watch,
  onUnmounted,
} from 'vue'
import type { Ref, PropType, SetupContext, ComponentPublicInstance } from 'vue'

export default {
  name: 'IFrameContainer',
  props: {
    css: {
      type: String as PropType<string>,
      default: '',
    },

    bodyClass: {
      type: String as PropType<string>,
      default: '',
    },
  },

  setup(props: { css: string; bodyClass: string }, { slots }: SetupContext) {
    const iframeRef: Ref<HTMLIFrameElement | null> = ref(null)
    const iframeBody: Ref<HTMLElement | null> = ref(null)
    const iframeHead: Ref<HTMLElement | null> = ref(null)
    const iframeStyle: Ref<HTMLStyleElement | null> = ref(null)
    let iframeApp: ComponentPublicInstance | null = null
    let resizeObserver: ResizeObserver | null = null
    const boundListeners: [string, EventListener][] = []

    // Function to adjust iframe height based on content
    const adjustIframeHeight = (): void => {
      if (iframeRef.value && iframeBody.value) {
        const height = iframeBody.value.scrollHeight
        iframeRef.value.height = `${height}px`
      }
    }

    onMounted(() => {
      if (!iframeRef.value || !iframeRef.value.contentDocument) return

      iframeBody.value = iframeRef.value.contentDocument.body
      iframeHead.value = iframeRef.value.contentDocument.head

      // Forward touch events from the iframe to the parent document so that
      // global swipe gestures still work when interacting with the iframe.
      const forwardTouch = (e: TouchEvent) => {
        const event = new TouchEvent(e.type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          touches: e.touches,
          targetTouches: e.targetTouches,
          changedTouches: e.changedTouches,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
        })
        document.dispatchEvent(event)
      }

      ;['touchstart', 'touchmove', 'touchend'].forEach((evt) => {
        iframeRef.value!.contentWindow!.addEventListener(evt, forwardTouch, {
          passive: true,
        })
        boundListeners.push([evt, forwardTouch])
      })

      const el = document.createElement('div')
      if (iframeBody.value) {
        iframeBody.value.appendChild(el)
      }

      iframeStyle.value = document.createElement('style')
      iframeStyle.value.innerHTML = props.css

      if (iframeHead.value) {
        iframeHead.value.appendChild(iframeStyle.value)
      }

      if (props.bodyClass && iframeBody.value) {
        iframeBody.value.setAttribute('class', props.bodyClass)
      }

      watch(
        () => props.bodyClass,
        (value) => {
          if (iframeBody.value) {
            iframeBody.value.setAttribute('class', value)
          }
        },
      )

      // Create a ResizeObserver to monitor content size changes
      if (window.ResizeObserver && iframeBody.value) {
        resizeObserver = new ResizeObserver(() => {
          adjustIframeHeight()
        })
        resizeObserver.observe(iframeBody.value)
      }

      // Set up a MutationObserver to detect DOM changes
      if (iframeBody.value) {
        const mutationObserver = new MutationObserver(() => {
          adjustIframeHeight()
        })

        mutationObserver.observe(iframeBody.value, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        })
      }

      // Initial height adjustment
      adjustIframeHeight()

      iframeApp = createApp({
        name: 'IframeRender',
        setup() {
          return () => slots.default && slots.default()
        },
      }).mount(el)
    })

    onBeforeUpdate(() => {
      if (!iframeApp || !iframeRef.value || !iframeStyle.value) {
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

      if (iframeRef.value && boundListeners.length) {
        boundListeners.forEach(([evt, listener]) => {
          iframeRef.value!.contentWindow!.removeEventListener(evt, listener)
        })
      }
    })

    return () => h('iframe', { ref: iframeRef })
  },
}
