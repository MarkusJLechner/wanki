import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TheHeader from '../../src/components/TheHeader.vue'

// Mock components
vi.mock('../../src/components/Sidepanel.vue', () => ({
  default: { template: '<div class="sidepanel" />' },
}))
vi.mock('../../src/components/ButtonIcon.vue', () => ({
  default: { template: '<button class="back" @click="$emit(\'click\')" />' },
}))
vi.mock('../../src/components/SidepanelHeader.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('@/plugins/wankidb/db', () => ({ wipeDatabase: vi.fn() }))

// Mock router outside the test
const back = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ back }) }))

describe('TheHeader.vue', () => {
  it('calls router.back when back button clicked', async () => {
    // Reset mock before test
    back.mockReset()

    const wrapper = mount(TheHeader, { props: { backButton: true } })
    await wrapper.find('.back').trigger('click')
    expect(back).toHaveBeenCalled()
  })
})
