(()=>{
const root=document.documentElement,button=document.getElementById('theme'),labels=JSON.parse(document.getElementById('ui-labels').textContent);
function apply(theme){root.dataset.theme=theme;if(button){button.textContent=theme==='dark'?'☀ '+labels.day:'☾ '+labels.night;button.setAttribute('aria-pressed',String(theme==='dark'));}try{localStorage.setItem('ai-course-theme',theme)}catch(e){}}
apply(root.dataset.theme||'light');button?.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark'));
const supported=['es','en','fr','it'];
const lang=document.getElementById('language');
if(!root.dataset.profile){let preferred;try{preferred=localStorage.getItem('ai-course-language')}catch(e){}
if(!supported.includes(preferred)){const requested=navigator.languages?.length?navigator.languages:[navigator.language];preferred=requested.map(x=>String(x).toLowerCase().split('-')[0]).find(x=>supported.includes(x))||'en'}
if(preferred!==root.lang){location.replace((preferred==='es'?'index.html':'index-'+preferred+'.html')+location.hash)}
}
if(lang)lang.addEventListener('change',()=>{try{localStorage.setItem('ai-course-language',lang.value)}catch(e){}let profile=root.dataset.profile;let file=profile?profile+'-'+lang.value+'.html':(lang.value==='es'?'index.html':'index-'+lang.value+'.html');location.href=file+location.hash});
let step=0,steps=[...document.querySelectorAll('#llm-flow>div')],next=document.getElementById('flow-next');if(next){next.addEventListener('click',()=>{steps[step].classList.remove('active');step=(step+1)%steps.length;steps[step].classList.add('active');const descriptions=JSON.parse(document.getElementById('flow-details').textContent);document.getElementById('flow-detail').textContent=descriptions[step];document.getElementById('flow-status').textContent=(step+1)+' / '+steps.length+' · '+steps[step].querySelector('span').textContent});}
let fp=document.getElementById('fp'),fn=document.getElementById('fn');if(fp){function update(){document.getElementById('fp-value').textContent=fp.value;document.getElementById('fn-value').textContent=fn.value;document.getElementById('precision').textContent=(1500/(15+Number(fp.value))).toFixed(1)+' %';document.getElementById('recall').textContent=(1500/(15+Number(fn.value))).toFixed(1)+' %';}fp.addEventListener('input',update);fn.addEventListener('input',update);update()}
const inputs=['volume','minutes','hour','cost'].map(id=>document.getElementById(id));if(inputs.every(Boolean)){function calc(){let v=inputs.map(el=>Math.max(0,Number(el.value)||0)),hours=v[0]*v[1]/60;document.getElementById('hours').textContent=hours.toFixed(1);document.getElementById('benefit').textContent=(hours*v[2]-v[3]).toFixed(2)+' €'}inputs.forEach(el=>el.addEventListener('input',calc));calc()}
document.addEventListener('click',e=>{const link=e.target.closest('.activity-code-links a');if(!link)return;const target=document.getElementById(link.hash.slice(1));if(target?.matches('details.practical-extra'))target.open=true});
if('IntersectionObserver' in window){let observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.sidebar a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}})},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('section.chapter').forEach(s=>observer.observe(s));}
})();
