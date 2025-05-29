import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewContainer from '../../src/components/ReviewContainer.vue'

vi.mock('../../src/components/IFrameContainer', () => ({
  default: { template: '<div class="iframe" />' },
}))
vi.mock('../../src/components/ReviewMedia.vue', () => ({
  default: { template: '<div class="review-media" />' },
}))
vi.mock('../../src/store/globalstate', () => ({
  refstorage: { get: () => false },
}))

describe('ReviewContainer.vue', () => {
  it('renders iframe container', () => {
    const wrapper = mount(ReviewContainer)
    expect(wrapper.find('.iframe').exists()).toBe(true)
  })
})
