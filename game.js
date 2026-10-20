'use strict';
const W=360,H=640,$=id=>document.getElementById(id),canvas=$('game'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const sprite=new Image(),assets={fighters:sprite,skye:new Image(),tank:new Image(),raven:new Image(),sol:new Image()};let artReady=false,artFailed=false;
const assetSources={fighters:'/* FIGHTER_IMAGE */',skye:'/* SKYE_IMAGE */',tank:'/* TANK_IMAGE */',raven:'/* RAVEN_IMAGE */',sol:'/* SOL_IMAGE */'};
const frames=[
 {x:22,y:3,w:319,h:433,anchor:158},{x:429,y:9,w:480,h:429,anchor:166},{x:903,y:1,w:451,h:437,anchor:174},{x:1382,y:1,w:367,h:437,anchor:178},
 {x:24,y:434,w:355,h:439,anchor:181},{x:402,y:438,w:433,h:435,anchor:230},{x:828,y:442,w:561,h:434,anchor:355},{x:1397,y:432,w:363,h:445,anchor:192}
,
{"x": 255, "y": 9, "w": 341, "h": 435, "anchor": 170, "asset": "skye", "rawW": 388, "rawH": 495},
{"x": 847, "y": 10, "w": 489, "h": 435, "anchor": 185, "asset": "skye", "rawW": 555, "rawH": 494},
{"x": 246, "y": 511, "w": 409, "h": 435, "anchor": 189, "asset": "skye", "rawW": 464, "rawH": 493},
{"x": 859, "y": 518, "w": 423, "h": 435, "anchor": 212, "asset": "skye", "rawW": 473, "rawH": 486},
{"x": 182, "y": 13, "w": 425, "h": 435, "anchor": 213, "asset": "tank", "rawW": 469, "rawH": 480},
{"x": 828, "y": 23, "w": 566, "h": 435, "anchor": 217, "asset": "tank", "rawW": 612, "rawH": 470},
{"x": 186, "y": 504, "w": 463, "h": 435, "anchor": 231, "asset": "tank", "rawW": 536, "rawH": 504},
{"x": 850, "y": 522, "w": 436, "h": 435, "anchor": 218, "asset": "tank", "rawW": 487, "rawH": 486},
{"x": 99, "y": 16, "w": 306, "h": 435, "anchor": 153, "asset": "raven", "rawW": 426, "rawH": 605},
{"x": 667, "y": 11, "w": 417, "h": 435, "anchor": 157, "asset": "raven", "rawW": 586, "rawH": 611},
{"x": 122, "y": 627, "w": 358, "h": 435, "anchor": 175, "asset": "raven", "rawW": 487, "rawH": 592},
{"x": 733, "y": 637, "w": 361, "h": 435, "anchor": 186, "asset": "raven", "rawW": 483, "rawH": 582},
{"x": 138, "y": 16, "w": 345, "h": 435, "anchor": 173, "asset": "sol", "rawW": 420, "rawH": 529},
{"x": 749, "y": 21, "w": 466, "h": 435, "anchor": 186, "asset": "sol", "rawW": 561, "rawH": 524},
{"x": 159, "y": 558, "w": 360, "h": 435, "anchor": 180, "asset": "sol", "rawW": 461, "rawH": 557},
{"x": 786, "y": 574, "w": 361, "h": 435, "anchor": 181, "asset": "sol", "rawW": 449, "rawH": 541}];
const ROSTER={
 rookie:{name:'ROOKIE',tag:'THE ALL-ROUNDER',perk:'STAR PUNCH',desc:'Land 3 jabs. Your next heavy gets +6 damage.',color:'#ffd291',base:0,hp:100,jab:4,heavy:13,jabTime:.37,heavyTime:.79,cost:23,regen:18,dodge:.62,cooldown:.96,speed:3,power:3,guard:3,windup:1.05,rest:1.35,damage:17},
 skye:{name:'SKYE',tag:'THE SPEEDSTER',perk:'DOUBLE TAP',desc:'Every 3rd jab adds a second cyan hit. Hold A!',color:'#5ce8e2',base:8,hp:90,jab:4,heavy:10,jabTime:.29,heavyTime:.65,cost:20,regen:21,dodge:.64,cooldown:.86,speed:5,power:2,guard:2,windup:.9,rest:1.1,damage:14},
 tank:{name:'TANK',tag:'THE HEAVYWEIGHT',perk:'IRON GUARD',desc:'A gold shield halves one hit. Recharges in 6s.',color:'#ffdb62',base:12,hp:125,jab:6,heavy:18,jabTime:.45,heavyTime:.94,cost:27,regen:17,dodge:.6,cooldown:1.1,speed:2,power:5,guard:5,windup:1.28,rest:1.65,damage:23},
 raven:{name:'RAVEN',tag:'THE COUNTER ARTIST',perk:'AFTERIMAGE',desc:'Dodge a punch. Your next heavy adds a purple echo.',color:'#e19bff',base:16,hp:95,jab:4,heavy:12,jabTime:.35,heavyTime:.72,cost:21,regen:19,dodge:.68,cooldown:.82,speed:4,power:3,guard:2,windup:.98,rest:1.2,damage:16},
 sol:{name:'SOL',tag:'THE PRESSURE FIGHTER',perk:'HOT STREAK',desc:'Hits build heat. At 5, B releases a flame burst. Getting hit cools it.',color:'#ffac65',base:20,hp:100,jab:4,heavy:12,jabTime:.34,heavyTime:.76,cost:21,regen:19,dodge:.62,cooldown:.93,speed:4,power:4,guard:3,windup:1.02,rest:1.25,damage:17},
 brick:{name:'BRICK',tag:'THE GYM BOSS',perk:'SECOND WIND',desc:'Big windups. Heavy punches. Double swings at half health.',color:'#ff859b',base:4,hp:360,jab:6,heavy:19,speed:2,power:5,guard:4,windup:1.08,rest:1.4,damage:17}
};
const CPU_NOTES={rookie:'Every third landed punch is a charged star punch.',skye:'Fast windups. A missed dodge can lead to two punches.',tank:'Slow heavy swings. A gold shield halves a hit every 6s.',raven:'Hitting her guard charges her next counterpunch.',sol:'Landed punches build heat. Counter to cool him down.',brick:ROSTER.brick.desc};
const playable=['rookie','skye','tank','raven','sol'];
let selectedId='rookie',rivalId='brick',matchMode='boss',selectStep='player',previewId='rookie',screen='lobby';
const STAGES=[
 {name:'PATCH',rival:'rookie',hp:155,damage:9,coin:120,xp:80,unlock:'skye',unlockXP:60,theme:'#aeecc2',limit:90,style:'warmup',tip:'Start simple: A to jab. C on DODGE NOW, then B.',recommend:'ROOKIE builds a star punch with 3 clean jabs.'},
 {name:'SKYE',rival:'skye',hp:240,damage:13,coin:150,xp:100,theme:'#5ce8e2',limit:100,style:'rush',tip:'Two punches! Dodge BOTH before you hit B.',recommend:'SKYE has fast recovery. Save energy for the final opening.'},
 {name:'TANK',rival:'tank',hp:350,damage:21,coin:180,xp:120,unlock:'tank',unlockXP:60,theme:'#ffdb62',limit:110,style:'armor',tip:'A gold shield halves one hit. Break it with a jab.',recommend:'TRY SKYE: a fast jab strips armor before your heavy.'},
 {name:'RAVEN',rival:'raven',hp:355,damage:18,coin:210,xp:140,unlock:'raven',unlockXP:60,theme:'#e19bff',limit:110,style:'counter',tip:'Do not hit the purple guard: it charges a counter.',recommend:'TRY TANK: one deliberate heavy after the full combo.'},
 {name:'SOL',rival:'sol',hp:430,damage:19,coin:240,xp:160,unlock:'sol',unlockXP:160,theme:'#ffac65',limit:120,style:'heat',tip:'His landed hits build heat. Your counter cools him.',recommend:'TRY RAVEN: dodge the whole string, then release your echo.'},
 {name:'BRICK',rival:'brick',hp:600,damage:23,coin:280,xp:180,theme:'#ff859b',limit:130,style:'fortress',shell:.4,tip:'Braced during windup. Save your heavy for GUARD OPEN.',recommend:'TRY SOL: build heat between attacks, then burst after the combo.'},
 {name:'NIGHT RAVEN',rival:'raven',hp:585,damage:24,coin:320,xp:200,theme:'#ce9aff',limit:140,style:'feint',tip:'Blue glove = FEINT. Wait. Gold glove = real punch.',recommend:'RAVEN recovers her dodge quickly. Read each glove, not a fixed rhythm.'},
 {name:'IRON BRICK',rival:'brick',hp:780,damage:28,coin:400,xp:240,theme:'#ff6c86',limit:150,style:'final',shell:.35,tip:'Three phases. Fast jabs, delayed hooks, blue feints.',recommend:'Upgrade your fighter. Dodge the full string. One heavy per opening.'}
];
const PROFILE_KEY='neon-knockout-career-v1',XP_THRESHOLDS=[0,60,160,300,480,700];let storageOK=true;
function emptyProfile(){return{version:1,coins:0,cleared:0,owned:['rookie'],fighters:Object.fromEntries(playable.map(id=>[id,{xp:0,power:0,heart:0,flow:0}])),stars:Array(8).fill(0),wins:0};}
function readProfile(){const clean=emptyProfile();try{const raw=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');if(!raw||raw.version!==1)return clean;const n=(v,max)=>Math.max(0,Math.min(max,Math.floor(Number(v)||0)));clean.coins=n(raw.coins,999999);clean.cleared=n(raw.cleared,8);clean.wins=n(raw.wins,999999);clean.owned=['rookie',...playable.filter(id=>id!=='rookie'&&raw.owned?.includes(id))];for(const id of playable)for(const key of ['xp','power','heart','flow'])clean.fighters[id][key]=n(raw.fighters?.[id]?.[key],key==='xp'?700:3);clean.stars=clean.stars.map((_,i)=>n(raw.stars?.[i],3));return clean;}catch{storageOK=false;return clean;}}
let profile=readProfile(),campaignIndex=0,gymId='rookie';
function saveProfile(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));storageOK=true;}catch{storageOK=false;}}
function fighterLevel(id){const xp=profile.fighters[id].xp;let level=1;while(level<6&&xp>=XP_THRESHOLDS[level])level++;return level;}
function effectiveFighter(id){const f=ROSTER[id],u=profile.fighters[id],level=fighterLevel(id),scale=1+(level-1)*.05+u.power*.08;return{...f,level,hp:f.hp+(level-1)*8+u.heart*12,jab:Math.round(f.jab*scale*10)/10,heavy:Math.round(f.heavy*scale*10)/10,regen:f.regen+(level-1)*.8+u.flow*3,cooldown:Math.max(.68,f.cooldown-u.flow*.025)};}
function career(){return matchMode==='career';}
function stage(){return STAGES[campaignIndex];}
function dodgeLength(){return career()?Math.min(.43,pc().dodge*.63):pc().dodge;}
function dodgeCooldown(){return career()?Math.max(.45,pc().cooldown*.59):pc().cooldown;}
function trainFighter(id,key){if(!profile.owned.includes(id)||!['power','heart','flow'].includes(key))return false;const u=profile.fighters[id],cost=60+u[key]*60;if(u[key]>=3||profile.coins<cost)return false;profile.coins-=cost;u[key]++;saveProfile();return true;}
function settleFight(){if(!career()||S.rewarded)return;S.rewarded=true;const cfg=stage(),oldLevel=fighterLevel(selectedId),first=S.win&&profile.stars[campaignIndex]===0,contribution=S.stats.hits>0;const coins=S.win?(first?cfg.coin:30+campaignIndex*5):(contribution?12:0),rawXP=S.win?(first?cfg.xp:25+campaignIndex*5):(contribution?18:0),xp=Math.min(rawXP,700-profile.fighters[selectedId].xp);profile.coins+=coins;profile.fighters[selectedId].xp=Math.min(700,profile.fighters[selectedId].xp+xp);let unlocked='';let stars=0;
 if(S.win){stars=1+(S.player.hp>=S.player.maxHP*.45?1:0)+(S.player.hp>=S.player.maxHP*.7&&S.clock<cfg.limit*.65?1:0);profile.stars[campaignIndex]=Math.max(profile.stars[campaignIndex],stars);profile.cleared=Math.max(profile.cleared,campaignIndex+1);profile.wins++;if(cfg.unlock&&!profile.owned.includes(cfg.unlock)){unlocked=cfg.unlock;profile.owned.push(unlocked);profile.fighters[unlocked].xp=Math.max(profile.fighters[unlocked].xp,cfg.unlockXP||60);}}
 S.reward={coins,xp,first,stars,unlocked,oldLevel,newLevel:fighterLevel(selectedId),stageIndex:campaignIndex};saveProfile();
}
function nextPattern(){const i=campaignIndex,phase=S.phase2?1:0,cycle=S.cycle,hit=(windup,power=1)=>({windup,power,feint:false}),fake=(windup=.38)=>({windup,power:0,feint:true});let arr;
 if(i===0)arr=[hit(cycle%2?1.05:1.2)];
 else if(i===1)arr=[hit(.85),hit(phase?.4:.55,.8)];
 else if(i===2)arr=cycle%2?[hit(.7,.8),hit(1.05,1.2)]:[hit(1.35,1.25)];
 else if(i===3)arr=cycle%2?[hit(.7),hit(.6,1.1)]:[hit(1.12,1.15)];
 else if(i===4)arr=phase?[hit(.75,.8),hit(.42,.8),hit(.85,1.2)]:[hit(.85),hit(.62,1.1)];
 else if(i===5)arr=phase?[hit(.65),hit(.43,.9),hit(1.02,1.3)]:[hit(.92),hit(1.1,1.2)];
 else if(i===6)arr=cycle%2?[fake(.42),hit(.56),hit(.88,1.2)]:[hit(.65),fake(.38),hit(.62,1.15)];
 else {const rage=S.boss.hp<cpuMax()*.3;if(rage)arr=cycle%2?[hit(.58,.85),hit(.4,.9),hit(1.05,1.35)]:[fake(),hit(.5),hit(.8,1.35)];else arr=phase?[hit(.66),fake(.38),hit(.48),hit(.92,1.25)]:[hit(.85),hit(cycle%2?1.2:.63,1.2)];}
 S.sequence=arr;S.sequenceAt=0;S.sequenceDodges=0;beginSequenceHit();
}
function beginSequenceHit(){S.attack=S.sequence[S.sequenceAt];transition('windup',S.attack.windup);sound('tick');}
function lastSequenceHit(){return S.sequenceAt===S.sequence.length-1;}
function realPunchNumber(){return S.sequence.slice(0,S.sequenceAt+1).filter(a=>!a.feint).length;}
function realPunchCount(){return S.sequence.filter(a=>!a.feint).length;}
function advanceSequence(){if(!lastSequenceHit()){S.sequenceAt++;transition('between',campaignIndex<2?.15:.1);return;}S.cycle++;const open=campaignIndex===0?1.15:campaignIndex<4?.95:.8;if(S.sequenceDodges===realPunchCount()){S.openUntil=S.t+open;S.counterScale=campaignIndex===0?2.2:2.05;pop('GUARD OPEN!',180,167,'#b7f0bc',1.5,.75);setHint('Full combo dodged! B NOW — one clean heavy.');}else{S.openUntil=S.t+.42;S.counterScale=1.4;setHint('A small opening. Hit once, then be ready.');}transition('recover',open+.12);}
function tickCareerAI(dt){
 if(S.clock>=stage().limit){S.timedOut=true;finish(false);return;}
 if(!S.phase2&&S.boss.hp<=cpuMax()*.5){S.phase2=true;S.phaseAnnounce=1.5;banner('PHASE 2','NEW RHYTHM. STAY SHARP.',1);sound('bell');}
 if(campaignIndex===7&&!S.rage&&S.boss.hp<cpuMax()*.3){S.rage=true;banner('FINAL PHASE','WATCH THE LAST HOOK!',1.2);S.shake=4;sound('bell');}
 S.aiTime+=dt;
 if(S.ai==='rest'&&S.aiTime>=S.aiDuration){S.hitChain=0;S.openUntil=0;transition('guard',campaignIndex<1?.45:.46);}
 else if(S.ai==='guard'&&S.aiTime>=S.aiDuration)nextPattern();
 else if(S.ai==='between'&&S.aiTime>=S.aiDuration)beginSequenceHit();
 else if(S.ai==='windup'){const left=S.aiDuration-S.aiTime;if(S.attack?.feint)setHint('BLUE GLOVE = FEINT. Wait for the gold glove.');else setHint(left<=dodgeCue()?'DODGE NOW! '+realPunchNumber()+' / '+realPunchCount():'WAIT… '+(lastSequenceHit()?'Watch the delayed punch.':'More than one punch. Stay ready.'));if(S.aiTime>=S.aiDuration){if(S.attack.feint){pop('FEINT',253,203,'#8ac9ff',1.1,.4);advanceSequence();}else{transition('strike',.28);sound('swing');}}}
 else if(S.ai==='strike'){if(!S.aiHit&&S.aiTime>=.07){S.aiHit=true;bossContact();if(S.mode!=='fight')return;}if(S.aiTime>=S.aiDuration)advanceSequence();}
 else if(S.ai==='recover'&&S.aiTime>=S.aiDuration){S.openUntil=0;transition('rest',campaignIndex===0?.85:campaignIndex<4?.65:.48);}
}
function dodgeCue(){return career()?(campaignIndex===0?.28:.21):.45;}

