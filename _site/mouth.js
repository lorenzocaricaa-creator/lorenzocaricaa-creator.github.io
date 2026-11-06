import {artworkSVG,coverComposition} from './art-layout.mjs';
const root=document.getElementById('mouth-entry');
if(root){
 const boot=JSON.parse(document.getElementById('portfolio-data').textContent),items=boot.content.projects.filter(p=>!p.hidden);
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const quickNavigation=document.getElementById('mouth-quick-navigation'),menu=document.getElementById('mouth-project-menu'),mouth=document.getElementById('mouth-hotspot'),invite=document.getElementById('mouth-invite'),back=document.getElementById('mouth-back'),counter=document.getElementById('mouth-counter'),alternative=document.getElementById('mouth-enter-alternative'),listLink=document.getElementById('mouth-list-link'),returnButton=document.getElementById('return-to-mouth'),announcement=document.getElementById('mouth-announcement'),scrollHint=document.getElementById('mouth-scroll-hint');
 const original=[...document.querySelectorAll('.header,#lavori,#profilo,#contatti,.site-footer')];
 let state='closed',hoverTimer=null,settleTimer=null,paintKey='';
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 const fine=()=>matchMedia('(hover:hover) and (pointer:fine)').matches;
 menu.innerHTML=items.map((p,i)=>`<button class="mouth-project-link" data-project="${escape(p.id)}" aria-label="Scopri ${escape(p.title)}"><span class="mouth-project-number" aria-hidden="true">${String(i+1).padStart(2,'0')}/</span><span class="mouth-project-name">${escape(p.title)}</span><span class="mouth-project-arrow" aria-hidden="true">↗</span></button>`).join('')||'<p class="mouth-empty">I progetti saranno disponibili a breve.</p>';
 counter.textContent=items.length+' PROGETTI';document.getElementById('mouth-page-title').textContent=boot.content.profile.name+' — Portfolio';
 document.querySelector('[data-mouth-editor]').hidden=!boot.editor;
 const desktopMask=matchMedia('(min-width:1024px) and (orientation:landscape) and (hover:hover) and (pointer:fine)');
 let targetScroll=0, motion=0;
 function resetMask(){
  cancelAnimationFrame(motion);motion=0;
  if(desktopMask.matches && !menu.hidden)menu.scrollTop=menu.scrollHeight-menu.clientHeight;
  targetScroll=menu.scrollTop;
 }
 function glide(){
  const gap=targetScroll-menu.scrollTop;
  if(Math.abs(gap)<1.5){menu.scrollTop=targetScroll;motion=0;return;}
  menu.scrollTop+=Math.sign(gap)*Math.max(1,Math.abs(gap)*.24);
  motion=requestAnimationFrame(glide);
 }
 root.addEventListener('wheel',event=>{
  if(state!=='open'||!desktopMask.matches||event.ctrlKey||!event.deltaY||event.target.closest('.mouth-bottomline,.mouth-topline'))return;
  event.preventDefault();
  if(!motion)targetScroll=menu.scrollTop;
  const unit=event.deltaMode===1?16:event.deltaMode===2?menu.clientHeight:1;
  targetScroll=Math.max(0,Math.min(menu.scrollHeight-menu.clientHeight,targetScroll-event.deltaY*unit));
  if(reduced())menu.scrollTop=targetScroll;
  else if(!motion)motion=requestAnimationFrame(glide);
 },{passive:false});
 function updateScroll(){scrollHint.hidden=state!=='open'||menu.scrollHeight<=menu.clientHeight+2||menu.scrollTop+menu.clientHeight>=menu.scrollHeight-2;}
 function geometry(){
  const r=root.getBoundingClientRect();if(!r.width||!r.height)return;
  const portrait=r.height>r.width,cover=coverComposition(r.width,r.height);
  const inside={width:portrait?941:1586,height:portrait?1672:992,src:'/assets/entry-mouth-'+(portrait?'mobile':'desktop')+'.webp'};
  const key=[r.width,r.height,cover.src].join(':');
  const coverArt=artworkSVG(r.width,r.height,cover,{fullscreen:true}),interiorArt=artworkSVG(r.width,r.height,inside,{fullscreen:true});
  const frame=coverArt.frame,indexFrame=interiorArt.frame;
  if(key!==paintKey){document.getElementById('portrait-art').innerHTML=coverArt.svg;document.getElementById('interior-art').innerHTML=interiorArt.svg;}
  paintKey=key;root.dataset.composition=portrait?'portrait':r.width/r.height>=1.95?'wide':'landscape';
  const mx=frame.left+frame.width*cover.mouthX,my=frame.top+frame.height*cover.mouthY,hitWidth=Math.max(92,frame.width*(portrait?.19:.085)),hitHeight=Math.max(44,frame.height*.045);
  // The clear strip lies between the uvula and the tongue in each illustration.
  const indexHeight=Math.min(indexFrame.height*(portrait?.46:.19),r.height*.7);
  const rowHeight=Math.min(portrait?44:34,(indexHeight-8)/Math.max(1,items.length));
  const previousRow=Math.max(fine()?25:44,Math.min(55,(Math.max(95,indexFrame.height*(portrait?.50:.235))-8)/Math.max(1,items.length)));
  const previousFont=Math.max(16,Math.min(portrait?Math.min(24,indexFrame.width*.06):26,previousRow*.68));
  const indexFont=Math.min(previousFont*.85,rowHeight*.86);
  const inviteWidth=portrait?210:225,ix=Math.max(14,Math.min(r.width-inviteWidth-14,portrait?mx-inviteWidth/2:mx+12)),iy=Math.min(r.height-68,my+hitHeight*.7+14);
  const vars={'mouth-x':mx+'px','mouth-y':my+'px','mouth-width':hitWidth+'px','mouth-height':hitHeight+'px','invite-x':ix+'px','invite-y':iy+'px','invite-arrow-x':Math.max(16,Math.min(inviteWidth-20,mx-ix))+'px','index-x':indexFrame.left+indexFrame.width*(portrait?.503:.505)+'px','index-y':indexFrame.top+indexFrame.height*(portrait?.46:.525)+'px','index-width':Math.min(r.width-32,portrait?indexFrame.width*.73:Math.min(480,indexFrame.width*.45))+'px','index-height':indexHeight+'px','index-font':indexFont+'px','index-row':rowHeight+'px'};
  if(desktopMask.matches){
   const scale=indexFrame.width/inside.width;
   const step=34*scale;
   const firstRowTop=526-step/scale*items.length/2;
   vars['index-x']=(indexFrame.left+800*scale)+'px';
   vars['index-y']=(indexFrame.top+445*scale)+'px';
   vars['index-row']=step+'px';
   vars['index-font']=28*scale+'px';
   vars['mask-width']=376*scale+'px';
   vars['mask-height']=480*scale+'px';
   vars['lead-space']=(firstRowTop-205+154)*scale+'px';
   vars['tail-space']=Math.max(0,685-firstRowTop-items.length*34)*scale+'px';
  }
  for(const [key,value]of Object.entries(vars))root.style.setProperty('--'+key,value);
  if(desktopMask.matches)resetMask();
  requestAnimationFrame(updateScroll);
 }
 new ResizeObserver(geometry).observe(root);geometry();menu.addEventListener('scroll',updateScroll,{passive:true});
 function gateOriginal(show){document.body.classList.toggle('show-original',show);original.forEach(el=>el.inert=!show);returnButton.hidden=!show;root.inert=show;if(!show)geometry();}
 function settle(focus){state='open';root.classList.add('is-settled');root.setAttribute('aria-busy','false');menu.hidden=false;mouth.hidden=true;invite.hidden=true;back.hidden=false;counter.hidden=false;quickNavigation.hidden=false;alternative.hidden=true;listLink.hidden=false;announcement.textContent='Indice aperto. '+items.length+' progetti disponibili.';requestAnimationFrame(updateScroll);if(focus)(menu.querySelector('button')||back).focus({preventScroll:true});resetMask();}
 function open(focus=false,instant=false){if(state!=='closed')return;clearTimeout(hoverTimer);state='opening';root.setAttribute('aria-busy','true');mouth.setAttribute('aria-expanded','true');root.classList.add('is-preparing');if(instant||reduced()){root.classList.add('is-open');settle(focus);return;}requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('is-open')));settleTimer=setTimeout(()=>settle(focus),1050);}
 function close(){if(state==='closed')return;clearTimeout(settleTimer);clearTimeout(hoverTimer);state='closing';quickNavigation.hidden=true;menu.hidden=true;scrollHint.hidden=true;back.hidden=true;counter.hidden=true;root.classList.remove('is-settled','is-open','is-preparing');root.setAttribute('aria-busy','true');settleTimer=setTimeout(()=>{state='closed';mouth.hidden=false;invite.hidden=false;mouth.setAttribute('aria-expanded','false');root.setAttribute('aria-busy','false');alternative.hidden=false;listLink.hidden=true;announcement.textContent='Apri la bocca per esplorare i progetti.';mouth.focus({preventScroll:true});},reduced()?0:750);}
 mouth.addEventListener('pointerenter',()=>{if(fine()&&state==='closed')hoverTimer=setTimeout(()=>open(false),220);});mouth.addEventListener('pointerleave',()=>clearTimeout(hoverTimer));mouth.addEventListener('click',()=>open(true));invite.addEventListener('click',()=>open(true));alternative.addEventListener('click',()=>open(true));back.addEventListener('click',close);
 function showContent(section,initial=false){gateOriginal(true);const destination=document.getElementById(section);if(destination){destination.scrollIntoView({behavior:initial||reduced()?'instant':'smooth',block:'start'});if(!initial){const title=destination.querySelector('h2')||destination;title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}}if(!initial&&location.protocol!=='about:')history.replaceState(null,'','#'+section);}
 document.querySelectorAll('[data-mouth-section]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();showContent(button.dataset.mouthSection);}));
 function returnHome(){gateOriginal(false);scrollTo({top:0,behavior:'instant'});if(location.protocol!=='about:')history.replaceState(null,'',location.pathname+location.search);(state==='open'?back:mouth).focus({preventScroll:true});}
 returnButton.addEventListener('click',returnHome);document.querySelector('.header .identity').addEventListener('click',event=>{event.preventDefault();returnHome();});document.querySelector('[data-return-home]').addEventListener('click',event=>{event.preventDefault();returnHome();});
 document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();showContent('lavori');});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&state==='open'&&!document.getElementById('project-dialog').open){close();event.preventDefault();}});
 gateOriginal(false);if(boot.previewProjectId||location.hash.startsWith('#progetto/'))open(false,true);else if(boot.previewSection)showContent(boot.previewSection,true);else if(['#lavori','#profilo','#contatti'].includes(location.hash))showContent(location.hash.slice(1),true);
}
