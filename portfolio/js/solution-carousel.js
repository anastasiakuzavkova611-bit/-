(() => {
 document.querySelectorAll('.solution-carousel').forEach(root => {
  const slides=[...root.querySelectorAll(':scope > figure')];
  const dots=[...root.querySelectorAll('.solution-carousel-dots button')];
  const next=root.querySelector('.solution-carousel-next');
  const previous=slides.length>2 ? next.cloneNode(true) : null;
  if(previous){
   previous.dataset.last='true';
   previous.setAttribute('aria-label','Показать предыдущий скриншот');
   previous.addEventListener('click',()=>show(current-1));
   root.append(previous);
  }
  let current=0;
  function show(index){
   current=(index+slides.length)%slides.length;
   slides.forEach((slide,i)=>{slide.hidden=i!==current});
   dots.forEach((dot,i)=>{if(i===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});
   if(previous){
    previous.hidden=current===0;
    next.hidden=current===slides.length-1;
   }
   next.dataset.last=String(current===slides.length-1);
   next.setAttribute('aria-label',current===slides.length-1?'Показать предыдущий скриншот':'Показать следующий скриншот');
   root.querySelector('.solution-carousel-status').textContent=`Скриншот ${current+1} из ${slides.length}`;
  }
  next.addEventListener('click',()=>show(current+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>show(i)));
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1))}});
  show(0);
 });
})();
