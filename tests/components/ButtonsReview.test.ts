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
})
