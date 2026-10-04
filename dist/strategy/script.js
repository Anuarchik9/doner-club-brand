const progress=document.getElementById('progressBar');
const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const glossaryBtn=document.getElementById('glossaryBtn');
const drawerClose=document.getElementById('drawerClose');
const tooltip=document.getElementById('tooltip');
const presentationControls=document.getElementById('presentationControls');
const presentationPrev=document.getElementById('presentationPrev');
const presentationNext=document.getElementById('presentationNext');
const presentationCounter=document.getElementById('presentationCounter');
const presentationHome=document.getElementById('presentationHome');

const slides=[...document.querySelectorAll('main > .section')];
let presentationIndex=0;
let fitTimer=null;

// Convert the page into a real slide deck: every section gets one centered canvas.
slides.forEach((slide,index)=>{
  if(!slide.id)slide.id=index===0?'top':'slide-'+(index+1);
  const first=slide.firstElementChild;
  if(first && first.classList && first.classList.contains('slide-content')) return;
  const wrapper=document.createElement('div');
  wrapper.className='slide-content';
  while(slide.firstChild) wrapper.appendChild(slide.firstChild);
  slide.appendChild(wrapper);
});

function slideIndexFromHash(){
  const id=(location.hash||'').replace('#','');
  if(!id || id==='top') return 0;
  const index=slides.findIndex(slide=>slide.id===id);
  return index>=0?index:0;
}

// Let CSS lay out content at its real size in either orientation. Never
// shrink a 1280px canvas onto a phone or rely on user-agent detection.
function updateMobileViewport(){
  document.documentElement.style.setProperty('--deck-height',window.innerHeight+'px');
}
function fitSlide(){ updateMobileViewport(); }

function scheduleFit(){
  clearTimeout(fitTimer);
  fitTimer=setTimeout(()=>requestAnimationFrame(fitSlide),30);
}

function showSlide(index,updateHash=true){
  const previous=slides[presentationIndex];
  if(previous) previous.classList.remove('presentation-active');
  presentationIndex=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>slide.classList.remove('presentation-active'));
  const activeSlide=slides[presentationIndex];
  void activeSlide.offsetWidth;
  activeSlide.classList.add('presentation-active');
  activeSlide.querySelector('.slide-content').scrollTop=0;
  hideTip();
  presentationCounter.textContent=(presentationIndex+1)+' / '+slides.length;
  presentationPrev.disabled=presentationIndex===0;
  presentationNext.disabled=presentationIndex===slides.length-1;

  const active=slides[presentationIndex];
  if(updateHash){
    const hash=active.id?'#'+active.id:(presentationIndex===0?'#top':'#slide-'+(presentationIndex+1));
    history.replaceState(null,'',hash);
  }
  requestAnimationFrame(()=>requestAnimationFrame(fitSlide));
}

function openDrawer(){
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  drawer.inert=false;drawerClose.focus();
}
function closeDrawer(){
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  drawer.inert=true;glossaryBtn.focus();
}
glossaryBtn.addEventListener('click',openDrawer);
drawerClose.addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);

presentationHome.addEventListener('click',()=>showSlide(0));
presentationPrev.addEventListener('click',()=>showSlide(presentationIndex-1));
presentationNext.addEventListener('click',()=>showSlide(presentationIndex+1));

document.querySelectorAll('.topbar a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const hash=link.getAttribute('href');
    if(!hash) return;
    const id=hash.replace('#','');
    const targetIndex=id==='top'?0:slides.findIndex(slide=>slide.id===id);
    if(targetIndex>=0){
      e.preventDefault();
      showSlide(targetIndex);
    }
  });
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && drawer.classList.contains('open')){
    closeDrawer();
    return;
  }
  if(drawer.classList.contains('open')){
    if(e.key==='Tab'){
      const items=[...drawer.querySelectorAll('button,a[href],[tabindex="0"]')];
      if(items.length===1){e.preventDefault();items[0].focus()}
    }
    return;
  }
  if(e.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();showSlide(presentationIndex+1);}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showSlide(presentationIndex-1);}
  if(e.key==='Home'){e.preventDefault();showSlide(0);}
  if(e.key==='End'){e.preventDefault();showSlide(slides.length-1);}
});

window.addEventListener('resize',scheduleFit);
window.addEventListener('orientationchange',()=>{setTimeout(()=>{updateMobileViewport();scheduleFit();showSlide(presentationIndex,false);},220);});
if(window.visualViewport){window.visualViewport.addEventListener('resize',()=>{updateMobileViewport();scheduleFit();});}

function showTip(el){
  const text=el.dataset.tip;
  if(!text) return;
  tooltip.textContent=text;
  tooltip.classList.add('show');
  const r=el.getBoundingClientRect();
  requestAnimationFrame(()=>{
    const t=tooltip.getBoundingClientRect();
    const left=Math.min(window.innerWidth-t.width-12,Math.max(12,r.left+r.width/2-t.width/2));
    let top=r.bottom+9;
    if(top+t.height>window.innerHeight-12) top=r.top-t.height-9;
    tooltip.style.left=left+'px';
    tooltip.style.top=Math.max(12,top)+'px';
  });
}
function hideTip(){tooltip.classList.remove('show');}
document.querySelectorAll('.term').forEach(el=>{
  el.addEventListener('mouseenter',()=>showTip(el));
  el.addEventListener('mouseleave',hideTip);
  el.addEventListener('focus',()=>showTip(el));
  el.addEventListener('blur',hideTip);
  el.addEventListener('click',()=>showTip(el));
});

document.body.classList.add('presentation-mode','deck-only');
updateMobileViewport();
progress.style.display='none';
showSlide(slideIndexFromHash(),false);
window.addEventListener('load',scheduleFit);

window.addEventListener('hashchange',()=>showSlide(slideIndexFromHash(),false));
