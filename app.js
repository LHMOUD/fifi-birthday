'use strict';
const config=window.INVITATION,el=id=>document.getElementById(id),root=document.documentElement;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
document.title=`من عالم ${config.name} · دعوة عيد ميلاد`;
el('venue').textContent=config.venue;
const date=new Date(config.date),validDate=Number.isFinite(date.getTime());
el('event-date').textContent=validDate?new Intl.DateTimeFormat('ar-IQ',{timeZone:config.timeZone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date):'الموعد يُحدّد قريبًا';
el('footer-details').textContent=el('event-date').textContent+' · '+config.venue;
function tick(){
 const gap=date.getTime()-Date.now();
 if(!validDate||gap<=0){el('count-title').textContent=validDate?'حان موعد فرحتنا ♡':'بانتظار موعد الفرح';el('countdown').hidden=true;el('day-label').textContent='موعدنا';return;}
 const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:config.timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
 const nowDay=dayFormat.format(new Date()),tomorrowDay=dayFormat.format(new Date(Date.now()+86400000)),eventDay=dayFormat.format(date);
 el('day-label').textContent=eventDay===nowDay?'اليوم':eventDay===tomorrowDay?'باجر':'موعدنا';
 const total=Math.floor(gap/1000),values=[Math.floor(total/86400),Math.floor(total/3600)%24,Math.floor(total/60)%60,total%60];
 ['days','hours','minutes','seconds'].forEach((id,i)=>el(id).textContent=values[i].toLocaleString('ar-IQ',{minimumIntegerDigits:2}));
}
tick();setInterval(tick,1000);
if('IntersectionObserver' in window){root.classList.add('js');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('visible',entry.isIntersecting)),{threshold:.12});document.querySelectorAll('.reveal').forEach(item=>observer.observe(item));}
const section=el('fifi');let scheduled=false;
function paintScroll(){scheduled=false;const max=root.scrollHeight-innerHeight;root.style.setProperty('--scroll',String(clamp(scrollY/Math.max(1,max))));if(reducedMotion.matches)return;root.style.setProperty('--opening-progress',String(clamp(scrollY/(innerHeight*.9))));const rect=section.getBoundingClientRect();root.style.setProperty('--scene',String(clamp((innerHeight*.75-rect.top)/(innerHeight*.95))));}
function queuePaint(){if(!scheduled){scheduled=true;requestAnimationFrame(paintScroll);}}
addEventListener('scroll',queuePaint,{passive:true});addEventListener('resize',queuePaint);reducedMotion.addEventListener('change',queuePaint);paintScroll();
for(let i=0;i<24;i++){const star=document.createElement('i');star.className='sparkle';star.style.left=`${(i*37)%100}%`;star.style.top=`${(i*23)%100}%`;el('sparkles').append(star);}
// Music-box arrangement generated locally with Web Audio, starts only on a tap.
let audioContext=null,master=null,musicOn=false,musicTimer=null,nextPhrase=0;
const melody=[[67,.5],[67,.5],[69,1],[67,1],[72,1],[71,2],[67,.5],[67,.5],[69,1],[67,1],[74,1],[72,2],[67,.5],[67,.5],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.5],[77,.5],[76,1],[72,1],[74,1],[72,2]];
function scheduleMelody(start){let cursor=start;melody.forEach(([note,beats])=>{const duration=beats*.43;[1,2].forEach((harmonic,index)=>{const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=440*Math.pow(2,(note-69)/12)*harmonic;gain.gain.setValueAtTime(0,cursor);gain.gain.linearRampToValueAtTime(index?.025:.12,cursor+.012);gain.gain.exponentialRampToValueAtTime(.0001,cursor+duration+.28);oscillator.connect(gain);gain.connect(master);oscillator.start(cursor);oscillator.stop(cursor+duration+.3);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});cursor+=duration;});return cursor+2;}
async function startMusic(silent=false){
 if(musicOn)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)throw new Error('Audio unavailable');
  if(!audioContext){audioContext=new Audio();master=audioContext.createGain();master.gain.value=.35;master.connect(audioContext.destination);}
  // A blocked automatic resume may stay pending. A later tap must be free to retry.
  await audioContext.resume();
  if(audioContext.state!=='running'||document.hidden||musicOn)return;
  musicOn=true;
  el('sound').setAttribute('aria-pressed','true');
  el('sound').setAttribute('aria-label','إيقاف موسيقى عيد الميلاد');
  el('sound-label').textContent='الموسيقى شغّالة';
  if(!nextPhrase)nextPhrase=scheduleMelody(audioContext.currentTime+.08);
  clearInterval(musicTimer);
  musicTimer=setInterval(()=>{if(musicOn&&audioContext.currentTime+1>=nextPhrase)nextPhrase=scheduleMelody(nextPhrase);},400);
 }catch(_){if(!silent)el('sound-status').textContent='تعذّر تشغيل الموسيقى. جرّبي زر الموسيقى مرة أخرى.';}
}
async function stopMusic(){musicOn=false;clearInterval(musicTimer);if(audioContext)await audioContext.suspend();el('sound').setAttribute('aria-pressed','false');el('sound').setAttribute('aria-label','تشغيل موسيقى عيد الميلاد');el('sound-label').textContent='شغّلي الموسيقى';}
el('sound').addEventListener('click',()=>{musicOn?stopMusic():startMusic();});
el('enter').addEventListener('click',()=>{startMusic();section.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&musicOn)stopMusic();});
if(/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.rsvpUrl)){el('preview').hidden=true;el('live').hidden=false;el('rsvp-frame').src=config.rsvpUrl;el('form-link').href=config.rsvpUrl;}
el('preview').addEventListener('submit',event=>{event.preventDefault();const name=el('guest').value.trim();if(name.length<2){el('status').textContent='اكتبي اسمچ من حرفين على الأقل.';return;}el('status').textContent=`يا هلا ${name} ♡ هذه معاينة فقط؛ اسمچ ما انحفظ بعد.`;if(reducedMotion.matches)return;for(let i=0;i<40;i++){const p=document.createElement('i');p.className='confetti';p.style.left=`${Math.random()*100}%`;p.style.background=['#b798ce','#e8b8b3','#d2b577','#c8d3bb'][i%4];p.style.animationDelay=`${Math.random()*.6}s`;document.body.append(p);setTimeout(()=>p.remove(),4500);}});

// Try immediately where permitted; otherwise unlock naturally on the first interaction.
function firstInteraction(event){
 document.removeEventListener('pointerdown',firstInteraction);
 document.removeEventListener('keydown',firstInteraction);
 if(!event.target.closest('#sound'))startMusic(true);
}
document.addEventListener('pointerdown',firstInteraction,{passive:true});
document.addEventListener('keydown',firstInteraction);
startMusic(true);
