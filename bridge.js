(()=>{
// Runs in an opaque-origin sandbox; cannot read the parent's login/session storage.
const send=(type,data={})=>parent.postMessage({type,...data},'*');
let courseRoot=document.documentElement;
addEventListener('message',e=>{if(e.source!==parent)return;if(e.data?.type==='appearance'&&['light','dark'].includes(e.data.theme))courseRoot.dataset.theme=e.data.theme;if(e.data?.type==='resume'&&Number.isInteger(e.data.chapter))e.data.chapter>1?document.getElementById('chapter-'+e.data.chapter)?.scrollIntoView():window.scrollTo(0,0)});
addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';
 if(href.startsWith('#')){e.preventDefault();const target=document.getElementById(href.slice(1));if(target){if(target.matches('details.practical-extra'))target.open=true;target.scrollIntoView();const match=href.match(/^#chapter-(\d+)$/);if(match)send('chapter',{chapter:Number(match[1])});}return;}
 e.preventDefault();if(/^https:\/\//.test(href)){window.open(href,'_blank','noopener,noreferrer');}else send('home');
});
let timer;const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const chapter=Number(entry.target.id.split('-')[1]);clearTimeout(timer);timer=setTimeout(()=>send('chapter',{chapter}),900);}},{rootMargin:'0px 0px -65% 0px'});
document.querySelectorAll('section.chapter[id^="chapter-"]').forEach(el=>observer.observe(el));
send('ready');
})();
