import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonActions from '../../src/components/ButtonActions.vue'
import { commonGlobal } from '../common.ts'

vi.mock('../../src/components/Spacer.vue', () => ({
  default: { template: '<div />' },
}))

describe('ButtonActions.vue', () => {
  it('shows confirm and cancel buttons', () => {
    const wrapper = mount(ButtonActions, {
      props: { confirm: true, loading: false },
      global: {
        ...commonGlobal,
      },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
    expect(wrapper.text()).toContain('Confirm')
    expect(wrapper.text()).toContain('Cancel')
  })

  it('emits confirm on click', async () => {
    const wrapper = mount(ButtonActions, {
      props: { confirm: true, loading: false },
      global: {
        ...commonGlobal,
      },
    })
    const confirmButton = wrapper.findAll('button')[1]
    await confirmButton.trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })
})
