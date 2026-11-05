(() => {
 document.querySelectorAll('.ab-research-gallery').forEach(root => {
  const slides=[...root.querySelectorAll(':scope > figure')], buttons=[...root.querySelectorAll(':scope > button')], status=root.querySelector('.ab-research-status');let current=0;
  function show(i){
   current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==current);
   buttons.forEach(button=>{
    const direction=button.dataset.direction;
    if(direction){button.hidden=direction==='prev'?current===0:current===slides.length-1;button.dataset.last=String(direction==='prev')}
    else{button.dataset.last=String(current===slides.length-1);button.setAttribute('aria-label',current===slides.length-1?'Предыдущий слайд':'Следующий слайд')}
   });
   if(status) status.textContent=`${current+1} из ${slides.length}${slides[current].querySelector('figcaption') ? ': '+slides[current].querySelector('figcaption').textContent : ''}`;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>show(current+(button.dataset.direction==='prev'?-1:1))));
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1))}});show(0);
 });
})();
