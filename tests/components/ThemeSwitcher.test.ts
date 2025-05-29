import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import ThemeSwitcher from '../../src/components/ThemeSwitcher.vue'

vi.mock('../../src/components/ButtonIcon.vue', () => ({ default: { template: '<button class="btn" @click="$emit(\'click\')" />' } }))
vi.mock('../../src/store/globalstate', () => ({
  refstorage: {
    get: vi.fn().mockReturnValue(false),
    toggle: vi.fn(),
    ref: vi.fn().mockReturnValue(ref(false))
  }
}))

describe('ThemeSwitcher.vue', () => {
  it('toggles theme on click', async () => {
    const { refstorage } = await import('../../src/store/globalstate')
    const wrapper = mount(ThemeSwitcher)
    await wrapper.find('.btn').trigger('click')
    await flushPromises()
    expect(refstorage.toggle).toHaveBeenCalledWith('darkTheme')
  })
})
