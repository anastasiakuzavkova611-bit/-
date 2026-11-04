(() => {
  const canvas = document.querySelector('.portfolio-canvas');
  const stage = document.querySelector('.design-stage');
  const names = ['Шрифт', 'Палитра', 'Кривая', 'Сетка', 'Инструменты', 'Градиент'];
  const items = [...stage.querySelectorAll('.design-object:not(.object-cursor)')];
  let drag;
  const motion = active => document.dispatchEvent(new CustomEvent('preview-interaction', {detail:{active}}));
  const position = (el,x,y) => {
    el.dataset.x=x; el.dataset.y=y;
    el.style.setProperty('--user-x',`${x}px`);
    el.style.setProperty('--user-y',`${y}px`);
  };
  function move(el,dx,dy,rect=el.getBoundingClientRect(),x=+el.dataset.x||0,y=+el.dataset.y||0) {
    const bounds=canvas.getBoundingClientRect();
    const scale=stage.getBoundingClientRect().width/stage.offsetWidth;
    dx=Math.max(bounds.left+10-rect.left,Math.min(dx,bounds.right-10-rect.right));
    dy=Math.max(bounds.top+10-rect.top,Math.min(dy,bounds.bottom-10-rect.bottom));
    position(el,x+dx/scale,y+dy/scale);
  }
  function finish(event) {
    if(!drag || (event?.pointerId != null && event.pointerId!==drag.id)) return;
    const el=drag.el;
    if(el.hasPointerCapture(drag.id)) el.releasePointerCapture(drag.id);
    el.classList.remove('is-dragging');
    drag=null; motion(false);
  }
  items.forEach((el,i)=>{
    el.dataset.movable=''; el.tabIndex=0; el.setAttribute('role','button');
    el.setAttribute('aria-label',`${names[i]}. Перетащите или двигайте стрелками. Escape — вернуть на место.`);
    el.title='Можно перетаскивать · двойной клик — вернуть на место';
    el.addEventListener('pointerdown',event=>{
      if(event.button!==0 || drag) return;
      event.preventDefault(); motion(true);
      el.focus({preventScroll:true});
      drag={el,id:event.pointerId,px:event.clientX,py:event.clientY,x:+el.dataset.x||0,y:+el.dataset.y||0,rect:el.getBoundingClientRect()};
      el.classList.add('is-dragging'); el.setPointerCapture(event.pointerId);
    });
    el.addEventListener('pointermove',event=>{
      if(!drag || drag.el!==el || drag.id!==event.pointerId) return;
      move(el,event.clientX-drag.px,event.clientY-drag.py,drag.rect,drag.x,drag.y);
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(type=>el.addEventListener(type,finish));
    el.addEventListener('dblclick',()=>{position(el,0,0);motion(false);});
    el.addEventListener('keydown',event=>{
      const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(event.key==='Escape'){event.preventDefault();finish();position(el,0,0);motion(false);return;}
      if(!vectors[event.key]) return;
      event.preventDefault();motion(true);
      const [x,y]=vectors[event.key],step=event.shiftKey?24:8;
      move(el,x*step,y*step);
    });
    el.addEventListener('keyup',event=>{if(event.key.startsWith('Arrow'))motion(false);});
    el.addEventListener('blur',()=>{if(!drag)motion(false);});
  });
  stage.querySelector('.object-cursor').setAttribute('aria-hidden','true');
  window.addEventListener('blur',()=>finish());
  window.addEventListener('resize',()=>{finish();items.forEach(el=>position(el,0,0));});
})();
