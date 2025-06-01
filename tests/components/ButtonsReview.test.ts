import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonsReview from '../../src/components/ButtonsReview.vue'
import { commonGlobal } from '../common.ts'

describe('ButtonsReview.vue', () => {
  it('emits show event when clicked', async () => {
    const wrapper = mount(ButtonsReview, {
      global: {
        ...commonGlobal,
      },
    })
    await wrapper.find('[role="button"]').trigger('click')
    expect(wrapper.emitted('show')).toBeTruthy()
  })

  it('shows rating buttons when showRating prop is true', () => {
    const wrapper = mount(ButtonsReview, {
      props: { showRating: true },
      global: {
        ...commonGlobal,
      },
    })
    expect(wrapper.findAll('.grid > div').length).toBe(4)
  })

  it('displays due text when showDue is true', () => {
    const wrapper = mount(ButtonsReview, {
      props: {
        showRating: true,
        showDue: true,
        due: ['1m', '6m', '10m', '4d'],
      },
      global: {
        ...commonGlobal,
      },
    })
    const spans = wrapper.findAll('.grid > div span:last-child')
    expect(spans.length).toBe(4)
    expect(spans[0].text()).toBe('1m')
  })
})
