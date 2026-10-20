const fs=require('node:fs'),vm=require('node:vm');const noop=()=>{},nodes=new Map(),memory=new Map();function node(){return{hidden:false,disabled:false,textContent:'',dataset:{},classList:{add:noop,remove:noop},setAttribute:noop,getContext:()=>({imageSmoothingEnabled:false})}}const context={console,Math,Date,Image:class{},document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8').split('/* RENDER */')[0],context);vm.runInContext(`
artReady=true;
function expect(v,msg){if(!v)throw Error(msg)}
function advance(sec){for(let i=0;i<Math.ceil(sec/.01);i++)tick(.01)}
function prepare(i,id='rookie'){matchMode='career';campaignIndex=i;rivalId=stage().rival;selectedId=id;startFight();}
profile=emptyProfile();expect(profile.owned.length===1&&profile.owned[0]==='rookie','new career starts with Rookie');expect(!trainFighter('rookie','power'),'cannot buy without coins');profile.coins=100;expect(trainFighter('rookie','power')&&profile.coins===40&&pc().heavy>13,'real upgrade and exact debit');expect(!trainFighter('skye','power'),'cannot train locked fighter');expect(!trainFighter('rookie','heart')&&profile.coins===40,'no negative wallet');expect(JSON.stringify(readProfile())===JSON.stringify(profile),'profile round trip');
profile=emptyProfile();prepare(0);S.boss.hp=1;playerContact('jab');expect(S.win&&S.reward.first&&profile.coins===120&&profile.cleared===1,'first clear rewards and next stage');expect(profile.owned.includes('skye')&&fighterLevel('skye')===2&&fighterLevel('rookie')===2,'unlock plus independent XP levels');const total=profile.coins;settleFight();expect(profile.coins===total,'reward cannot be claimed twice');prepare(0);S.boss.hp=1;playerContact('jab');expect(!S.reward.first&&S.reward.coins===30&&profile.coins===150,'replay rewards smaller than first clear');prepare(1);finish(false);expect(S.reward.coins===0&&S.reward.xp===0,'no idle death farming');prepare(1);playerContact('jab');finish(false);expect(S.reward.coins===12&&S.reward.xp===18,'active loss keeps small progress');const oldMode=S.mode;campaignIndex=3;startFight();expect(S.mode===oldMode,'locked stage cannot start');
prepare(1);nextPattern();request('dodge');bossContact();expect(S.openUntil===0&&S.sequenceDodges===1&&S.ai==='windup','first dodge does not cancel second punch');advanceSequence();beginSequenceHit();S.t+=dodgeCooldown()+.01;request('dodge');bossContact();advanceSequence();expect(S.openUntil>S.t&&S.ai==='recover','full combo dodge earns counter window');
profile.cleared=8;profile.owned=[...playable];prepare(6);nextPattern();S.sequenceAt=1;beginSequenceHit();const hp=S.player.hp;advance(.55);expect(S.player.hp===hp,'feint has no invisible damage');prepare(7);S.clock=stage().limit;tick(.01);expect(!S.win&&S.timedOut,'round timer ends stalling');
function bot(style='reader'){
 for(let i=0;i<24000&&S.mode!=='result';i++){
  if(S.mode==='fight'){
   if(style==='jab')S.heldJab=true;
   else if(S.ai==='windup'&&!S.attack?.feint&&S.aiDuration-S.aiTime<.09&&S.t>=S.player.dodgeReady)request('dodge');
   else if(S.ai==='recover'&&S.t<S.openUntil&&!S.player.action&&S.t-S.player.dodgeAt>.2)request('heavy');
   else if(S.ai==='rest'&&!S.player.action&&S.aiTime>.1)request('jab');
  }tick(.01);
 }
 return {stage:campaignIndex+1,fighter:selectedId,win:S.win,time:+S.clock.toFixed(1),hp:S.player.hp,bossHP:S.boss.hp,dodges:S.stats.dodges,level:fighterLevel(selectedId)};
}
profile=emptyProfile();const campaignResults=[];for(const [i,id]of [[0,'rookie'],[1,'skye'],[2,'skye'],[3,'tank'],[4,'raven'],[5,'sol'],[6,'raven'],[7,'sol']]){
 if(i>=2){trainFighter(id,'power');if(i>=5){trainFighter(id,'power');trainFighter(id,'heart');trainFighter(id,'flow');}}
 prepare(i,id);const result=bot();campaignResults.push(result);expect(result.win,'reader with earned upgrades should beat stage '+(i+1));
}
console.log('PROGRESSION PLAYTHROUGH',JSON.stringify(campaignResults));
const losses=[];profile=emptyProfile();profile.owned=[...playable];profile.cleared=8;for(const i of [1,2,3,4,5,6,7]){prepare(i);const result=bot('jab');losses.push(result);expect(!result.win,'jab-only must lose stage '+(i+1));}console.log('JAB-ONLY CHECKS',JSON.stringify(losses));
profile=emptyProfile();profile.owned=[...playable];profile.cleared=8;for(const id of playable){profile.fighters[id]={xp:700,power:3,heart:3,flow:3};prepare(7,id);const result=bot('jab');expect(!result.win,'even max gear cannot jab-spam final boss: '+id);}
profile=emptyProfile();profile.coins=9999;for(let i=0;i<4;i++)trainFighter('rookie','power');expect(profile.fighters.rookie.power===3,'training caps at 3');console.log('PASS progression, XP, unlocks, upgrades, persistence, reward idempotency, loss rewards, gating, multi-hit combos, feints, timer, campaign balance');
`,context);