const pc=()=>effectiveFighter(selectedId),bc=()=>career()?{...ROSTER[stage().rival],...stage()}:ROSTER[rivalId],duration=kind=>kind==='jab'?pc().jabTime:pc().heavyTime;
const cpuMax=()=>career()?stage().hp:rivalId==='brick'?360:Math.round(bc().hp*2.3);
function fresh(){const max=cpuMax();return{mode:'lobby',paused:false,t:0,clock:0,freeze:0,slow:0,shake:0,flash:0,phaseAnnounce:0,ai:'rest',aiTime:0,aiDuration:3.15,aiHit:false,cycle:0,phase2:false,doubleNext:false,openUntil:0,counterScale:1,hitChain:0,combo:0,heldJab:false,jabPointer:null,buffer:null,button:{jab:0,heavy:0,dodge:0,stick:0},player:{hp:pc().hp,maxHP:pc().hp,trailHp:pc().hp,energy:100,action:null,hurt:0,dodgeAt:-10,dodgeReady:0,meter:0,armorAt:0,perkFlash:0},boss:{hp:max,trailHp:max,hurt:0,blocked:0,meter:0,armorAt:0,perkFlash:0},stats:{hits:0,dodges:0,perfect:0,counters:0,bestCombo:0,taken:0,procs:0},echoes:[],particles:[],texts:[],banner:{text:'',sub:'',life:0,max:1},lastHint:'',koTime:0,win:false,score:0,rewarded:false,reward:null,sequence:[],sequenceAt:0,sequenceDodges:0,attack:null,rage:false,timedOut:false};}
let S=fresh(),muted=true,audioCtx,audioNoise,lastFrame=0,uiClock=0,cardURL='',cardFile=null;
const CONTACT={jab:.085,heavy:.235};
function sound(kind){if(muted||!audioCtx)return;try{const t=audioCtx.currentTime;
 const tone=(hz,to,length,vol,type='sine',offset=0)=>{const o=audioCtx.createOscillator(),a=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(hz,t+offset);o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+offset+length);a.gain.setValueAtTime(vol,t+offset);a.gain.exponentialRampToValueAtTime(.0001,t+offset+length);o.connect(a).connect(audioCtx.destination);o.start(t+offset);o.stop(t+offset+length)};
 const noise=(length,vol,cutoff)=>{const o=audioCtx.createBufferSource(),a=audioCtx.createGain(),f=audioCtx.createBiquadFilter();o.buffer=audioNoise;f.type='lowpass';f.frequency.value=cutoff;a.gain.setValueAtTime(vol,t);a.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(f).connect(a).connect(audioCtx.destination);o.start(t);o.stop(t+length)};
 if(kind==='jab'){tone(150,55,.12,.12);noise(.07,.15,1000)}if(kind==='heavy'){tone(110,30,.2,.22);noise(.12,.24,1800)}if(kind==='hurt'){tone(80,35,.25,.16,'triangle');noise(.17,.18,1200)}if(kind==='swing')noise(.09,.08,2400);if(kind==='dodge')noise(.13,.09,4000);if(kind==='block'){tone(380,160,.08,.07,'square');noise(.05,.07,5000)}if(kind==='tick')tone(440,390,.04,.035,'square');if(kind==='perfect'){tone(660,880,.12,.07,'triangle');tone(990,1320,.18,.07,'triangle',.08)}if(kind==='bell'){tone(900,880,.5,.09,'triangle');tone(1250,1240,.45,.045,'sine')}
 if(kind==='ko'){noise(.35,.15,1800);[440,554,659,880].forEach((hz,i)=>tone(hz,hz,.25,.055,'square',i*.12))}
 }catch{}}
