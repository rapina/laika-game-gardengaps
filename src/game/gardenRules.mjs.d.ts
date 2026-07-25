export interface GardenState { section:number; failures:number; frozen:number[]; offsets:number[]; over:boolean; won:boolean; lastSuccess?:boolean }
export const SECTIONS:number
export const STEP_MS:number
export const TARGETS:number[]
export function createState():GardenState
export function preview(state:GardenState,node:number,x:number):{offsets:number[];gap:number;target:number}
export function commit(state:GardenState,node:number,x:number):GardenState
export function step(state:GardenState):GardenState
