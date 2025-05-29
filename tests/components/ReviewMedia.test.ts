import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReviewMedia from '../../src/components/ReviewMedia.vue'

vi.mock('../../src/components/ReviewAudio.vue', () => ({
  default: { template: '<div class="audio" />' },
}))
vi.mock('../../src/store/globalstate', () => ({
  refstorage: { getSetting: () => false },
}))
vi.mock('../../src/plugins/defaultSettings', () => ({
  defaultSettings: { reviewing: { alignAudioButtonsRight: '' } },
}))

describe('ReviewMedia.vue', () => {
  it('renders one component per media entry', () => {
    const list = [
      { name: 'a', media: 'a' },
      { name: 'b', media: 'b' },
    ]
    const wrapper = mount(ReviewMedia, { props: { mediaList: list } })
    expect(wrapper.findAll('.audio').length).toBe(2)
  })
})
