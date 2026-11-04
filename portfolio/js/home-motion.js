(() => {
  const canvas = document.querySelector('.portfolio-canvas');
  const cursor = document.querySelector('.object-cursor');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!canvas || !cursor) return;
  let userControls = reduced.matches;
  document.documentElement.classList.toggle('cursor-demo', !userControls);
  let cursorAnimation, tracks = [], resizeFrame;
  function takeControl(event) {
    if (event.type === 'pointermove' && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    userControls = true;
    cursorAnimation?.cancel();
    cursor.hidden = true;
    document.documentElement.classList.remove('cursor-demo');
  }
  document.addEventListener('pointermove', takeControl, {passive: true});
  document.addEventListener('pointerdown', takeControl, {passive: true});
  document.addEventListener('keydown', takeControl);
  const duration = 12000;
  function animateCursor(time = 0) {
    cursorAnimation?.cancel();
    if (reduced.matches || userControls) return;
    const base = cursor.getBoundingClientRect();
    const scale = parseFloat(getComputedStyle(cursor).scale) || 1;
    function point(selector, x, y) {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return [(rect.left + rect.width*x - base.left)/scale, (rect.top + rect.height*y - base.top)/scale];
    }
    const typeStart = point('.editor-selection',0,.65);
    const typeEnd = point('.editor-selection',.96,.65);
    const palette = point('.palette-dots i:nth-child(4)',.5,.5);
    const block = point('.layout-grid',.25,.3);
    const blockEnd = point('.layout-grid',.65,.63);
    const key = (offset, pos, scaleValue = 1) => ({offset,transform:`translate(${pos[0]}px,${pos[1]}px) scale(${scaleValue})`});
    cursorAnimation = cursor.animate([
      key(0,[0,0]),key(.07,[0,0]),key(.13,typeStart),key(.15,typeStart,.88),key(.21,typeEnd,.88),key(.27,typeEnd),
      key(.34,typeEnd),key(.39,palette),key(.41,palette,.83),key(.44,palette),key(.49,palette),
      key(.53,block),key(.55,block,.88),key(.63,blockEnd,.88),key(.68,blockEnd),key(.73,blockEnd),key(.84,[0,0]),key(1,[0,0])
    ],{duration,iterations:Infinity,easing:'linear'});
    cursorAnimation.currentTime=time;
  }
  function sync() {
    const stop=document.hidden||!!document.querySelector('dialog[open]')||reduced.matches;
    canvas.classList.toggle('motion-paused',stop);
    tracks.forEach(a=>{if(a.playState!=='idle')stop?a.pause():a.play();});
  }
  function build(time=0) {
    animateCursor(time);
    tracks=canvas.getAnimations({subtree:true});
    tracks.forEach(a=>{a.currentTime=time;});
    sync();
  }
  document.addEventListener('visibilitychange',sync);
  document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']}));
  reduced.addEventListener('change',()=>{if(reduced.matches){takeControl({type:'reduced'});tracks=[];}else build();sync();});
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>build(cursorAnimation?.currentTime||0));});
  requestAnimationFrame(()=>build());
})();
