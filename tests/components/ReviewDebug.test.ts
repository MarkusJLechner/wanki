import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewDebug from '../../src/components/ReviewDebug.vue'
import i18n from '../../src/plugins/i18n'

vi.mock('../../src/components/Promise.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))

describe('ReviewDebug.vue', () => {
  it('renders deck name', () => {
    const wrapper = mount(ReviewDebug, {
      props: { card: {}, deck: { name: 'Test' } },
      global: { plugins: [i18n] },
    })
    expect(wrapper.text()).toContain('Test')
  })
})
