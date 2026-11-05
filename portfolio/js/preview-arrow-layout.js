(() => {
 const roots=[...document.querySelectorAll('.solution-carousel,.install-video-comparison,.ab-research-gallery,.ab-solution-gallery')];
 let pending=false;
 function layout(){
  pending=false;
  roots.forEach(root=>{
   const media=[...root.querySelectorAll('img,video')].find(el=>!el.closest('[hidden]')&&el.getBoundingClientRect().width);
   const group=[...root.querySelectorAll('.ab-flow-phones,.ab-mvp-grid')].find(el=>!el.closest('[hidden]')&&el.getBoundingClientRect().width);
   if(group){
    const card=root.getBoundingClientRect(), box=group.getBoundingClientRect();
    root.querySelectorAll(':scope > button').forEach(button=>{if(button.hidden)return;const x=button.dataset.last==='true'?(card.left+box.left)/2:(box.right+card.right)/2;button.style.left=(x-card.left-20)+'px';button.style.right='auto';button.style.width='40px';button.style.top=((box.top+box.bottom)/2-card.top)+'px';button.style.transform='translateY(-50%)'});return;
   }
   if(!media)return;
   const card=root.getBoundingClientRect(), frame=media.closest('.screen-original,.install-video-panel')?.getBoundingClientRect()||card;
   const box=media.getBoundingClientRect(), css=getComputedStyle(media);
   let left=box.left,right=box.right,top=box.top,bottom=box.bottom;
   const nw=media.naturalWidth||media.videoWidth,nh=media.naturalHeight||media.videoHeight;
   if(css.objectFit==='contain'&&nw&&nh){
    const scale=Math.min(box.width/nw,box.height/nh),w=nw*scale,h=nh*scale;
    const pos=css.objectPosition.split(' ');
    const ratio=(v)=>v==='left'||v==='top'?0:v==='right'||v==='bottom'?1:parseFloat(v)/100;
    left+=(box.width-w)*(Number.isFinite(ratio(pos[0]))?ratio(pos[0]):.5);
    top+=(box.height-h)*(Number.isFinite(ratio(pos[1]))?ratio(pos[1]):.5);
    right=left+w;bottom=top+h;
   }
   // Use only the visible image: long sources may extend below the card.
   left=Math.max(left,frame.left,card.left);right=Math.min(right,frame.right,card.right);
   top=Math.max(top,frame.top,card.top);bottom=Math.min(bottom,frame.bottom,card.bottom);
   root.querySelectorAll(':scope > button').forEach(button=>{
    if(button.hidden)return;
    const previous=button.dataset.last==='true';
    const centerX=previous?(card.left+left)/2:(right+card.right)/2;
    button.style.left=(centerX-card.left-20)+'px';
    button.style.right='auto';button.style.width='40px';
    button.style.top=((top+bottom)/2-card.top)+'px';
    button.style.transform='translateY(-50%)';
   });
  });
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(layout)}}
 const resize=new ResizeObserver(schedule),mutation=new MutationObserver(schedule);
 roots.forEach(root=>{
  resize.observe(root);mutation.observe(root,{subtree:true,attributes:true,attributeFilter:['hidden','data-last']});
  root.querySelectorAll('img,video,.screen-original,.install-video-panel,.ab-flow-phones,.ab-mvp-grid').forEach(el=>{resize.observe(el);el.addEventListener('load',schedule);el.addEventListener('loadedmetadata',schedule)});
 });
 document.fonts.ready.then(schedule);window.addEventListener('resize',schedule);schedule();
})();
