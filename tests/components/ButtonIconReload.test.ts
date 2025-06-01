import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonIconReload from '../../src/components/ButtonIconReload.vue'
import { commonGlobal } from '../common.ts'

describe('ButtonIconReload.vue', () => {
  it('calls location.reload on click', async () => {
    const reload = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...original, reload },
      writable: true,
    })

    const wrapper = mount(ButtonIconReload, {
      global: {
        ...commonGlobal,
      },
    })
    await wrapper.trigger('click')
    expect(reload).toHaveBeenCalled()

    Object.defineProperty(window, 'location', { value: original })
  })
})
