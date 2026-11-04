(() => {
 const boards=[...document.querySelectorAll('.complete-screen-board')];
 function fit(board){
  if(!board.clientWidth || !board.clientHeight)return;
  const frame=board.querySelector('.screen-original');
  const img=frame?.querySelector('img');
  if(!img?.naturalWidth)return;
  const css=getComputedStyle(board);
  const visible=[...board.children].filter(el=>el!==frame && getComputedStyle(el).display!=='none' && getComputedStyle(el).position!=='absolute');
  const captions=visible.reduce((sum,el)=>sum+el.getBoundingClientRect().height,0);
  const width=board.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
  const available=board.clientHeight-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-captions-parseFloat(css.rowGap)*visible.length;
  const height=Math.max(0,Math.min(available,width*img.naturalHeight/img.naturalWidth));
  frame.style.setProperty('--fitted-screen-height',height+'px');
 }
 const observer=new ResizeObserver(entries=>entries.forEach(({target})=>fit(target)));
 boards.forEach(board=>{
  observer.observe(board);
  board.querySelector('img')?.addEventListener('load',()=>fit(board));
  fit(board);
 });
 document.fonts.ready.then(()=>boards.forEach(fit));
})();