function unlockAudio(){if(muted)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(!audioNoise){audioNoise=audioCtx.createBuffer(1,audioCtx.sampleRate*.5,audioCtx.sampleRate);const a=audioNoise.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}audioCtx.resume().catch(()=>{})}catch{setHint('Sound is unavailable. All attack cues are visible.')}}
function setHint(s){if(S.lastHint===s)return;S.lastHint=s;$('hint').textContent=s;}
function banner(text,sub='',life=.8){S.banner={text,sub,life,max:life};}
function pop(text,x,y,color='#fff0c1',scale=1.5,life=.65){S.texts.push({text,x,y,color,scale,life,max:life});if(S.texts.length>8)S.texts.shift()}
function sparks(x,y,n=10,color='#ffdc8b',force=1){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=(30+Math.random()*95)*force;S.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-12,life:.25+Math.random()*.3,max:.55,color:i%3?color:'#fff6d5',size:i%4===0?3:2})}if(S.particles.length>150)S.particles.splice(0,S.particles.length-150)}
function hidePanels(){$('combatStatus').textContent='';for(const id of ['lobbyPanel','selectPanel','versusPanel','resultPanel','pausePanel','cardPanel','helpPanel','mapPanel','gymPanel'])$(id).hidden=true;}
function startFight(){if(!artReady)return;if(career()&&campaignIndex>profile.cleared)return;if(!profile.owned.includes(selectedId))selectedId='rookie';S=fresh();if(career()){S.aiDuration=campaignIndex===0?2.4:1.45;}S.mode='fight';screen='fight';hidePanels();$('machine').classList.remove('paused');$('pause').textContent='Ⅱ PAUSE';$('pause').setAttribute('aria-label','Pause fight');banner('FIGHT!',pc().name+' / '+pc().perk,1.1);setHint('You are on the LEFT. A to jab, B for heavy, C to dodge.');unlockAudio();sound('bell');syncButtons();}
function request(kind){
 if(!artReady||S.paused||S.mode!=='fight')return false;S.button[kind]=.13;const p=S.player;
 if(kind==='dodge'){
  if(S.t<p.dodgeReady){if(p.dodgeReady-S.t>.25)pop('WAIT',90,282,'#a0bad4',1,.3);return false}
  p.action=null;p.hurt=0;p.dodgeAt=S.t;p.dodgeReady=S.t+dodgeCooldown();S.buffer=null;sound('dodge');sparks(100,328,5,pc().color,.7);return true;
 }
 if(p.action||p.hurt>.13){if(p.action&&duration(p.action.kind)-p.action.age<.14)S.buffer={kind,until:S.t+.18};return false}
 const cost=kind==='jab'?7:pc().cost;if(p.energy<cost){setHint('Take a breath — energy refills on its own.');S.button[kind]=.2;return false}
 if(S.t-p.dodgeAt<.16){S.buffer={kind,until:S.t+.35};return false}
 p.energy-=cost;p.action={kind,age:0,contact:false};sound('swing');return true;
}
function transition(ai,duration){S.ai=ai;S.aiTime=0;S.aiDuration=duration;S.aiHit=false;}
function isDucking(){const age=S.t-S.player.dodgeAt;return age>=0&&age<dodgeLength();}
function perkEffect(label,side='player',count=true){const c=side==='player'?pc():bc(),p=S[side];p.perkFlash=.65;if(side==='player'&&count)S.stats.procs++;pop(label,side==='player'?110:250,163,c.color,1.3,.85);sparks(side==='player'?144:225,245,18,c.color,1.1);sound('perfect');}
function dealBoss(damage,kind,counter=false,echo=false){
 const b=S.boss;
 if(rivalId==='tank'&&S.t>=b.armorAt){damage=Math.ceil(damage*.5);b.armorAt=S.t+6;perkEffect('IRON GUARD','boss');}
 b.hp=Math.max(0,b.hp-damage);b.hurt=kind==='heavy'?.34:.2;S.stats.hits++;S.combo++;S.stats.bestCombo=Math.max(S.stats.bestCombo,S.combo);S.hitChain++;
 S.freeze=kind==='heavy'?.075:.033;S.shake=kind==='heavy'?5:2;S.flash=kind==='heavy'?.045:0;
 sparks(234,237,kind==='heavy'?18:9,echo?pc().color:counter?'#aeecc2':'#ffcf83',kind==='heavy'?1.2:.8);sound(kind);
 if(!echo)pop(counter?'COUNTER!':kind==='heavy'?'THUMP!':S.combo>1?S.combo+' HIT':'POW!',222,194,counter?'#b5f5bf':'#ffe1a3',counter?1.8:1.5,.65);
 pop('-'+damage,252,266,echo?pc().color:'#fff0d6',1,.6);
 if(counter&&!echo){S.stats.counters++;if(kind==='heavy'){S.openUntil=S.t+.1;S.slow=.11}setHint('Counter landed! A clean dodge opens the guard.');if(rivalId==='sol')b.meter=0;}
 if(b.hp<=0)finish(true);
}
function playerContact(kind){
 const guarded=S.ai==='guard'||(career()&&S.ai==='between'),counter=S.t<S.openUntil,p=S.player,b=S.boss;
 if(guarded){if(rivalId==='raven'&&!b.meter){b.meter=1;perkEffect('COUNTER READY','boss');}b.blocked=.22;S.freeze=.025;S.shake=1.5;S.combo=0;sound('block');sparks(219,251,7,'#93d4f4',.55);pop('BLOCK',225,207,'#9ac8eb',1,.45);setHint('Guard is up. Watch for the windup.');return}
 let damage=kind==='heavy'?pc().heavy:pc().jab;
 if(selectedId==='rookie'){
  if(kind==='jab'){const before=p.meter;p.meter=Math.min(3,p.meter+1);if(before===2)perkEffect('STAR READY','player',false);}
  else if(p.meter>=3){p.meter=0;damage+=6;perkEffect('STAR PUNCH!');}
 }
 if(selectedId==='skye'&&kind==='jab'){p.meter=(p.meter+1)%3;if(p.meter===0){S.echoes.push({at:S.t+.12,damage:4,type:'DOUBLE TAP'});perkEffect('DOUBLE TAP!');}}
 if(selectedId==='raven'&&kind==='heavy'&&p.meter){p.meter=0;S.echoes.push({at:S.t+.17,damage:10,type:'AFTERIMAGE'});perkEffect('ECHO STRIKE!');}
 if(selectedId==='sol'){damage+=Math.floor(p.meter/2);if(kind==='heavy'&&p.meter===5){damage+=10;p.meter=0;perkEffect('FLAME BURST!');}else{const before=p.meter;p.meter=Math.min(5,p.meter+1);if(before===4)perkEffect('ON FIRE!','player',false);}}
 if(career()&&stage().shell&&S.ai==='windup'&&!counter){damage*=stage().shell;pop('BRACED',248,214,'#baa7c8',1,.3);}
 damage=Math.max(1,Math.round(damage*(counter?S.counterScale:1)));dealBoss(damage,kind,counter);
 if(S.mode==='fight'&&S.ai==='rest'&&S.hitChain>=(career()?(campaignIndex===0?6:3):4)&&S.clock>2.2){S.hitChain=0;transition('guard',.6)}
}
function bossContact(){
 if(isDucking()){
  const perfect=S.t-S.player.dodgeAt<.28;S.stats.dodges++;if(perfect)S.stats.perfect++;
  if(career()){S.sequenceDodges++;if(selectedId==='raven'){S.player.meter=1;perkEffect('ECHO READY!','player',false);}pop('SLIP '+realPunchNumber()+'/'+realPunchCount(),106,193,pc().color,1.6,.6);sparks(80,261,8,pc().color,.75);sound(perfect?'perfect':'dodge');setHint(lastSequenceHit()?'Last punch dodged. Wait for GUARD OPEN.':'Keep watching — another punch is coming!');return;}
  S.openUntil=S.t+(perfect?1.65:1.45);S.counterScale=perfect?2.8:2.4;S.slow=perfect?.21:.1;S.hitChain=0;S.doubleNext=false;
  if(selectedId==='raven'){S.player.meter=1;perkEffect('ECHO READY!','player',false);}
  pop(perfect?'PERFECT SLIP!':'NICE DODGE!',106,193,perfect?'#e9ffd1':'#a7eff0',perfect?1.7:1.6,.95);sparks(80,261,8,pc().color,.75);sound(perfect?'perfect':'dodge');transition('recover',perfect?1.75:1.55);setHint('Missed! Tap B now for a heavy counter.');return;
 }
 let damage=Math.round((bc().damage+(S.phase2?2:0))*(career()?(S.attack?.power||1):1));
 if(rivalId==='rookie'){S.boss.meter++;if(S.boss.meter>=3){damage+=6;S.boss.meter=0;perkEffect('STAR PUNCH!','boss');}}
 if(rivalId==='sol'){damage+=S.boss.meter*2;S.boss.meter=Math.min(5,S.boss.meter+1);if(S.boss.meter===5)perkEffect('ON FIRE!','boss');}
 if(rivalId==='raven'&&S.boss.meter){damage+=8;S.boss.meter=0;perkEffect('ECHO STRIKE!','boss');}
 const p=S.player;if(selectedId==='tank'&&S.t>=p.armorAt){damage=Math.ceil(damage*.5);p.armorAt=S.t+6;perkEffect('IRON GUARD!');}
 if(selectedId==='sol')p.meter=0;
 p.hp=Math.max(0,p.hp-damage);p.hurt=.46;p.action=null;S.buffer=null;S.stats.taken+=damage;S.combo=0;S.shake=6;S.freeze=.09;S.flash=.06;
 sparks(108,246,16,selectedId==='tank'&&p.perkFlash>0?pc().color:'#ffae9a',1);pop('OUCH!',101,194,'#ffb4a3',1.8,.7);pop('-'+damage,77,271,'#ffb4a3',1,.6);sound('hurt');setHint(career()?'Wait for the gold glove. Dodge each punch in the string.':'Watch DODGE NOW, then tap C. Dodge can cancel a punch.');if(p.hp<=0)finish(false);
}
function finish(win){$('combatStatus').textContent='';S.win=win;settleFight();S.mode='ko';S.koTime=0;S.heldJab=false;S.jabPointer=null;S.buffer=null;S.player.action=null;S.freeze=win?.1:.07;S.shake=win?8:5;S.score=Math.round(S.stats.hits*15+S.stats.dodges*160+S.stats.perfect*120+S.stats.counters*100+S.stats.procs*60+(win?1000+S.player.hp*8:0));banner(win?'KNOCKOUT!':'DOWN, BUT NOT OUT',win?pc().name+' TAKES THE ROUND.':'ONE MORE ROUND?',1.7);sound(win?'ko':'bell');syncButtons();}
function results(){hidePanels();S.mode='result';screen='result';$('resultPanel').hidden=false;$('resultTitle').textContent=S.win?'KNOCKOUT!':S.timedOut?'TIME UP!':'RUN IT BACK.';$('resultEyebrow').textContent=(S.win?pc().name:bc().name)+' WINS / '+(career()?'STAGE '+String(campaignIndex+1).padStart(2,'0'):'VS CPU');$('resultText').textContent=career()?(S.win?stage().name+' defeated. '+(S.reward.first?'FIRST CLEAR!':'REPLAY CLEAR!'):stage().tip):(S.win?pc().perk+' activated '+S.stats.procs+' times. Score: '+S.score+'.':'Watch the glove, slip with C, answer with B.');$('statDodges').textContent=S.stats.dodges;$('statCombo').textContent=S.stats.bestCombo;$('statTime').textContent=formatTime(S.clock);$('rewardBox').hidden=!career();$('continueCareer').hidden=!career()||!S.win||campaignIndex===7;$('resultGym').hidden=!career();$('resultHome').textContent=career()?'STAGE MAP':'ARCADE LOBBY';if(career()){const r=S.reward;$('rewardCoins').textContent='+'+r.coins+' G';$('rewardXP').textContent='+'+r.xp+' XP';$('rewardLevel').textContent=r.newLevel>r.oldLevel?'LEVEL UP! '+r.oldLevel+' → '+r.newLevel:pc().name+' / LV '+r.newLevel;$('rewardUnlock').textContent=r.unlocked?ROSTER[r.unlocked].name+' LV '+fighterLevel(r.unlocked)+' UNLOCKED!':S.win&&campaignIndex===7?'CIRCUIT CHAMPION! Replay for 3 stars.':S.win?'NEXT OPPONENT UNLOCKED.':r.coins?'Training progress kept. Upgrade or try another fighter.':'Land a hit to earn training progress.';$('unlockReveal').hidden=!r.unlocked;$('rewardUnlock').hidden=!!r.unlocked;if(r.unlocked){$('unlockArt').dataset.portrait=r.unlocked;$('unlockName').textContent=ROSTER[r.unlocked].name;$('unlockPerk').textContent='LV '+fighterLevel(r.unlocked)+' / '+ROSTER[r.unlocked].perk;}if(typeof paintPortraits==='function')paintPortraits();$('rewardStars').textContent=S.win?'★'.repeat(r.stars)+'☆'.repeat(3-r.stars):'';}setHint(career()?'Earn XP, upgrade at the GYM, then take on the next opponent.':'Rematch, switch fighters, or keep your fight card.');try{const key='neon-knockout-'+selectedId+'-'+rivalId,best=Number(localStorage.getItem(key)||0);if(S.score>best)localStorage.setItem(key,String(S.score))}catch{}}
function tick(dt){
 if(S.paused||!['fight','ko'].includes(S.mode))return;
 for(const k of Object.keys(S.button))S.button[k]=Math.max(0,S.button[k]-dt);
 S.banner.life=Math.max(0,S.banner.life-dt);S.phaseAnnounce=Math.max(0,S.phaseAnnounce-dt);S.shake=Math.max(0,S.shake-dt*25);S.flash=Math.max(0,S.flash-dt);
 for(const p of S.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=135*dt}S.particles=S.particles.filter(p=>p.life>0);
 for(const t of S.texts){t.life-=dt;t.y-=dt*21}S.texts=S.texts.filter(t=>t.life>0);
 if(S.freeze>0){S.freeze=Math.max(0,S.freeze-dt);return}
 if(S.slow>0){S.slow-=dt;dt*=.48}
 S.t+=dt;S.player.hurt=Math.max(0,S.player.hurt-dt);S.boss.hurt=Math.max(0,S.boss.hurt-dt);S.boss.blocked=Math.max(0,S.boss.blocked-dt);S.player.perkFlash=Math.max(0,S.player.perkFlash-dt);S.boss.perkFlash=Math.max(0,S.boss.perkFlash-dt);
 S.player.trailHp=lerp(S.player.trailHp,S.player.hp,Math.min(1,dt*2.6));S.boss.trailHp=lerp(S.boss.trailHp,S.boss.hp,Math.min(1,dt*2.6));
 if(S.mode==='ko'){S.koTime+=dt;if(S.koTime>2)results();return}
 S.clock+=dt;S.player.energy=Math.min(100,S.player.energy+dt*pc().regen);
 const due=S.echoes.filter(e=>e.at<=S.t);S.echoes=S.echoes.filter(e=>e.at>S.t);for(const e of due){if(S.mode!=='fight')return;S.player.perkFlash=.4;dealBoss(e.damage,'jab',false,true);}if(S.mode!=='fight')return;
 const a=S.player.action;if(a){a.age+=dt;if(!a.contact&&a.age>=CONTACT[a.kind]){a.contact=true;playerContact(a.kind);if(S.mode!=='fight')return}if(a.age>=duration(a.kind)){S.player.action=null;if(S.buffer&&S.buffer.until>=S.t){const kind=S.buffer.kind;S.buffer=null;request(kind)}}}
 if(S.buffer&&S.buffer.until<S.t)S.buffer=null;if(S.buffer&&!S.player.action&&S.player.hurt<.13&&S.t-S.player.dodgeAt>=.16){const kind=S.buffer.kind;S.buffer=null;request(kind)}if(S.heldJab&&!S.player.action&&S.player.hurt<.1&&S.player.energy>=7&&S.t-S.player.dodgeAt>.25)request('jab');
 if(career()){tickCareerAI(dt);return;}
 if(!S.phase2&&S.boss.hp<=cpuMax()/2){S.phase2=true;S.phaseAnnounce=1.4;banner(bc().name+' TURNS IT UP','STAY COOL. WATCH THE GLOVE.',1.15);sound('bell')}
 S.aiTime+=dt;
 if(S.ai==='rest'&&S.aiTime>=S.aiDuration){S.hitChain=0;transition('guard',rivalId==='skye'?.38:.55)}
 else if(S.ai==='guard'&&S.aiTime>=S.aiDuration){transition('windup',bc().windup*(S.phase2?.8:1));sound('tick');}
 else if(S.ai==='windup'){const remaining=S.aiDuration-S.aiTime;setHint(remaining<=.45?'DODGE NOW! Tap C, then counter with B.':'Watch the glowing glove…');if(S.aiTime>=S.aiDuration){transition('strike',.3);sound('swing')}}
 else if(S.ai==='strike'){
  if(!S.aiHit&&S.aiTime>=.09){S.aiHit=true;bossContact();if(S.mode!=='fight')return}
  if(S.ai==='strike'&&S.aiTime>=S.aiDuration){S.cycle++;S.doubleNext=(S.phase2&&S.cycle%3===0)||(rivalId==='skye'&&S.cycle%2===0);if(S.doubleNext&&rivalId==='skye')perkEffect('DOUBLE TAP!','boss');transition('recover',S.doubleNext?.38:.9)}
 }
 else if(S.ai==='recover'&&S.aiTime>=S.aiDuration){S.openUntil=0;if(S.doubleNext){S.doubleNext=false;transition('windup',.75)}else transition('rest',bc().rest*(S.phase2?.75:1))}
 if(S.clock<2.9)setHint('You are on the LEFT. Try A to jab and B for heavy.');
}
function formatTime(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
function syncButtons(){const active=S.mode==='fight';for(const id of['jab','heavy','dodge','stick'])$(id).disabled=!artReady||!active||S.paused;$('pause').disabled=!artReady||!['fight','ko'].includes(S.mode);}
function togglePause(force){if(!['fight','ko'].includes(S.mode))return;S.paused=force===undefined?!S.paused:force;S.heldJab=false;S.jabPointer=null;$('pausePanel').hidden=!S.paused;$('machine').classList.toggle('paused',S.paused);$('pause').textContent=S.paused?'▶ RESUME':'Ⅱ PAUSE';$('pause').setAttribute('aria-label',S.paused?'Resume fight':'Pause fight');syncButtons()}
/* RENDER */
const FONT={A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',H:'10001/10001/10001/11111/10001/10001/10001',I:'11111/00100/00100/00100/00100/00100/11111',J:'00111/00010/00010/00010/00010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/10101/01010',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111','0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110','2':'01110/10001/00001/00010/00100/01000/11111','3':'11110/00001/00001/01110/00001/00001/11110','4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/10000/11110/00001/00001/11110','6':'01110/10000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000','8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00001/01110','!':'00100/00100/00100/00100/00100/00000/00100',':':'00000/00100/00100/00000/00100/00100/00000','-':'00000/00000/00000/11111/00000/00000/00000','.':'00000/00000/00000/00000/00000/00100/00100','/':'00001/00010/00010/00100/01000/01000/10000','?':'01110/10001/00001/00010/00100/00000/00100','+':'00000/00100/00100/11111/00100/00100/00000'};
const C={bg:'#17102e',line:'#513448',cream:'#fff0bf',purple:'#2c1d41',red:'#eb535d',mint:'#a9e9bd',blue:'#259dd5'};
function rect(x,y,w,h,color,ctx=g){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function polygon(points,color,ctx=g){ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(Math.round(p[0]),Math.round(p[1])):ctx.moveTo(Math.round(p[0]),Math.round(p[1])));ctx.closePath();ctx.fill()}
function text(str,x,y,scale=1,color=C.cream,align='left',ctx=g,shadow=true){str=String(str).toUpperCase();let width=(str.length*6-1)*scale;if(align==='center')x-=width/2;if(align==='right')x-=width;
 const draw=(ox,oy,c)=>{ctx.fillStyle=c;for(let i=0;i<str.length;i++){const rows=FONT[str[i]]?.split('/');if(!rows)continue;for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(rows[row][col]==='1')ctx.fillRect(Math.round(x+(i*6+col)*scale+ox),Math.round(y+row*scale+oy),Math.ceil(scale),Math.ceil(scale))}};
 if(shadow)draw(Math.max(1,Math.round(scale)),Math.max(1,Math.round(scale)),C.bg);draw(0,0,color);
}
function line(x1,y1,x2,y2,color,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(Math.round(x1),Math.round(y1));g.lineTo(Math.round(x2),Math.round(y2));g.stroke()}
function seeded(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}
function audience(){
 rect(0,75,W,220,C.bg);for(let row=0;row<4;row++)for(let col=0;col<9;col++){
  const i=row*9+col,x=col*43-8+(row%2?20:0),excited=(S.shake>2||S.mode==='ko'||S.mode==='result'&&S.win),y=105+row*31+(excited?Math.round(Math.sin(S.t*9+i)*3):Math.round(Math.sin(S.t*2+i)));
  const skin=['#442444','#3c2443','#58304b','#49233c'][i%4],light=['#633e55','#55364f','#704258','#694052'][i%4];
  polygon([[x-17,y+24],[x-10,y+10],[x+8,y+10],[x+18,y+24],[x+13,y+39],[x-14,y+39]],row<2?'#2b1c3b':'#35213f');
  if(excited&&i%3===0){polygon([[x-14,y+24],[x-23,y+4],[x-19,y+1],[x-8,y+18]],'#35213f');rect(x-24,y-1,6,7,skin)}
  polygon([[x-10,y-4],[x-6,y-9],[x+5,y-10],[x+11,y-4],[x+12,y+9],[x+7,y+17],[x-4,y+17],[x-11,y+10]],skin);rect(x-6,y-2,12,3,light);
  const hair=i%5;if(hair===0){rect(x-12,y-7,23,7,'#241a35');rect(x-7,y-11,13,5,'#241a35')}if(hair===1){rect(x-13,y-8,25,6,'#271a35');rect(x-14,y-1,5,18,'#271a35');rect(x+9,y-1,5,18,'#271a35')}if(hair===2){rect(x-13,y-8,24,5,'#38213d');rect(x-16,y-3,11,3,'#38213d')}if(hair===3){rect(x-13,y-3,26,3,'#281932');rect(x-10,y-4,8,8,'#21162c');rect(x+3,y-4,8,8,'#21162c')}
  rect(x-6,y+4,3,2,'#21142c');rect(x+4,y+4,3,2,'#21142c');rect(x-2,y+11,5,excited?4:2,light);if(i%6===0)rect(x-5,y+9,12,3,'#23172f');
 }
}
function ringScene(){
 audience();rect(0,254,360,151,'#302241');polygon([[0,326],[360,326],[360,407],[0,407]],'#3c3656');
 for(let i=0;i<260;i++){const x=Math.floor(seeded(i)*360),y=326+Math.floor(seeded(i+100)*81);rect(x,y,2+(i%4),1,i%3?'#48415f':'#322a46')}
 for(const y of[195,264,314]){rect(0,y+4,360,7,'#211c37');rect(0,y,360,5,'#4d4567');rect(0,y,360,1,'#77708b');for(let x=14;x<360;x+=54)rect(x,y+1,13,1,'#a0909a')}
 rect(174,187,15,140,'#282039');rect(177,186,5,141,'#5a4c69');rect(178,194,2,12,'#8b778e');rect(171,191,23,8,'#493a55');rect(170,263,25,8,'#493a55');rect(171,314,24,9,'#493a55');
 for(let k=-3;k<=3;k++)line(180+k*14,327,180+k*65,406,'#48415e');line(0,382,360,382,'#4e4560');
 polygon([[31,372],[66,362],[136,365],[155,378],[136,387],[58,389]],'#221c34');polygon([[199,369],[231,358],[294,364],[328,381],[299,390],[220,386]],'#211b33');
 if(career()){g.globalAlpha=campaignIndex>=5?.09:.035;rect(0,80,360,325,stage().theme);g.globalAlpha=1;text('STAGE '+(campaignIndex+1)+' / '+stage().style,180,396,.75,stage().theme,'center');}
}
const spriteCache=[],whiteCache=[],mintCache=[];
function buildSprites(){for(const f of frames){const c=document.createElement('canvas');c.width=Math.round(f.w*.55);c.height=Math.round(f.h*.55);const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(assets[f.asset||'fighters'],f.x,f.y,f.rawW||f.w,f.rawH||f.h,0,0,c.width,c.height);spriteCache.push(c);for(const[bank,color]of[[whiteCache,'#fff6c9'],[mintCache,f.asset?ROSTER[f.asset].color:'#a9f1df']]){const tint=document.createElement('canvas');tint.width=c.width;tint.height=c.height;const t=tint.getContext('2d');t.drawImage(c,0,0);t.globalCompositeOperation='source-in';t.fillStyle=color;t.fillRect(0,0,c.width,c.height);bank.push(tint)}}}
function actor(index,x,y,scale,angle=0,sy=1,alpha=1,flash=0,tint=false,ctx=g){if(!artReady)return;const f=frames[index];ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.scale(1,sy);ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(tint?mintCache[index]:spriteCache[index],Math.round(-f.anchor*scale),Math.round(-f.h*scale),Math.round(f.w*scale),Math.round(f.h*scale));if(flash>0){ctx.globalAlpha=flash;ctx.drawImage(whiteCache[index],Math.round(-f.anchor*scale),Math.round(-f.h*scale),Math.round(f.w*scale),Math.round(f.h*scale))}ctx.restore()}
function fighter(id,pose,x,y,scale,angle=0,sy=1,alpha=1,flash=0,tint=false,ctx=g,side='left'){
 const flip=(id==='brick')===(side==='left');ctx.save();if(flip){ctx.translate(x,0);ctx.scale(-1,1);x=0;angle=-angle;}actor(ROSTER[id].base+pose,x,y,scale,angle,sy,alpha,flash,tint,ctx);ctx.restore();
}
function fighters(){
 const p=S.player,b=S.boss,t=S.t,duckAge=t-p.dodgeAt;let duck=duckAge>=0&&duckAge<dodgeLength()?Math.sin(Math.PI*duckAge/dodgeLength()):0;
 if(p.action)duck*=clamp(1-p.action.age/.16,0,1);
 let px=98,py=382+Math.round(Math.sin(t*7)*1.2),pf=0,pa=0,psy=1,pflash=0;
 if(p.action){const a=p.action;if(a.kind==='jab'){if(a.age>.05&&a.age<.22)pf=1;px+=Math.sin(clamp(a.age/.3,0,1)*Math.PI)*19;pa=.02}else{if(a.age<.18){px-=8*Math.sin(a.age/.18*Math.PI/2);pa=-.04}else if(a.age<.43){pf=2;px+=25*Math.sin((a.age-.18)/.25*Math.PI);py-=6;pa=.025}else px+=5}}
 if(duck){for(let i=0;i<3;i++)fighter(selectedId,0,98-i*13,382,.4,-.05*i,1-i*.035,.10+i*.03,0,true);px-=43*duck;py+=11*duck;pa=-.18*duck;psy=1-.12*duck;if(!p.action)pf=0;line(74,296,43,302,'#9bded5',2);line(75,310,36,318,'#5da6b8',2)}
 if(p.hurt>.04){pf=3;px-=Math.sin((.46-p.hurt)/.46*Math.PI)*15;pa=-.08;pflash=p.hurt>.34?.6:0}
 let bx=258,by=380+Math.round(Math.sin(t*5+1)*1.1),bf=0,ba=0;
 if(S.ai==='windup'){bf=2;bx+=Math.sin(S.aiTime/S.aiDuration*Math.PI/2)*7;by-=Math.min(3,S.aiTime*4);ba=.035}
 if(S.ai==='strike'){bf=1;bx-=Math.sin(clamp(S.aiTime/.3,0,1)*Math.PI)*19;ba=-.035}
 if(S.ai==='recover'&&S.t<S.openUntil){bf=3;bx+=Math.sin(S.aiTime*8)*3;ba=Math.sin(S.aiTime*7)*.018}
 if(b.hurt>.035){if(!['windup','strike'].includes(S.ai))bf=3;bx+=Math.sin((.34-Math.min(.34,b.hurt))/.34*Math.PI)*12;ba=.06}
 if(S.mode==='ko'||S.mode==='result'){
  const k=clamp(S.koTime/1.1,0,1),ease=1-(1-k)**3;if(S.win){bf=3;bx=267;by=382+ease*6;ba=-ease*1.53}else{pf=3;px=84;py=383+ease*4;pa=ease*1.52}
 }
 if(S.ai==='windup'&&S.mode==='fight'){const urgency=clamp((S.aiTime/S.aiDuration-.3)/.7,0,1);g.globalAlpha=.2+urgency*.2;g.strokeStyle=career()&&S.attack?.feint?'#83bfff':'#ffda8a';g.lineWidth=2;for(let i=0;i<3;i++){const r=19+i*7+Math.sin(t*10)*2;g.beginPath();g.arc(276,224,r,-2.1,.7);g.stroke()}g.globalAlpha=1;}
 if(p.perkFlash>0&&['raven','skye'].includes(selectedId)){for(let i=3;i>=1;i--)fighter(selectedId,selectedId==='raven'?2:1,px-i*13,py,.4,pa,psy,(p.perkFlash/.65)*(.21-i*.035),0,true);}
 fighter(rivalId,bf,bx,by,rivalId==='brick'?.45:.4,ba,1,1,b.hurt>.23?.5:0,false,g,'right');
 if(career()&&campaignIndex>=6){const elite=campaignIndex===7?'#ffbf80':'#d7a4f2';if(S.ai==='windup'||S.rage){for(let i=0;i<8;i++){const a=i/8*TAU+t*1.3,x=bx+Math.cos(a)*57,y=by-94+Math.sin(a)*84;rect(x,y,2,3,elite);}}if(campaignIndex===7){polygon([[bx-11,by-177],[bx-14,by-188],[bx-5,by-183],[bx,by-193],[bx+5,by-183],[bx+14,by-188],[bx+11,by-177]],'#e8be78');}}
 if(S.ai==='guard'&&S.mode==='fight'){g.globalAlpha=.75;polygon([[215,221],[233,217],[248,227],[243,248],[230,256],[215,247]],'#3683bc');line(231,224,231,247,'#a2d9ec',2);line(221,235,241,235,'#a2d9ec',2);g.globalAlpha=1}
 fighter(selectedId,pf,px,py,.4,pa,psy,1,pflash);
 if(selectedId==='tank'&&(S.t>=p.armorAt||p.perkFlash>.1)){g.globalAlpha=p.perkFlash>.1?.85:.4;polygon([[62,247],[96,233],[130,247],[124,284],[96,304],[68,284]],pc().color);polygon([[69,251],[96,241],[123,251],[117,280],[96,294],[75,280]],'#3b3845');text('+',96,258,2,pc().color,'center');g.globalAlpha=1;}
 if(selectedId==='sol'&&p.meter>1){for(let i=0;i<5;i++){const y=283-((t*55+i*13)%40);rect(140+Math.sin(t*5+i)*12,y,3,5,i%2?'#ffcf6a':'#ef6c4b');}}
 if(selectedId==='rookie'&&p.meter===3){text('+',147,263+Math.sin(t*8)*3,2,pc().color,'center');}
 if(selectedId==='raven'&&p.meter){fighter(selectedId,0,px-18,py,.4,0,1,.18,0,true);}
 if(p.perkFlash>0&&selectedId==='sol'){const f=1-p.perkFlash/.65;for(let i=0;i<7;i++){const a=-1.7+i*.4,r=16+f*35,x=186+Math.cos(a)*r,y=254+Math.sin(a)*r;polygon([[x,y-9],[x+5,y],[x+2,y+6],[x-4,y+4],[x-6,y]],i%2?'#ffd570':'#f0784e');}}
 if(p.perkFlash>0&&selectedId==='rookie'){const x=173,y=246,r=8+p.perkFlash*12;polygon([[x,y-r],[x+4,y-4],[x+r,y],[x+4,y+4],[x,y+r],[x-4,y+4],[x-r,y],[x-4,y-4]],'#ffe7a2');}
 if(p.action?.kind==='heavy'&&p.action.age<.18){const age=p.action.age/.18;for(let i=0;i<4;i++){const a=i/4*TAU;line(137+Math.cos(a)*(18-age*6),274+Math.sin(a)*(18-age*6),137+Math.cos(a)*24,274+Math.sin(a)*24,'#ffcd8a',2)}}
}
function healthBar(x,y,w,h,hp,trail,max,color,reverse=false){rect(x-2,y-2,w+4,h+4,'#e1b9a1');rect(x,y,w,h,'#271733');const a=Math.round(w*clamp(trail/max,0,1)),b=Math.round(w*clamp(hp/max,0,1));rect(reverse?x+w-a:x,y+2,a,h-4,'#e9b36e');rect(reverse?x+w-b:x,y+2,b,h-4,color);rect(reverse?x+w-b:x,y+2,b,3,reverse?'#ffb59d':'#8be3eb');}
function hud(){
 rect(0,0,W,83,C.bg);text(pc().name,13,12,1.7,pc().color);text(bc().name,347,12,1.7,bc().color,'right');healthBar(13,31,134,17,S.player.hp,S.player.trailHp,pc().hp,'#28acd4');healthBar(213,31,134,17,S.boss.hp,S.boss.trailHp,cpuMax(),'#e34f69',true);
 rect(13,55,134,5,'#3c2b47');rect(13,55,134*S.player.energy/100,5,'#e0ce8e');text('LV '+pc().level+' / ENERGY',13,65,.8,'#8f91a2');
 const meter=selectedId==='tank'?clamp(1-(S.player.armorAt-S.t)/6,0,1):S.player.meter/(selectedId==='sol'?5:selectedId==='raven'?1:3);rect(13,79,134,3,'#3c2b47');rect(13,79,134*meter,3,pc().color);text(selectedId==='tank'?(S.t>=S.player.armorAt?'SHIELD READY':'SHIELD '+Math.ceil(S.player.armorAt-S.t)+'S'):selectedId==='raven'?(S.player.meter?'ECHO READY':'DODGE TO CHARGE'):selectedId==='sol'?'HEAT '+S.player.meter+'/5':(selectedId==='rookie'?'STAR ':'DOUBLE ')+S.player.meter+'/3',13,88,.8,pc().color);
 const open=S.t<S.openUntil&&S.mode==='fight',label=open?'GUARD OPEN':S.ai==='guard'?'BLOCKING':S.ai==='windup'?'WINDING UP':career()?'STAGE '+(campaignIndex+1):'CPU RIVAL';text(label,347,59,1,open?'#b9f1bb':'#b499af','right');
 polygon([[180,4],[188,15],[202,11],[201,26],[212,35],[201,44],[204,58],[188,55],[180,68],[171,55],[158,58],[159,44],[147,35],[159,26],[156,11],[172,15]],'#ffdda0');polygon([[180,13],[186,22],[196,21],[193,33],[201,37],[191,43],[193,51],[182,49],[179,57],[174,48],[165,50],[166,41],[156,34],[168,28],[166,21],[175,23]],'#faedbc');text('VS',180,28,2,'#a43a51','center');text(formatTime(career()?Math.max(0,stage().limit-S.clock):S.clock),180,73,1,'#a38aa7','center');
}
function fightCue(){
 if(career()&&S.mode==='fight'){let label='',sub='',color='#e4c89f',ratio=0;if(S.ai==='windup'){const fake=S.attack?.feint,left=S.aiDuration-S.aiTime;label=fake?'BLUE GLOVE / FEINT':left<=dodgeCue()?'DODGE NOW!':'WAIT... WATCH THE GLOVE';sub=fake?'HOLD C. THE NEXT ONE IS REAL.':realPunchNumber()+' OF '+realPunchCount()+' / '+(lastSequenceHit()?'LAST PUNCH':'MORE PUNCHES COMING');color=fake?'#8ac9ff':left<=dodgeCue()?'#fff0a5':'#e4bd9d';ratio=S.aiTime/S.aiDuration;}else if(S.ai==='between'){label='KEEP YOUR GUARD!';sub='ANOTHER PUNCH IS COMING';color='#ffc3a2';}else if(S.t<S.openUntil){label='GUARD OPEN / B NOW!';sub='ONE HEAVY. THEN GET READY.';color='#b7f2bd';ratio=clamp((S.openUntil-S.t)/.95,0,1);}else if(S.ai==='guard'){label=stage().style==='counter'||stage().style==='feint'?'PURPLE GUARD / WAIT':'GUARD UP / WAIT';sub='SAVE ENERGY. WATCH THE GLOVE.';color='#cba9e4';}else if(S.clock<2.4){label='YOU ARE ON THE LEFT';sub=campaignIndex===0?'A = JAB / B = HEAVY / C = DODGE':stage().style==='rush'?'DODGE BOTH PUNCHES BEFORE B':'READ THE WHOLE ATTACK STRING';}if(label){rect(25,102,310,38,'#19132bf3');text(label,180,106,1.2,color,'center');text(sub,180,121,.8,'#bda7c5','center');if(ratio)rect(44,136,272*ratio,2,color);}if(S.rage)text('FINAL PHASE',180,147,1,'#ff8d8d','center');return;}
 if(S.mode!=='fight')return;
 let label='',sub='',col='#e3d0ba',ratio=0;
 if(S.ai==='windup'){const left=S.aiDuration-S.aiTime;label=left<=.45?'DODGE NOW!':'WATCH HIS GLOVE';sub=left<=.45?'C  /  SPACE':'HE IS WINDING UP';col=left<=.45?'#ffe79c':'#dfbb99';ratio=S.aiTime/S.aiDuration;}
 else if(S.t<S.openUntil){label='HIS GUARD IS OPEN!';sub='B  /  HEAVY COUNTER';col='#b7f2bd';ratio=clamp((S.openUntil-S.t)/1.65,0,1);}
 else if(S.ai==='guard'){label='HE IS COVERING UP';sub='WATCH. WAIT. SLIP.';col='#a9d1e8';ratio=1}
 else if(S.clock<2.7){label='A TO PUNCH';sub='YOU ARE ON THE LEFT';col='#e4d2ad';}
 if(label){rect(46,102,268,37,'#19132be8');text(label,180,106,1.3,col,'center');text(sub,180,120,.85,'#a892ae','center');if(ratio)rect(67,134,226*ratio,2,col)}
 if(S.phaseAnnounce>0)text(bc().name+' GETS SERIOUS',180,145,1.2,'#ffbd9e','center');
}
function circle(cx,cy,r,color){const pts=[];for(let i=0;i<20;i++){const a=i/20*TAU;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}polygon(pts,color)}
function button(cx,cy,r,key,name,kind,colors){const pressed=S.button[kind]>0,down=pressed?6:0;circle(cx+2,cy+13,r+2,'#151126');circle(cx,cy+9,r,colors[2]);circle(cx,cy+down,r,colors[0]);circle(cx-2,cy-2+down,r-4,colors[1]);polygon([[cx-r+8,cy-8+down],[cx-r+16,cy-r+10+down],[cx+8,cy-r+7+down],[cx+18,cy-r+12+down],[cx-3,cy-r+13+down]],colors[3]);
 const cue=kind==='dodge'&&S.ai==='windup'&&S.aiDuration-S.aiTime<dodgeCue()+.02&&(!career()||!S.attack?.feint)&&S.mode==='fight'||kind==='heavy'&&S.t<S.openUntil&&S.mode==='fight';
 if(cue){g.strokeStyle='#fff2b4';g.lineWidth=2;g.beginPath();g.arc(cx,cy+down,r+5,0,TAU);g.stroke();text(kind==='dodge'?'NOW':'HIT!',cx,cy-r-15,1,'#fff2b4','center')}
 text(key,cx,cy-13+down,3,'#fff9dc','center');text(name,cx,cy+r+20,.85,'#b1a9bd','center');
 if(kind==='dodge'&&S.mode==='fight'&&S.t<S.player.dodgeReady){const ratio=1-(S.player.dodgeReady-S.t)/dodgeCooldown();rect(cx-r+7,cy+r-5,r*2-14,3,'#1b4846');rect(cx-r+7,cy+r-5,(r*2-14)*ratio,3,'#caf2bf')}
}
function cabinet(){
 rect(0,407,360,233,'#34364e');rect(0,406,360,5,'#19162b');rect(0,411,360,3,'#82708a');rect(0,415,360,3,'#574662');
 for(let i=0;i<420;i++){const x=Math.floor(seeded(i+2000)*360),y=420+Math.floor(seeded(i+5000)*218);rect(x,y,2+(i%4),i%3?1:2,i%3?'#41455c':'#292d44')}
 polygon([[0,606],[65,620],[194,613],[276,629],[360,608],[360,640],[0,640]],'#28273f');rect(0,407,360,4,'#96b2a5');
 for(let x=9;x<90;x+=11){rect(x,423,8,2,'#ba586e');rect(x,427,8,2,'#5e6d9a')}for(let x=270;x<355;x+=11){rect(x,423,8,2,'#ba586e');rect(x,427,8,2,'#5e6d9a')}text(career()?'CIRCUIT / '+(campaignIndex+1)+' OF 8':'FIGHT CLUB / 2004',180,423,1.1,'#71bfae','center');
 const age=S.t-S.player.dodgeAt,tilt=age>=0&&age<dodgeLength()?-18*Math.sin(age/dodgeLength()*Math.PI):0;
 circle(80,554,43,'#23253c');g.fillStyle='#18182d';g.beginPath();g.ellipse(80,552,32,15,0,0,TAU);g.fill();g.strokeStyle='#93929a';g.lineWidth=2;g.beginPath();g.ellipse(80,552,34,17,0,.3,2.6);g.stroke();rect(71+tilt*.4,506,18,46,'#202338');rect(74+tilt*.4,511,5,37,'#4c4e62');circle(80+tilt,505,32,'#9c472f');circle(80+tilt,500,31,'#e28d35');circle(77+tilt,494,25,'#f4ad43');polygon([[58+tilt,486],[66+tilt,476],[83+tilt,474],[96+tilt,482],[83+tilt,479],[66+tilt,483]],'#ffd076');text('SLIP',80,592,1,'#9e9cb0','center');polygon([[31,548],[39,542],[39,554]],'#d4d4b7');polygon([[130,548],[122,542],[122,554]],'#d4d4b7');
 button(221,476,35,'A','QUICK JAB','jab',['#176eae','#1ca7d7','#143c73','#8be3e7']);button(309,495,36,'B','HEAVY','heavy',['#a72e4d','#e7565c','#681e3b','#ff9b77']);button(269,568,34,'C','DODGE','dodge',['#26685b','#429970','#194b48','#95d69f']);
 for(const[x,y,w]of[[15,622,26],[153,573,16],[332,604,22],[160,454,12],[17,465,17]]){line(x,y,x+w,y-3,'#1e2338',2);line(x,y+2,x+w*.5,y,'#596076')}
}
function render(){
 if(['lobby','select','versus','map','gym'].includes(S.mode)){rect(0,0,W,H,C.bg);cabinet();return;}
 rect(0,0,W,H,C.bg);g.save();if(S.shake>0){g.translate(Math.round((Math.random()-.5)*S.shake),Math.round((Math.random()-.5)*S.shake*.65))}ringScene();fighters();
 for(const p of S.particles){g.globalAlpha=clamp(p.life/.2,0,1);rect(p.x,p.y,p.size,p.size,p.color)}g.globalAlpha=1;
 for(const t of S.texts){g.globalAlpha=clamp(t.life/.12,0,1);text(t.text,t.x,t.y,t.scale,t.color,'center')}g.globalAlpha=1;
 if(S.flash>0){g.globalAlpha=.1;rect(0,80,360,323,'#fff2ba');g.globalAlpha=1}g.restore();hud();fightCue();
 if(S.banner.life>0){const progress=clamp((S.banner.max-S.banner.life)*8,0,1);g.save();g.globalAlpha=Math.min(1,S.banner.life*4);g.translate(180,155);g.scale(.8+progress*.2,.8+progress*.2);const size=S.banner.text.length>16?1.6:2.8;text(S.banner.text,0,0,size,'#ffe2a0','center');text(S.banner.sub,0,25,.85,'#d8bcc3','center');g.restore()}
 cabinet();
}
/* BOOT */
function fighterLoaded(){artReady=true;buildSprites();$('bossMode').disabled=false;$('cpuMode').disabled=false;refreshLobby();buildRoster();paintPortraits();syncButtons();render();}
let loaded=0;for(const [id,img] of Object.entries(assets)){img.onload=()=>{loaded++;if(loaded===5)fighterLoaded();};img.onerror=()=>{artFailed=true;$('loadingHint').textContent='Artwork could not load. Reload to retry.';};img.src=assetSources[id];}
$('bossMode').disabled=true;$('cpuMode').disabled=true;syncButtons();$('rematch').onclick=startFight;$('pause').onclick=()=>togglePause();$('resume').onclick=()=>togglePause(false);
$('sound').onclick=()=>{muted=!muted;unlockAudio();$('sound').textContent=muted?'♪ SOUND OFF':'♪ SOUND ON';$('sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');if(!muted)sound('bell')};
for(const[id,kind]of[['jab','jab'],['heavy','heavy'],['dodge','dodge'],['stick','dodge']]){
 const button=$(id);button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();button.setPointerCapture(e.pointerId);unlockAudio();request(kind);if(id==='jab'&&S.mode==='fight'&&!S.paused){S.heldJab=true;S.jabPointer=e.pointerId}if(id==='stick')S.button.stick=.2});
 const release=e=>{if(id==='jab'&&S.jabPointer===e.pointerId){S.heldJab=false;S.jabPointer=null}try{if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId)}catch{}};
 for(const event of['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
 button.addEventListener('click',e=>{if(e.detail===0){unlockAudio();request(kind)}});
}
const keyMap={j:'jab',a:'jab',k:'heavy',b:'heavy',c:'dodge',l:'dodge',' ':'dodge',ArrowLeft:'dodge',ArrowRight:'dodge'};
document.addEventListener('keydown',e=>{if(!$('cardPanel').hidden)return;if(['fight','ko','result'].includes(S.mode)&&e.key.toLowerCase()==='r'&&!e.repeat){e.preventDefault();startFight();return}if(['Escape','p','P'].includes(e.key)&&!e.repeat){e.preventDefault();togglePause();return}const kind=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(!kind||S.mode!=='fight')return;e.preventDefault();if(e.repeat)return;unlockAudio();request(kind);if(kind==='jab'&&S.mode==='fight'&&!S.paused)S.heldJab=true});
document.addEventListener('keyup',e=>{if(['j','a'].includes(e.key.toLowerCase())){S.heldJab=false;S.jabPointer=null}});
window.addEventListener('blur',()=>{S.heldJab=false;S.jabPointer=null;if(S.mode==='fight')togglePause(true)});document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.mode==='fight')togglePause(true)});
function cardCanvas(){const c=document.createElement('canvas');c.width=720;c.height=900;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.scale(2,2);rect(0,0,360,450,'#17112b',ctx);rect(9,9,342,432,'#b794a1',ctx);rect(12,12,336,426,'#241831',ctx);for(let i=0;i<280;i++)rect(seeded(i+9)*330+14,seeded(i+890)*420+15,1,1,'#382640',ctx);
 text('AFTER HOURS ARCADE',180,27,1.1,'#b2e3b6','center',ctx);text('NEON KNOCKOUT',180,49,2.2,'#f4d496','center',ctx);text(S.win?pc().name+' WINS':'I WILL BE BACK',180,78,1.4,S.win?'#aeecc2':'#efb4ad','center',ctx);rect(24,101,312,178,'#1b1430',ctx);rect(24,233,312,46,'#35304d',ctx);fighter(selectedId,S.win?2:0,101,274,.36,0,1,1,0,false,ctx);fighter(rivalId,S.win?3:0,267,274,.38,S.win?-.38:0,1,1,0,false,ctx,'right');text(pc().name,80,285,1,pc().color,'center',ctx);text(bc().name,272,285,1,bc().color,'center',ctx);text('VS',180,180,1.5,'#b698a7','center',ctx);
 if(career())text('CLEAR '+(S.reward?.stars||0)+'/3 / +'+(S.reward?.xp||0)+' XP',180,299,.75,'#c1dbb5','center',ctx);text('SCORE',32,312,1,'#ad91ab','left',ctx);text(String(S.score).padStart(5,'0'),328,309,1.8,'#f8e4b3','right',ctx);
 for(const[label,value,y]of[['GOOD DODGES',S.stats.dodges,345],['PERFECT SLIPS',S.stats.perfect,365],['BEST COMBO',S.stats.bestCombo,385],['RING TIME',formatTime(S.clock),405]]){text(label,32,y,1,'#b69bb7','left',ctx);text(value,328,y,1,'#c1e9be','right',ctx)}text(career()?'STAGE '+(campaignIndex+1)+' / LV '+fighterLevel(selectedId)+' / +'+(S.reward?.coins||0)+' GOLD':pc().perk+' / '+S.stats.procs+' ACTIVATIONS',180,426,.8,'#917b98','center',ctx);return c;
}
$('saveCard').onclick=()=>{if(S.mode!=='result')return;const c=cardCanvas();c.toBlob(blob=>{if(!blob){setHint('Card could not be saved. You can take a screenshot of your result.');return}if(cardURL)URL.revokeObjectURL(cardURL);cardURL=URL.createObjectURL(blob);cardFile=new File([blob],'neon-knockout-fight-card.png',{type:'image/png'});$('cardImage').src=cardURL;$('cardStatus').textContent='Your round, ready to keep. Download or share the PNG.';$('cardPanel').hidden=false},'image/png')};
$('downloadCard').onclick=()=>{if(!cardFile)return;const a=document.createElement('a');a.href=cardURL;a.download=cardFile.name;document.body.append(a);a.click();a.remove();$('cardStatus').textContent='File ready. If no download opens, touch and hold the image.'};
$('shareCard').onclick=async()=>{if(!cardFile)return;try{if(navigator.canShare?.({files:[cardFile]})){$('cardStatus').textContent='Opening the device share sheet. Download is available too.';await navigator.share({title:'Neon Knockout — my round',files:[cardFile]});$('cardStatus').textContent='Share sheet closed.'}else $('cardStatus').textContent='File sharing is unavailable here. Download or touch and hold your card.'}catch(e){$('cardStatus').textContent=e.name==='AbortError'?'Sharing canceled. Your card is still here.':'Sharing unavailable. Download or save the image.'}};
$('closeCard').onclick=()=>{$('cardPanel').hidden=true};
function perkStatus(){const p=S.player;if(selectedId==='tank')return S.t>=p.armorAt?'SHIELD READY':(p.armorAt-S.t).toFixed(1)+'s TO SHIELD';if(selectedId==='raven')return p.meter?'ECHO READY':'DODGE TO CHARGE';if(selectedId==='sol')return p.meter+'/5 HEAT';return p.meter+'/3 JABS';}
function refreshLobby(){if(!artReady)return;$('loadingHint').textContent='CIRCUIT '+Math.min(8,profile.cleared+1)+'/8 · '+profile.coins+' G · '+profile.owned.length+'/5 FIGHTERS';for(const c of document.querySelectorAll('.lobbylineup canvas')){const owned=profile.owned.includes(c.dataset.portrait);c.classList.toggle('locked',!owned);c.setAttribute('aria-label',ROSTER[c.dataset.portrait].name+(owned?' unlocked':' locked'));}}
function enterLobby(){S=fresh();screen='lobby';hidePanels();$('lobbyPanel').hidden=false;$('machine').classList.remove('paused');$('pause').textContent='Ⅱ PAUSE';$('pause').setAttribute('aria-label','Pause fight');setHint('Win fights. Earn XP and gold. Build your champion.');refreshLobby();syncButtons();}
function unlockStage(id){return STAGES.findIndex(s=>s.unlock===id);}
function beginSelect(mode){matchMode=mode;selectStep='player';if(!profile.owned.includes(selectedId))selectedId='rookie';S=fresh();S.mode='select';screen='select';previewId=selectedId;hidePanels();$('selectPanel').hidden=false;buildRoster();refreshSelect();syncButtons();setHint(career()?stage().recommend:'Choose an unlocked fighter for exhibition practice.');sound('tick');}
function buildRoster(){const pool=selectStep==='player'?playable:Object.keys(ROSTER).filter(id=>id!==selectedId);$('roster').replaceChildren();for(const id of pool){const f=ROSTER[id],b=document.createElement('button'),owned=selectStep!=='player'||profile.owned.includes(id);b.className='fightertile'+(owned?'':' locked');b.dataset.fighter=id;b.style.setProperty('--fighter',f.color);b.setAttribute('aria-label',f.name+' / '+f.perk);b.innerHTML='<canvas width="100" height="110" aria-hidden="true" data-portrait="'+id+'"></canvas><span>'+f.name+'</span><small>'+(selectStep==='rival'?'CPU':owned?'LV '+fighterLevel(id):'LOCKED')+'</small>';b.onclick=()=>{previewId=id;refreshSelect();sound('tick');};$('roster').append(b);}refreshSelect();}
function refreshSelect(){const f=ROSTER[previewId],owned=selectStep!=='player'||profile.owned.includes(previewId),eff=selectStep==='player'?effectiveFighter(previewId):f;$('selectEyebrow').textContent=career()?'STAGE '+(campaignIndex+1)+' / VS '+stage().name:selectStep==='player'?'SELECT YOUR FIGHTER':'SELECT CPU OPPONENT';$('selectTitle').textContent=selectStep==='player'?'CHOOSE YOUR CORNER':'PICK YOUR RIVAL';$('previewName').textContent=f.name;$('previewName').style.color=f.color;$('previewTag').textContent=owned?(selectStep==='player'?'LV '+fighterLevel(previewId)+' / ':'')+f.tag:'LOCKED / CLEAR STAGE '+(unlockStage(previewId)+1);$('previewPerk').textContent=f.perk;$('previewPerk').style.color=f.color;$('previewDesc').textContent=owned?(selectStep==='player'?f.desc:CPU_NOTES[previewId]):'Defeat '+STAGES[unlockStage(previewId)].name+' in the CIRCUIT to unlock this fighter.';$('previewArt').dataset.portrait=previewId;$('previewArt').dataset.side=selectStep==='player'?'left':'right';$('previewHP').textContent=(selectStep==='player'?eff.hp:previewId==='brick'?360:Math.round(f.hp*2.3))+' HP';$('statBars').innerHTML=['speed','power','guard'].map(k=>'<div><span>'+k.toUpperCase()+'</span><i>'+Array.from({length:5},(_,j)=>'<b style="background:'+(j<f[k]?f.color:'#3b2b4c')+'"></b>').join('')+'</i></div>').join('');for(const b of $('roster').children){const active=b.dataset.fighter===previewId;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}$('confirmFighter').disabled=!owned;$('confirmFighter').textContent=!owned?'LOCKED / PLAY THE CIRCUIT':career()?'ENTER STAGE '+(campaignIndex+1)+' →':selectStep==='player'?'PICK CPU OPPONENT →':'READY TO FIGHT →';$('selectHint').textContent=career()?stage().recommend+(profile.stars[campaignIndex]?' REPLAY: '+(30+campaignIndex*5)+' G + '+(25+campaignIndex*5)+' XP.':' FIRST CLEAR: '+stage().coin+' G + '+stage().xp+' XP.'):'EXHIBITION: practice with unlocked fighters. No XP or gold.';paintPortraits();}
function showVersus(){S=fresh();S.mode='versus';screen='versus';hidePanels();$('versusPanel').hidden=false;$('versusMode').textContent=career()?'CIRCUIT / STAGE '+(campaignIndex+1)+' OF 8':'VERSUS CPU / EXHIBITION';$('p1Name').textContent=pc().name;$('cpuName').textContent=bc().name;$('p1Perk').textContent='LV '+fighterLevel(selectedId)+' / '+pc().perk;$('cpuPerk').textContent=career()?stage().hp+' HP / '+stage().style.toUpperCase():bc().perk;$('p1Art').dataset.portrait=selectedId;$('cpuArt').dataset.portrait=rivalId;$('matchTip').textContent=career()?stage().tip+' ROUND: '+stage().limit+'s.':'A = JAB · B = HEAVY · C = DODGE. Watch the windup, then counter.';paintPortraits();setHint(career()?stage().tip:'You are on the left. A = jab, B = heavy, C = dodge.');sound('bell');}
function showMap(){matchMode='career';S=fresh();S.mode='map';screen='map';hidePanels();$('mapPanel').hidden=false;$('mapWallet').textContent=profile.coins+' G / '+profile.cleared+' OF 8 CLEARED';$('stageGrid').replaceChildren();for(const [i,cfg] of STAGES.entries()){const ready=i<=profile.cleared,done=profile.stars[i]>0,b=document.createElement('button');b.className='stagecard'+(done?' cleared':ready?' current':' locked');b.disabled=!ready;b.style.setProperty('--stage',cfg.theme);b.setAttribute('aria-label','Stage '+(i+1)+' '+cfg.name+(done?' cleared':ready?' available':' locked'));b.innerHTML='<canvas width="85" height="105" data-portrait="'+cfg.rival+'" data-side="right" aria-hidden="true"></canvas><span><b>'+String(i+1).padStart(2,'0')+' / '+cfg.name+'</b><small>'+(done?'★'.repeat(profile.stars[i])+' · REPLAY':ready?'FIGHT · '+cfg.hp+' HP':'CLEAR STAGE '+i)+'</small><small class="stageloot">'+(ready?(done?30+i*5:cfg.coin)+' G / '+(done?25+i*5:cfg.xp)+' XP':'')+'</small></span>';b.onclick=()=>openStage(i);$('stageGrid').append(b);}$('mapProgress').textContent=profile.cleared===8?'CHAMPION! Replay stages for gold and 3-star clears.':'Next unlock: '+(STAGES.slice(profile.cleared).find(s=>s.unlock)?.unlock?.toUpperCase()||'CIRCUIT CHAMPION')+'. Upgrade between fights.';syncButtons();paintPortraits();setHint('Tap an open stage. Gold is shared; XP belongs to the fighter who fought.');}
function openStage(index){if(index>profile.cleared||index<0||index>=8)return;campaignIndex=index;rivalId=stage().rival;beginSelect('career');}
let gymReturn='lobby';
function openGym(back='lobby'){gymReturn=back;gymId=profile.owned.includes(selectedId)?selectedId:'rookie';S.mode='gym';screen='gym';hidePanels();$('gymPanel').hidden=false;refreshGym();syncButtons();}
function refreshGym(){const f=effectiveFighter(gymId),u=profile.fighters[gymId],lv=fighterLevel(gymId),start=XP_THRESHOLDS[lv-1],end=XP_THRESHOLDS[lv]||700;$('gymWallet').textContent=profile.coins+' G';$('gymName').textContent=f.name+' / LV '+lv;$('gymArt').dataset.portrait=gymId;$('gymAbility').textContent=f.perk;$('gymXPText').textContent=lv===6?'MAX LEVEL':(u.xp-start)+' / '+(end-start)+' XP TO LV '+(lv+1);$('gymXPFill').style.width=(lv===6?100:(u.xp-start)/(end-start)*100)+'%';$('gymStats').textContent=f.hp+' HP · '+f.heavy.toFixed(1)+' HEAVY · '+f.regen.toFixed(1)+' ENERGY/S';$('gymTabs').replaceChildren();for(const id of profile.owned){const b=document.createElement('button');b.className='textbutton'+(id===gymId?' active':'');b.textContent=ROSTER[id].name;b.setAttribute('aria-label','Train '+ROSTER[id].name);b.onclick=()=>{gymId=id;refreshGym();};$('gymTabs').append(b);}for(const [key,title,detail] of [['power','POWER','+8% BASE PUNCH DAMAGE'],['heart','HEART','+12 MAX HP'],['flow','FLOW','+3 ENERGY/S · FASTER DODGE']]){const tier=u[key],cost=60+tier*60,button=$('train'+key);button.disabled=tier>=3||profile.coins<cost;button.innerHTML='<span><b>'+title+' '+tier+'/3</b><small>'+detail+'</small></span><strong>'+(tier>=3?'MAX':cost+' G')+'</strong>';button.setAttribute('aria-label','Train '+title+(tier>=3?' maxed':' for '+cost+' gold'));}$('gymSave').textContent=storageOK?'AUTO-SAVED ON THIS DEVICE':'SESSION PROGRESS / STORAGE UNAVAILABLE';paintPortraits();setHint('Choose a fighter and a training upgrade. Win fights to earn more gold.');}

