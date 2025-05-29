import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import HelloWorld from '../../src/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('commits increment when button clicked', async () => {
    const commit = vi.fn()
    const store = createStore({ mutations: { increment: commit } })
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hi' },
      global: { plugins: [store] },
    })
    await wrapper.find('button').trigger('click')
    expect(commit).toHaveBeenCalled()
  })
})
