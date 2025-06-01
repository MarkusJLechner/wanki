import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonRound from '../../src/components/ButtonRound.vue'
import { commonGlobal } from '../common.ts'

describe('ButtonRound.vue', () => {
  it('uses default size when not small', () => {
    const wrapper = mount(ButtonRound, {
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.classes()).toContain('h-14')
  })

  it('uses small size when small=true', () => {
    const wrapper = mount(ButtonRound, {
      props: { small: true },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.classes()).toContain('h-11')
  })
})
