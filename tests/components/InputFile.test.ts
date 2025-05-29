import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputFile from '../../src/components/InputFile.vue'

describe('InputFile.vue', () => {
  it('emits selected files', async () => {
    const wrapper = mount(InputFile)
    const input = wrapper.find('input')
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('input')
    expect(wrapper.emitted('select')?.[0][0][0]).toBe(file)
  })
})
