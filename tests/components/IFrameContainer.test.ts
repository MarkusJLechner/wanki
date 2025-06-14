import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, createApp: vi.fn(() => ({ mount: vi.fn() })) }
})

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class {
    observe() {}
    disconnect() {}
  },
})
Object.defineProperty(window, 'MutationObserver', {
  writable: true,
  value: class {
    observe() {}
    disconnect() {}
  },
})
Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentDocument', {
  writable: true,
  value: {
    body: { appendChild: vi.fn(), scrollHeight: 0 },
    head: { appendChild: vi.fn() },
  },
})
Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
  writable: true,
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

const IFrameContainer = (
  await import('../../src/components/IFrameContainer.js')
).default

describe('IFrameContainer', () => {
  it('renders iframe element', () => {
    const wrapper = mount(IFrameContainer, { slots: { default: '<div />' } })
    expect(wrapper.find('iframe').exists()).toBe(true)
  })
})
