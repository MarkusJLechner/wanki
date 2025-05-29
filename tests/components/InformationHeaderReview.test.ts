import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InformationHeaderReview from '../../src/components/InformationHeaderReview.vue'

vi.mock('../../src/components/NumberDue.vue', () => ({ default: { template: '<span />' } }))

describe('InformationHeaderReview.vue', () => {
  it('renders timer prop', () => {
    const wrapper = mount(InformationHeaderReview, { props: { timer: '00:10' } })
    expect(wrapper.text()).toContain('00:10')
  })
})
