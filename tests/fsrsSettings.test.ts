// disable eslint rule to allow var for hoisted mocks
/* eslint-disable no-var */
import { describe, it, expect, vi } from 'vitest'
import { generatorParameters } from 'ts-fsrs'

vi.mock('../src/plugins/wankidb/db', () => ({ wankidb: {} }))

var setConf: any
var getConf: any
vi.mock('../src/plugins/collection', () => {
  setConf = vi.fn(async () => ({}))
  getConf = vi.fn(async () => undefined)
  return {
    getConf,
    setConf,
    creationTimestamp: vi.fn(async () => Date.now()),
  }
})

import { getParameters, saveParameters } from '../src/plugins/fsrs'

describe('fsrs parameter storage', () => {
  it('returns defaults when no parameters stored', async () => {
    const params = await getParameters()
    expect(params).toEqual(generatorParameters())
  })

  it('saves parameters via setConf', async () => {
    const params = generatorParameters()
    await saveParameters(params)
    expect(setConf).toHaveBeenCalledWith('fsrs', params)
  })
})
