'use strict';
(() => {
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isPreview=location.protocol==='about:';
const boot=JSON.parse(document.getElementById('portfolio-data').textContent);
const {profile}=boot.content,projects=boot.content.projects.filter(p=>!p.hidden);
const categoryNames={product:'Product design',prototype:'Prototipazione',communication:'Comunicazione'};
const text=(id,value)=>{document.getElementById(id).textContent=value;};
const lines=value=>esc(value).replace(/\n/g,'<br>');
const paragraphs=value=>String(value||'').split(/\n\s*\n/).filter(Boolean).map(value=>'<p>'+lines(value)+'</p>').join('');
const tags=p=>p.categories.map(c=>'<span>'+categoryNames[c]+'</span>').join('');
const cover=p=>p.images.find(photo=>photo[0]===p.cover)||p.images.find(photo=>photo[0]===p.cover.replace('-thumb',''))||p.images[0];
document.querySelector('.identity-name').innerHTML=esc(profile.name)+'<span class="identity-sub">'+esc(profile.professionalTitle)+'</span>';
document.querySelector('.identity').setAttribute('aria-label',profile.name+', inizio');
document.title=profile.name+' — '+profile.professionalTitle;
text('profile-title',profile.aboutHeading);document.getElementById('about-copy').innerHTML=paragraphs(profile.aboutText);
text('contact-title',profile.contactHeading);text('contact-copy',profile.contactText);
document.querySelectorAll('a[href^="mailto:"]').forEach(link=>link.href='mailto:'+profile.email);
document.querySelector('.email-address').textContent=profile.email;
document.getElementById('skills-list').innerHTML=profile.skills.map(s=>'<div class="skill-row"><h4>'+esc(s.title)+'</h4><p>'+lines(s.description)+'</p></div>').join('');
function entries(id,items){document.getElementById(id).innerHTML=items.map(item=>'<div class="experience"><span>'+esc(item.period)+'</span><div><h4>'+esc(item.title)+'</h4><p>'+lines(item.description)+'</p></div></div>').join('');}
entries('experience-list',profile.experiences);entries('education-list',profile.education);
text('footer-copyright','© '+new Date().getFullYear()+' '+profile.name);
document.querySelector('[data-editor-link]').hidden=!boot.editor;
const count=String(projects.length).padStart(2,'0');document.querySelector('.sup').textContent='('+count+')';
document.querySelector('.filter[data-filter=all]').textContent='Tutti '+count;
document.querySelector('.result-count').textContent=projects.length+' progetti';
const grid=document.getElementById('project-grid');
grid.innerHTML=projects.map((p,i)=>`<button class="project-card" data-project="${esc(p.id)}" aria-label="Scopri ${esc(p.title)}"><span class="project-image"><img src="${esc(p.cover)}" alt="${esc(cover(p)?.[1]||p.title)}" loading="lazy" decoding="async"><span class="project-plus" aria-hidden="true">↗</span></span><span class="project-info"><span><span class="project-title">${esc(p.title)}</span><span class="project-subtitle">${esc(p.subtitle)}</span></span><span class="project-year">${String(i+1).padStart(2,'0')}/ ${esc(p.year)}</span></span><span class="project-tags">${tags(p)}</span></button>`).join('')||'<p class="empty-projects">I progetti saranno disponibili a breve.</p>';
let activeFilter='all',activeIndex=0,returnFocus=null,collectiveReturnFocus=null;
const dialog=document.getElementById('project-dialog'),dialogBody=document.getElementById('dialog-body'),closeButton=document.getElementById('close-dialog'),collectiveDialog=document.getElementById('collective-dialog');
function visibleProjects(){return projects.filter(p=>activeFilter==='all'||p.categories.includes(activeFilter));}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 activeFilter=button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
 let total=0;grid.querySelectorAll('.project-card').forEach(card=>{const p=projects.find(p=>p.id===card.dataset.project);card.hidden=activeFilter!=='all'&&!p.categories.includes(activeFilter);if(!card.hidden)total++;});
 document.querySelector('.result-count').textContent=total+' progetti';
}));
function photo(p,src,caption='',hero=false){
 const info=p.images.find(photo=>photo[0]===src);if(!info)return '';
 const size=window.portfolioPhotoDimensions?.[src];const dimensions=size?` width="${size[0]}" height="${size[1]}"`:'';
 const captionMarkup=hero||(p.id==='in-forma'&&src==='/assets/informa-context-definitiva.png')||src==='/assets/ordita-worn.webp'||(p.id==='accessories'&&src==='/assets/accessories-editorial.webp')?'':`<figcaption class="photo-caption"><span>${esc(caption||info[1])}</span></figcaption>`;
 return `<div class="case-photo"><img src="${esc(src)}"${dimensions} alt="${esc(info[1]||p.title)}" loading="${hero?'eager':'lazy'}" decoding="async"></div>${captionMarkup}`;
}
function block(p,b,index){
 const tone=b.tone==='light'?' light':'';const label=String(index+(p.id==='accessories'?2:1)).padStart(2,'0')+' /';
 if(b.type==='image')return `<section class="case-block case-image${tone}"><figure>${photo(p,b.image,b.caption)}</figure></section>`;
 if(b.type==='pair')return `<section data-pair="${esc(p.id)}-${esc(b.id)}" class="case-block case-pair${tone}"><span class="block-label">${label} ${esc(b.label??'IMMAGINI / DETTAGLI')}</span><div class="pair-photos">${b.images.map(src=>'<figure>'+photo(p,src)+'</figure>').join('')}</div>${b.caption?'<p class="pair-caption">'+lines(b.caption)+'</p>':''}</section>`;
 if(b.type==='gallery')return `<section class="case-block case-gallery${tone}"><div class="gallery-heading">${b.heading?'<h3>'+lines(b.heading)+'</h3>':''}${b.caption?paragraphs(b.caption):''}</div><div class="gallery-photos" style="--gallery-columns:${Math.min(3,b.images.length)}" role="region" aria-label="${esc(b.heading?.replace(/\n/g,' ')||'Galleria fotografica')}" tabindex="0">${b.images.map(src=>'<figure>'+photo(p,src)+'</figure>').join('')}</div></section>`;
 if(b.type==='text')return `<section class="case-block case-text${tone}"><span class="block-label">${label} ${esc(b.label??(index===0?'IL PROGETTO':'APPROFONDIMENTO'))}</span><div class="block-copy">${b.heading?'<h3>'+lines(b.heading)+'</h3>':''}${paragraphs(b.text)}</div></section>`;
 if(b.type==='split')return `<section class="case-block case-split${tone}${b.side==='right'?' image-right':''}"><figure>${photo(p,b.image,b.caption)}</figure><div class="split-copy">${b.heading?'<h3>'+lines(b.heading)+'</h3>':''}${paragraphs(b.text)}</div></section>`;
 return '';
}
function collectiveLogo(c,className=''){return c.logo?`<img class="${className}" src="${esc(c.logo)}" alt="${esc(c.name)} collettivo" width="1522" height="930">`:`<span class="${className}">${esc(c.name)}</span>`;}
function collectiveCallout(p){const c=boot.content.collective;return p.collective&&c?`<aside class="collective-callout" aria-label="Progetto collettivo"><div><span class="block-label">PROGETTO COLLETTIVO</span>${collectiveLogo(c,'collective-callout-logo')}</div><button data-open-collective>Il collettivo <span aria-hidden="true">↗</span></button></aside>`:'';}
function openCollective(){
 const c=boot.content.collective;if(!c)return;
 collectiveReturnFocus=document.activeElement;
 document.getElementById('collective-title').textContent=c.name;
 document.getElementById('collective-logo').innerHTML=collectiveLogo(c,'collective-logo');
 document.getElementById('collective-description').innerHTML=paragraphs(c.description);
 const list=items=>'<ul>'+items.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>';
 document.getElementById('collective-facts').innerHTML=(c.founded?'<section><h3>ANNO DI FONDAZIONE</h3><p>'+esc(c.founded)+'</p></section>':'')+(c.members?.length?'<section><h3>MEMBRI DEL COLLETTIVO</h3>'+list(c.members)+'</section>':'')+(c.disciplines?.length?'<section><h3>AMBITI</h3>'+list(c.disciplines)+'</section>':'');
 document.getElementById('collective-highlights').innerHTML=c.highlights?.length?'<h3>SELEZIONE DI PROGETTI ED ESPOSIZIONI</h3>'+c.highlights.map(item=>'<article><span>'+esc(item.period)+'</span><div><h4>'+esc(item.title)+'</h4>'+paragraphs(item.description)+'</div></article>').join(''):'';
 const instagram=document.getElementById('collective-instagram');instagram.href='https://www.instagram.com/'+encodeURIComponent(c.instagramHandle)+'/';instagram.textContent='@'+c.instagramHandle+' ↗';
 if(!collectiveDialog.open)collectiveDialog.showModal();document.getElementById('close-collective').focus({preventScroll:true});
}
function navigationList(){let list=visibleProjects();if(!list.some(p=>p.id===projects[activeIndex].id))list=projects;return list;}
function renderProject(){
 const p=projects[activeIndex],hero=p.images.find(([src])=>src===p.heroImage)||cover(p);if(!hero)return;
 text('dialog-position',profile.name+' / '+String(activeIndex+1).padStart(2,'0')+' — '+count);
 dialogBody.innerHTML=`<article class="case-study"><header class="case-heading"><div class="case-meta"><span>${String(activeIndex+1).padStart(2,'0')} / ${count}</span><span>${lines(p.context)}<br>${esc(p.year)}</span></div><h2 id="dialog-title">${esc(p.title)}</h2><div class="project-tags">${tags(p)}</div></header><figure class="case-hero">${photo(p,hero[0],hero[1],true)}</figure>${collectiveCallout(p)}${(p.blocks||[]).map((b,i)=>block(p,b,i)).join('')}<section class="case-credits"><div><h3>${esc(p.roleLabel??'IL MIO RUOLO / CREDITI')}</h3>${paragraphs(p.role)}</div><div><h3>${esc(p.detailsLabel??'DETTAGLI')}</h3>${paragraphs(p.note)}${p.id==='synkara'?'<p><a href="https://www.instagram.com/progettosynkara/" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;text-underline-offset:4px">Segui SYNKARÀ su Instagram — @progettosynkara ↗</a></p>':''}<div class="project-tags">${tags(p)}</div></div></section></article>`;
 const list=navigationList(),i=list.findIndex(item=>item.id===p.id),prev=list[(i-1+list.length)%list.length],next=list[(i+1)%list.length];
 const previous=document.getElementById('previous-project'),following=document.getElementById('next-project');
 previous.innerHTML='<span class="nav-arrow" aria-hidden="true">←</span><span class="nav-project">'+esc(prev.title)+'</span>';following.innerHTML='<span class="nav-project">'+esc(next.title)+'</span><span class="nav-arrow" aria-hidden="true">→</span>';
 previous.disabled=following.disabled=list.length<2;previous.setAttribute('aria-label','Progetto precedente: '+prev.title);following.setAttribute('aria-label','Progetto successivo: '+next.title);
 dialog.scrollTop=0;
}
function openProject(id,updateHash=true){const i=projects.findIndex(p=>p.id===id);if(i<0)return;if(collectiveDialog.open){collectiveReturnFocus=null;collectiveDialog.close();}activeIndex=i;if(!dialog.open)returnFocus=document.activeElement;renderProject();if(!dialog.open){dialog.showModal();document.body.classList.add('dialog-open');}closeButton.focus({preventScroll:true});if(updateHash&&!isPreview)history.pushState({project:id},'','#progetto/'+id);}
function closeProject(){if(collectiveDialog.open){collectiveReturnFocus=null;collectiveDialog.close();}if(dialog.open)dialog.close();}
function moveProject(direction){const list=navigationList();if(!list.length)return;const i=list.findIndex(p=>p.id===projects[activeIndex].id);openProject(list[(i+direction+list.length)%list.length].id,false);if(!isPreview)history.replaceState(null,'','#progetto/'+projects[activeIndex].id);}
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-project]');if(trigger)openProject(trigger.dataset.project);if(event.target.closest('[data-open-collective]'))openCollective();});
closeButton.addEventListener('click',closeProject);document.getElementById('previous-project').addEventListener('click',()=>moveProject(-1));document.getElementById('next-project').addEventListener('click',()=>moveProject(1));
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');if(!isPreview&&location.hash.startsWith('#progetto/'))history.replaceState(null,'',location.pathname+location.search);if(returnFocus instanceof HTMLElement&&returnFocus.isConnected&&!returnFocus.hidden)returnFocus.focus({preventScroll:true});});
document.getElementById('close-collective').addEventListener('click',()=>collectiveDialog.close());
collectiveDialog.addEventListener('close',()=>{if(dialog.open&&collectiveReturnFocus instanceof HTMLElement&&collectiveReturnFocus.isConnected)collectiveReturnFocus.focus({preventScroll:true});collectiveReturnFocus=null;});
function syncHash(){if(location.hash.startsWith('#progetto/')){let id;try{id=decodeURIComponent(location.hash.slice(10));}catch{return;}openProject(id,false);}else if(dialog.open)closeProject();}
window.addEventListener('hashchange',syncHash);syncHash();if(boot.previewProjectId)openProject(boot.previewProjectId,false);
document.getElementById('copy-email').addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText(profile.email);status.textContent='Indirizzo copiato.';}catch{const field=document.createElement('textarea');field.value=profile.email;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();document.getElementById('copy-email').focus({preventScroll:true});status.textContent=copied?'Indirizzo copiato.':'Seleziona e copia l’indirizzo qui sopra.';}});
})();
