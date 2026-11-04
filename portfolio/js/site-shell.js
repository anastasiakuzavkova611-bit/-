(() => {
 function attach(header, scroller) {
  const position = () => scroller === window ? window.scrollY : scroller.scrollTop;
  let previous = position(), travel = 0, direction = 0;
  const reset = () => { previous = position(); travel = 0; direction = 0; header.classList.remove('is-hidden'); };
  scroller.addEventListener('scroll', () => {
   const current = Math.max(0, position()), delta = current - previous;
   previous = current;
   if (current <= header.offsetHeight) { reset(); return; }
   if (!delta) return;
   const next = Math.sign(delta);
   travel = next === direction ? travel + Math.abs(delta) : Math.abs(delta);
   direction = next;
   if (travel >= 8) header.classList.toggle('is-hidden', direction > 0);
  }, { passive: true });
  window.addEventListener('pageshow', reset);
  if(scroller !== window) new MutationObserver(reset).observe(scroller,{attributes:true,attributeFilter:['open']});
 }
 const pageHeader = document.querySelector('body > .site-header');
 if(pageHeader) attach(pageHeader, window);
 document.querySelectorAll('dialog[data-route]').forEach(panel => {const h=panel.querySelector('.site-header');if(h)attach(h,panel);});
})();