function paintPortraits(){if(!artReady)return;for(const el of document.querySelectorAll('canvas[data-portrait]')){if(!el.offsetParent)continue;const id=el.dataset.portrait,c=el.getContext('2d'),f=ROSTER[id],big=el.id==='previewArt',idle=(Math.sin(performance.now()/190+f.base)>.75?1:0);c.imageSmoothingEnabled=false;c.clearRect(0,0,el.width,el.height);const frame=frames[f.base],scale=Math.min((el.width-8)/frame.w,(el.height-14)/435);const t=performance.now()/1000,up=Math.round(Math.sin(t*(id==='skye'?9:6))*1.5);c.fillStyle='#100d20';c.fillRect(5,el.height-8,el.width-10,3);fighter(id,0,el.width/2,el.height-8+up,scale,Math.sin(t*3)*.012,1,1,0,false,c,el.dataset.side||'left');if(id==='sol'){c.fillStyle=f.color;c.fillRect(el.width-12,el.height-20-(idle?4:0),3,5);}}}
$('bossMode').onclick=showMap;$('cpuMode').onclick=()=>beginSelect('cpu');$('confirmFighter').onclick=()=>{if(selectStep==='player'){if(!profile.owned.includes(previewId))return;selectedId=previewId;if(career()){rivalId=stage().rival;showVersus();}else{selectStep='rival';previewId=rivalId===selectedId?'brick':rivalId;buildRoster();}}else{rivalId=previewId;showVersus();}};
$('selectBack').onclick=()=>{if(selectStep==='rival'){selectStep='player';previewId=selectedId;buildRoster();}else if(career())showMap();else enterLobby();};$('versusBack').onclick=()=>beginSelect(matchMode);$('fightNow').onclick=startFight;$('changeFighter').onclick=()=>beginSelect(matchMode);$('home').onclick=enterLobby;$('resultHome').onclick=()=>career()?showMap():enterLobby();$('pauseHome').onclick=()=>career()?showMap():enterLobby();$('help').onclick=()=>{$('helpPanel').hidden=false;};$('closeHelp').onclick=()=>{$('helpPanel').hidden=true;};$('lobbyGym').onclick=()=>openGym('lobby');$('mapGym').onclick=()=>openGym('map');$('mapBack').onclick=enterLobby;$('gymBack').onclick=()=>gymReturn==='result'?results():gymReturn==='map'?showMap():enterLobby();$('resultGym').onclick=()=>openGym('result');$('continueCareer').onclick=()=>{if(S.win&&campaignIndex<7)openStage(campaignIndex+1);};for(const key of ['power','heart','flow'])$('train'+key).onclick=()=>{if(trainFighter(gymId,key)){sound('perfect');$('gymToast').textContent=key.toUpperCase()+' UPGRADED!';refreshGym();}};
function frame(t){let dt=Math.min(.05,(t-lastFrame)/1000||0);lastFrame=t;if(!document.hidden){tick(dt);render();uiClock+=dt;if(uiClock>.1){syncButtons();if(S.mode==='fight')$('combatStatus').textContent=pc().name+' '+Math.ceil(S.player.hp)+' HP. '+bc().name+' '+Math.ceil(S.boss.hp)+' HP. '+(S.ai==='windup'?(career()&&S.attack?.feint?'FEINT / WAIT':S.aiDuration-S.aiTime<=dodgeCue()?'DODGE NOW':'WINDING UP'):S.t<S.openUntil?'COUNTER NOW':S.ai.toUpperCase())+'. '+pc().perk+': '+perkStatus()+' / '+(S.t>=S.player.dodgeReady?'C READY':'C WAIT');if(['lobby','select','versus','map','gym','result'].includes(S.mode))paintPortraits();uiClock=0}}requestAnimationFrame(frame)}
render();requestAnimationFrame(frame);
