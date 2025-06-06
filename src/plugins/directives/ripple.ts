import type { DirectiveBinding, ObjectDirective } from 'vue'

interface RippleOptions {
  disable?: boolean
  [key: string]: unknown
}

interface RippleProps {
  event: string[]
  eventStop: string[]
  transition: number
}

function setProps(modifiers: string[], props: RippleProps): void {
  modifiers.forEach(function (item) {
    if (isNaN(Number(item))) props.event = [item]
    else props.transition = Number(item)
  })
}

interface RippleDirective
  extends ObjectDirective<HTMLElement, RippleOptions | string> {
  color?: string
}

const Ripple: RippleDirective = {
  mounted: function (
    el: HTMLElement,
    binding: DirectiveBinding<RippleOptions | string>,
  ) {
    // Default values.
    const props: RippleProps = {
      event: ['mousedown', 'touchstart'],
      eventStop: ['click', 'mouseout', 'touchend', 'touchcancel'],
      transition: 300,
    }

    setProps(Object.keys(binding.modifiers), props)
    props.event.forEach((e) =>
      el.addEventListener(
        e,
        function (event: Event) {
          rippler(event, el, binding.value)
        },
        { passive: true },
      ),
    )

    let onClick = false

    let bg = Ripple.color || 'rgba(0, 0, 0, 0.2)'
    if (typeof binding.value !== 'object' && binding.value) {
      bg = binding.value
    }

    let initx = 0
    let inity = 0
    let destx = 0
    let desty = 0
    const thresholdMove = 10

    const move = (e: MouseEvent | TouchEvent) => {
      destx =
        'clientX' in e ? e.clientX : (e.touches && e.touches[0].clientX) || 0
      desty =
        'clientY' in e ? e.clientY : (e.touches && e.touches[0].clientY) || 0
      if (
        Math.abs(initx - destx) > thresholdMove ||
        Math.abs(inity - desty) > thresholdMove
      ) {
        document
          .querySelectorAll('.ripple')
          .forEach(
            (e) =>
              ((e as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0)'),
          )
      }
    }
    ;['mousemove', 'touchmove'].forEach((e) =>
      el.addEventListener(e, move as EventListener, { passive: true }),
    )

    function rippler(
      event: Event,
      el: HTMLElement,
      value?: RippleOptions | string,
    ) {
      if (typeof value === 'object' && value?.disable) {
        return
      }

      const touchEvent = event as TouchEvent
      const mouseEvent = event as MouseEvent

      initx =
        'clientX' in event
          ? mouseEvent.clientX
          : (touchEvent.touches && touchEvent.touches[0].clientX) || 0
      inity =
        'clientY' in event
          ? mouseEvent.clientY
          : (touchEvent.touches && touchEvent.touches[0].clientY) || 0
      destx = initx
      desty = inity

      if (onClick) {
        return
      }
      onClick = true
      const target = el
      // Get border to avoid offsetting on ripple container position
      const targetBorder = parseInt(
        getComputedStyle(target).borderWidth.replace('px', ''),
      )

      // Get necessary variables
      const rect = target.getBoundingClientRect(),
        left = rect.left,
        top = rect.top,
        width = target.offsetWidth,
        height = target.offsetHeight,
        dx =
          ('clientX' in event
            ? mouseEvent.clientX
            : (touchEvent.touches && touchEvent.touches[0].clientX) || 0) -
          left,
        dy =
          ('clientY' in event
            ? mouseEvent.clientY
            : (touchEvent.touches && touchEvent.touches[0].clientY) || 0) - top,
        maxX = Math.max(dx, width - dx),
        maxY = Math.max(dy, height - dy),
        style = window.getComputedStyle(target),
        radius = Math.sqrt(maxX * maxX + maxY * maxY),
        border = targetBorder > 0 ? targetBorder : 0

      // Create the ripple and its container
      const ripple = document.createElement('div'),
        rippleContainer = document.createElement('div')
      rippleContainer.className = 'ripple-container'
      ripple.className = 'ripple'

      //Styles for ripple
      ripple.style.marginTop = '0px'
      ripple.style.marginLeft = '0px'
      ripple.style.width = '1px'
      ripple.style.height = '1px'
      ripple.style.transition =
        'all ' + props.transition + 'ms cubic-bezier(0.4, 0, 0.2, 1)'
      ripple.style.borderRadius = '50%'
      ripple.style.pointerEvents = 'none'
      ripple.style.position = 'relative'
      ripple.style.zIndex = style.zIndex
      ripple.style.backgroundColor = bg

      //Styles for rippleContainer
      rippleContainer.style.position = 'absolute'
      rippleContainer.style.left = 0 - border + 'px'
      rippleContainer.style.top = 0 - border + 'px'
      rippleContainer.style.height = '0'
      rippleContainer.style.width = '0'
      rippleContainer.style.pointerEvents = 'none'
      rippleContainer.style.overflow = 'hidden'

      // Store target position to change it after
      const storedTargetPosition =
        target.style.position.length > 0
          ? target.style.position
          : getComputedStyle(target).position
      // Change target position to relative to guarantee ripples correct positioning
      if (storedTargetPosition !== 'relative') {
        target.style.position = 'relative'
      }

      rippleContainer.appendChild(ripple)
      target.appendChild(rippleContainer)

      ripple.style.marginLeft = dx + 'px'
      ripple.style.marginTop = dy + 'px'

      // No need to set positioning because ripple should be child of target and to it's relative position.
      // rippleContainer.style.left    = left + (((window.pageXOffset || document.scrollLeft) - (document.clientLeft || 0)) || 0) + "px";
      // rippleContainer.style.top     = top + (((window.pageYOffset || document.scrollTop) - (document.clientTop || 0)) || 0) + "px";
      rippleContainer.style.width = width + 'px'
      rippleContainer.style.height = height + 'px'
      rippleContainer.style.borderTopLeftRadius = style.borderTopLeftRadius
      rippleContainer.style.borderTopRightRadius = style.borderTopRightRadius
      rippleContainer.style.borderBottomLeftRadius =
        style.borderBottomLeftRadius
      rippleContainer.style.borderBottomRightRadius =
        style.borderBottomRightRadius

      rippleContainer.style.direction = 'ltr'

      setTimeout(function () {
        ripple.style.width = radius * 2 + 'px'
        ripple.style.height = radius * 2 + 'px'
        ripple.style.marginLeft = dx - radius + 'px'
        ripple.style.marginTop = dy - radius + 'px'
      }, 0)

      function clearRipple() {
        setTimeout(function () {
          ripple.style.backgroundColor = 'rgba(0, 0, 0, 0)'
          onClick = false
        }, 250)

        // Timeout set to get a smooth removal of the ripple
        setTimeout(function () {
          rippleContainer.parentNode?.removeChild(rippleContainer)
        }, 850)

        props.eventStop.forEach((e) =>
          el.removeEventListener(e, clearRipple, false),
        )

        // After removing event set position to target to it's original one
        // Timeout it's needed to avoid jerky effect of ripple jumping out parent target
        setTimeout(function () {
          let clearPosition = true
          for (let i = 0; i < target.childNodes.length; i++) {
            const node = target.childNodes[i]
            if (
              node instanceof Element &&
              node.className === 'ripple-container'
            ) {
              clearPosition = false
            }
          }

          if (clearPosition) {
            if (storedTargetPosition !== 'static') {
              target.style.position = storedTargetPosition
            } else {
              target.style.position = ''
            }
          }
        }, props.transition + 250)
      }

      if (props.event.includes(event.type)) {
        props.eventStop.forEach((e) =>
          el.addEventListener(e, clearRipple, false),
        )
      } else {
        clearRipple()
      }
    }
  },
}

export default Ripple
