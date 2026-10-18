const root=document.getElementById('DrumApp');
if(root){
  const $=id=>root.querySelector('#'+id);
  const STEPS=16,INST=[['Kick','kick'],['Snare','snare'],['HiHat','hat'],['Clap','clap']];
  const grid=$('dr-grid');let cells=[],pattern=INST.map(()=>new Array(STEPS).fill(false)),playing=false,step=0,timer=null,ac=null;
  function build(){grid.innerHTML='';cells=[];INST.forEach((ins,r)=>{const row=document.createElement('div');row.className='dr-row';const lbl=document.createElement('span');lbl.className='lbl';lbl.textContent=ins[0];row.appendChild(lbl);const rc=[];for(let s=0;s<STEPS;s++){const c=document.createElement('div');c.className='dr-cell';c.addEventListener('click',()=>{pattern[r][s]=!pattern[r][s];c.classList.toggle('on',pattern[r][s]);});row.appendChild(c);rc.push(c);}grid.appendChild(row);cells.push(rc);});}
  function noise(dur){const n=Math.floor(ac.sampleRate*dur),buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource();src.buffer=buf;return src;}
  function env(node,t,peak,dur){const g=ac.createGain();g.gain.setValueAtTime(peak,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);node.connect(g);g.connect(ac.destination);return g;}
  function hit(type,t){
    if(type==='kick'){const o=ac.createOscillator();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(50,t+0.12);env(o,t,1,0.3);o.start(t);o.stop(t+0.32);}
    else if(type==='snare'){const s=noise(0.2),bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;s.connect(bp);env(bp,t,0.7,0.2);s.start(t);s.stop(t+0.2);}
    else if(type==='hat'){const s=noise(0.05),hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=7000;s.connect(hp);env(hp,t,0.4,0.05);s.start(t);s.stop(t+0.05);}
    else{const s=noise(0.12),bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1200;s.connect(bp);env(bp,t,0.6,0.12);s.start(t);s.stop(t+0.12);}
  }
  function tick(){const t=ac.currentTime+0.02;cells.forEach(rc=>rc.forEach(c=>c.classList.remove('beat')));INST.forEach((ins,r)=>{if(pattern[r][step])hit(ins[1],t);cells[r][step].classList.add('beat');});step=(step+1)%STEPS;}
  function iv(){return 60000/parseInt($('dr-bpm').value)/4;}
  function start(){if(playing)return;ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();playing=true;step=0;$('dr-play').textContent='■ Stop';tick();timer=setInterval(tick,iv());}
  function stop(){playing=false;if(timer)clearInterval(timer);timer=null;$('dr-play').textContent='▶ Play';cells.forEach(rc=>rc.forEach(c=>c.classList.remove('beat')));}
  $('dr-play').addEventListener('click',()=>playing?stop():start());
  $('dr-bpm').addEventListener('input',()=>{$('dr-bpmv').textContent=$('dr-bpm').value;if(playing){clearInterval(timer);timer=setInterval(tick,iv());}});
  $('dr-clear').addEventListener('click',()=>{pattern=INST.map(()=>new Array(STEPS).fill(false));cells.forEach(rc=>rc.forEach(c=>c.classList.remove('on')));});
  build();
}
