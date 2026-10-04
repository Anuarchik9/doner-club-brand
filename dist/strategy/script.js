const body=document.body;
const progress=document.getElementById('progressBar');
const presentBtn=document.getElementById('presentBtn');
const glossaryBtn=document.getElementById('glossaryBtn');
const glossaryDrawer=document.getElementById('glossaryDrawer');
const glossaryClose=document.getElementById('glossaryClose');
const drawerBackdrop=document.getElementById('drawerBackdrop');
const tooltip=document.getElementById('tooltip');
const architectureBoard=document.getElementById('architectureBoard');

function updateProgress(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const pct=max>0?Math.min(100,Math.max(0,(scrollY/max)*100)):0;
  progress.style.width=pct+'%';
}
addEventListener('scroll',updateProgress,{passive:true});
addEventListener('resize',updateProgress);
updateProgress();

presentBtn?.addEventListener('click',()=>{
  body.classList.toggle('presentation');
  presentBtn.textContent=body.classList.contains('presentation')?'Обычный режим':'Режим презентации';
});

document.querySelectorAll('[data-view]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===btn));
    architectureBoard.classList.toggle('target',btn.dataset.view==='target');
    architectureBoard.classList.toggle('current',btn.dataset.view!=='target');
  });
});

function openGlossary(){
  glossaryDrawer.classList.add('open');
  drawerBackdrop.classList.add('open');
  glossaryDrawer.setAttribute('aria-hidden','false');
}
function closeGlossary(){
  glossaryDrawer.classList.remove('open');
  drawerBackdrop.classList.remove('open');
  glossaryDrawer.setAttribute('aria-hidden','true');
}
glossaryBtn?.addEventListener('click',openGlossary);
glossaryClose?.addEventListener('click',closeGlossary);
drawerBackdrop?.addEventListener('click',closeGlossary);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeGlossary();
  if(!body.classList.contains('presentation')) return;
  if(e.key==='ArrowDown'||e.key==='PageDown') jumpChapter(1);
  if(e.key==='ArrowUp'||e.key==='PageUp') jumpChapter(-1);
});
document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>{
  closeGlossary();
  document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:'smooth'});
}));

function jumpChapter(direction){
  const chapters=[...document.querySelectorAll('.chapter')];
  const y=scrollY+100;
  let current=0;
  chapters.forEach((el,i)=>{if(el.offsetTop<=y) current=i;});
  const target=chapters[Math.max(0,Math.min(chapters.length-1,current+direction))];
  target?.scrollIntoView({behavior:'smooth',block:'start'});
}

function showTip(el){
  const text=el.dataset.tip;
  if(!text) return;
  tooltip.textContent=text;
  tooltip.classList.add('show');
  const r=el.getBoundingClientRect();
  const w=Math.min(320,innerWidth-24);
  tooltip.style.maxWidth=w+'px';
  requestAnimationFrame(()=>{
    const tr=tooltip.getBoundingClientRect();
    let left=Math.min(innerWidth-tr.width-12,Math.max(12,r.left+r.width/2-tr.width/2));
    let top=r.bottom+10;
    if(top+tr.height>innerHeight-12) top=r.top-tr.height-10;
    tooltip.style.left=left+'px';
    tooltip.style.top=Math.max(12,top)+'px';
  });
}
function hideTip(){tooltip.classList.remove('show')}
document.querySelectorAll('.term').forEach(el=>{
  el.addEventListener('mouseenter',()=>showTip(el));
  el.addEventListener('mouseleave',hideTip);
  el.addEventListener('focus',()=>showTip(el));
  el.addEventListener('blur',hideTip);
  el.addEventListener('click',()=>{
    if(tooltip.classList.contains('show')) hideTip(); else showTip(el);
  });
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add('seen');
  });
},{threshold:.08});
document.querySelectorAll('.chapter').forEach(el=>observer.observe(el));
