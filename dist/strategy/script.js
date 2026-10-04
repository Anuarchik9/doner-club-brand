const progress=document.getElementById('progressBar');
const drawer=document.getElementById('drawer');
const backdrop=document.getElementById('backdrop');
const glossaryBtn=document.getElementById('glossaryBtn');
const drawerClose=document.getElementById('drawerClose');
const tooltip=document.getElementById('tooltip');

function updateProgress(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  progress.style.width=Math.max(0,Math.min(100,pct))+'%';
}
window.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();

function openDrawer(){
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
}
function closeDrawer(){
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
}
glossaryBtn.addEventListener('click',openDrawer);
drawerClose.addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeDrawer();});

function showTip(el){
  const text=el.dataset.tip;
  if(!text) return;
  tooltip.textContent=text;
  tooltip.classList.add('show');
  const r=el.getBoundingClientRect();
  requestAnimationFrame(()=>{
    const t=tooltip.getBoundingClientRect();
    let left=Math.min(window.innerWidth-t.width-12,Math.max(12,r.left+r.width/2-t.width/2));
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
  el.addEventListener('click',()=>tooltip.classList.contains('show')?hideTip():showTip(el));
});