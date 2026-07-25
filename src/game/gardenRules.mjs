export const SECTIONS = 8
export const STEP_MS = 1000 / 60
export const TARGETS = [-58, 46, -34, 62, -50, 30, -66, 54]
export const createState = () => ({ section: 0, failures: 0, frozen: [], offsets: Array(7).fill(0), over: false, won: false })
export function preview(state, node, x) {
    const offsets = [...state.offsets]
    const influence = [0.35, 0.72, 1, 0.72, 0.35]
    for (let d = -2; d <= 2; d++) {
        const i = node + d
        if (i >= 0 && i < offsets.length && !state.frozen.includes(i)) offsets[i] = Math.max(-78, Math.min(78, x * influence[d + 2]))
    }
    const target = TARGETS[state.section] ?? 0
    const gap = 34 + Math.max(0, 62 - Math.abs(offsets[node] - target))
    return { offsets, gap, target }
}
export function commit(state, node, x) {
    if (state.over) return state
    const p = preview(state, node, x)
    const success = p.gap >= 66
    const section = state.section + (success ? 1 : 0)
    const failures = state.failures + (success ? 0 : 1)
    const frozen = success ? state.frozen : [...new Set([...state.frozen, node])]
    const won = section >= SECTIONS
    const over = won || failures >= 3 || frozen.length >= 5
    return { ...state, offsets: p.offsets, section, failures, frozen, won, over, lastSuccess: success }
}
export function step(state) { return state }
