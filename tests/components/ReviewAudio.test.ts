import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ReviewAudio from '../../src/components/ReviewAudio.vue'

vi.mock('../../src/store/globalstate', () => ({
  refstorage: { getSetting: vi.fn().mockReturnValue(false) },
}))
vi.mock('../../src/plugins/defaultSettings', () => ({
  defaultSettings: {
    reviewing: { audioControls: '', autoPlayAudio: '', autoPlayAudioDelay: '' },
  },
}))
vi.mock('../../src/plugins/global', () => ({
  getFileMimeType: () => 'audio/mp3',
  sleep: () => Promise.resolve(),
}))
vi.mock('../../src/plugins/wankidb/db', () => ({
  wankidb: { media: { get: vi.fn().mockResolvedValue(null) } },
}))

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  value: vi.fn(),
})
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  value: vi.fn().mockResolvedValue(undefined),
})

describe('ReviewAudio.vue', () => {
  it('sets audio source from objectUrl', async () => {
    const wrapper = mount(ReviewAudio, {
      props: { objectUrl: 'foo', autoplay: false },
    })
    await flushPromises()
    expect((wrapper.find('audio').element as HTMLAudioElement).src).toContain(
      'foo',
    )
  })
})
