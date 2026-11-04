(() => {
 const main = document.querySelector('.install-case');
 if (!main) return;
 const dialog = document.createElement('dialog');
 dialog.className = 'case-media-viewer';
 dialog.setAttribute('aria-label','Увеличенный просмотр');
 dialog.innerHTML = '<div class="media-toolbar"><span class="media-title"></span><div><button type="button" class="media-close" aria-label="Закрыть просмотр">×</button></div></div><div class="media-stage"></div><button type="button" class="media-next" aria-label="Показать Стало" hidden><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>';
 document.body.append(dialog);
 const stage = dialog.querySelector('.media-stage'), title = dialog.querySelector('.media-title');
 const next = dialog.querySelector('.media-next');
 title.setAttribute('aria-live','polite');
 let opener, sourceVideo;
 function positionVideoNext(){
  const player=stage.querySelector('video');
  if(!dialog.open||!player||!player.videoWidth)return;
  if(player.classList.contains('branding-recording-trim')){
   const style=getComputedStyle(stage),w=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),h=stage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
   const width=Math.min(w,h*1728/870);player.style.width=width+'px';player.style.height=(width*870/1728)+'px';player.style.objectFit='cover';player.style.objectPosition='center top';
  }
  const box=dialog.getBoundingClientRect(), media=player.getBoundingClientRect();
  const visibleRight=media.right-(player.classList.contains('branding-recording-trim')?media.width*.01:0);
  next.style.right='auto';
  const last=title.textContent.trim()==='Стало';
  next.dataset.last=String(last);
  next.style.left=(last?(media.left-box.left)/2-next.offsetWidth/2:(visibleRight+box.right)/2-box.left-next.offsetWidth/2)+'px';
  next.style.top=((media.top+media.bottom)/2-box.top)+'px';
 }
 const videoLayout=new ResizeObserver(positionVideoNext);
 window.addEventListener('resize',positionVideoNext);
 function renderVideo() {
  videoLayout.disconnect();stage.querySelector('video')?.pause(); stage.replaceChildren();
  const root = sourceVideo.closest('.install-video-comparison');
  title.textContent = root.querySelector('.install-video-label').textContent;
  next.setAttribute('aria-label', title.textContent.trim()==='Было'?'Показать Стало':'Показать Было');
  const player = sourceVideo.cloneNode(true);
  player.removeAttribute('id'); player.controls=true; player.autoplay=true; player.loop=true; player.preload='auto';
  stage.append(player); player.currentTime=0; player.play().catch(()=>{});
  videoLayout.observe(stage);videoLayout.observe(player);
  player.addEventListener('loadedmetadata',positionVideoNext);
  requestAnimationFrame(positionVideoNext);
 }
 next.addEventListener('click',()=>{
  const root=sourceVideo?.closest('.install-video-comparison');if(!root)return;
  root.querySelector('.install-video-next').click();
  sourceVideo=root.querySelector('.install-video-panel:not([hidden]) video');
  renderVideo();
 });
 function open(trigger, media, label) {
  opener = trigger; sourceVideo = media.tagName === 'VIDEO' ? media : null;
  dialog.classList.toggle('has-video',!!sourceVideo); next.hidden=!sourceVideo; title.textContent = label; stage.replaceChildren(); stage.classList.remove('is-original');
  main.querySelectorAll('video').forEach(v => v.pause());
  document.documentElement.classList.add('media-viewer-open');
  if (sourceVideo) {
   dialog.showModal(); renderVideo();
  } else {
   const image = document.createElement('img'); image.src = trigger.href || media.currentSrc || media.src; image.alt = media.alt || 'Скриншот интерфейса';
   stage.append(image); dialog.showModal();
  }
 }
 dialog.querySelector('.media-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{
  videoLayout.disconnect();
  stage.querySelector('video')?.pause();stage.replaceChildren();document.documentElement.classList.remove('media-viewer-open');
  if(sourceVideo && !sourceVideo.closest('[hidden]') && !matchMedia('(prefers-reduced-motion: reduce)').matches){sourceVideo.currentTime=0;sourceVideo.play().catch(()=>{})}
  opener?.focus(); sourceVideo=null;
 });
 main.querySelectorAll('.ab-screen-gallery img').forEach(img=>{
  if(img.closest('a'))return;
  const link=document.createElement('a');link.href=img.src;link.className='screen-original';link.setAttribute('aria-label','Увеличить: '+img.alt);img.before(link);link.append(img);
 });
 main.querySelectorAll('a.screen-original').forEach(link=>{
  const img=link.querySelector('img');if(!img)return;
  link.setAttribute('aria-haspopup','dialog');link.classList.add('media-zoom-target');link.dataset.zoomHint='Нажмите, чтобы увеличить';
  link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();open(link,img,link.closest('figure')?.querySelector('.carousel-board-title')?.textContent || link.closest('figure')?.querySelector('figcaption')?.textContent.trim() || img.alt)});
 });
 main.querySelectorAll('.install-video-comparison').forEach(root=>{
  root.querySelectorAll('.install-video-panel').forEach(panel=>{
   const video=panel.querySelector('video');if(!video)return;
   panel.classList.add('media-zoom-target');panel.dataset.zoomHint='Нажмите, чтобы увеличить';
   panel.tabIndex=0;panel.setAttribute('role','button');panel.setAttribute('aria-label','Увеличить видео');panel.setAttribute('aria-haspopup','dialog');
   const show=()=>open(panel,video,root.querySelector('.install-video-label').textContent);
   panel.addEventListener('click',show);
   panel.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});
  });
 });
 const hint=document.createElement('span');
 hint.className='media-cursor-hint';hint.id='media-cursor-hint';hint.setAttribute('role','tooltip');hint.textContent='Нажмите, чтобы увеличить';hint.hidden=true;document.body.append(hint);
 const hideHint=()=>{hint.hidden=true};
 function positionHint(x,y){
  if(dialog.open)return hideHint();
  hint.hidden=false;
  const w=hint.offsetWidth,h=hint.offsetHeight;
  let left=x+16,top=y+18;
  if(left+w>innerWidth-12)left=x-w-16;
  if(top+h>innerHeight-12)top=y-h-12;
  hint.style.left=Math.max(12,Math.min(left,innerWidth-w-12))+'px';
  hint.style.top=Math.max(12,Math.min(top,innerHeight-h-12))+'px';
 }
 main.querySelectorAll('.media-zoom-target').forEach(target=>{
  target.setAttribute('aria-describedby',hint.id);
  target.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')positionHint(e.clientX,e.clientY)});
  target.addEventListener('pointerleave',hideHint);
  target.addEventListener('pointerdown',hideHint);
  target.addEventListener('click',hideHint);
  target.addEventListener('focus',()=>{if(target.matches(':focus-visible')){const r=target.getBoundingClientRect();positionHint(r.left+16,r.top+16)}});
  target.addEventListener('blur',hideHint);
 });
 document.addEventListener('scroll',hideHint,true);
 window.addEventListener('blur',hideHint);
 window.addEventListener('resize',hideHint);
})();
