import { Application, Assets, Circle, Graphics, Sprite, Text, Texture } from 'pixi.js'
import { APP_CONFIG } from '../appConfig'
import type { GameCallbacks, GameRuntime } from './types'
// @ts-expect-error The deterministic rules stay native ESM so Node verification executes the exact same step module.
import { commit, createState, preview, type GardenState } from './gardenRules.mjs'

const W=390,H=844, TEAL=0x35b8ad, STRAW=0xb89b6a, BG=0x06141a
export class GardenGame implements GameRuntime {
 private readonly assetBase:string
 private app:Application|null=null; private state:GardenState=createState(); private cb:GameCallbacks|null=null
 private nodes:Graphics[]=[]; private reeds:Graphics[]=[]; private guides:Graphics[]=[]; private status:Text|null=null; private progress:Graphics|null=null
 private dragging=-1; private startX=0; private previewOffsets:number[]=[...this.state.offsets]; private passing=false
 private keyboardOffset=0; private correction=false
 private restartAt=0; private destroyed=false; private ro:ResizeObserver|null=null; private audio:AudioContext|null=null
 private locale:'ko'|'en'=new URLSearchParams(location.search).get('lang')==='en'?'en':'ko'
 private paused=false; private muted=false
 constructor(assetBase=''){this.assetBase=assetBase}
 async mount(container:HTMLElement, cb:GameCallbacks){
  this.cb=cb; const app=new Application(); await app.init({width:W,height:H,backgroundColor:BG,antialias:true,resolution:Math.min(devicePixelRatio||1,3)*1.12,autoDensity:true})
  if(this.destroyed){app.destroy(true,{children:true});return} this.app=app; container.appendChild(app.canvas)
  const fit=()=>{const s=Math.min(container.clientWidth/W,container.clientHeight/H); app.canvas.style.width=`${W*s}px`;app.canvas.style.height=`${H*s}px`}
  fit();this.ro=new ResizeObserver(fit);this.ro.observe(container)
  ;(globalThis as any).__gameDesignSize={w:W,h:H}; (globalThis as any).__forceGameOver=()=>this.finish(false)
  app.stage.eventMode='static';app.stage.hitArea=app.screen
  await this.drawBackdrop(); this.drawScene(); this.bindKeyboard()
  const release=(e:any)=>{if(this.state.over){if(performance.now()>=this.restartAt)this.restart();return} if(this.dragging>=0)this.release(e.global.x)}
  app.stage.on('pointerup',release);app.stage.on('globalpointerup',release)
 }
 private async drawBackdrop(){
  if(!this.app)return
  try{const base=this.assetBase.replace(/\/?$/,'/');const tex=await Assets.load<Texture>(`${base}art/title-key.png`);const sp=new Sprite(tex);sp.width=W;sp.height=H;sp.alpha=.17;this.app.stage.addChild(sp)}catch{}
  const shade=new Graphics().rect(0,0,W,H).fill({color:BG,alpha:.55});this.app.stage.addChild(shade)
 }
 private drawScene(){
  if(!this.app)return
  const title=new Text({text:this.locale==='ko'?'틈의 정원':'Garden of Gaps',style:{fill:0xd4c29c,fontSize:24,fontFamily:'Galmuri14'}});title.position.set(22,20);title.name='title';this.app.stage.addChild(title)
  this.status=new Text({text:'',style:{fill:TEAL,fontSize:17,fontFamily:'Galmuri11',align:'center'}});this.status.anchor.set(.5);this.status.position.set(W/2,78);this.app.stage.addChild(this.status)
  this.progress=new Graphics();this.app.stage.addChild(this.progress)
  const leaf=new Graphics().ellipse(195,132,105,40).fill(0x365b45).moveTo(145,132).lineTo(240,132).stroke({color:0x719078,width:2});this.app.stage.addChild(leaf)
  for(let i=0;i<7;i++){
   const guide=new Graphics();this.guides.push(guide);this.app.stage.addChild(guide)
   const r=new Graphics();this.reeds.push(r);this.app.stage.addChild(r)
   const n=new Graphics()
   // The 50px Circle is the input contract; the visible material is a small leaf bud.
   n.hitArea=new Circle(0,0,25);n.eventMode='static';n.cursor='grab'
   n.moveTo(-13,1).quadraticCurveTo(-5,-13,0,-3).quadraticCurveTo(5,-13,13,1).quadraticCurveTo(5,7,0,5).quadraticCurveTo(-5,7,-13,1).fill(0x315f50)
   n.moveTo(-10,1).quadraticCurveTo(0,-3,10,1).stroke({color:0xa6b776,width:2})
   n.circle(0,1,3).fill(0xd1b978)
   n.on('pointerdown',(e)=>{if(this.passing||this.state.over)return;this.sound(150);this.dragging=i;this.startX=e.global.x})
   n.on('pointermove',(e)=>{if(this.dragging===i){const x=Math.max(-78,Math.min(78,e.global.x-this.startX));this.previewOffsets=preview(this.state,i,x).offsets;this.renderReeds()}})
   this.nodes.push(n);this.app.stage.addChild(n)
  }
  const bug=new Graphics().ellipse(0,0,12,17).fill(0x1c2427).stroke({color:0x718080,width:2});bug.name='bug';bug.position.set(195,744);this.app.stage.addChild(bug)
  this.renderReeds();this.updateUi(true)
 }
 private renderReeds(){
  const target=preview(this.state,3,0).target
  for(let i=0;i<7;i++){
   const base=62+i*44,off=this.previewOffsets[i],r=this.reeds[i],g=this.guides[i]
   r.clear();r.moveTo(base,700).bezierCurveTo(base+off*.2,540,base+off*.8,360,base+off,165).stroke({color:STRAW,width:13});r.moveTo(base-3,700).bezierCurveTo(base+off*.2-3,540,base+off*.8-3,360,base+off-3,165).stroke({color:0x6f583d,width:2})
   const lo=base+Math.max(-78,target-30)*.65,hi=base+Math.min(78,target+30)*.65,cy=440
   const inside=Math.abs(off-target)<=30
   g.clear()
   // Two wet leaf tips are the success corridor. They show the target and its full tolerance without numeric UI.
   const wet=0x1fe0d0,guideAlpha=this.correction?1:.82
   g.moveTo(lo-9,cy).quadraticCurveTo(lo-2,cy-12,lo+5,cy).quadraticCurveTo(lo-2,cy+9,lo-9,cy).fill({color:wet,alpha:guideAlpha})
   g.moveTo(hi+9,cy).quadraticCurveTo(hi+2,cy-12,hi-5,cy).quadraticCurveTo(hi+2,cy+9,hi+9,cy).fill({color:wet,alpha:guideAlpha})
   g.moveTo(lo+3,cy).bezierCurveTo((lo+hi)/2,cy+(target<0?-7:7),(lo+hi)/2,cy+(target<0?-7:7),hi-3,cy).stroke({color:inside?0xb8d7a3:wet,width:inside?4:2,alpha:guideAlpha})
   const n=this.nodes[i],frozen=this.state.frozen.includes(i);n.position.set(base+off*.65,440);n.alpha=frozen?.35:1;n.eventMode=frozen?'none':'static'
  }
  ;(globalThis as any).__gardenVisibleNodeCenters=this.nodes.map((n)=>({x:n.x,y:n.y}))
 }
 private updateUi(first=false){
  if(!this.status||!this.progress)return
  const direction=preview(this.state,3,0).target<0?(this.locale==='ko'?'왼쪽':'left'):(this.locale==='ko'?'오른쪽':'right')
  this.status.text=this.passing?(this.locale==='ko'?'지나가는 중\n기다려요':'Let it pass\nWait'):this.correction
   ?(this.locale==='ko'?`젖은 잎눈 사이로 다시\n${direction} 모양을 따라요`:`Try the wet leaf buds again\nFollow the ${direction} shape`)
   :(this.locale==='ko'?`움직여도 돼요\n${direction} 잎눈 사이에 놓아요`:`Shape the gap\nRelease between the ${direction} leaf buds`)
  this.progress.clear();for(let i=0;i<8;i++)this.progress.roundRect(83+i*29,105,18,6,3).fill(i<this.state.section?TEAL:0x294044)
  if(first){const guide=new Text({text:this.guideText(),style:{fill:0xc8c4ad,fontSize:13,fontFamily:'Galmuri11',align:'center',lineHeight:20}});guide.anchor.set(.5);guide.position.set(W/2,790);guide.name='guide';this.app?.stage.addChild(guide)}
 }
 private release(globalX:number){const i=this.dragging;this.dragging=-1;if(i<0)return;const x=Math.max(-78,Math.min(78,globalX-this.startX));this.commitShape(i,x)}
 private commitShape(i:number,x:number){this.state=commit(this.state,i,x);this.correction=!this.state.lastSuccess;this.keyboardOffset=0;this.previewOffsets=[...this.state.offsets];this.renderReeds();this.passing=true;this.updateUi();this.sound(this.state.lastSuccess?440:90);setTimeout(()=>{this.passing=false;if(this.state.over)this.finish(this.state.won);else{this.renderReeds();this.updateUi()}},520)}
 private finish(won:boolean){if(this.state.over&&this.restartAt)return;this.state={...this.state,over:true,won};this.passing=false;this.restartAt=performance.now()+700
  const g=new Graphics().rect(0,0,W,H).fill({color:0x02090d,alpha:.9});g.eventMode='none';this.app?.stage.addChild(g)
  const text=new Text({text:this.overText(won),style:{fill:won?TEAL:0xc9a77b,fontSize:21,fontFamily:'Galmuri14',align:'center',lineHeight:34}});text.anchor.set(.5);text.position.set(W/2,H/2);this.app?.stage.addChild(text);text.name='over'
  ;(globalThis as any).__gameOverUiBoxes=[{name:'result',x:40,y:350,w:310,h:150}];this.cb?.onGameOver({score:this.state.section,phase:this.state.section})
 }
 private restart(){if(!this.app)return;const over=this.app.stage.getChildByName('over');if(over)over.destroy();const children=[...this.app.stage.children];for(const child of children.slice(-3)){if(child instanceof Graphics&&child!==this.progress&&!this.nodes.includes(child)&&!this.reeds.includes(child)&&!this.guides.includes(child))child.destroy()}this.state=createState();this.previewOffsets=[...this.state.offsets];this.keyboardOffset=0;this.correction=false;this.restartAt=0;this.renderReeds();this.updateUi()}
 private bindKeyboard(){window.addEventListener('keydown',this.key);document.addEventListener('visibilitychange',this.visibility)}
 private key=(e:KeyboardEvent)=>{if(this.state.over){if((e.key==='Enter'||e.key===' ')&&performance.now()>=this.restartAt)this.restart();return}const n=3
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.sound(150);this.keyboardOffset=Math.max(-78,Math.min(78,this.keyboardOffset+(e.key==='ArrowLeft'?-12:12)));this.previewOffsets=preview(this.state,n,this.keyboardOffset).offsets;this.renderReeds()}
  if((e.key==='Enter'||e.key===' ')&&!this.passing){e.preventDefault();this.commitShape(n,this.keyboardOffset)}
  if(e.key.toLowerCase()==='m')this.audio?.suspend()}
 private visibility=()=>{if(document.hidden)this.audio?.suspend()}
 private guideText(){return this.locale==='ko'?'장식된 마디를 좌우로 끌고 놓으세요\n틈이 열리면 딱정벌레가 지나가요 · 젖은 잎까지 8구간\n세 번 막히면 갈대가 굳어 길이 닫혀요':'Drag a decorated node sideways, then release\nAn open gap lets the beetle pass · reach the wet leaf in 8 sections\nThree blocks harden the reeds and close the way'}
 private overText(won:boolean){return won?(this.locale==='ko'?'젖은 잎 아래 돌아왔어요\n\n화면을 눌러 다시 시작':'Safe beneath the wet leaf\n\nTap anywhere to begin again'):(this.locale==='ko'?'갈대가 굳어 길이 닫혔어요\n\n화면을 눌러 다시 시작':'The reeds hardened; the way closed\n\nTap anywhere to begin again')}
 setLocale(locale:'ko'|'en'){this.locale=locale;const title=this.app?.stage.getChildByName('title') as Text|undefined;if(title)title.text=locale==='ko'?'틈의 정원':'Garden of Gaps';const guide=this.app?.stage.getChildByName('guide') as Text|undefined;if(guide)guide.text=this.guideText();const over=this.app?.stage.getChildByName('over') as Text|undefined;if(over)over.text=this.overText(this.state.won);this.updateUi()}
 setPaused(value:boolean){this.paused=value;if(value){this.app?.ticker.stop();this.audio?.suspend()}else{this.app?.ticker.start();if(!this.muted)this.audio?.resume()}}
 setMuted(value:boolean){this.muted=value;if(value)this.audio?.suspend();else if(!this.paused)this.audio?.resume()}
 restartRun(){this.restart()}
 private sound(freq:number){if(this.muted||this.paused)return;if(!this.audio)this.audio=new AudioContext();if(this.audio.state==='suspended')this.audio.resume();const o=this.audio.createOscillator(),g=this.audio.createGain();o.frequency.value=freq;g.gain.value=.025;o.connect(g).connect(this.audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,this.audio.currentTime+.08);o.stop(this.audio.currentTime+.09)}
 destroy(){this.destroyed=true;this.ro?.disconnect();window.removeEventListener('keydown',this.key);document.removeEventListener('visibilitychange',this.visibility);this.audio?.close();this.app?.destroy(true,{children:true});this.app=null}
 getDebugState(){return{over:this.restartAt>0,score:this.state.section,section:this.state.section,failures:this.state.failures,passing:this.passing,frozen:this.state.frozen,locale:this.locale,paused:this.paused,muted:this.muted}}
}
