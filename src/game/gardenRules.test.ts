import { describe, expect, it } from 'vitest'
// @ts-expect-error Node and the browser deliberately share this native ESM rules module.
import { commit, createState, preview, TARGETS } from './gardenRules.mjs'
describe('garden rules', () => {
  it('is deterministic and linked neighbours follow', () => {
    const a=preview(createState(),3,60), b=preview(createState(),3,60)
    expect(a).toEqual(b); expect(a.offsets[2]).toBeGreaterThan(0)
  })
  it('opens eight sections with visible targets', () => {
    let s=createState()
    for(let i=0;i<8;i++) s=commit(s,3,TARGETS[i])
    expect(s.won).toBe(true); expect(s.section).toBe(8)
  })
  it('hardens a selected reed after a miss', () => {
    const s=commit(createState(),2,-TARGETS[0])
    expect(s.frozen).toContain(2); expect(s.failures).toBe(1)
  })
  it('uses the same visible thirty-unit leaf corridor on every section', () => {
    for (const target of TARGETS) {
      const section = TARGETS.indexOf(target)
      const state = { ...createState(), section }
      expect(commit(state, 3, Math.max(-78, target - 30)).lastSuccess).toBe(true)
      expect(commit(state, 3, Math.min(78, target + 30)).lastSuccess).toBe(true)
      if (target + 31 <= 78) expect(commit(state, 3, target + 31).lastSuccess).toBe(false)
      if (target - 31 >= -78) expect(commit(state, 3, target - 31).lastSuccess).toBe(false)
    }
  })
})
