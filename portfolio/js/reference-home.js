(()=>{
 const track=document.querySelector('.concept-track'),dialog=document.querySelector('.concept-preview');let opener;
 const originals=[...track.children];originals.forEach(el=>{const clone=el.cloneNode(true);clone.dataset.copy='true';clone.tabIndex=-1;clone.setAttribute('aria-hidden','true');track.appendChild(clone)});
 document.querySelectorAll('[data-image]').forEach(el=>el.addEventListener('click',()=>{opener=el;dialog.querySelector('img').src=el.dataset.image;dialog.querySelector('img').alt=el.dataset.title;dialog.showModal()}));
 dialog.querySelector('.preview-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 history.scrollRestoration='manual';if(!location.hash)window.scrollTo(0,0);
})();
