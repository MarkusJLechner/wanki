import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { h } from 'vue'
import PromiseComponent from '../../src/components/Promise.vue'

describe('Promise.vue', () => {
  it('exposes result when promise resolves', async () => {
    let resolveFn: (v: string) => void = () => {}
    const promise = new Promise<string>((resolve) => { resolveFn = resolve })

    const wrapper = mount(PromiseComponent, {
      props: { promise },
      slots: {
        default: ({ result, loading }: any) =>
          h('div', [
            h('div', { class: 'result' }, result),
            h('div', { class: 'loading' }, String(loading)),
          ]),
      },
    })

    expect(wrapper.find('.loading').text()).toBe('true')
    resolveFn('done')
    await promise
    await flushPromises()
    expect(wrapper.find('.result').text()).toBe('done')
    expect(wrapper.find('.loading').text()).toBe('false')
  })
})
