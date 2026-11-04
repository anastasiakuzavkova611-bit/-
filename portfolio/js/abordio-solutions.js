(() => {
 document.querySelectorAll('.ab-solution-gallery').forEach(root => {
  const slides=[...root.querySelectorAll(':scope > figure')];
  const button=root.querySelector('.ab-gallery-next');let current=0;
  function align(){const first=slides[current].querySelector('img');root.style.setProperty('--ab-arrow-rail',(first.getBoundingClientRect().left-root.getBoundingClientRect().left)+'px')}
  function show(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==current);button.dataset.last=String(current===slides.length-1);button.setAttribute('aria-label',current?'Предыдущие экраны':'Следующие экраны');root.querySelector('.ab-gallery-status').textContent=`Экраны ${current*2+1}–${current*2+2} из 4`;align()}
  button.addEventListener('click',()=>show(current+1));
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+1)}});
  new ResizeObserver(align).observe(root);show(0);
 });
})();
