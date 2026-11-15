/* ==========================================================================
   Gökalp — Görsel yenileme (Mr. Anduv! Görsel Kayıt Defteri çizgisi)
   Piksel kare çizimler yerine konturlu, gölgeli, ışıklı çizgi film çizimleri.
   Bu dosya index.html içindeki oyun kapsamına (IIFE) "@@GORSEL@@" yerine gömülür;
   oyunun mantığına dokunmaz, yalnız çizim işlevlerini değiştirir.
   ========================================================================== */
let g=ctx;const BS=SC;const OL='#1e130b';
const SHC={};
function shade(h,a){const k=h+a;if(SHC[k])return SHC[k];let n=parseInt(h.slice(1),16),r=n>>16,gg=n>>8&255,b=n&255;const f=a<0?0:255,p=Math.abs(a);r=Math.round((f-r)*p+r);gg=Math.round((f-gg)*p+gg);b=Math.round((f-b)*p+b);return SHC[k]='#'+((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1);}
function circ(x,y,r){g.beginPath();g.arc(x,y,Math.max(0.01,r),0,6.2832);}
function ell(x,y,rx,ry,rot=0){g.beginPath();g.ellipse(x,y,Math.max(0.01,rx),Math.max(0.01,ry),rot,0,6.2832);}
function rrect(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function cap(x1,y1,x2,y2,r){const a=Math.atan2(y2-y1,x2-x1);g.beginPath();g.arc(x1,y1,r,a+Math.PI/2,a-Math.PI/2);g.arc(x2,y2,r,a-Math.PI/2,a+Math.PI/2);g.closePath();}
function poly(p){g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();}
function fs(fill,ol=OL,lw=0.45){g.fillStyle=fill;g.fill();if(ol){g.lineWidth=lw;g.strokeStyle=ol;g.lineJoin='round';g.stroke();}}
function lg(x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function rg(x,y,r0,r1,st,x1=x,y1=y){const gr=g.createRadialGradient(x,y,r0,x1,y1,r1);st.forEach((c,i)=>gr.addColorStop(i/(st.length-1),c));return gr;}
function ln(x1,y1,x2,y2,c,w){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.stroke();}
function srand(s){s=Math.abs(s|0)%2147483646+1;return()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};}
function mk(w,h,fn){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*BS));c.height=Math.max(1,Math.ceil(h*BS));const old=g;g=c.getContext('2d');g.scale(BS,BS);try{fn();}finally{g=old;}return c;}
const GLS={};
function glowSpr(rgb){if(GLS[rgb])return GLS[rgb];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(0.3,`rgba(${rgb},0.5)`);gr.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=gr;x.fillRect(0,0,64,64);return GLS[rgb]=c;}
function glow(x,y,r,rgb,a=1){if(a<=0||r<=0)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);g.imageSmoothingEnabled=true;g.drawImage(glowSpr(rgb),x-r,y-r,r*2,r*2);g.restore();}
function feetShadow(x,y,w,a=0.32){ell(x,y+0.4,w,1.3);g.fillStyle=`rgba(25,12,4,${a})`;g.fill();}
const FB='"Bungee","Rubik",sans-serif',FR='"Rubik",sans-serif';


/* ---------- Gökalp (kahraman): sivri miğfer, kırmızı kaftan, altın kuşak, kılıç ---------- */
const GK={skin:'#f0b088',hair:'#3a2414',helm:'#a8b8d0',kaftan:'#c83a28',gold:'#f0c040',pants:'#2a4aa0',boot:'#3a2414'};
function gkLeg(hx,hip,ang,len,front){g.save();g.translate(hx,hip);g.rotate(ang);const c=front?GK.pants:shade(GK.pants,-0.28);cap(0,0,0,len-1.5,1.8);fs(lg(-2,0,2,0,[shade(c,0.15),c,shade(c,-0.2)]));const b=front?GK.boot:shade(GK.boot,-0.2);g.beginPath();g.moveTo(-1.9,len-2.8);g.lineTo(1.7,len-2.8);g.quadraticCurveTo(4,len-1.9,4.1,len);g.lineTo(-2,len);g.closePath();fs(lg(0,len-2.8,0,len,['#6a4a2a',b]));g.restore();}
function gkHead(hc){const s=GK.skin;rrect(-0.6,hc+3.4,2.6,2.3,0.6);fs(shade(s,-0.18),null);
 circ(0.6,hc,5.1);fs(rg(-0.8,hc-2.2,0.3,6.2,[shade(s,0.2),s,shade(s,-0.22)],0.6,hc));
 ell(3.05,hc+0.4,1.3,1.62);fs('#fffaf2',OL,0.3);ell(3.5,hc+0.6,0.74,1.02);fs('#2a1608',null);circ(3.78,hc+0.1,0.32);fs('#fff',null);
 ln(1.6,hc-1.3,4.5,hc-1.4,GK.hair,0.7);g.beginPath();g.moveTo(5.2,hc+0.8);g.quadraticCurveTo(6.5,hc+2,5.1,hc+2.4);g.strokeStyle=shade(s,-0.38);g.lineWidth=0.42;g.stroke();
 g.beginPath();g.moveTo(3,hc+3.3);g.quadraticCurveTo(3.9,hc+3.9,4.8,hc+3.1);g.strokeStyle='#6a2a1a';g.lineWidth=0.42;g.stroke();ell(1.9,hc+2.4,1.05,0.6);g.fillStyle='rgba(230,100,90,0.35)';g.fill();
 g.beginPath();g.moveTo(-5.2,hc-0.4);g.quadraticCurveTo(-5.6,hc+4,-3.2,hc+5.2);g.lineTo(-2.4,hc+1.4);g.closePath();fs(GK.hair,null);
 // sivri miğfer
 g.beginPath();g.moveTo(-5.4,hc-0.8);g.quadraticCurveTo(-5.2,hc-7,0.4,hc-11.5);g.quadraticCurveTo(5.8,hc-7,5.8,hc-1);g.closePath();fs(lg(-5,hc-11,5,hc,['#eef4fa','#a8b8d0','#5a6a84']));
 ln(0.4,hc-11.2,0.4,hc-2,'rgba(255,255,255,0.55)',0.5);circ(0.4,hc-11.8,0.9);fs(GK.gold,OL,0.3);
 rrect(-5.8,hc-2.4,12,2,0.9);fs(lg(0,hc-2.4,0,hc-0.4,['#ffe080',GK.gold,'#a8742a']),OL,0.35);rrect(3.6,hc-1.2,1.2,3.4,0.5);fs('#8a98b0',OL,0.3);
 g.beginPath();g.moveTo(-5.2,hc-0.6);g.lineTo(-6.2,hc+4.2);g.lineTo(-3.4,hc+3.6);g.closePath();fs('#7a8aa4',OL,0.3);}
function sword(ang,len,glowA){g.save();g.rotate(ang);rrect(-0.6,-2.2,1.2,3.2,0.4);fs('#5c3a1a',null);rrect(-2.2,0.8,4.4,1.1,0.5);fs(GK.gold,OL,0.3);
 g.beginPath();g.moveTo(-0.9,1.9);g.lineTo(-0.9,len-1.4);g.lineTo(0,len+0.6);g.lineTo(0.9,len-1.4);g.lineTo(0.9,1.9);g.closePath();fs(lg(-1,0,1,0,['#ffffff','#cfe0f0','#8aa0b8']),'#3a4a5a',0.3);
 if(glowA)glow(0,len*0.6,len*0.7,'96,224,255',glowA);g.restore();}
