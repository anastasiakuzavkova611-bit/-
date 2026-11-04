(() => {
 document.querySelectorAll('.ab-research-gallery').forEach(root => {
  const slides=[...root.querySelectorAll(':scope > figure')], button=root.querySelector('button'), status=root.querySelector('.ab-research-status');let current=0;
  function show(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==current);button.dataset.last=String(current===slides.length-1);button.setAttribute('aria-label',current?'Предыдущий слайд':'Следующий слайд');status.textContent=`${current+1} из ${slides.length}: ${slides[current].querySelector('figcaption').textContent}`;}
  button.addEventListener('click',()=>show(current+1));root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1))}});show(0);
 });
})();
