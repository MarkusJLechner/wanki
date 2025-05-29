import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ModalImport from '../../src/components/ModalImport.vue'

vi.mock('../../src/components/BaseModal.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))
vi.mock('../../src/components/InputFile.vue', () => ({
  default: { template: '<input />' },
}))
vi.mock('../../src/components/LoadingIcon.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../src/components/ProgressBar.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('plugins/global', () => ({
  addTask: () => '1',
  finishTask: () => {},
  promiseProgress: () => Promise.resolve(),
  promptFile: () => Promise.resolve(null),
}))
vi.mock('@/plugins/importer', () => ({
  decompressFile: () => ({
    promise: Promise.resolve(null),
    worker: { addEventListener: () => {}, removeEventListener: () => {} },
  }),
}))
vi.mock('@/plugins/idb', () => ({
  importDeck: () => Promise.resolve({}),
  persist: () => Promise.resolve(),
}))

describe('ModalImport.vue', () => {
  it('mounts properly', () => {
    const wrapper = shallowMount(ModalImport)
    expect(wrapper.exists()).toBe(true)
  })
})
