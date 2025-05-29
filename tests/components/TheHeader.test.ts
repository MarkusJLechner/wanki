import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('../../src/components/Sidepanel.vue', () => ({ default: { template: '<div class="sidepanel" />' } }))
vi.mock('../../src/components/ButtonIcon.vue', () => ({ default: { template: '<button class="back" @click="$emit(\'click\')" />' } }))
vi.mock('../../src/components/SidepanelHeader.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/plugins/wankidb/db', () => ({ wipeDatabase: vi.fn() }))

describe('TheHeader.vue', () => {
  it('calls router.back when back button clicked', async () => {
    const back = vi.fn()
    vi.doMock('vue-router', () => ({ useRouter: () => ({ back }) }))
    const { default: TheHeader } = await import('../../src/components/TheHeader.vue')
    const wrapper = mount(TheHeader, { props: { backButton: true } })
    await wrapper.find('.back').trigger('click')
    expect(back).toHaveBeenCalled()
  })
})
