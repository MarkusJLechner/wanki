import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonRound from '../../src/components/ButtonRound.vue'

describe('ButtonRound.vue', () => {
  it('uses default size when not small', () => {
    const wrapper = mount(ButtonRound)
    expect(wrapper.classes()).toContain('h-14')
  })

  it('uses small size when small=true', () => {
    const wrapper = mount(ButtonRound, { props: { small: true } })
    expect(wrapper.classes()).toContain('h-11')
  })
})
