/* Kervan Yolu 1.2 "Kendi Firman ve RES Projesi": firma adı ve kasası, ekipman (teleskopik kanat dorsesi, blade lifter, SPMT, ek tır), kredi ve faiz,
   şoförler (arka planda sefer), beceri ağacı (ağır yük, gabari dışı, gece, kar zinciri), 10 türbinlik RES projesi (vinç bekleme bedeli, final sahnesi). */
(function(){
'use strict';
const TRf={firma:'Firma',fKasa:'Kasa',fAd:'Firma adı',fAdYaz:'Firmana bir ad ver',fEkip:'Ekipman',fKredi:'Kredi',fSofor:'Şoförler',fBeceri:'Beceriler',fProje:'RES projesi',
 e_teleskop:'Teleskopik kanat dorsesi',e_lifter:'Blade lifter (kanat kaldırıcı)',e_spmt:'SPMT (kendinden yürür modüler)',e_tir:'Ek tır (çekici + lowbed)',
 ed_teleskop:'Kanat seferlerinde dorse kirası (%10) ödemezsin.',ed_lifter:'Ege aktarmasında lifter kirası (%8) ödemezsin.',ed_spmt:'Nasel ve güç aktarma seferlerinde modüler araç kirası (%7) ödemezsin.',ed_tir:'Bir şoför daha çalıştırabilirsin.',
 al:'SATIN AL',var:'Sende var',yetmez:'Kasa yetmiyor',kAl:'100.000 ₺ çek',kOde:'100.000 ₺ öde',kBorc:'Borç',kFaiz:'Faiz: sefer başı %0,9',kLimit:'Limit 1.000.000 ₺',
 sAl:'ŞOFÖR TUT',sYok:'Şoför için boş tır gerek (Ek tır al).',sUcret:'Sefer başı ücret 15.000 ₺; senin her seferinde o da bir sefer yapar.',sCik:'Çıkar',
 b_agir:'Ağır yük',b_gabari:'Gabari dışı',b_gece:'Gece seferi',b_zincir:'Kar zinciri',bd_agir:'Ağır yük navlunu +%4 / seviye',bd_gabari:'Çarpma ve sürtme hasarı −%15 / seviye',bd_gece:'Gece navlunu +%5 / seviye',bd_zincir:'Zincir takma süresi −%30 / seviye',
 bPuan:'Beceri puanı',bXp:'Deneyim',bAc:'+ AÇ',
 pYok:'Henüz projen yok. Bir bölge seç: 10 türbinlik rüzgâr santralinin bütün parçalarını sen taşı.',pBasla:'PROJEYİ BAŞLAT',pDevam:'SIRADAKİ PARÇA',pTur:'Türbin',pKalan:'Sıradaki',pLd:'Vinç bekleme bedeli (toplam)',pBitti:'Santral devrede! 10 türbin dönüyor.',pFull:'RES projesi Tam Sürüm ile açılır.',
 k_kira_tel:'Teleskopik dorse kirası',k_kira_spmt:'Modüler araç (SPMT) kirası',k_beceri:'Beceri primi',k_faiz:'Kredi faizi',k_vincBek:'Montaj vinci bekleme bedeli',k_proje:'Proje primi',
 r_sofor:'Firma şoförleri',r_xp:'Deneyim',seviye:'Seviye',t_seviye:'Yeni beceri puanı! Firma › Beceriler',finTitle:'SANTRAL DEVREDE',finSub:'10 türbin · {mw} MW · {r}',
 j_proje:'Proje parçası',lProje:'Proje'};
const ENf={firma:'Company',fKasa:'Cash',fAd:'Company name',fAdYaz:'Name your company',fEkip:'Equipment',fKredi:'Loan',fSofor:'Drivers',fBeceri:'Skills',fProje:'Wind farm project',
 e_teleskop:'Telescopic blade trailer',e_lifter:'Blade lifter',e_spmt:'SPMT (self-propelled modular)',e_tir:'Extra truck (tractor + lowbed)',
 ed_teleskop:'No trailer rent (10%) on blade jobs.',ed_lifter:'No lifter rent (8%) at the Aegean transfer.',ed_spmt:'No modular trailer rent (7%) on nacelle and drivetrain jobs.',ed_tir:'Lets you hire one more driver.',
 al:'BUY',var:'Owned',yetmez:'Not enough cash',kAl:'Borrow 100,000 ₺',kOde:'Repay 100,000 ₺',kBorc:'Debt',kFaiz:'Interest: 0.9% per job',kLimit:'Limit 1,000,000 ₺',
 sAl:'HIRE DRIVER',sYok:'A driver needs a free truck (buy an extra truck).',sUcret:'Wage 15,000 ₺ per job; each time you finish a job, they run one too.',sCik:'Let go',
 b_agir:'Heavy load',b_gabari:'Oversize',b_gece:'Night runs',b_zincir:'Snow chains',bd_agir:'Heavy freight +4% / level',bd_gabari:'Crash and scrape damage −15% / level',bd_gece:'Night freight +5% / level',bd_zincir:'Chain fitting time −30% / level',
 bPuan:'Skill points',bXp:'Experience',bAc:'+ UNLOCK',
 pYok:'No project yet. Pick a region and haul every part of a 10 turbine wind farm yourself.',pBasla:'START PROJECT',pDevam:'NEXT PART',pTur:'Turbine',pKalan:'Next',pLd:'Crane standby charges (total)',pBitti:'Wind farm online! 10 turbines turning.',pFull:'The wind farm project comes with the Full Version.',
 k_kira_tel:'Telescopic trailer rent',k_kira_spmt:'Modular trailer (SPMT) rent',k_beceri:'Skill bonus',k_faiz:'Loan interest',k_vincBek:'Erection crane standby charge',k_proje:'Project premium',
 r_sofor:'Company drivers',r_xp:'Experience',seviye:'Level',t_seviye:'New skill point! Company › Skills',finTitle:'WIND FARM ONLINE',finSub:'10 turbines · {mw} MW · {r}',
 j_proje:'Project part',lProje:'Project'};
Object.assign(STR.tr,TRf);Object.assign(STR.en,ENf);

const FIYAT={teleskop:300000,lifter:450000,spmt:600000,tir:400000};
const UCRET=15000,FAIZ=.009,LIMIT=1000000;
function F(){if(!SAVE.firma)SAVE.firma={ad:'',ek:{},kredi:0,xp:0,sp:0,b:{agir:0,gabari:0,gece:0,zincir:0},sof:[],proje:null};const f=SAVE.firma;f.ek=f.ek||{};f.b=f.b||{agir:0,gabari:0,gece:0,zincir:0};f.sof=f.sof||[];return f}
const fm=n=>fmt(Math.round(n));

// ---------- proje işleri (n >= 100000) ----------
const PARCA=['kule','nasel','hub','kanat','kanat','kanat'];
const _sef=sefer;
sefer=function(n){if(n<100000)return _sef(n);const p=F().proje;const k=n-100000;const reg=p?p.reg:'ege';const type=PARCA[k%6];const tod=TODS[Math.floor(hash2(n,5)*4)];
 const fee=Math.round(JT[type].base*1.5*(tod==='gece'?1.15:1)*REGIONS[reg].fee/50)*50;const j={n,type,tod,fee,reg,oem:p?p.oem:OEMS[0],inv:p?p.inv:INV[reg][0],proje:true,tur:Math.floor(k/6)+1};
 j.windHold=windHoldOf(j);if(['kanat','kule'].includes(type)&&GECE_REG.includes(reg)){if(j.tod!=='gece'){j.fee=Math.round(j.fee*1.15/50)*50;j.tod='gece'}j.night=true}j.refakat=['kanat','nasel'].includes(type)?(reg==='marmara'?'polis':'jandarma'):null;
 if(!REGIONS[reg].snow){j.rain=hash2(n,413)<.18;j.mud=j.rain||hash2(n,419)<.12}return j};

// ---------- maliyet ve prim satırları ----------
const _jc=jobCosts;
jobCosts=function(j){const c=_jc(j);const f=F(),F0=j.fee,t=j.type;if(t==='donus')return c;
 if(t==='kanat'&&!f.ek.teleskop)c.push(['k_kira_tel',-Math.round(F0*.10/50)*50]);
 if(t==='kanat'&&f.ek.lifter){const i=c.findIndex(x=>x[0]==='k_lifter');if(i>=0)c.splice(i,1)}
 if((t==='nasel'||t==='aktarma')&&!f.ek.spmt)c.push(['k_kira_spmt',-Math.round(F0*.07/50)*50]);
 let pr=0;if(HEAVY.includes(t))pr+=.04*f.b.agir;if(j.tod==='gece')pr+=.05*f.b.gece;if(pr>0)c.push(['k_beceri',Math.round(F0*pr/50)*50]);
 return c};

// ---------- sefer başlangıcı: faiz, beceri etkileri ----------
const _rg=resetGame;
resetGame=function(m,n){_rg(m,n);if(!G)return;const f=F();G._dm=G.dmg||0;G._chk=0;if(m==='career'&&f.kredi>0){G.ext=G.ext||[];G.ext.push(['k_faiz',-Math.round(f.kredi*FAIZ/50)*50])}};
const _st=window.EXT&&EXT.step;
if(window.EXT)EXT.step=function(dt,run){const r=_st?_st(dt,run):false;if(G&&mode==='career'){const f=F();
  if(G.dmg>G._dm){const d=G.dmg-G._dm;G.dmg=G._dm+d*(1-.15*f.b.gabari)}G._dm=G.dmg;
  if(G.chT>0&&!G._chk){G._chk=1;G.chT*=(1-.3*f.b.zincir)}if(!(G.chT>0))G._chk=0}return r};

// ---------- rapor sonrası: şoförler, deneyim, proje ----------
const _sr=showReport;
showReport=function(){const job=G.job;const f=F();let ld=0;
 if(job.proje){const late=Math.max(0,G.deliverT-G.deadline);ld=late>0?Math.round(Math.min(job.fee*.25,Math.ceil(late/10)*job.fee*.03)/50)*50:0;if(ld){G.ext=G.ext||[];G.ext.push(['k_vincBek',-ld])}}
 const m0=SAVE.money;_sr();if(mode!=='career')return;if(job.proje)$('rSefer').textContent=T('fProje')+' · '+T('pTur')+' '+job.tur+' · '+T('j_'+job.type);
 // proje kaydı
 if(job.proje){delete SAVE.done[job.n];const p=f.proje;if(p){p.i=Math.max(p.i,job.n-100000+1);p.ld=(p.ld||0)+ld;if(p.i>=60)p.bitti=true}}
 // şoförler
 let sn=0;const rows=[];for(const s of f.sof){let g=35000+Math.random()*30000;g*=.7;if(Math.random()<.1)g-=20000;sn+=g-UCRET;s.sefer=(s.sefer||0)+1}
 sn=Math.round(sn/50)*50;if(f.sof.length){SAVE.money+=sn;rows.push([T('r_sofor')+' ('+f.sof.length+')',(sn>=0?'+':'−')+fm(Math.abs(sn)),sn>=0?'pos':'neg'])}
 // deneyim
 const xp=20+10*(G.lastStars||1);const lv0=Math.floor(f.xp/100);f.xp+=xp;const lv1=Math.floor(f.xp/100);if(lv1>lv0){f.sp+=lv1-lv0;setTimeout(()=>toast(T('t_seviye'),'#ffe08a',3),900)}rows.push([T('r_xp'),'+'+xp+' XP · '+T('seviye')+' '+(lv1+1),'']);
 save();const box=$('rRows');rows.forEach(r=>{const d=document.createElement('div');d.className='kv';d.innerHTML=`<span>${r[0]}</span><b class="${r[2]}">${r[1]}</b>`;box.appendChild(d)});
 if(job.proje){$('rNext').hidden=!!(f.proje&&f.proje.bitti);if(f.proje&&f.proje.bitti&&!f.proje.final){f.proje.final=true;save();setTimeout(finale,1600)}}};
const nx=$('rNext');const _nx=nx.onclick;nx.onclick=()=>{if(G&&G.job&&G.job.proje){projeBasla();return}_nx()};

function projeBasla(){const p=F().proje;if(!p||p.bitti)return;const n=100000+p.i;if(PAID()&&!SAVE.full){openFull(n);return}show(null);if(BUILT_REG!==p.reg){startGame('career',n);return}resetGame('career',n);showHud(true);hudLabels()}

// ---------- final sahnesi ----------
function finale(){const p=F().proje;if(!p)return;show(null);showHud(false);phase='finale';state='finale';const c=G.target||{x:0,z:0};let a=0;const y0=getH(c.x,c.z);
 const ov=document.createElement('div');ov.id='finOv';ov.style.cssText='position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:12vh;pointer-events:auto;background:linear-gradient(transparent 55%,rgba(0,0,0,.55));color:#fff;text-align:center;font-family:"Barlow Condensed",sans-serif';
 ov.innerHTML=`<div style="font-size:14px;letter-spacing:.3em;color:#ffcf4a">${(F().ad||'').toUpperCase()}</div><div style="font-size:44px;font-weight:800;letter-spacing:.06em">${T('finTitle')}</div><div style="font-size:18px;opacity:.9">${T('finSub').replace('{mw}',10*5.7).replace('{r}',REGIONS[p.reg].name[L])}</div><div class="sig" style="margin-top:10px;opacity:.8">1923 · Bir Mr. Anduv! yapımıdır.</div>`;document.body.appendChild(ov);
 const t0=performance.now();const FCT=window.camTarget;window.camTarget=()=>{a=(performance.now()-t0)/1000*.12;return{p:new THREE.Vector3(c.x+Math.sin(a)*140,y0+60,c.z+Math.cos(a)*140),l:new THREE.Vector3(c.x,y0+40,c.z)}};
 blip(523,784,.4);setTimeout(()=>blip(659,988,.4),300);setTimeout(()=>blip(784,1175,.6),600);
 const end=()=>{ov.remove();window.camTarget=FCT;toMenu()};ov.onclick=end;setTimeout(()=>{if(document.body.contains(ov))end()},14000)}

// ---------- menü: Firma sekmesi ----------
const tabs=document.querySelector('#menu .tabs');const tf=document.createElement('div');tf.className='tab';tf.dataset.tab='firma';tf.id='tFirma';tabs.appendChild(tf);
tf.addEventListener('click',()=>{SAVE.tab='firma';save();renderMenu()});
let SUB='ekip';
const _rm=renderMenu;
renderMenu=function(){tf.textContent=T('firma');if(SAVE.tab!=='firma'){_rm();return}const keep=SAVE.tab;SAVE.tab='career';_rm();SAVE.tab=keep;document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.dataset.tab==='firma'));
 const f=F();const b=$('mBody');const sub=[['ekip',T('fEkip')],['sofor',T('fSofor')],['beceri',T('fBeceri')],['proje',T('fProje')]];
 let h=`<div class="kv"><span>${T('fAd')}</span><b><input id="fAdI" maxlength="22" placeholder="${T('fAdYaz')}" value="${(f.ad||'').replace(/"/g,'')}" style="background:#0f1a14;border:1px solid #2c4535;color:#fff;font:inherit;padding:4px 6px;border-radius:6px;width:11em;text-align:right"></b></div>
 <div class="kv"><span>${T('fKasa')}</span><b class="${SAVE.money>=0?'pos':'neg'}">${fm(SAVE.money)}</b></div>${f.kredi?`<div class="kv"><span>${T('kBorc')}</span><b class="neg">−${fm(f.kredi)}</b></div>`:''}
 <div class="chips" style="margin-top:8px">${sub.map(s=>`<div class="chip ${SUB===s[0]?'on':''}" data-sub="${s[0]}">${s[1]}</div>`).join('')}</div><div id="fSub" style="margin-top:8px"></div>`;
 b.innerHTML=h;const fs=$('fSub');
 const satir=(ad,des,sag)=>`<div style="padding:8px 0;border-bottom:1px solid #1d3025"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:15px">${ad}</b>${sag}</div><div style="font-size:12px;opacity:.75;margin-top:2px">${des}</div></div>`;
 if(SUB==='ekip'){fs.innerHTML=['teleskop','lifter','spmt','tir'].map(k=>{const own=k==='tir'?(f.ek.tir||0):f.ek[k];const btn=(k!=='tir'&&own)?`<span class="pos" style="font-weight:700">${T('var')} ✓</span>`:`<button class="btn sm gold" data-buy="${k}">${T('al')} · ${fm(FIYAT[k])}</button>`;return satir(T('e_'+k)+(k==='tir'&&own?` × ${own}`:''),T('ed_'+k),btn)}).join('')+
   satir(T('fKredi'),T('kFaiz')+' · '+T('kLimit'),`<span style="display:flex;gap:6px"><button class="btn sm" data-kr="al">${T('kAl')}</button>${f.kredi?`<button class="btn sm" data-kr="ode">${T('kOde')}</button>`:''}</span>`)}
 else if(SUB==='sofor'){const bos=(f.ek.tir||0)-f.sof.length;fs.innerHTML=`<div style="font-size:12px;opacity:.8;margin-bottom:6px">${T('sUcret')}</div>`+f.sof.map((s,i)=>satir(s.ad,(s.sefer||0)+' sefer',`<button class="btn sm" data-cik="${i}">${T('sCik')}</button>`)).join('')+(bos>0?`<button class="btn gold" data-hire="1" style="margin-top:8px">${T('sAl')}</button>`:`<div style="font-size:12px;opacity:.75;margin-top:8px">${T('sYok')}</div>`)}
 else if(SUB==='beceri'){fs.innerHTML=`<div class="kv"><span>${T('bXp')}</span><b>${f.xp} XP · ${T('seviye')} ${Math.floor(f.xp/100)+1}</b></div><div class="kv"><span>${T('bPuan')}</span><b class="${f.sp?'pos':''}">${f.sp}</b></div>`+['agir','gabari','gece','zincir'].map(k=>satir(T('b_'+k)+' '+'●'.repeat(f.b[k])+'○'.repeat(3-f.b[k]),T('bd_'+k),f.b[k]<3&&f.sp>0?`<button class="btn sm gold" data-sk="${k}">${T('bAc')}</button>`:'')).join('')}
 else{const p=f.proje;if(!p){fs.innerHTML=`<div style="font-size:13px;opacity:.85;margin-bottom:8px">${T('pYok')}</div><div class="chips">${REG_KEYS.map(r=>`<div class="chip" data-preg="${r}">${REGIONS[r].name[L]}</div>`).join('')}</div>${PAID()&&!SAVE.full?`<div style="font-size:12px;opacity:.75;margin-top:6px">${T('pFull')}</div>`:''}`}
  else{const done=p.i;let tur='';for(let t=0;t<10;t++){const k=Math.max(0,Math.min(6,done-t*6));tur+=`<div title="${T('pTur')} ${t+1}" style="flex:1;text-align:center"><div style="height:34px;display:flex;align-items:flex-end;justify-content:center"><div style="width:4px;height:${k>=1?28:6}px;background:${k>=1?'#e8eaea':'#3a4a40'}"></div></div><div style="font-size:11px;color:${k>=6?'#8ff0a4':'#9fb3a6'}">${k>=6?'✓':k+'/6'}</div></div>`}
   const nj=sefer(100000+Math.min(59,done));fs.innerHTML=`<div class="kv"><span>${T('lProje')}</span><b>${REGIONS[p.reg].name[L]} · ${p.inv} · ${p.oem}</b></div><div style="display:flex;gap:2px;margin:8px 0">${tur}</div>
   ${p.bitti?`<div class="pos" style="font-weight:700">${T('pBitti')}</div>`:`<div class="kv"><span>${T('pKalan')}</span><b>${T('pTur')} ${nj.tur} · ${T('j_'+nj.type)}</b></div>`}<div class="kv"><span>${T('pLd')}</span><b class="${p.ld?'neg':''}">${p.ld?'−'+fm(p.ld):'0 ₺'}</b></div>`}}
 // olaylar
 const ai=$('fAdI');if(ai)ai.onchange=()=>{f.ad=ai.value.trim().slice(0,22);save()};
 b.querySelectorAll('[data-sub]').forEach(e=>e.onclick=()=>{SUB=e.dataset.sub;renderMenu()});
 b.querySelectorAll('[data-buy]').forEach(e=>e.onclick=()=>{const k=e.dataset.buy;if(SAVE.money<FIYAT[k]){toast(T('yetmez'),'#ff8a5c',2);return}SAVE.money-=FIYAT[k];if(k==='tir')f.ek.tir=(f.ek.tir||0)+1;else f.ek[k]=true;save();blip(523,784,.3);renderMenu()});
 b.querySelectorAll('[data-kr]').forEach(e=>e.onclick=()=>{if(e.dataset.kr==='al'){if(f.kredi+100000>LIMIT)return;f.kredi+=100000;SAVE.money+=100000}else{if(SAVE.money<100000){toast(T('yetmez'),'#ff8a5c',2);return}f.kredi=Math.max(0,f.kredi-100000);SAVE.money-=100000}save();renderMenu()});
 b.querySelectorAll('[data-hire]').forEach(e=>e.onclick=()=>{const AD=['Rıza Usta','Kemal Abi','Hüseyin','Murat','Ali Rıza','Hasan Usta','Nuri','Selim'];f.sof.push({ad:AD[(f.sof.length*3+Math.floor(Math.random()*8))%AD.length],sefer:0});save();renderMenu()});
 b.querySelectorAll('[data-cik]').forEach(e=>e.onclick=()=>{f.sof.splice(+e.dataset.cik,1);save();renderMenu()});
 b.querySelectorAll('[data-sk]').forEach(e=>e.onclick=()=>{const k=e.dataset.sk;if(f.sp>0&&f.b[k]<3){f.sp--;f.b[k]++;save();blip(659,988,.25);renderMenu()}});
 b.querySelectorAll('[data-preg]').forEach(e=>e.onclick=()=>{const r=e.dataset.preg;f.proje={reg:r,i:0,ld:0,oem:OEMS[Math.floor(Math.random()*OEMS.length)],inv:INV[r][Math.floor(Math.random()*2)]};save();renderMenu()});
 // ana düğme
 const go=$('goBtn');if(SUB==='proje'&&f.proje&&!f.proje.bitti){go.textContent=T(f.proje.i?'pDevam':'pBasla');go.onclick=()=>{projeBasla()}}else{go.textContent=T('startJob');go.onclick=()=>{const n=nextSefer();if(needFull(n)){openFull(n);return}startGame('career',n)}}};
// diğer sekmelerde ana düğmenin asıl işlevi
const go0=$('goBtn').onclick;document.querySelectorAll('#menu .tab').forEach(e=>{if(e!==tf)e.addEventListener('click',()=>{$('goBtn').onclick=go0})});
})();
