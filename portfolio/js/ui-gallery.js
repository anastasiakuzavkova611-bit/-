(() => {
 const gallery=document.querySelector('.ui-gallery');if(!gallery)return;
 const intro=gallery.parentElement,stage=gallery.querySelector('.ui-stage'),cards=[...gallery.querySelectorAll('.ui-card')];
 const trigger=gallery.querySelector('.folder-trigger'),faces=[...gallery.querySelectorAll('.folder-face')];
 const dialog=document.querySelector('.ui-dialog'),close=dialog.querySelector('.ui-close');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
 let progress=0,targetProgress=0,offset=0,last=0,visible=true,drag=null,suppressUntil=0,openedBy=null,frame=0,layout=[],total=0,stageWidth=0,speed=0;
 let unit=1,folderX=0,folderY=0,folderScale=1,scrollStart=0,headerHeight=84,heroTop=0,ribbonY=24,ribbonHeight=0,scrollDistance=360;
 const springs=cards.map(()=>({hover:false,focus:false,lift:0,velocity:0}));
 const textMeasure=document.createElement('canvas').getContext('2d');
 const poses=[[70,25,224,236,0],[28,22,208,236,-12],[128,7,206,230,19],[69,29,195,231,-6],[118,24,192,225,8],[62,39,210,220,-9],[124,32,190,225,11]];
 function measure(){
  const title=document.querySelector('.hero-title'),role=title.querySelector('.bold-line--role');
  title.style.fontSize='117px';
  const mobile=innerWidth<=640;
  headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
  const bottomGap=clamp(innerHeight*.065,32,72);
  const widthFont=117*title.clientWidth/role.getBoundingClientRect().width;
  const fontSize=Math.min(widthFont,Math.max(20,(innerHeight-headerHeight-bottomGap-64)/3.7));
  title.style.fontSize=fontSize+'px';unit=fontSize/117;intro.style.setProperty('--unit',unit+'px');
  title.style.setProperty('--name-width',role.firstElementChild.getBoundingClientRect().width+'px');
  // Equal visible gaps: descenders and accents change ink bounds within line boxes.
  const rows=[...title.querySelectorAll('.bold-line')];
  const ink=rows.map(row=>{
   const style=getComputedStyle(row);
   textMeasure.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
   const m=textMeasure.measureText(row.textContent),a=m.fontBoundingBoxAscent??fontSize*.8,d=m.fontBoundingBoxDescent??fontSize*.2;
   const baseline=(row.getBoundingClientRect().height-a-d)/2+a;
   return {top:baseline-m.actualBoundingBoxAscent,bottom:baseline+m.actualBoundingBoxDescent,height:row.getBoundingClientRect().height};
  });
  const opticalGap=clamp(fontSize*.35,12,44);
  rows.slice(0,-1).forEach((row,i)=>row.style.marginBottom=(opticalGap-(ink[i].height-ink[i].bottom)-ink[i+1].top)+'px');
  stageWidth=stage.clientWidth;
  heroTop=Math.max(24,innerHeight-headerHeight-bottomGap-title.getBoundingClientRect().height);
  const greeting=document.querySelector('.bold-line--hello'),type=getComputedStyle(greeting);
  textMeasure.font=type.fontWeight+' '+type.fontSize+' '+type.fontFamily;
  const metrics=textMeasure.measureText(greeting.textContent),ascent=metrics.fontBoundingBoxAscent??fontSize*.8,descent=metrics.fontBoundingBoxDescent??fontSize*.2;
  const inkBottom=(parseFloat(type.lineHeight)-ascent-descent)/2+ascent+metrics.actualBoundingBoxDescent;
  // Keep the folder compact and constrain it on short windows.
  folderScale=mobile?Math.min(Math.max(.58,unit),Math.max(.15,(heroTop-36)/290)):Math.min(unit,Math.max(.15,(heroTop+inkBottom-28)/330));
  folderScale*=.81;
  folderX=(stageWidth-title.clientWidth)/2+role.getBoundingClientRect().width*.46-180*folderScale+(mobile?12:40)*folderScale;
  folderY=mobile?heroTop-290*folderScale-24:heroTop+inkBottom-299*folderScale;
  // Balance the composition by its visible edges, including glyph descenders.
  const compositionTop=Math.min(heroTop+ink[0].top,folderY-30*folderScale);
  const compositionBottom=heroTop+title.getBoundingClientRect().height-(ink[2].height-ink[2].bottom);
  const balanceShift=(innerHeight-headerHeight-compositionBottom-compositionTop)/2;
  const upwardShift=Math.min(mobile?32:48,Math.max(0,compositionTop+balanceShift-24));
  heroTop+=balanceShift-upwardShift;folderY+=balanceShift-upwardShift;
  for(const [key,value] of Object.entries({'--folder-x':folderX,'--folder-y':folderY,'--folder-width':360*folderScale,'--folder-height':290*folderScale}))stage.style.setProperty(key,value+'px');
  scrollStart=0;
  let x=0;const height=clamp((innerHeight-headerHeight)*.48,mobile?200:240,mobile?280:360);
  const gap=mobile?24:40;
  const sizes=[[.289,.289],[.617,.289],[.460,1],[.460,1],[1.39,.808],[.460,1],[.610,.619]];
  layout=cards.map((c,i)=>{const [rw,rh]=sizes[i],w=height*rw,h=height*rh;
   const r={x:i===0?height*(.617-.289):x,w,h,ratio:w/h,y:height-h};
   if(i===0)r.y=height*(1-.289*2)-gap*.6;
   else x+=w+gap;
   return r;
  });total=x;
  ribbonY=24;
  ribbonHeight=ribbonY+height+24;
  // Stable document geometry: only card transforms change while scrolling.
  scrollDistance=Math.max(360,innerHeight-headerHeight-ribbonHeight+240);
  stage.style.height=reduced.matches?'auto':ribbonHeight+'px';
  intro.style.height=reduced.matches?'auto':(ribbonHeight+scrollDistance)+'px';updateProgress();
 }
 function updateProgress(){const r=intro.getBoundingClientRect();targetProgress=reduced.matches?1:clamp((-r.top+headerHeight-scrollStart)/scrollDistance,0,1);}
 function render(now){
  const dt=Math.min((now-last)/1000||0,.04);last=now;
  progress=reduced.matches?1:progress+(targetProgress-progress)*(1-Math.exp(-dt/.09));
  if(Math.abs(progress-targetProgress)<.00001)progress=targetProgress;
  springs.forEach(s=>{const force=((s.hover||s.focus)&&progress<.02&&!reduced.matches?18:0)-s.lift;s.velocity+=(force*220-s.velocity*19)*dt;s.lift+=s.velocity*dt;});
  if(visible){
   const keyboardFocus=stage.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');
   const desiredSpeed=!reduced.matches&&!drag&&!dialog.open&&!keyboardFocus?60*clamp((progress-.8)/.2,0,1):0;
   speed+=(desiredSpeed-speed)*(1-Math.exp(-dt/.16));offset+=dt*speed;
   const p=progress,e=p*p*(3-2*p),exit=clamp((p-.06)/.46,0,1),folderOpacity=1-exit*exit*(3-2*exit);
   intro.style.setProperty('--hero-top',heroTop+'px');
   const textExit=clamp(progress/.42,0,1);
   intro.style.setProperty('--intro-fade',reduced.matches?1:1-textExit*textExit*(3-2*textExit));
   intro.style.setProperty('--folder-opacity',reduced.matches?0:folderOpacity);
   gallery.classList.toggle('is-unfolding',progress>.02||reduced.matches);
   trigger.tabIndex=progress>.02?-1:0;
   faces.forEach(f=>f.style.transform=`translateY(${exit*28*folderScale}px)`);
   cards.forEach((card,i)=>{
    const size=layout[i];if(!size)return;
    if(reduced.matches){card.style.width=size.w+'px';card.style.height=size.h+'px';card.style.opacity='1';card.style.transform='none';card.style.alignSelf='flex-end';card.style.pointerEvents='auto';card.tabIndex=0;const image=card.querySelector('.ui-card__image');image.style.width=size.w+'px';image.style.height=size.h+'px';image.style.left='0';image.style.top='0';card.style.setProperty('--paper-opacity','0');card.style.setProperty('--paper-edge','0');return;}
    const [px,py,pw,ph,angle]=poses[i],fh=ph*folderScale,fw=pw*folderScale;
    const cw=mix(fw,size.w,e),ch=mix(fh,size.h,e);
    if(e<.001)offset=0;
    const gap=innerWidth<=640?24:40;
    const ribbon=((size.x-offset+size.w+gap)%total+total)%total-size.w-gap+24;
    const fromX=folderX+(px+pw/2)*folderScale-fw/2,fromY=folderY+py*folderScale;
    const arc=-Math.sin(p*Math.PI)*24*folderScale;
    const lift=springs[i].lift,bounce=lift*folderScale*(1-e);
    const spread=clamp((p-.16)/.84,0,1),spreadEase=spread*spread*(3-2*spread);
    const x=mix(fromX,ribbon,spreadEase),y=mix(fromY,ribbonY+size.y,e)+arc-bounce;
    card.style.width=cw+'px';card.style.height=ch+'px';
    card.style.transform=`translate3d(${x}px,${y}px,0) rotate(${(angle+lift*.045*(i%2?1:-1))*(1-e)}deg)`;
    card.style.opacity=i<3?'1':String(clamp((p-.2)/.3,0,1));
    card.style.zIndex=String(p>.4?50-i:(springs[i].hover||springs[i].focus?25:20-i));
    const interactive=e>.97||(progress<.02&&i<3);card.style.pointerEvents=interactive?'auto':'none';card.tabIndex=interactive?0:-1;
    const screen=card.querySelector('.ui-card__image'),imageW=Math.min(cw,ch*size.ratio),imageH=imageW/size.ratio;
    screen.style.width=imageW+'px';screen.style.height=imageH+'px';screen.style.left=(cw-imageW)/2+'px';screen.style.top=(ch-imageH)/2+'px';
    card.style.setProperty('--paper-edge',String(6*folderScale*(1-e)));card.style.setProperty('--paper-opacity',String(1-e));
   });
  }
  frame=requestAnimationFrame(render);
 }
 trigger.addEventListener('click',()=>{const top=intro.getBoundingClientRect().top+scrollY-headerHeight+scrollStart+scrollDistance;window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});});
 function open(card){openedBy=card;dialog.querySelector('h2').textContent=card.dataset.title;const img=dialog.querySelector('img');img.src=card.dataset.image;img.alt=card.dataset.title;dialog.showModal();document.body.classList.add('ui-modal-open');close.focus();}
 cards.forEach((c,i)=>{
  c.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')springs[i].hover=true;});
  c.addEventListener('pointerleave',()=>springs[i].hover=false);
  c.addEventListener('focus',()=>springs[i].focus=true);
  c.addEventListener('blur',()=>springs[i].focus=false);
  c.addEventListener('click',()=>{if(performance.now()>suppressUntil)open(c)});
  c.addEventListener('focus',()=>{if(progress>.999&&!reduced.matches){offset=layout[i].x-(stageWidth-layout[i].w)/2+20;}});
 });
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('ui-modal-open');openedBy?.focus({preventScroll:true});});
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||reduced.matches||progress<.98)return;drag={x:e.clientX,y:e.clientY,offset,id:e.pointerId,moved:false};});
 stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6){drag.moved=true;stage.setPointerCapture(e.pointerId);stage.classList.add('is-dragging');offset=drag.offset-dx;}});
 function release(){if(drag?.moved)suppressUntil=performance.now()+250;drag=null;stage.classList.remove('is-dragging');}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const i=cards.indexOf(document.activeElement);cards[(i+(e.key==='ArrowRight'?1:-1)+cards.length)%cards.length].focus({preventScroll:true});});
 new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{rootMargin:'100px'}).observe(gallery);
 addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',measure);
 reduced.addEventListener('change',()=>{cards.forEach(c=>c.style.transform='');measure();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else{last=0;frame=requestAnimationFrame(render)}});
 measure();document.fonts.ready.then(measure);frame=requestAnimationFrame(render);
})();
