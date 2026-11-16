(()=>{
const root=document.documentElement,button=document.getElementById('theme'),labels=JSON.parse(document.getElementById('ui-labels').textContent);
function apply(theme){root.dataset.theme=theme;if(button){button.textContent=theme==='dark'?'☀ '+labels.day:'☾ '+labels.night;button.setAttribute('aria-pressed',String(theme==='dark'));}}
apply(root.dataset.theme||'light');button?.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark'));
const supported=['es','en','fr','it'];
const lang=document.getElementById('language');
if(!root.dataset.profile){let preferred=new URLSearchParams(location.search).get('lang');
if(!supported.includes(preferred)){const requested=navigator.languages?.length?navigator.languages:[navigator.language];preferred=requested.map(x=>String(x).toLowerCase().split('-')[0]).find(x=>supported.includes(x))||'en'}
if(preferred!==root.lang){location.replace((preferred==='es'?'index.html':'index-'+preferred+'.html')+location.hash)}
}
if(lang)lang.addEventListener('change',()=>{let profile=root.dataset.profile;let file=profile?profile+'-'+lang.value+'.html':(lang.value==='es'?'index.html':'index-'+lang.value+'.html');location.href=file+'?lang='+lang.value+location.hash});
let step=0,steps=[...document.querySelectorAll('#llm-flow>div')],next=document.getElementById('flow-next');if(next){next.addEventListener('click',()=>{steps[step].classList.remove('active');step=(step+1)%steps.length;steps[step].classList.add('active');const descriptions=JSON.parse(document.getElementById('flow-details').textContent);document.getElementById('flow-detail').textContent=descriptions[step];document.getElementById('flow-status').textContent=(step+1)+' / '+steps.length+' · '+steps[step].querySelector('span').textContent});}
let fp=document.getElementById('fp'),fn=document.getElementById('fn');if(fp){function update(){document.getElementById('fp-value').textContent=fp.value;document.getElementById('fn-value').textContent=fn.value;document.getElementById('precision').textContent=(1500/(15+Number(fp.value))).toFixed(1)+' %';document.getElementById('recall').textContent=(1500/(15+Number(fn.value))).toFixed(1)+' %';}fp.addEventListener('input',update);fn.addEventListener('input',update);update()}
const inputs=['volume','minutes','hour','cost'].map(id=>document.getElementById(id));if(inputs.every(Boolean)){function calc(){let v=inputs.map(el=>Math.max(0,Number(el.value)||0)),hours=v[0]*v[1]/60;document.getElementById('hours').textContent=hours.toFixed(1);document.getElementById('benefit').textContent=(hours*v[2]-v[3]).toFixed(2)+' €'}inputs.forEach(el=>el.addEventListener('input',calc));calc()}
document.addEventListener('click',e=>{const tutor=e.target.closest('.course-tutor');if(tutor&&parent!==window){const chapter=Number(tutor.closest('section.chapter').id.split('-')[1]);parent.postMessage({type:'tutor',chapter},'*');return}const link=e.target.closest('.activity-code-links a');if(!link)return;const target=document.getElementById(link.hash.slice(1));if(target?.matches('details.practical-extra'))target.open=true});
if('IntersectionObserver' in window){let observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.sidebar a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}})},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('section.chapter').forEach(s=>observer.observe(s));}
})();

