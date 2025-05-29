import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewDebug from '../../src/components/ReviewDebug.vue'

vi.mock('../../src/components/Promise.vue', () => ({ default: { template: '<div><slot /></div>' } }))

describe('ReviewDebug.vue', () => {
  it('renders deck name', () => {
    const wrapper = mount(ReviewDebug, { props: { card: {}, deck: { name: 'Test' } } })
    expect(wrapper.text()).toContain('Test')
  })
})
