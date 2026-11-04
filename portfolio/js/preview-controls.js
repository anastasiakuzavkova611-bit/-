(() => {
  const canvas=document.querySelector('.portfolio-canvas');
  const stage=document.querySelector('.design-stage');
  const q=s=>stage.querySelector(s);
  let edited=false;
  function pause(){document.dispatchEvent(new CustomEvent('preview-interaction',{detail:{active:true}}));}
  function edit(panel){edited=true;pause();canvas.classList.add('has-preview-edits');panel.classList.add('is-edited');}
  stage.querySelectorAll('.design-object:not(.object-cursor)').forEach(panel=>{
    panel.addEventListener('pointerenter',pause);
    panel.addEventListener('focusin',pause);
    const resume=()=>{if(!edited)document.dispatchEvent(new CustomEvent('preview-interaction',{detail:{active:false}}));};
    panel.addEventListener('pointerleave',resume);
    panel.addEventListener('focusout',event=>{if(!panel.contains(event.relatedTarget))resume();});
  });
  q('.object-cursor').setAttribute('aria-hidden','true');
  const type=q('.object-type'), menu=q('.font-menu');
  const fonts=[['Regular','glyph-sans'],['Serif','glyph-serif'],['Italic','glyph-italic']];
  let fontIndex=0;
  const trigger=document.createElement('button');
  trigger.className='type-trigger';trigger.type='button';trigger.setAttribute('aria-label','Сменить шрифт');
  q('.type-board').append(trigger);
  menu.querySelectorAll('span').forEach((span,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=fonts[i][0];b.setAttribute('aria-label',`Шрифт ${fonts[i][0]}`);b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>setFont(i));span.replaceWith(b);
  });
  function setFont(index){
    edit(type);fontIndex=index;
    type.querySelectorAll('.type-glyph').forEach(el=>el.classList.toggle('is-selected',el.classList.contains(fonts[index][1])));
    menu.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  }
  trigger.addEventListener('click',()=>setFont((fontIndex+1)%3));
  const palette=q('.object-palette');
  const colors=['#28272c','#b3a3ce','#d9d0ee','#e9f5a6','#ffffff'];
  const colorNames=['Графитовый','Сиреневый','Лавандовый','Лаймовый','Белый'];
  let selectedColor='#e9f5a6';
  palette.querySelectorAll('.palette-dots i').forEach((swatch,index)=>{
    const b=document.createElement('button');b.type='button';b.className='swatch-button';b.setAttribute('aria-label',`${colorNames[index]} цвет блока`);b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{
      edit(palette);edit(q('.object-grid'));selectedColor=colors[index];
      q('.layout-drag-block').style.background=selectedColor;
      palette.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));
    });swatch.append(b);
  });
  const gradient=q('.object-gradient'), range=document.createElement('input');
  range.type='range';range.min='0';range.max='100';range.value='30';range.setAttribute('aria-label','Цвет градиента');
  q('.gradient-slider').append(range);
  const setGradient=()=>{edit(gradient);q('.gradient-orb').style.filter=`hue-rotate(${Number(range.value)*3.6}deg)`;};
  range.addEventListener('input',setGradient);
  const curve=q('.object-curve'),svg=curve.querySelector('svg');
  const controls=[{x:75,y:30},{x:166,y:130}];
  const handles=[...svg.querySelectorAll('circle')];
  function drawCurve(){
    edit(curve);
    svg.querySelector('path').setAttribute('d',`M30 117L${controls[0].x} ${controls[0].y}M${controls[1].x} ${controls[1].y}L209 41`);
    const d=`M30 117C${controls[0].x} ${controls[0].y} ${controls[1].x} ${controls[1].y} 209 41`;
    curve.style.setProperty('--curve-path',`path('${d}')`);
    handles.forEach((handle,i)=>{handle.setAttribute('cx',controls[i].x);handle.setAttribute('cy',controls[i].y);handle.setAttribute('aria-valuenow',Math.round(controls[i].y));});
  }
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function dragControl(el,panel,onMove){
    let pointer=null;
    el.addEventListener('pointerdown',event=>{
      if(event.button!==0||pointer!==null)return;
      event.preventDefault();edit(panel);pointer=event.pointerId;el.focus({preventScroll:true});el.setPointerCapture(pointer);onMove(event);
    });
    el.addEventListener('pointermove',event=>{if(event.pointerId===pointer)onMove(event);});
    const end=event=>{if(event.pointerId===pointer)pointer=null;};
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>el.addEventListener(name,end));
  }
  handles.forEach((handle,i)=>{
    handle.setAttribute('r','6');handle.setAttribute('tabindex','0');handle.setAttribute('role','slider');handle.setAttribute('aria-label',`Точка кривой ${i+1}`);handle.setAttribute('aria-valuemin','8');handle.setAttribute('aria-valuemax','147');handle.setAttribute('aria-valuenow',controls[i].y);
    dragControl(handle,curve,event=>{
      const rect=svg.getBoundingClientRect();controls[i]={x:clamp((event.clientX-rect.left)/rect.width*240,8,232),y:clamp((event.clientY-rect.top)/rect.height*155,8,147)};drawCurve();
    });
    handle.addEventListener('keydown',event=>{
      if(!event.key.startsWith('Arrow'))return;event.preventDefault();
      const point=controls[i],step=event.shiftKey?10:3;
      point.x=clamp(point.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),8,232);
      point.y=clamp(point.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0),8,147);drawCurve();
    });
  });
  const grid=q('.layout-grid'),block=q('.layout-drag-block');
  block.tabIndex=0;block.setAttribute('role','button');block.setAttribute('aria-label','Блок сетки — перетащите внутри карточки или двигайте стрелками');
  let bx=16,by=12;
  function positionBlock(x,y){
    edit(q('.object-grid'));bx=clamp(x,0,grid.clientWidth-block.offsetWidth);by=clamp(y,0,grid.clientHeight-block.offsetHeight);
    block.style.left=`${bx}px`;block.style.top=`${by}px`;
  }
  dragControl(block,q('.object-grid'),event=>{
    const rect=grid.getBoundingClientRect();positionBlock((event.clientX-rect.left)/rect.width*grid.offsetWidth-block.offsetWidth/2,(event.clientY-rect.top)/rect.height*grid.offsetHeight-block.offsetHeight/2);
  });
  block.addEventListener('keydown',event=>{
    const directions={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-6],ArrowDown:[0,6]};
    if(!directions[event.key])return;event.preventDefault();const [x,y]=directions[event.key];positionBlock(bx+x,by+y);
  });
  const tools=q('.tool-strip');
  const labels=['Прямоугольный блок','Изменить градиент','Сменить шрифт','Переключить колонки сетки','Круглый блок'];
  let columns=3;
  tools.querySelectorAll('span').forEach((span,i)=>{
    const button=document.createElement('button');button.type='button';button.textContent=span.textContent;button.title=labels[i];button.setAttribute('aria-label',labels[i]);
    button.addEventListener('click',()=>{
      edit(q('.object-tool'));
      tools.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      if(i===2){setFont((fontIndex+1)%3);return;}
      if(i===1){range.value=String((Number(range.value)+25)%101);setGradient();return;}
      edit(q('.object-grid'));
      if(i===3){columns=columns===3?2:3;grid.style.gridTemplateColumns=`repeat(${columns},1fr)`;return;}
      block.style.borderRadius=i===4?'50%':'0';block.style.width=i===4?'45px':'60px';positionBlock(bx,by);
    });span.replaceWith(button);
  });
})();