// Speech is requested only after a learner presses Listen; there is no automatic playback.
(()=>{
 const synth=window.speechSynthesis, U=window.SpeechSynthesisUtterance;
 let current=null,serial=0;
 const skip='details,nav,script,style,button,select,option,input,textarea,pre,code,svg,figure,.figure,.learning-map,.flow,.chapter-audio,.course-tutor,.next,[hidden],[aria-hidden="true"]';
 const blockTags=new Set(['P','H2','H3','H4','H5','LI','DT','DD','TH','TD','BLOCKQUOTE']);
 function spokenText(chapter){
  const blocks=[];let last=null;
  const walker=document.createTreeWalker(chapter,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
   const node=walker.currentNode,p=node.parentElement;
   if(!p||p.closest(skip))continue;
   const part=node.data.replace(/\s+/g,' ').trim();if(!part)continue;
   let parent=p;while(parent&&parent!==chapter&&!blockTags.has(parent.tagName))parent=parent.parentElement;
   if(parent!==last){blocks.push(part);last=parent}else blocks[blocks.length-1]+=' '+part;
  }
  return blocks.join('. ').replace(/\s+/g,' ').trim();
 }
 function chunks(text){
  const sentences=text.match(/[^.!?\n]+[.!?]?/g)||[text],result=[];let part='';
  for(const sentence of sentences){let s=sentence.trim();while(s.length>220){const cut=s.lastIndexOf(' ',220);const end=cut>40?cut:220;if(part){result.push(part);part=''}result.push(s.slice(0,end));s=s.slice(end).trim()}
   if(!s)continue;if(part&&(part+' '+s).length>220){result.push(part);part=''}part+=(part?' ':'')+s;
  }if(part)result.push(part);return result;
 }
 function status(item,key){item.querySelector('.audio-status').textContent=item.dataset[key]||''}
 function setButtons(item,paused){item.querySelector('.audio-pause').hidden=paused;item.querySelector('.audio-resume').hidden=!paused}
 function stop(key='stopped'){
  serial++;if(synth)synth.cancel();if(!current)return;
  const item=current.item;current=null;item.querySelector('.audio-open').setAttribute('aria-expanded','false');item.querySelector('.audio-panel').hidden=true;status(item,key);setButtons(item,false);
 }
 function refreshVoices(item){
  if(!synth)return;const select=item.querySelector('.audio-voice'),chosen=select.value,lang=document.documentElement.lang.toLowerCase().split('-')[0];
  const voices=synth.getVoices().filter(v=>v.lang.toLowerCase().split('-')[0]===lang);select.replaceChildren(select.options[0]);
  for(const voice of voices){const option=document.createElement('option');option.value=voice.voiceURI||voice.name;option.textContent=voice.name+' ('+voice.lang+' · '+(voice.localService?item.dataset.local:item.dataset.remote)+')';select.append(option)}
  if([...select.options].some(option=>option.value===chosen))select.value=chosen;
 }
 function voiceFor(lang,item){const matches=synth.getVoices().filter(v=>v.lang.toLowerCase().split('-')[0]===lang),chosen=item.querySelector('.audio-voice').value;return matches.find(v=>(v.voiceURI||v.name)===chosen)||matches.find(v=>v.localService)||matches[0]||null} 
 function speakNext(id){
  if(!current||id!==serial)return;const state=current;
  if(state.index>=state.parts.length){status(state.item,'finished');state.item.querySelector('.audio-open').setAttribute('aria-expanded','false');state.item.querySelector('.audio-panel').hidden=true;current=null;return}
  let utterance;try{utterance=new U(state.parts[state.index]);utterance.lang=document.documentElement.lang;const voice=voiceFor(utterance.lang.toLowerCase().split('-')[0],state.item);if(voice)utterance.voice=voice;utterance.rate=Number(state.item.querySelector('.audio-speed').value);state.utterance=utterance;
   utterance.onend=()=>{if(current===state&&id===serial){state.index++;speakNext(id)}};
   utterance.onerror=()=>{if(current===state&&id===serial){status(state.item,'error');state.item.querySelector('.audio-pause').hidden=true;state.item.querySelector('.audio-resume').hidden=true;current=null}};
   synth.speak(utterance);status(state.item,'playing');
  }catch(_){status(state.item,'error');state.item.querySelector('.audio-pause').hidden=true;state.item.querySelector('.audio-resume').hidden=true;current=null}
 }
 for(const item of document.querySelectorAll('.chapter-audio')){
  const panel=item.querySelector('.audio-panel'),open=item.querySelector('.audio-open');
  open.addEventListener('click',()=>{
   if(current?.item===item){stop();return}
   if(!panel.hidden&&!current){panel.hidden=true;open.setAttribute('aria-expanded','false');return}
   stop();refreshVoices(item);panel.hidden=false;open.setAttribute('aria-expanded','true');setButtons(item,false);
   if(!synth||!U){status(item,'unavailable');item.querySelector('.audio-pause').hidden=true;item.querySelector('.audio-resume').hidden=true;return}
   const parts=chunks(spokenText(item.closest('section.chapter')));if(!parts.length){status(item,'empty');return}
   current={item,parts,index:0};status(item,'ready');speakNext(serial);
  });
  item.querySelector('.audio-pause').addEventListener('click',()=>{if(current?.item!==item)return;synth.pause();setButtons(item,true);status(item,'paused')});
  item.querySelector('.audio-resume').addEventListener('click',()=>{if(current?.item!==item)return;synth.resume();setButtons(item,false);status(item,'playing')});
  item.querySelector('.audio-stop').addEventListener('click',()=>stop());
 }
 if(synth?.addEventListener)synth.addEventListener('voiceschanged',()=>document.querySelectorAll('.chapter-audio').forEach(refreshVoices));
 window.addEventListener('hashchange',()=>{if(current&&/^#chapter-\d+$/.test(location.hash)&&location.hash!=='#'+current.item.closest('section.chapter').id)stop()});
 window.addEventListener('pagehide',()=>stop());
})();
