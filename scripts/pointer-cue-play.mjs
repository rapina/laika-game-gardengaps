import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { setTimeout as delay } from 'node:timers/promises'
import { sourceHash } from './source-hash.mjs'

const port=4186
const dev=spawn('npm',['run','dev','--','--host','127.0.0.1','--port',String(port),'--force'],{stdio:'ignore',detached:true,shell:true})
const stop=()=>{try{process.kill(-dev.pid,'SIGKILL')}catch{}}
async function wait(){for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/`)).ok)return}catch{}await delay(200)}throw Error('server timeout')}
async function readLeafCue(page){
  const shot=await page.locator('canvas').screenshot()
  return page.evaluate(async(base64)=>{
    const image=new Image();image.src=`data:image/png;base64,${base64}`;await image.decode()
    const c=document.createElement('canvas');c.width=image.width;c.height=image.height
    const x=c.getContext('2d');x.drawImage(image,0,0);const p=x.getImageData(0,0,c.width,c.height).data
    const ys=[Math.floor(c.height*425/844),Math.ceil(c.height*455/844)]
    let sum=0,n=0
    const hist=Array(390).fill(0)
    for(let y=ys[0];y<=ys[1];y++)for(let xx=0;xx<c.width;xx++){const k=(y*c.width+xx)*4,r=p[k],g=p[k+1],b=p[k+2];if(g>135&&b>120&&r<90){sum+=xx;n++;hist[Math.min(389,Math.floor(xx*390/c.width))]++}}
    if(n<20)throw Error(`leaf cue not found: ${n}`)
    let targetOffset=0,best=-1
    for(let t=-78;t<=78;t++){let score=0;for(let i=0;i<7;i++)for(const edge of [Math.max(-78,t-30),Math.min(78,t+30)]){const at=Math.round(62+i*44+edge*.65);for(let d=-5;d<=5;d++)score+=hist[at+d]??0}if(score>best){best=score;targetOffset=t}}
    return {pixels:n,targetOffset}
  },shot.toString('base64'))
}
async function drag(page,node,target){
  const box=await page.locator('canvas').boundingBox();const scale=box.width/390
  const center=await page.evaluate((i)=>globalThis.__gardenVisibleNodeCenters[i],node)
  const y=box.y+440*scale
  const startX=box.x+center.x*scale
  await page.mouse.move(startX,y);await page.mouse.down();await page.mouse.move(startX+target*scale,y,{steps:8});await page.mouse.up();await delay(650)
}
try{
 await wait();const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']})
 const page=await browser.newPage({viewport:{width:390,height:844}})
 await page.goto(`http://127.0.0.1:${port}/autoplay.html?lang=en`);await page.waitForSelector('canvas');await delay(500)
 const first=await readLeafCue(page)
 // A natural short movement misses once. The intensified wet-leaf correction is then reread from pixels.
 const short=Math.sign(first.targetOffset)*12
 await drag(page,0,short)
 const afterMiss=await page.evaluate(()=>globalThis.__gameState)
 const correction=await readLeafCue(page)
 const observations=[{gesture:'natural-short',section:afterMiss.section,failures:afterMiss.failures,cuePixels:correction.pixels,cueOffset:+correction.targetOffset.toFixed(1)}]
 for(let guard=0;guard<10;guard++){
   const state=await page.evaluate(()=>globalThis.__gameState)
   if(state.over)break
   const cue=await readLeafCue(page)
   const intended=Math.max(-78,Math.min(78,cue.targetOffset+Math.sign(cue.targetOffset)*20))
   await drag(page,6,intended)
   const next=await page.evaluate(()=>globalThis.__gameState)
   observations.push({gesture:'cue-centred-pointer',section:next.section,failures:next.failures,cuePixels:cue.pixels,cueOffset:+cue.targetOffset.toFixed(1)})
 }
 const final=await page.evaluate(()=>globalThis.__gameState)
 const firstRecovery=observations.findIndex((o)=>o.section>0)
 const result={sourceHash:sourceHash(),input:'real Playwright pointer events',policy:'target inferred from rendered teal pixels; pointer starts at exported visible knot center; no rule target read',firstFailureImproved:afterMiss.failures===1&&firstRecovery>0&&observations[firstRecovery].failures===1,completed:final?.section===8&&final?.over===true,observations}
 writeFileSync('verification/pointer-cue-result.json',`${JSON.stringify(result,null,2)}\n`)
 console.log(JSON.stringify(result,null,2));await browser.close()
 if(!result.firstFailureImproved||!result.completed)process.exitCode=1
}finally{stop()}
