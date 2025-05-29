import { describe, it, expect } from 'vitest'
import { getMediaFromNote, replaceMediaFromNote, replaceAsync, getFileMimeType } from '../src/plugins/global'


describe('global utility functions', () => {
  it('extracts media tags from note text', () => {
    const text = 'hello [image:pic.png] and [sound:audio.mp3]'
    const result = getMediaFromNote(text)
    expect(result).toEqual([
      { type: 'image', media: 'pic.png' },
      { type: 'sound', media: 'audio.mp3' },
    ])
  })

  it('replaces media tags in note text', () => {
    const text = 'hi [image:foo.png]'
    expect(replaceMediaFromNote(text, '<x>')).toBe('hi <x>')
  })

  it('replaceAsync performs asynchronous replacements', async () => {
    const result = await replaceAsync('a1b2', /\d/g, async (m) => String(Number(m) + 1))
    expect(result).toBe('a2b3')
  })

  it('detects mime type from byte header', () => {
    expect(getFileMimeType(Uint8Array.from([0x89,0x50,0x4e,0x47]))).toBe('image/png')
    expect(getFileMimeType(Uint8Array.from([0xff,0xd8,0xff,0xe0]))).toBe('image/jpeg')
    expect(getFileMimeType(Uint8Array.from([0x00,0x00,0x00,0x00]))).toBe('audio/mp3')
  })
})
