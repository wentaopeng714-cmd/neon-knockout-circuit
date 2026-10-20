const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/game.js','utf8').split('/* RENDER */')[0];
const noop=()=>{},nodes=new Map();function node(){return{hidden:false,disabled:false,textContent:'',dataset:{},classList:{add:noop,remove:noop},setAttribute:noop,getContext:()=>({imageSmoothingEnabled:false})}}
const sandbox={console,Math,Date,Image:class{},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}},localStorage:{getItem:()=>null,setItem:noop}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
vm.runInContext(`
artReady=true;profile.owned=[...playable];
function expect(v,m){if(!v)throw new Error(m)}
function advance(t){for(let i=0;i<Math.ceil(t/.01);i++)tick(.01)}
startFight();request('jab');advance(.15);expect(S.boss.hp===356,'jab contact damage');advance(.4);expect(S.boss.hp===356,'single contact only');request('heavy');advance(.4);expect(S.boss.hp===343,'heavy damage distinct');
startFight();request('heavy');advance(.1);expect(request('dodge')&&S.player.action===null,'dodge cancels windup');bossContact();expect(S.player.hp===100&&S.stats.dodges===1&&S.stats.perfect===1,'perfect dodge avoids damage');advance(.3);request('heavy');advance(.4);expect(S.boss.hp===324&&S.stats.counters===1,'perfect heavy counter amplified');
startFight();request('dodge');advance(.7);bossContact();expect(S.player.hp===83,'early dodge expires');
startFight();transition('guard',.5);request('heavy');advance(.3);expect(S.boss.hp===360&&S.stats.hits===0,'guard blocks damage');
startFight();transition('windup',1.08);request('jab');advance(.15);expect(S.ai==='windup','jab cannot stunlock committed boss swing');
startFight();S.boss.hp=170;advance(.1);expect(S.phase2,'second phase');
startFight();const t=S.t;S.paused=true;advance(1);expect(S.t===t&&!request('jab'),'pause freezes fight and rejects input');S.paused=false;
startFight();S.boss.hp=1;request('jab');advance(.3);expect(S.mode==='ko'&&S.win,'winning KO');advance(3);expect(S.mode==='result','winning result');startFight();expect(S.player.hp===100&&S.boss.hp===360&&S.stats.hits===0,'rematch resets complete round');
// A held punch by itself must not beat the boss before learning to dodge.
startFight();S.heldJab=true;for(let i=0;i<12000&&S.mode!=='result';i++)tick(.01);expect(S.mode==='result'&&!S.win,'jab spam alone loses');console.log('Jab-only defeat: time',S.clock.toFixed(1),'boss HP',S.boss.hp);
// The intended easy loop should win without needing movement or combo chords.
startFight();for(let i=0;i<12000&&S.mode!=='result';i++){
 if(S.mode==='fight'){
  if(S.ai==='windup'&&S.aiDuration-S.aiTime<.17&&S.t>=S.player.dodgeReady)request('dodge');
  else if(S.ai==='recover'&&S.t<S.openUntil&&!S.player.action&&S.t-S.player.dodgeAt>.28)request('heavy');
  else if(S.ai==='rest'&&!S.player.action&&S.aiTime>.3)request('jab');
 }
 tick(.01);
}
expect(S.mode==='result'&&S.win&&S.stats.dodges>=5,'simple dodge + heavy loop wins');expect(S.clock<100,'first boss reasonable length');console.log('Dodge-counter win: time',S.clock.toFixed(1),'HP',S.player.hp,'dodges',S.stats.dodges,'counters',S.stats.counters);
console.log('PASS punches, hit timing, guard, cancel-to-dodge, early/perfect dodge, counter, boss phase, pause, KO, restart and balance simulations');
`,sandbox);
vm.runInContext(`
function choose(id,rival='brick'){selectedId=id;rivalId=rival;startFight();}
choose('rookie');playerContact('jab');playerContact('jab');playerContact('jab');expect(S.player.meter===3,'rookie charge');const rhp=S.boss.hp;playerContact('heavy');expect(rhp-S.boss.hp===19&&S.player.meter===0,'rookie star bonus consumed');
choose('skye');playerContact('jab');playerContact('jab');playerContact('jab');expect(S.echoes.length===1,'skye schedules real second hit');const shp=S.boss.hp;advance(.25);expect(shp-S.boss.hp===4&&S.stats.hits===4,'skye echo damage and hit count');
choose('tank');bossContact();expect(S.player.hp===116&&S.player.armorAt===6,'tank halves first 17 damage to 9');bossContact();expect(S.player.hp===99,'tank shield cannot absorb every hit');S.t=6.1;bossContact();expect(S.player.hp===90,'tank shield really recharges');
choose('raven');request('dodge');bossContact();expect(S.player.meter===1,'raven successful dodge charges echo');S.openUntil=0;playerContact('heavy');const vhp=S.boss.hp;advance(.7);expect(vhp-S.boss.hp===10&&S.player.meter===0,'raven heavy releases delayed echo');
choose('sol');for(let i=0;i<5;i++)playerContact('jab');expect(S.player.meter===5,'sol heat builds');const ohp=S.boss.hp;playerContact('heavy');expect(ohp-S.boss.hp===24&&S.player.meter===0,'sol flame heavy 12+2+10');playerContact('jab');bossContact();expect(S.player.meter===0,'sol heat clears on damage');
choose('rookie','tank');playerContact('heavy');expect(cpuMax()-S.boss.hp===7,'CPU Tank actual armor');
choose('rookie','raven');transition('guard',1);playerContact('jab');expect(S.boss.meter===1,'CPU Raven guard charges counter');bossContact();expect(S.player.hp===76,'CPU Raven charged damage');
choose('rookie','sol');bossContact();bossContact();expect(S.player.hp===64,'CPU Sol builds damage heat');
choose('skye');S.boss.hp=1;S.player.hp=1;S.echoes.push({at:0,damage:4,type:'DOUBLE TAP'});transition('strike',.3);S.aiTime=.1;tick(.01);expect(S.mode==='ko'&&S.win&&S.player.hp===1,'echo KO ends combat before opponent can hit');
const records=[];
for(const id of playable)for(const foe of Object.keys(ROSTER)){
 choose(id,foe);for(let i=0;i<14000&&S.mode!=='result';i++){
 if(S.mode==='fight'){
  if(S.ai==='windup'&&S.aiDuration-S.aiTime<.17&&S.t>=S.player.dodgeReady)request('dodge');
  else if(S.ai==='recover'&&S.t<S.openUntil&&!S.player.action&&S.t-S.player.dodgeAt>.28)request('heavy');
  else if(S.ai==='rest'&&!S.player.action&&S.aiTime>.3)request('jab');
 }tick(.01);}
 expect(S.win&&S.mode==='result','intended loop must beat '+id+' vs '+foe);expect(S.clock>8&&S.clock<100,'round duration bounded');records.push({fighter:id,rival:foe,time:+S.clock.toFixed(1),HP:S.player.hp,perks:S.stats.procs});
}
console.log('30 MATCHUP SIMULATIONS PASS',JSON.stringify(records));
console.log('PASS all five abilities, CPU armor/counter/heat, 30 full rounds, and replay resets');
`,sandbox);
