(() => {
 const track=document.querySelector('.experience__track');if(!track)return;
 const section=track.closest('.experience'),stage=section.querySelector('.experience__sticky');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 let pinned=false,max=0,start=0,frame=0,lastTime=0,target=0,current=0,previousProgress=0,navigating=false;
 const active=()=>pinned&&window.scrollY>=start-1&&window.scrollY<=start+max+1;
 const render=time=>{
  frame=0;
  if(navigating)return;
  const dt=lastTime?Math.min(time-lastTime,40):16.67;
  lastTime=time;
  // Short, frame-rate independent damping; no long catch-up after a fast gesture.
  current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt/70));
  if(Math.abs(target-current)<.5)current=target;
  track.scrollTo({left:current,behavior:'instant'});
  if(Math.abs(target-current)>.5)frame=requestAnimationFrame(render);
  else lastTime=0;
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
 const progress=()=>clamp(window.scrollY-start,0,max);
 const sync=()=>{
  if(!pinned)return;
  const next=progress();
  // Only actual user traversal advances the rail; anchor jumps retain its position.
  if(!navigating){target=clamp(target+next-previousProgress,0,max);schedule();}
  previousProgress=next;
 };
 window.addEventListener('portfolio:anchor-start',()=>{
  navigating=true;cancelAnimationFrame(frame);frame=0;lastTime=0;
  current=track.scrollLeft;target=current;previousProgress=progress();
 });
 window.addEventListener('portfolio:anchor-end',()=>{
  previousProgress=progress();navigating=false;
 });
 const measure=()=>{
  max=Math.max(0,track.scrollWidth-track.clientWidth);
  const headerBottom=(document.querySelector('.site-header')?.getBoundingClientRect().height||0)+16;
  const top=Math.min(headerBottom,window.innerHeight-stage.offsetHeight-24);
  const style=getComputedStyle(section);
  const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
  // Keep tall cards fully readable on short screens, using the native rail there.
  pinned=max>1&&track.offsetHeight+headerBottom+24<=window.innerHeight;
  section.classList.toggle('is-pinned',pinned);
  section.style.setProperty('--experience-top',`${top}px`);
  section.style.height=pinned?`${stage.offsetHeight+padding+max}px`:'';
  start=section.getBoundingClientRect().top+window.scrollY+parseFloat(style.paddingTop)-top;
  current=track.scrollLeft;target=current;previousProgress=progress();
 };
 const moveTo=(left,behavior='instant')=>{
  left=clamp(left,0,max);
  if(pinned)window.scrollTo({top:start+left,behavior});
  else track.scrollTo({left,behavior});
 };
 const step=()=>track.firstElementChild.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);
 track.addEventListener('keydown',e=>{
  if(e.target!==track)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveTo(track.scrollLeft+(e.key==='ArrowRight'?1:-1)*step(),reduced.matches?'instant':'smooth');}
 });
 track.addEventListener('wheel',e=>{
  if(e.ctrlKey)return;
  const horizontal=Math.abs(e.deltaX)>Math.abs(e.deltaY)||e.shiftKey;
  const delta=(horizontal?(e.deltaX||e.deltaY):e.deltaY)*(e.deltaMode===1?20:e.deltaMode===2?track.clientWidth:1);
  if(pinned){
   // Never seek to the section's start from a gesture above or below it.
   // Diagonal trackpad input remains ordinary page scrolling.
   if(horizontal){
    e.preventDefault();window.scrollBy({top:delta,behavior:'instant'});
   }
   return;
  }
  if(horizontal)return; // Native horizontal touchpad/swipe behavior.
  if((delta>0&&target<max-1)||(delta<0&&target>1)){
   e.preventDefault();target=clamp(target+delta,0,max);schedule();
  }
 },{passive:false});
 track.addEventListener('scroll',()=>{if(!pinned&&!frame){current=track.scrollLeft;target=current;}},{passive:true});
 let drag=null;
 track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||(pinned&&!active()))return;drag={x:e.clientX,left:track.scrollLeft};track.setPointerCapture(e.pointerId);});
 track.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>4)track.classList.add('is-dragging');if(track.classList.contains('is-dragging'))moveTo(drag.left-dx);});
 const finish=()=>{drag=null;track.classList.remove('is-dragging');};
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);track.addEventListener('lostpointercapture',finish);
 window.addEventListener('scroll',sync,{passive:true});
 window.addEventListener('resize',measure);
 new ResizeObserver(measure).observe(stage);
 document.fonts.ready.then(measure);
 window.addEventListener('load',measure,{once:true});
 measure();
})();
