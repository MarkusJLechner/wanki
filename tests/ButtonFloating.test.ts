import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ButtonFloating from '../src/components/ButtonFloating.vue'

// Mock the vue-router functionality
vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
}))

// Register a mock ripple directive
const mockRipple = {
  mounted: () => {},
  unmounted: () => {},
}

describe('ButtonFloating', () => {
  it('renders menu items and handles click interactions correctly', async () => {
    const wrapper = mount(ButtonFloating, {
      props: {
        modelValue: [
          { text: 'Item 1', icon: 'fas fa-star' },
          { text: 'Item 2', icon: 'fas fa-cog' },
        ],
      },
      global: {
        directives: {
          ripple: mockRipple,
        },
      },
    })

    // Test initial closed state
    const button = wrapper.find('button[data-test="floating-button"]')
    expect(button.exists()).toBe(true)
    expect(wrapper.find('[data-test="menu"]').exists()).toBe(false)

    // Test menu opens on click
    await button.trigger('click')
    await nextTick()

    const menu = wrapper.find('[data-test="menu"]')
    expect(menu.exists()).toBe(true)

    // Test menu items are rendered correctly
    const menuItems = wrapper.findAll('[data-test="menu-item"]')
    expect(menuItems).toHaveLength(2)
    expect(menuItems[0].text()).toBe('Item 1')
    expect(menuItems[1].text()).toBe('Item 2')

    // Test menu closes on second click
    await button.trigger('click')
    await nextTick()
    expect(wrapper.find('[data-test="menu"]').exists()).toBe(false)
  })
})