function drawGokalp(px,py,face,kind,atk,anim){const x=px+5,y=py+22,air=kind==='j',mv=!air&&(kind==='a'||kind==='b')&&pl&&Math.abs(pl.vx)>0.2,t=(anim||0)*0.3;
 g.save();g.translate(x,y);g.scale(face*0.92,0.92);
 const bob=mv?-Math.abs(Math.sin(t))*0.9:0,hip=-9+bob,tH=7.4,sh=hip-tH,hc=sh-4.6;let fa,ba;if(air){fa=-0.85;ba=0.5;}else if(mv){fa=-Math.sin(t)*0.75;ba=Math.sin(t)*0.75;}else{fa=-0.05;ba=0.1;}
 gkLeg(-1.1,hip,ba,9,false);g.save();g.translate(-1.6,sh+1.3);g.rotate(0.3+(mv?Math.sin(t)*0.6:0));cap(0,0,0,5,1.35);fs(shade(GK.kaftan,-0.3));circ(0,5.6,1.15);fs(shade(GK.skin,-0.12));g.restore();
 g.beginPath();g.moveTo(-3.9,sh+1.6);g.quadraticCurveTo(-4.2,sh-0.3,-1.6,sh);g.lineTo(2.4,sh);g.quadraticCurveTo(4.2,sh-0.2,4,sh+1.6);g.lineTo(4.9,hip+3.2);g.lineTo(-4.7,hip+3.2);g.closePath();fs(lg(-4,sh,3,hip+3,[shade(GK.kaftan,0.2),GK.kaftan,shade(GK.kaftan,-0.26)]));
 ln(0.4,sh+0.3,0.4,hip+3,GK.gold,0.55);for(let k=0;k<3;k++){circ(-0.9,sh+1.6+k*1.7,0.35);g.fillStyle=GK.gold;g.fill();}
 rrect(-4.1,hip-1.8,8.4,1.9,0.6);fs(GK.gold,OL,0.3);
 gkLeg(0.9,hip,fa,9,true);gkHead(hc);
 g.save();g.translate(1.4,sh+1.5);
 if(atk>0){const k=Math.min(1,(12-atk)/7);g.rotate(-1.9+k*2.1);cap(0,0,0,5,1.45);fs(lg(-1.4,0,1.4,0,[shade(GK.kaftan,0.12),shade(GK.kaftan,-0.18)]));circ(0,5.6,1.3);fs(GK.skin);g.translate(0,5.4);sword(-0.1,14,0.55);g.restore();
  if(atk>5){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(140,230,255,0.75)';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.arc(1.4,sh+1.5,17,-1.4,0.35*(12-atk)/6);g.stroke();g.restore();}}
 else{g.rotate(air?-1.4:0.35);cap(0,0,0,5,1.45);fs(lg(-1.4,0,1.4,0,[shade(GK.kaftan,0.12),shade(GK.kaftan,-0.18)]));circ(0,5.6,1.3);fs(GK.skin);g.translate(0,5.4);sword(air?1.3:-0.45,11,0);g.restore();}
 g.restore();}

/* ---------- Erlik gölgesi, mekanik güvercin, yıldız tozu, kuyruklu yıldız ---------- */
function drawGolge(f,sx){const x=sx+6,y=f.y+6+Math.sin(frame*0.08+f.x0)*1.2;glow(x,y,12,'150,70,220',0.35);
 g.beginPath();g.moveTo(x-6,y+4);g.quadraticCurveTo(x-7,y-7,x,y-7.5);g.quadraticCurveTo(x+7,y-7,x+6,y+4);for(let k=0;k<4;k++)g.quadraticCurveTo(x+4.5-k*3,y+7+((k+(frame>>3))%2)*1.6,x+3-k*3,y+4);g.closePath();fs(rg(x-2,y-3,0.5,9,['#a060d8','#7a38b0','#3e1a62'],x,y),'#1a0a2a',0.45);
 for(const s of [-1,1]){ell(x+s*2.3,y-2,1.5,1.8);fs('#ffffff',null);circ(x+s*2.3+0.4,y-1.6,0.7);g.fillStyle='#2a0a3a';g.fill();}
 g.beginPath();g.moveTo(x-1.6,y+1.6);g.quadraticCurveTo(x,y+0.6,x+1.6,y+1.6);g.strokeStyle='#1a0a2a';g.lineWidth=0.5;g.stroke();}
function drawGuvercin(d){const x=d.x-cam+5,y=d.y+4,f=pl?pl.face:1,fl=Math.sin(frame*0.4);g.save();g.translate(x,y);g.scale(f,1);
 g.save();g.rotate(-0.4-fl*0.7);g.beginPath();g.moveTo(-1,-1);g.quadraticCurveTo(-4,-7,-9,-6.5);g.quadraticCurveTo(-6,-3,-7,-1.5);g.quadraticCurveTo(-3,-0.5,-1,1);g.closePath();fs(lg(0,0,-9,-6,['#f8f8f8','#c8d0dc']),OL,0.35);for(let k=0;k<3;k++)ln(-2-k*2,-1-k*1.4,-3-k*2,-3-k*1.4,'#a8b8d0',0.4);g.restore();
 ell(0,0.6,5,3);fs(rg(-1,-0.8,0.4,5,['#ffffff','#e6eaf0','#a8b0c0']),OL,0.4);poly([-4.5,0,-7.5,-1.6,-7.3,1.8]);fs('#c8d0dc',OL,0.3);
 circ(3.6,-1.2,2.3);fs(rg(3,-1.8,0.3,2.6,['#ffffff','#d8dee8']),OL,0.35);poly([5.6,-1.4,7.6,-0.8,5.6,-0.2]);fs(GK.gold,OL,0.25);circ(4.2,-1.6,0.55);g.fillStyle='#1a1a2a';g.fill();
 circ(0.4,0.8,1.3);fs('#a8b8d0',OL,0.3);for(let k=0;k<4;k++){const a=frame*0.1+k*1.57;circ(0.4+Math.cos(a)*1,0.8+Math.sin(a)*1,0.25);g.fillStyle=GK.gold;g.fill();}
 g.restore();glow(x,y,6,'255,240,200',0.2);}
function drawYildizTozu(s){const x=s.x-cam+5,y=s.y+5+Math.sin(frame*0.1+s.x),r=2.6+Math.sin(frame*0.15+s.x)*0.6;glow(x,y,8,'255,210,90',0.55);g.save();g.translate(x,y);g.rotate(frame*0.02);
 g.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.38:r,a=i*Math.PI/4;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();fs(rg(-0.5,-0.5,0.2,r,['#ffffff','#ffe070','#f0a020']),null);g.restore();}
function drawKuyruklu(k){const x=k.x-cam,y=k.y;g.save();g.globalCompositeOperation='lighter';for(let i=10;i>0;i--){circ(x-i*k.vx*2.2,y-i*k.vy*2.2,2.6-i*0.18);g.fillStyle=`rgba(255,${150+i*8},60,${0.08*(11-i)})`;g.fill();}g.restore();glow(x,y,9,'255,220,140',0.8);circ(x,y,2.4);fs(rg(x-0.6,y-0.6,0.2,2.6,['#ffffff','#ffd070']),null);}
function drawKayaG(r){const x=r.x-cam,y=r.y;ell(x,y,4.4,3.9,0.3);fs(rg(x-1.2,y-1.2,0.3,5,['#a89a8a','#7a6e60','#4a4038']),OL,0.4);}

/* ---------- karolar ---------- */
const TPL={tk:{a:'#4a5878',b:'#2e3850',top:'#9fb0d2',rune:'#c79a34'},ay:{a:'#9a9eab',b:'#80848f',top:'#e2e6ee',rune:'#c8ccd8'},ul:{a:'#463664',b:'#34284e',top:'#d8d0ff',rune:'#b8a8ff'},yd:{a:'#5a4a3a',b:'#3e3228',top:'#d8b878',rune:'#e0b048'},co:{a:'#8a4a5a',b:'#6a3446',top:'#ffd8a8',rune:'#ffd060'},gg:{a:'#5a4a36',b:'#46392a',top:'#7ac060',rune:'#9ae070'},kp:{a:'#c8a47c',b:'#a88660',top:'#f0dcb8',rune:'#6a4a30'}};
const GTC={};
function gTile(k,kind,v){const key=k+kind+v;if(GTC[key])return GTC[key];const P=TPL[k],r=srand(v*31+kind.length*7+k.charCodeAt(0));
 return GTC[key]=mk(16,16,()=>{g.fillStyle=P.b;g.fillRect(0,0,16,16);
  const blk=(x,y,w,h)=>{rrect(x+0.35,y+0.35,w-0.7,h-0.7,1);fs(lg(x,y,x+w,y+h,[shade(P.a,0.18),P.a,shade(P.a,-0.12)]),null);g.fillStyle='rgba(255,255,255,0.12)';g.fillRect(x+1,y+0.8,w-2,0.6);};
  if(k==='ay'||k==='gg'||k==='kp'){g.fillStyle=lg(0,0,0,16,[shade(P.a,0.08),P.a,shade(P.a,-0.15)]);g.fillRect(0,0,16,16);for(let i=0;i<7;i++){const x=r()*15,y=1+r()*14,s=0.5+r()*1.3;ell(x,y,s*1.3,s);g.fillStyle=r()<0.5?P.b:shade(P.a,0.18);g.fill();}if(k==='ay')for(let i=0;i<2;i++){const x=3+r()*10,y=4+r()*9;circ(x,y,1.6);g.strokeStyle=P.b;g.lineWidth=0.5;g.stroke();}if(k==='kp')for(let i=0;i<3;i++)ln(0,3+i*5+r()*2,16,3+i*5+r()*2,'rgba(140,100,70,0.35)',0.4);}
  else{blk(0,0,8,8);blk(8,0,8,8);blk(-4,8,8,8);blk(4,8,8,8);blk(12,8,8,8);}
  if(kind==='rune'){g.strokeStyle=P.rune;g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(5,4.5);g.lineTo(8,8);g.lineTo(11,4.5);g.moveTo(8,8);g.lineTo(8,11.8);g.stroke();}
  if(kind==='top'){if(k==='gg'){g.fillStyle=lg(0,0,0,5,['#a8e080',P.top,'#4a8a3a']);g.beginPath();g.moveTo(0,0);g.lineTo(16,0);g.lineTo(16,4);for(let x=16;x>=0;x-=2)g.quadraticCurveTo(x-1,5.8+((x+v)%3)*0.5,x-2,4);g.closePath();g.fill();for(let i=0;i<6;i++){const x=r()*16;ln(x,1,x+(r()-0.5),-0.6-r()*1.6,'#a8e080',0.45);}}
   else{g.fillStyle=lg(0,0,0,3.4,['#ffffff',P.top,shade(P.top,-0.25)]);rrect(0,0,16,3,0.6);g.fill();g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(0,3,16,0.6);if(k==='ul'||k==='co'){for(let i=0;i<3;i++){circ(2+i*5.5+r()*2,1.2,0.5);g.fillStyle='#ffffff';g.fill();}}}}
 });}
function drawTilesV(c){const x0=Math.floor(c/T);
 for(let ty=0;ty<15;ty++)for(let tx=x0;tx<=x0+Math.ceil(W/T)&&tx<cur.W;tx++){if(!grid[ty][tx]||bset.has(tx+','+ty))continue;const top=ty===0||!grid[ty-1][tx];
  g.drawImage(gTile(lvKey,top?'top':((tx*7+ty*13)%11===0?'rune':'fill'),(tx+ty)&1),tx*T-c,ty*T,16,16);
  if(!top&&(tx*7+ty*13)%11===0)glow(tx*T-c+8,ty*T+8,7,'255,210,120',0.15+0.1*Math.sin(frame*0.05+tx));}}

/* ---------- gök arka planları ---------- */
const GBG={};
function skyBG(top,stops){g.fillStyle=lg(0,-top,0,H,stops);g.fillRect(0,-top,W,VH);}
function starsV(c,top,a=1){for(const s of STARS){const x=((s.x-c*s.z)%W+W)%W,y=-top+s.y*(top+200);const tw=0.45+0.55*Math.abs(Math.sin(frame*0.03+s.ph));circ(x,y,s.s*0.45);g.fillStyle=`rgba(255,255,255,${tw*a})`;g.fill();if(s.s>1)glow(x,y,2.6,'200,220,255',tw*0.5*a);}}
function ridge(key,w,h,col,amp,seed,snow,hazeCol){if(GBG[key])return GBG[key];return GBG[key]=mk(w,h,()=>{const f=x=>h*0.55+amp*Math.sin(2*Math.PI*2*x/w+seed)+amp*0.5*Math.sin(2*Math.PI*5*x/w+seed*2)+amp*0.2*Math.sin(2*Math.PI*13*x/w);
 g.beginPath();g.moveTo(0,h);for(let x=0;x<=w;x+=2)g.lineTo(x,f(x));g.lineTo(w,h);g.closePath();g.fillStyle=lg(0,0,0,h,[shade(col,0.15),col,shade(col,-0.15)]);g.fill();
 if(snow)for(let x=0;x<w;x++){const y=f(x);if(y<h*0.45){g.fillStyle='rgba(240,248,255,0.9)';g.fillRect(x,y,1.2,Math.max(0,(h*0.45-y)*0.8));}}
 if(hazeCol){g.globalCompositeOperation='source-atop';g.fillStyle=lg(0,0,0,h,['rgba(0,0,0,0)',hazeCol]);g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}});}
function bigStarV(x,y,r,rgb){glow(x,y,r*4,rgb,0.6);g.save();g.translate(x,y);g.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.3:r*1.4,a=i*Math.PI/4;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fillStyle='#ffffff';g.fill();g.restore();}
function tilePar(img,w,h,off,y){let x=-(((off%w)+w)%w);for(;x<W;x+=w)g.drawImage(img,x,y,w+0.4,h);}
const bgV={
 tk(c,top){skyBG(top,['#060a24','#141f4a','#2a3c78']);starsV(c,top);bigStarV(W-52,30-top*0.5,4+Math.sin(frame*0.05),'190,232,255');
  for(const tw of TOWERS){const x=tw.x-c*0.4;if(x<-50||x>W+10)continue;const tp=210-tw.h;rrect(x,tp,tw.w,tw.h+30,1.2);fs(lg(x,0,x+tw.w,0,['#24306a','#16204a','#0e163a']),'#0a1030',0.5);for(let i=0;i<tw.w;i+=8){rrect(x+i,tp-4,4,4.4,0.6);fs('#1c2858',null);}
   g.strokeStyle='#c79a34';g.lineWidth=0.9;g.save();g.translate(x+tw.w/2,tp+14);g.beginPath();g.moveTo(-2,-3);g.lineTo(0,0);g.lineTo(2,-3);g.moveTo(0,0);g.lineTo(0,3.5);g.stroke();g.restore();glow(x+tw.w/2,tp+14,6,'255,200,90',0.3);
   for(let wy=tp+26;wy<200;wy+=18){rrect(x+tw.w/2-1.6,wy,3.2,5,1.4);g.fillStyle='rgba(255,200,110,0.6)';g.fill();}}
  g.imageSmoothingEnabled=true;tilePar(ridge('tk',512,60,'#101a40',10,1,false,'rgba(40,60,120,0.5)'),512,60,c*0.6,185);},
 ay(c,top){skyBG(top,['#02020a','#06060f','#0e0e1c']);starsV(c,top);const ex=W-46-c*0.02,ey=44-top*0.5;glow(ex,ey,34,'80,140,255',0.4);g.save();circ(ex,ey,17);g.clip();g.fillStyle=rg(ex-6,ey-6,1,20,['#5a9af0','#2a62c8','#123a8a']);g.fillRect(ex-18,ey-18,36,36);
   for(const [dx,dy,rx,ry] of [[-6,-5,6,4],[-2,1,4,5],[7,4,6,3],[-10,8,4,2]]){ell(ex+dx,ey+dy,rx,ry,0.3);g.fillStyle='#3aa050';g.fill();}for(const [dx,dy,w] of [[-10,6,12],[0,-11,10]]){ell(ex+dx,ey+dy,w/2,1.4);g.fillStyle='rgba(240,248,255,0.85)';g.fill();}g.restore();
   g.globalCompositeOperation='source-over';circ(ex,ey,17);g.fillStyle=rg(ex+8,ey+6,4,20,['rgba(0,0,10,0)','rgba(0,0,10,0.6)']);g.fill();
   g.imageSmoothingEnabled=true;tilePar(ridge('ay',512,70,'#5a5e6a',9,2,false,'rgba(0,0,0,0.4)'),512,70,c*0.3,175);},
 ul(c,top){skyBG(top,['#0c0620','#24164a','#3e2a6a']);starsV(c,top);const px=W-70-c*0.03,py=30-top*0.5;[[0,0,3],[11,-5,2],[20,1,3],[6,8,2],[15,11,2],[26,-3,2],[22,15,2]].forEach(([dx,dy,r],i)=>bigStarV(px+dx,py+dy,r*0.8+Math.sin(frame*0.06+i)*0.3,i%2?'216,208,255':'255,240,176'));
   for(let i=0;i<9;i++){const x=((i*137-c*0.35)%(W+120)+W+120)%(W+120)-60,y=120+(i*53)%70;for(let k=0;k<4;k++){ell(x+k*9+4,y+3-((k%3)*1.5),9,5);g.fillStyle=k%2?'#2a1c50':'#33225c';g.fill();}ell(x+18,y+1,16,2);g.fillStyle='rgba(216,208,255,0.25)';g.fill();}},
 yd(c,top){skyBG(top,['#050818','#121c3a','#1e2c50']);starsV(c,top);const px=40-c*0.02,py=26-top*0.5,pts=[[0,10],[14,12],[26,8],[38,10],[50,4],[66,0],[60,16]];
   g.save();g.globalAlpha=0.3;g.strokeStyle='#ffd060';g.lineWidth=0.6;g.beginPath();[...pts,[50,4]].forEach(([dx,dy],i)=>i?g.lineTo(px+dx,py+dy):g.moveTo(px+dx,py+dy));g.stroke();g.restore();
   pts.forEach(([dx,dy],i)=>{const on=lit.includes(i);if(on)bigStarV(px+dx,py+dy,2.2+Math.sin(frame*0.08+i)*0.4,'255,208,96');else{circ(px+dx,py+dy,0.9);g.fillStyle='#4a5a7a';g.fill();}});
   g.imageSmoothingEnabled=true;tilePar(ridge('yd1',512,90,'#1a2846',22,0.5,true,'rgba(20,30,60,0.4)'),512,90,c*0.15,130);tilePar(ridge('yd2',512,60,'#0e1830',14,2.2,false,null),512,60,c*0.3,185);},
 co(c,top){skyBG(top,['#1a0c2a','#5a2a5a','#a84a6a','#ffa868']);starsV(c,top,0.5);const vx=W-64-c*0.02,vy=150;glow(vx,vy,40,'255,230,190',0.55);bigStarV(vx,vy,4.5,'255,246,208');
   g.imageSmoothingEnabled=true;tilePar(ridge('co',512,50,'#4a2040',8,1.5,false,'rgba(255,150,120,0.25)'),512,50,c*0.25,190);},
 gg(c,top){skyBG(top,['#081626','#16384a','#2a5a6a']);starsV(c,top,0.8);g.imageSmoothingEnabled=true;tilePar(ridge('gg1',512,110,'#1e3e4e',30,0.8,true,'rgba(80,140,170,0.35)'),512,110,c*0.15,60);tilePar(ridge('gg2',512,60,'#173040',10,2.5,false,null),512,60,c*0.3,140);},
 kp(c,top){skyBG(top,['#2a3a6a','#8a6a8a','#c87a7a','#f0b880']);starsV(c,top,0.35);
   for(let i=0;i<5;i++){const x=((i*97+frame*0.15-c*0.1)%(W+60)+W+60)%(W+60)-30,y=40+(i*37)%70+Math.sin(frame*0.02+i)*3,col=['#c83a28','#2a8a5a','#f0c040','#2a4aa0','#e07a3a'][i];ell(x,y,5,6);fs(rg(x-2,y-2,0.5,7,[shade(col,0.3),col,shade(col,-0.3)]),OL,0.35);ln(x-3,y+4,x-1.2,y+7,'#5a3a1a',0.3);ln(x+3,y+4,x+1.2,y+7,'#5a3a1a',0.3);rrect(x-1.6,y+7,3.2,2,0.5);fs('#8a5a2a',null);}
   const o=c*0.35;for(let i=-1;i<W/34+2;i++){const x=i*34-(o%34),hh=40+((i+Math.floor(o/34))*29%4)*12;g.beginPath();g.moveTo(x-2,212);g.quadraticCurveTo(x+1,212-hh*0.7,x+3,210-hh);g.lineTo(x+9,210-hh);g.quadraticCurveTo(x+11,212-hh*0.7,x+14,212);g.closePath();fs(lg(x,0,x+14,0,['#b8907a','#9a7a6a','#6a5048']),null);ell(x+6,211-hh,7,2.6);fs('#5a4040',null);}
   g.fillStyle=lg(0,206,0,240,['#8a6a5a','#6a5044']);g.fillRect(0,206,W,40);}};

/* ---------- bosslar ---------- */
function drawYelbegen3(e,sx){const y=e.y,x=sx,fl=e.inv>0&&(frame>>2)%2,step=Math.sin((e.anim||0)*0.08)*1.6,f=e.face||-1;
 g.save();g.translate(x+14,0);g.scale(-f,1);g.translate(-14,0);ell(14,y+40.4,16,1.5);g.fillStyle='rgba(20,10,4,0.4)';g.fill();
 for(const [lx,o] of [[6,step],[17,-step]]){rrect(lx,y+30+o*0.3,7,10-o*0.3,2);fs(lg(lx,0,lx+7,0,['#5a6a4c','#2f3a2a']));rrect(lx-1,y+37.5,9,3,1.2);fs('#3a2a1a');}
 g.beginPath();g.moveTo(2,y+33);g.quadraticCurveTo(-1,y+18,4,y+12);g.lineTo(24,y+12);g.quadraticCurveTo(30,y+18,26,y+33);g.closePath();fs(rg(10,y+16,1,20,['#7a8a62','#4d5a44','#2a3424'],14,y+22));
 rrect(2,y+24,24,3.2,1);fs(lg(0,y+24,0,y+27,['#a03028','#6a1810']),OL,0.35);
 g.save();g.translate(-2,y+26);g.rotate(-0.25+Math.sin(frame*0.05)*0.15);rrect(-2,-22,5,24,2.2);fs(lg(-2,0,3,0,['#9b6a35','#5c3a1a']));g.restore();
 [[x?0:0,2,e.hp>=3],[18,2,e.hp>=2],[9,-4,e.hp>=1]].forEach(([hx,hy,al])=>{const cx=hx+5,cy=y+hy+5;if(!al){ell(cx,cy+5,2.4,1.5);fs('#2a3424');return;}ln(cx,cy+3,14,y+13,'#4d5a44',2.8);circ(cx,cy,5);fs(rg(cx-1.4,cy-1.6,0.4,6,['#b0c090','#8a9a72','#5a6a4c']),OL,0.45);
  poly([cx-4,cy-3,cx-5,cy-7,cx-2.4,cy-4]);fs('#f0e4c8',OL,0.3);poly([cx+4,cy-3,cx+5,cy-7,cx+2.4,cy-4]);fs('#f0e4c8',OL,0.3);for(const s of [-1,1]){circ(cx+s*1.8,cy-0.4,1.1);fs('#ff3020',null);}glow(cx,cy-0.4,4,'255,60,30',0.3);
  g.beginPath();g.moveTo(cx-2.2,cy+2.2);g.quadraticCurveTo(cx,cy+3.4,cx+2.2,cy+2.2);g.strokeStyle='#1a1010';g.lineWidth=0.5;g.stroke();});
 g.restore();if(fl)glow(x+14,y+20,30,'255,255,255',0.5);}
function drawTepegozV(e,sx){const st=e.st==='stun',y=e.y+(st?6:0),x=sx,fl=e.inv>0&&(frame>>2)%2,f=e.face,step=st?0:Math.sin((e.anim||0)*0.2)*1.5,sh=e.st==='wind'?Math.sin(frame)*0.8:0;
 ell(x+15,e.y+44.4,17,1.6);g.fillStyle='rgba(20,10,4,0.4)';g.fill();
 g.save();g.translate(x+15+sh,0);g.scale(f,1);
 for(const [lx,o] of [[-9,step],[2,-step]]){rrect(lx,y+32+o*0.3,7.5,12-o*0.3-(st?6:0),2.2);fs(lg(lx,0,lx+7,0,['#9fae7e','#76845a']));rrect(lx-1,y+42-(st?6:0),9.5,2.6,1.2);fs('#3a2414');}
 g.beginPath();g.moveTo(-12,y+34);g.quadraticCurveTo(-14,y+18,-8,y+14);g.lineTo(9,y+14);g.quadraticCurveTo(14,y+18,12,y+34);g.closePath();fs(rg(-3,y+18,1,20,['#c6d3a0','#9fae7e','#6a7a4e'],0,y+24));
 rrect(-11,y+24,22,10,2);fs(lg(0,y+24,0,y+34,['#8a6a3a','#6a4a2a','#3a2414']),OL,0.4);for(let k=-9;k<10;k+=4)ln(k,y+25,k+1,y+33,'rgba(30,15,5,0.4)',0.4);
 g.save();g.translate(13,y+15);g.rotate(-0.6+(e.st==='wind'?-0.8:0)+Math.sin(frame*0.05)*0.1);rrect(-2.6,-26,6,28,2.6);fs(lg(-2.6,0,3.4,0,['#9b6a35','#5c3a1a']));for(let k=0;k<5;k++){circ(0.4,-23+k*4.5,0.9);fs('#c8c2b2',OL,0.25);}g.restore();
 g.save();g.translate(-12,y+16);g.rotate(0.4);cap(0,0,0,12,3);fs(lg(-3,0,3,0,['#c6d3a0','#9fae7e']));g.restore();
 const hy=y-2;ell(0,hy+6,12,11);fs(rg(-3,hy+2,1,14,['#dae6b8','#c6d3a0','#8a9a6a'],0,hy+6));
 for(let i=0;i<7;i++){poly([-11+i*3.6,hy-1,-9.4+i*3.6,hy-6-(i%2)*2,-7.6+i*3.6,hy-1]);fs('#3a2a1e',null);}g.beginPath();g.moveTo(-12,hy+2);g.quadraticCurveTo(0,hy-6,12,hy+2);g.lineTo(12,hy-1);g.quadraticCurveTo(0,hy-9,-12,hy-1);g.closePath();fs('#3a2a1e',null);
 const ex=1,ey=hy+6;ell(ex,ey,6.2,5.2);fs('#ffffff','#2a1a10',0.6);if(st){ln(ex-4,ey,ex+4,ey,'#2a1a10',0.9);}else{circ(ex+2,ey+0.4,2.8);fs(rg(ex+1.4,ey-0.4,0.3,3,['#ff6a5a','#d13b2b','#7a1a10']),null);circ(ex+2,ey+0.4,1.2);g.fillStyle='#1a1010';g.fill();circ(ex+1.2,ey-0.6,0.6);g.fillStyle='#fff';g.fill();}
 ln(ex-6,ey-6,ex-1,ey-4.6,'#2a1a10',1);ln(ex+1,ey-4.6,ex+6,ey-6,'#2a1a10',1);
 g.beginPath();g.moveTo(-6,hy+12.5);g.quadraticCurveTo(0,hy+16.5,6,hy+12.5);g.lineTo(5,hy+14.5);g.quadraticCurveTo(0,hy+17.5,-5,hy+14.5);g.closePath();fs('#3a1420',null);poly([-3.6,hy+13.2,-2.6,hy+15.4,-1.6,hy+13.6]);g.fillStyle='#fff6e0';g.fill();poly([1.6,hy+13.6,2.6,hy+15.4,3.6,hy+13.2]);g.fill();
 g.restore();if(st)for(let i=0;i<3;i++){const a=frame*0.12+i*2.1;glow(x+15+Math.cos(a)*12,y-14+Math.sin(a)*3,3,'255,210,80',0.9);}if(fl)glow(x+15,y+20,30,'255,255,255',0.5);}
function drawCanavarV(c){const b=boss;if(!b||b.type!=='canavar'||b.dead||!(b.neck>=2)||!cur.water)return;const wt=cur.water.y*T,x=b.x-c,fl=b.inv>0&&(frame>>2)%2,f=b.face;const hy=b.st==='rest'?wt-8:wt-b.neck;
 for(let y=wt+2;y>hy;y-=3){const k=(wt-y)/Math.max(1,wt-hy),sx=x+Math.sin(k*2+frame*0.05)*3*(b.st==='rest'?0:1);ell(sx,y-2,6.5,4);fs(lg(sx-6,0,sx+6,0,['#4a7a7a','#2e4a4a','#1a3030']),null);if(((y|0)%9)<3){poly([sx-f*6-1.5,y-4,sx-f*7.5,y-8,sx-f*4,y-4]);fs('#1a3030',null);}ell(sx+f*3,y-2,2,3.4);g.fillStyle='rgba(140,180,160,0.5)';g.fill();}
 g.save();g.translate(x,hy);g.scale(f,1);ell(0,-7,11,7.5);fs(rg(-3,-10,1,12,['#5a8a8a','#2e4a4a','#1a3030']),OL,0.5);rrect(6,-9,10,7,3);fs(lg(0,-9,0,-2,['#4a7a7a','#2e4a4a']),OL,0.45);ell(13,-3,4,1.6);fs('#6a8a7a',null);
 for(const [dx,h] of [[-8,5],[-2,7.5],[4,5]]){poly([dx-2,-12,dx,-12-h,dx+2,-12]);fs('#1a3030',OL,0.3);}
 if(b.st==='rest')ln(6,-8,10,-8,'#101018',0.8);else{circ(8,-8.5,2.2);fs('#ffd040',OL,0.35);circ(8.4,-8.4,1);g.fillStyle='#101018';g.fill();glow(8,-8.5,5,'255,210,60',0.4);}
 g.restore();if(fl)glow(x,hy-6,20,'255,255,255',0.45);
 for(const r of drops){const rx=r.x-c,ry=r.y;glow(rx,ry,6,'127,216,240',0.5);circ(rx,ry,2.6);fs(rg(rx-0.8,ry-0.8,0.2,3,['#ffffff','#7fd8f0','#3a8ab0']),null);}}
function drawVanKedisiV(c){const x=90*T-c,y=9*T;if(x<-20||x>W)return;g.save();g.translate(x+5,y);
 ell(0,-4,6,3.8);fs(rg(-1,-6,0.5,7,['#ffffff','#f0f0ec','#c8c8c0']),OL,0.45);g.beginPath();g.moveTo(-5.5,-4);g.quadraticCurveTo(-11,-6+Math.sin(frame*0.1)*2,-9,-11);g.strokeStyle='#d8a050';g.lineWidth=2;g.lineCap='round';g.stroke();g.strokeStyle='#f4f4f0';g.lineWidth=1;g.stroke();
 for(const lx of [-3.5,3]){rrect(lx-1,-1.4,2,2,0.8);fs('#f4f4f0',OL,0.3);}
 circ(5,-9,3.8);fs(rg(4,-10,0.4,4.4,['#ffffff','#f0f0ec']),OL,0.45);poly([2.6,-11.6,2.8,-15,4.6,-12.4]);fs('#f4f4f0',OL,0.35);poly([5.6,-12.4,7.4,-15,7.6,-11.6]);fs('#f4f4f0',OL,0.35);
 circ(4,-9.3,0.9);g.fillStyle='#3a7ad0';g.fill();circ(6.6,-9.3,0.9);g.fillStyle='#d0a020';g.fill();poly([5,-8,4.6,-7.4,5.4,-7.4]);g.fillStyle='#e8a0a0';g.fill();
 g.restore();glow(x+5,y-8,10,'255,255,220',0.25);}
function drawHansV(c){for(const h of hans){const x=h.x-c,y=h.y;if(x<-20||x>W+20)continue;
 rrect(x-8,y-6,16,6,1.2);fs(lg(0,y-6,0,y,['#9a8668','#6a5640']),OL,0.4);rrect(x-9,y-7.4,18,2.2,1);fs(lg(0,y-7.4,0,y-5,['#f0d898','#c8a868']),OL,0.35);
 if(h.on){glow(x,y-12,18,'255,150,40',0.75);const fl=Math.sin(frame*0.4)*1.2;g.beginPath();g.moveTo(x,y-21-fl);g.quadraticCurveTo(x+6,y-12,x+4,y-7.4);g.lineTo(x-4,y-7.4);g.quadraticCurveTo(x-6,y-12,x,y-21-fl);g.closePath();fs(lg(0,y-21,0,y-7,['#fff6c0','#ffb040','#e8501c']),null);
  g.beginPath();g.moveTo(x,y-15-fl*0.5);g.quadraticCurveTo(x+2.6,y-10,x,y-7.6);g.quadraticCurveTo(x-2.6,y-10,x,y-15-fl*0.5);g.closePath();g.fillStyle='#fffbe8';g.fill();}
 else{ell(x,y-7.6,4,1.2);fs('#3a2414',null);circ(x,y-8.2,0.8);g.fillStyle='#c04010';g.fill();glow(x,y-8,3,'255,90,30',0.4);}}}
function drawCapsV(c){for(const [x,y,w] of (cur.caps||[])){const px=x*T-c,py=y*T;if(px<-60||px>W+20)continue;poly([px-6,py+2,px+w*T/2,py-20,px+w*T+6,py+2]);fs(lg(0,py-20,0,py,['#8a6a54','#6a5040','#4a3428']),OL,0.45);
 rrect(px-6,py,w*T+12,3,1);fs('#4a3428',OL,0.35);rrect(px+w*T/2-3.4,py+19.5,6.8,8.5,3.4);fs('#2a1a10',OL,0.4);rrect(px+w*T/2-2.2,py+21,4.4,6.4,2.2);fs(lg(0,py+21,0,py+27,['#ffe090','#ffb040']),null);glow(px+w*T/2,py+24,10,'255,180,80',0.5);}}
function drawCrystalsV(c){for(const br of bridges){for(let i=0;i<br.w;i++){const x=(br.x+i)*T-c,y=br.y*T;if(x<-16||x>W)continue;
  if(br.t>0){if(br.t<90&&(frame>>2)%2)continue;rrect(x,y,16,5,1.4);fs(lg(0,y,0,y+5,['#ffffff','#fff2b0','#ffd070']),null);glow(x+8,y+3,9,'255,220,140',0.4);}else{rrect(x+5,y+1,6,1.4,0.7);g.fillStyle='rgba(255,240,200,0.35)';g.fill();}}}
 for(const q of crystals){const x=q.x-c+5,y=q.y+5+Math.sin(frame*0.06+q.b)*2,on=bridges[q.b].t>0;glow(x,y,on?14:9,on?'255,246,192':'255,192,112',on?0.8:0.5);poly([x,y-7,x+5,y,x,y+7,x-5,y]);fs(lg(x-5,y-7,x+5,y+7,on?['#ffffff','#fff6c0','#ffd070']:['#ffe0b0','#ffc070','#c87a20']),'#7a4a10',0.4);poly([x,y-7,x+1.6,y,x,y+7]);g.fillStyle='rgba(255,255,255,0.35)';g.fill();}}
function drawWaterV(c,front){const w=cur.water;if(!w)return;const wt=w.y*T,x0=Math.max(0,w.x0*T-c),x1=Math.min(W,w.x1*T-c);if(x1<=x0)return;
 if(!front){for(const f of fish){const x=f.x-c;for(let i=0;i<3;i++){const fx=x+i*7,fy=f.y+(i%2)*4+Math.sin(frame*0.1+i);const d=Math.cos(f.t*0.015)>0?1:-1;g.save();g.translate(fx+2.5,fy+1);g.scale(d,1);ell(0,0,3,1.4);fs(lg(0,-1.4,0,1.4,['#ffffff','#e8e0d0','#b8b0a0']),null);poly([-3,0,-4.6,-1.3,-4.6,1.3]);fs('#f09040',null);g.restore();}}return;}
 g.fillStyle=lg(0,wt,0,H,['rgba(60,170,200,0.45)','rgba(20,90,130,0.6)']);g.fillRect(x0,wt,x1-x0,H-wt);g.beginPath();g.moveTo(x0,wt);for(let x=x0;x<=x1;x+=3)g.lineTo(x,wt+Math.sin((x+c)*0.08+frame*0.06)*1.5);g.strokeStyle='rgba(220,250,255,0.85)';g.lineWidth=0.8;g.stroke();
 for(let i=0;i<8;i++){const x=x0+((i*53+frame*0.3)%(x1-x0||1)),y=wt+12+(i*29)%40;ell(x,y,4,0.5);g.fillStyle='rgba(200,240,255,0.18)';g.fill();}}
function drawGoalV(c){if(boss&&!boss.dead)return;const gx=cur.goal*T-c,gy=13*T;
 if(lvKey==='tk'){rrect(gx+4,gy-96,8,96,1.2);fs(lg(gx+4,0,gx+12,0,['#7b86a8','#5b6684','#3b4664']),OL,0.45);for(let y=gy-90;y<gy;y+=12)ln(gx+4,y,gx+12,y,'#2e3850',0.6);for(const yy of [gy-60,gy-30]){rrect(gx+3,yy,10,2,0.6);fs('#f0c040',OL,0.3);}bigStarV(gx+8,gy-106,4.5+Math.sin(frame*0.1)*1,'255,220,90');}
 else if(lvKey==='kp'){const y0=6*T;rrect(gx-2,y0-30,4,30,1);fs(lg(gx-2,0,gx+2,0,['#8a6a40','#5a3a20']),OL,0.35);g.beginPath();g.moveTo(gx+2,y0-30);g.quadraticCurveTo(gx+11,y0-28+Math.sin(frame*0.1)*1.5,gx+20,y0-25);g.lineTo(gx+2,y0-20);g.closePath();fs(lg(gx,0,gx+20,0,['#d04a3a','#9a2018']),OL,0.35);bigStarV(gx+8,y0-46,3,'255,220,90');}
 else if(lvKey==='co'){const y0=13*T;for(const px of [gx-4,gx+20]){rrect(px,y0-64,8,64,1.2);fs(lg(px,0,px+8,0,['#e09a8a','#c87a6a','#8a4a40']),OL,0.45);}g.strokeStyle='#ffd8a8';g.lineWidth=4;g.beginPath();g.arc(gx+12,y0-64,16,Math.PI,0);g.stroke();g.fillStyle=`rgba(255,240,190,${0.3+0.15*Math.sin(frame*0.08)})`;g.fillRect(gx+4,y0-64,16,64);glow(gx+12,y0-40,24,'255,240,190',0.4);bigStarV(gx+12,y0-86,4,'255,246,208');}
 else if(lvKey==='gg'||lvKey==='yd'){const y0=(lvKey==='gg'?9:12)*T,hh=lvKey==='gg'?40:56,ww=lvKey==='gg'?24:28;for(const px of [gx,gx+ww-5]){rrect(px,y0-hh,5,hh,1);fs(lg(px,0,px+5,0,['#9a8668','#7a6650','#4a3e30']),OL,0.4);}rrect(gx-3,y0-hh-6,ww+6,6,1.4);fs(lg(0,y0-hh-6,0,y0-hh,['#f0d898','#c8a868']),OL,0.4);
  g.fillStyle=lvKey==='gg'?`rgba(160,230,255,${0.25+0.15*Math.sin(frame*0.1)})`:`rgba(255,208,96,${0.25+0.15*Math.sin(frame*0.1)})`;g.fillRect(gx+5,y0-hh+2,ww-10,hh-2);glow(gx+ww/2,y0-hh/2,ww,lvKey==='gg'?'160,230,255':'255,208,96',0.35);}
 else if(lvKey==='ul'){const y0=12*T;rrect(gx+2,y0-14,24,14,1.5);fs(lg(0,y0-14,0,y0,['#8a7ab2','#6a5a92','#4a3a72']),OL,0.4);rrect(gx,y0-16,28,3,1);fs('#d8d0ff',OL,0.35);[[0,0],[-7,-6],[7,-6],[-10,4],[10,4],[-4,10],[4,10]].forEach(([dx,dy],i)=>bigStarV(gx+14+dx,y0-48+dy,1.4+Math.sin(frame*0.08+i)*0.4,i?'255,240,176':'255,255,255'));}
 else{rrect(gx-2,gy-42,32,3,1);fs('#6a4a2a',OL,0.35);for(const px of [gx+1,gx+24])rrect(px,gy-40,3,22,1),fs('#6a4a2a',OL,0.3);ln(gx+13.5,gy-39,gx+13.5,gy-25,'#c8b080',0.6);rrect(gx+11,gy-26,5,4,1);fs('#6a4a2a',OL,0.3);
  rrect(gx,gy-18,28,18,1.5);fs(lg(0,gy-18,0,gy,['#9ca0ac','#7c808c','#5c606c']),OL,0.45);rrect(gx+2,gy-20,24,3,1);fs('#101018',null);glow(gx+13,gy-19,8,'255,246,192',0.4);}}
function drawMoversV(c){for(const m of movers){const x=m.x-c;if(m.ax==='y'){const y=m.y,cx=x+m.w/2;rrect(x+2,y,m.w-4,8,2);fs(lg(0,y,0,y+8,['#c08a4a','#8a5a2a']),OL,0.4);ln(x+3.5,y,cx-10,y-16,'#5a3a1a',0.6);ln(x+m.w-3.5,y,cx+10,y-16,'#5a3a1a',0.6);
  ell(cx,y-30,17,19);fs(rg(cx-6,y-38,1,22,['#ff7a5a','#c83a28','#7a1a10'],cx,y-30),OL,0.5);g.save();ell(cx,y-30,17,19);g.clip();g.fillStyle='#f0c040';g.fillRect(cx-4,y-50,8,40);g.fillStyle='#2a4aa0';g.fillRect(cx-18,y-33,36,4);g.restore();rrect(cx-5,y-14,10,3,1);fs('#8a2a1a',OL,0.3);if(m.vy<0){glow(cx,y-11,7,'255,170,60',0.8);}continue;}
  rrect(x,m.y,m.w,7,2.4);fs(lg(0,m.y,0,m.y+7,['#e8e2ff','#9a8ad0','#5a4a8a']),OL,0.45);ell(x+m.w/2,m.y+8,m.w*0.35,1.5);g.fillStyle='rgba(216,208,255,0.35)';g.fill();}}

/* ---------- HUD, başlık, kart ---------- */
function heartV(x,y,s,on){g.beginPath();g.moveTo(x,y+s*0.3);g.bezierCurveTo(x,y,x-s*0.5,y,x-s*0.5,y+s*0.3);g.bezierCurveTo(x-s*0.5,y+s*0.6,x,y+s*0.8,x,y+s);g.bezierCurveTo(x,y+s*0.8,x+s*0.5,y+s*0.6,x+s*0.5,y+s*0.3);g.bezierCurveTo(x+s*0.5,y,x,y,x,y+s*0.3);g.closePath();fs(on?lg(x,y,x,y+s,['#ff7a6a','#c0281e']):'rgba(80,40,40,0.6)','#2a0a05',0.35);}
let VIG2=null;
function postG(cool=true){if(!VIG2||VIG2.__w!==W||VIG2.__h!==VH){VIG2=mk(W,VH,()=>{g.fillStyle=rg(W/2,VH/2,Math.min(W,VH)*0.4,Math.max(W,VH)*0.72,['rgba(5,4,15,0)','rgba(5,4,15,0.45)']);g.fillRect(0,0,W,VH);});VIG2.__w=W;VIG2.__h=VH;}
 g.save();g.globalCompositeOperation='soft-light';g.fillStyle=lg(0,0,0,VH,cool?['rgba(90,120,230,0.28)','rgba(255,190,140,0.14)']:['rgba(255,140,90,0.28)','rgba(255,200,140,0.14)']);g.fillRect(0,0,W,VH);g.restore();g.imageSmoothingEnabled=true;g.drawImage(VIG2,0,0,W,VH);g.imageSmoothingEnabled=false;}
drawHero=function(px,py,face,kind,atk){g=ctx;drawGokalp(px,py,face,kind,atk,pl?pl.anim:frame);};
drawHUD=function(){g=ctx;postG(lvKey!=='co'&&lvKey!=='kp');g.fillStyle=lg(0,0,0,16,['rgba(14,18,48,0.9)','rgba(5,8,26,0.85)']);g.fillRect(0,0,W,15);g.fillStyle='#d8a83e';g.fillRect(0,15,W,0.7);
 txt(t('hp'),5,3,'#fff');for(let i=0;i<6;i++)heartV(33+i*7,3.6,6.4,i<pl.hp);
 g.save();g.translate(W/2-26,7.6);drawYildizTozu({x:cam-5,y:-5});g.restore();txt(String(totalDust()+levelDust).padStart(4,'0')+' / 1923',W/2-18,3,'#ffd870');
 g.save();g.translate(W-30,13);g.scale(0.55,0.55);gkHead(-6);g.restore();txt('× '+Math.max(0,lives),W-18,3,'#fff');};
drawWorld=function(){g=ctx;const c=cam,top=VH-H;g.save();g.translate(0,top);if(shake>0)g.translate((Math.random()-0.5)*4,(Math.random()-0.5)*3);
 g.imageSmoothingEnabled=true;(bgV[lvKey]||bgV.ay)(c,top);g.imageSmoothingEnabled=false;
 drawWaterV(c,false);drawTilesV(c);drawCapsV(c);drawCrystalsV(c);drawHansV(c);drawGoalV(c);if(lvKey==='gg'&&boss&&boss.dead)drawVanKedisiV(c);drawCanavarV(c);drawMoversV(c);
 for(const s of stars)if(!s.got)drawYildizTozu(s);
 for(const f of foes)if(!f.dead)drawGolge(f,f.x-c);
 if(boss&&!boss.dead&&boss.type!=='canavar'){if(boss.type==='tepegoz')drawTepegozV(boss,boss.x-c);else drawYelbegen3(Object.assign({},boss,{hp:Math.ceil(boss.hp/2)}),boss.x-c);}
 for(const r of rocks)drawKayaG(r);for(const k of comets)drawKuyruklu(k);
 if(pl.onG&&state!=='dying'){ell(pl.x-c+5,pl.y+22.4,5.5,1.3);g.fillStyle='rgba(10,8,20,0.35)';g.fill();}
 if(!(pl.inv>0&&(frame>>2)%2&&state==='play'))drawGokalp(pl.x-c,pl.y,pl.face,(state==='dying'||!pl.onG)?'j':(Math.abs(pl.vx)>0.2?((pl.anim>>3)%2?'a':'b'):'a'),state==='play'?pl.atk:0,pl.anim);
 drawGuvercin(dove);drawWaterV(c,true);drawDark(c);
 g.save();g.globalCompositeOperation='lighter';for(const q of parts){g.globalAlpha=Math.min(1,q.l/15);circ(q.x-c+1,q.y+1,1.2);g.fillStyle=q.c;g.fill();}g.restore();g.globalAlpha=1;
 g.restore();drawHUD();
 if(bossFight&&boss){rrect(W/2-112,18.5,224,12,3);fs('rgba(5,8,26,0.85)','#d8a83e',0.5);txt(t(BOSSN[boss.type]),W/2-108,20,'#ff9a7a',8);const sw=84/boss.max;for(let i=0;i<boss.max;i++){rrect(W/2+22+i*sw,21,sw-2,7,2);fs(i<boss.hp?lg(0,21,0,28,['#ff8a6a','#c0281e']):'rgba(60,30,30,0.8)',null);}}};
drawTitle=function(){g=ctx;const top=VH-H,c=titleCam;g.save();g.translate(0,top);g.imageSmoothingEnabled=true;bgV.tk(c,top);g.imageSmoothingEnabled=false;
 for(let i=0;i<=Math.ceil(W/16)+1;i++){const x=i*16-(c%16);g.drawImage(gTile('tk','top',i&1),x,208,16,16);g.drawImage(gTile('tk','fill',i&1),x,224,16,16);}
 const mx=28;g.drawImage(gTile('tk','top',0),mx,192,16,16);g.drawImage(gTile('tk','top',1),mx+16,192,16,16);drawGokalp(mx+6,170,1,'a',0,0);drawGuvercin({x:mx-12+cam,y:152+Math.sin(frame*0.08)*3});postG(true);g.restore();};
drawCard=function(){g=ctx;g.fillStyle=rg(W/2,VH/2,10,W,['#141c44','#05081a']);g.fillRect(0,0,W,VH);const cy=VH/2;starsV(frame*2,0,0.6);
 if(state==='intro'){txt(t(lvKey),W/2,cy-50,'#f3d58a',16,'center',true);txt(t(GRAVK[lvKey]),W/2,cy-28,'#a8bce0',8,'center');if(cur.boss)txt(t(BOSSW[cur.boss.type]),W/2,cy+58,'#ff9a7a',8,'center');
  g.save();g.translate(W/2-16,cy+6);g.scale(0.8,0.8);gkHead(-6);g.restore();txt('× '+lives,W/2-8,cy-5,'#eef2fb',9);drawYildizTozu({x:cam+W/2-29,y:cy+19});txt(String(totalDust()).padStart(4,'0')+' / 1923',W/2-16,cy+19,'#ffd870',8);
  txt(t('ready'),W/2,cy+44,'#eef2fb',8,'center');}
 else{txt(t('over1'),W/2,cy-40,'#f3d58a',16,'center',true);txt(t('over2'),W/2,cy-14,'#eef2fb',8,'center');if((frame>>5)%2&&stateT>40)txt(t('over3'),W/2,cy+12,'#fff6d0',9,'center');}
 postG(true);};
