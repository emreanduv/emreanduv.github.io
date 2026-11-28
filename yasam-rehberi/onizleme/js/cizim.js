// Yaşam Rehberi — elle çizilmiş SVG çizimler (FM2010 paleti). Dış görsel yok.
// Bant çizimleri (ekran başlıklarının sağında), konu simgeleri (Sor), reyon simgeleri (Çarşı), rahle (hatim).
// Saygı kuralı: Kâbe, mushaf ve mescit hiçbir zaman zarar görmez, karikatürleşmez; Kâbe çizilmez (ışıkla anılır).

const M = "#1f2328", Y = "#1d4d36", Y2 = "#2e7d56", A = "#c9a227", A2 = "#e9c766", K = "#a3261a", KR = "#f6efdc", KH = "#6b3f1f";
const sv = (vb, ic, cls = "ik") => `<svg viewBox="${vb}" class="${cls}" aria-hidden="true">${ic}</svg>`;
const s = (w = 1.6) => `stroke="${M}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// ── Rahle üstünde açık mushaf (hatim kartı, Sureler/Sor bandı) ──
const rahleIc = (nur) => `
  ${nur ? `<defs><radialGradient id="cz-nur" cx="50%" cy="40%" r="55%"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset=".5" stop-color="${A2}" stop-opacity=".35"/><stop offset="1" stop-color="${A2}" stop-opacity="0"/></radialGradient></defs>
  <circle cx="60" cy="40" r="44" fill="url(#cz-nur)"/>${Array.from({ length: 9 }, (_, i) => { const a = (-150 + i * 15) * Math.PI / 180; return `<path d="M${(60 + Math.cos(a) * 30).toFixed(1)} ${(40 + Math.sin(a) * 30).toFixed(1)}L${(60 + Math.cos(a) * 46).toFixed(1)} ${(40 + Math.sin(a) * 46).toFixed(1)}" stroke="${A2}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`; }).join("")}` : ""}
  <path d="M34 100 L78 64 M86 100 L42 64" stroke="${KH}" stroke-width="8" stroke-linecap="round"/>
  <path d="M34 100 L78 64 M86 100 L42 64" stroke="#8a5a32" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  <circle cx="60" cy="82" r="3" fill="${A}" stroke="#7a5a10"/>
  <g transform="translate(60 56) scale(1.32) translate(-60 -52)">
  <path d="M60 62 Q44 52 22 56 L24 44 Q44 40 60 50 Q76 40 96 44 L98 56 Q76 52 60 62Z" fill="${Y}" stroke="#0f2e20" stroke-width="1.2"/>
  <path d="M60 50 Q46 41 26 44 L27 52 Q45 49 60 58Z" fill="${KR}" stroke="${A}" stroke-width=".9"/>
  <path d="M60 50 Q74 41 94 44 L93 52 Q75 49 60 58Z" fill="#fffaf0" stroke="${A}" stroke-width=".9"/>
  <g stroke="${M}" stroke-width=".7" opacity=".45"><path d="M32 47.5q12-2.5 24 2M32 50.5q12-2 24 2"/><path d="M64 49.5q12-4.5 24-2M64 52.5q12-4 24-2"/></g>
  <path d="M60 50v12" stroke="${A}" stroke-width="1.2"/><path d="M58 62l2 9 2-9" fill="${K}"/></g>`;
export const RAHLE = sv("0 0 120 108", rahleIc(false), "cz");

// ── Bant çizimleri ──
export const BANT = {
  sor: sv("0 0 120 108", rahleIc(true), "bant-cizim"),
  // Kapalıçarşı kemeri, asılı fenerler, file
  carsi: sv("0 0 120 108", `
    <path d="M14 104V52Q14 14 60 10Q106 14 106 52V104" fill="none" stroke="${A}" stroke-width="5"/>
    <path d="M24 104V54Q24 24 60 20Q96 24 96 54V104" fill="#14321f" stroke="${A2}" stroke-width="1.2"/>
    <g stroke="${A}" stroke-width="2.4" stroke-dasharray="3 3" fill="none"><path d="M14 52Q14 14 60 10Q106 14 106 52"/></g>
    ${[38, 60, 82].map((x, i) => `<path d="M${x} 22v${10 + (i === 1 ? 6 : 0)}" stroke="${A2}"/><g transform="translate(${x} ${34 + (i === 1 ? 6 : 0)})"><path d="M-6 0h12l-2 12h-8z" fill="${i === 1 ? K : Y2}" stroke="${A}"/><path d="M-3 2h6l-1 8h-4z" fill="#ffd36a"/><circle cy="15" r="1.6" fill="${A}"/></g>`).join("")}
    <circle cx="60" cy="70" r="20" fill="#ffd36a" opacity=".16"/>
    <g transform="translate(46 64)"><path d="M2 8h24l-3 24H5z" fill="${KR}" stroke="${M}" stroke-width="1.4"/><path d="M8 8V4q6-6 12 0v4" fill="none" stroke="${M}" stroke-width="1.4"/><path d="M6 14h16" stroke="${A}" stroke-width="2"/></g>`, "bant-cizim"),
  // Terazi ve aile ağacı (miras)
  miras: sv("0 0 120 108", `
    <path d="M60 14v78M40 98h40M48 92h24" stroke="${A}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="12" r="5" fill="${A2}" stroke="#7a5a10"/>
    <path d="M22 30h76" stroke="${A}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M22 30 10 62M22 30l12 32M98 30 86 62M98 30l12 32" stroke="${A2}" stroke-width="1.2"/>
    <path d="M6 62h32q-2 10-16 10T6 62z" fill="${Y}" stroke="${A}" stroke-width="1.4"/>
    <path d="M82 62h32q-2 10-16 10t-16-10z" fill="${Y}" stroke="${A}" stroke-width="1.4"/>
    <g fill="${KR}" stroke="${A}" stroke-width=".8"><circle cx="15" cy="57" r="4"/><circle cx="25" cy="58" r="3.4"/><circle cx="20" cy="51" r="3"/></g>
    <g fill="${KR}" stroke="${A}" stroke-width=".8"><circle cx="93" cy="57" r="4"/><circle cx="103" cy="57" r="4"/></g>`, "bant-cizim"),
};

// ── Konu simgeleri (Sor › Konular) ──
export const KONU = {
  "Oruç": sv("0 0 40 40", `<path d="M22 6a12 12 0 1 0 10 18 9.5 9.5 0 1 1-10-18z" fill="${A2}" stroke="#7a5a10"/><path d="M6 30h22a8 3.5 0 0 1-22 0z" fill="${KR}" ${s(1.3)}/><g fill="${KH}"><ellipse cx="13" cy="29" rx="2.4" ry="1.3"/><ellipse cx="18" cy="28.4" rx="2.4" ry="1.3"/><ellipse cx="23" cy="29" rx="2.4" ry="1.3"/></g>`),
  "Miras": sv("0 0 40 40", `<path d="M20 6v26M12 34h16" ${s()}/><path d="M8 12h24" ${s()}/><path d="M8 12 4 22h8zM32 12l-4 10h8z" fill="${A2}" ${s(1.2)}/><circle cx="20" cy="6" r="2" fill="${A}"/>`),
  "Faiz": sv("0 0 40 40", `<ellipse cx="16" cy="28" rx="10" ry="4" fill="${A2}" ${s(1.2)}/><path d="M6 28v-4c0 2 4.5 4 10 4s10-2 10-4v4" fill="${A}" ${s(1.2)}/><ellipse cx="16" cy="22" rx="10" ry="4" fill="${A2}" ${s(1.2)}/><circle cx="29" cy="11" r="6" fill="${KR}" stroke="${K}" stroke-width="1.6"/><path d="M26 14l6-6M26.5 9.5h.1M31.5 12.5h.1" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/>`),
  "Namaz": sv("0 0 40 40", `<path d="M10 4h20v32H10z" fill="#8a1f22" ${s(1.2)}/><path d="M14 32V16q0-7 6-9 6 2 6 9v16z" fill="${Y}" stroke="${A}" stroke-width="1.1"/><path d="M20 10l1.4 2.4-1.4 2.4-1.4-2.4z" fill="${A2}"/>`),
  "Boşanma": sv("0 0 40 40", `<circle cx="14" cy="21" r="7.5" fill="none" stroke="${A}" stroke-width="2.6"/><circle cx="27" cy="21" r="7.5" fill="none" stroke="${A}" stroke-width="2.6" stroke-dasharray="30 6" transform="rotate(200 27 21)"/><path d="M20 6v4M20 32v4" ${s(1.3)} opacity=".5"/>`),
  "Zekât": sv("0 0 40 40", `<path d="M6 28q6-6 12-4h8q3 0 3 3t-3 3h-8" fill="none" ${s(1.4)}/><path d="M6 34l3-3q4-3 9-3h12l6-6" fill="none" ${s(1.4)}/><circle cx="24" cy="12" r="6" fill="${A2}" ${s(1.2)}/><path d="M24 9v6" stroke="#7a5a10" stroke-width="1.4"/>`),
  "Hac": sv("0 0 40 40", `<path d="M2 32 15 14l6 8 5-6 12 16z" fill="#b89668" ${s(1.2)}/><path d="M15 14l3 4-3 1-3-1z" fill="${KR}"/><circle cx="31" cy="9" r="4" fill="${A2}"/><path d="M2 34h36" ${s(1.2)}/>`),
  "Evlilik": sv("0 0 40 40", `<circle cx="15" cy="23" r="8" fill="none" stroke="${A}" stroke-width="2.8"/><circle cx="25" cy="23" r="8" fill="none" stroke="${A2}" stroke-width="2.8"/><path d="M25 8l2 3-2 2-2-2z" fill="#9fd9ff" stroke="${M}" stroke-width=".8"/>`),
  "Adalet": sv("0 0 40 40", `<path d="M20 5v28M11 35h18M7 11h26" ${s()}/><path d="M7 11 4 20h6zM33 11l-3 9h6z" fill="none" ${s(1.2)}/><path d="M4 20q3 3 6 0M30 20q3 3 6 0" ${s(1.2)}/><circle cx="20" cy="5" r="2" fill="${A}"/>`),
};

// ── Reyon simgeleri (Çarşı) ──
export const REYON = {
  gida: sv("0 0 40 40", `<path d="M7 18h26v10a6 6 0 0 1-6 6H13a6 6 0 0 1-6-6z" fill="#8a8f98" ${s(1.3)}/><path d="M5 18h30" ${s(1.6)}/><path d="M16 14h8" ${s(2.2)}/><path d="M14 10q2-3 0-5M20 10q2-3 0-5M26 10q2-3 0-5" stroke="#9aa3ad" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M4 22H7M33 22h3" ${s(2)}/>`),
  icecek: sv("0 0 40 40", `<path d="M14 8h12q-1 7-3.5 10 3.5 4 3.5 12H14q0-8 3.5-12Q15 15 14 8z" fill="#b8341f" fill-opacity=".85" ${s(1.2)}/><path d="M14 8h12" ${s(1.4)}/><ellipse cx="20" cy="33" rx="10" ry="2.6" fill="${A2}" ${s(1.2)}/><path d="M17 4q1-2 0-3M23 4q1-2 0-3" stroke="#9aa3ad" stroke-width="1" fill="none"/>`),
  lokanta: sv("0 0 40 40", `<path d="M4 22h32l-3 8H7z" fill="#c8c1ae" ${s(1.2)}/><g fill="${A2}" ${s(.9)}><path d="M8 22l4-5 4 5zM14 22l4-5 4 5zM20 22l4-5 4 5zM26 22l4-5 4 5z"/></g><g fill="#5a8a3a"><circle cx="12" cy="19.6" r=".8"/><circle cx="18" cy="19.6" r=".8"/><circle cx="24" cy="19.6" r=".8"/><circle cx="30" cy="19.6" r=".8"/></g>`),
  giyim: sv("0 0 40 40", `<path d="M14 6l-8 5 3 7 4-2v18h14V16l4 2 3-7-8-5q-2 4-6 4t-6-4z" fill="${Y2}" ${s(1.3)}/><path d="M20 10v24" stroke="#0f2e20" stroke-width=".9"/><circle cx="20" cy="17" r=".9" fill="${KR}"/><circle cx="20" cy="23" r=".9" fill="${KR}"/>`),
  ev: sv("0 0 40 40", `<rect x="8" y="5" width="24" height="31" rx="2" fill="#f2f2f5" ${s(1.3)}/><path d="M8 11h24" ${s(1)}/><circle cx="20" cy="23" r="8" fill="#9fc6e8" ${s(1.3)}/><path d="M14 24q3 3 6 0t6 0" stroke="#fff" stroke-width="1.2" fill="none"/><circle cx="12" cy="8" r=".9" fill="${M}"/><circle cx="15" cy="8" r=".9" fill="${M}"/>`),
  bakim: sv("0 0 40 40", `<path d="M14 14h12v18a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" fill="#9fd9b8" ${s(1.3)}/><path d="M17 8h6v6h-6z" fill="${A2}" ${s(1.2)}/><path d="M23 9h5" ${s(1.4)}/><circle cx="31" cy="9" r="1.2" fill="#9fc6e8"/><circle cx="33" cy="13" r=".9" fill="#9fc6e8"/><path d="M17 20h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
  saat: sv("0 0 40 40", `<path d="M15 3h10l1 7H14zM15 37h10l1-7H14z" fill="#5a3a22" ${s(1.1)}/><circle cx="20" cy="20" r="10" fill="${KR}" stroke="${A}" stroke-width="2.4"/><path d="M20 20V14M20 20l4 3" ${s(1.5)}/><circle cx="20" cy="20" r="1.2" fill="${M}"/>`),
  teknoloji: sv("0 0 40 40", `<rect x="11" y="4" width="18" height="32" rx="3.5" fill="${M}" ${s(1.2)}/><rect x="13" y="8" width="14" height="22" rx="1" fill="#3e7cc6"/><path d="M15 25l4-6 3 4 2-2 3 4z" fill="${A2}"/><circle cx="20" cy="33" r="1.2" fill="#5a5f66"/>`),
  hobi: sv("0 0 40 40", `<path d="M8 32 27 6l5 4-19 26-6 2z" fill="${A2}" ${s(1.3)}/><path d="M27 6l5 4" stroke="${K}" stroke-width="3"/><path d="M8 32l5 4" ${s(1.2)}/><path d="M7 36l-1 1" ${s(2)}/>`),
  market: sv("0 0 40 40", `<path d="M3 8h5l4 18h18l4-13H10" fill="none" ${s(1.6)}/><path d="M11 13h23l-4 13H13z" fill="${Y2}" fill-opacity=".25"/><circle cx="14" cy="32" r="2.6" fill="${KR}" ${s(1.3)}/><circle cx="28" cy="32" r="2.6" fill="${KR}" ${s(1.3)}/>`),
  yol: sv("0 0 40 40", `<path d="M6 24l3-8q1-3 4-3h14q3 0 4 3l3 8v7H6z" fill="${K}" ${s(1.3)}/><path d="M11 16h18l2 6H9z" fill="#9fc6e8" ${s(1)}/><circle cx="12" cy="31" r="3.4" fill="${M}"/><circle cx="28" cy="31" r="3.4" fill="${M}"/><circle cx="9" cy="26" r="1.3" fill="${A2}"/><circle cx="31" cy="26" r="1.3" fill="${A2}"/>`),
  dijital: sv("0 0 40 40", `<rect x="4" y="12" width="32" height="18" rx="9" fill="#5a5f6a" ${s(1.3)}/><path d="M11 18v6M8 21h6" stroke="${KR}" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="19" r="1.8" fill="${A2}"/><circle cx="31" cy="23" r="1.8" fill="${K}"/>`),
  yolculuk: sv("0 0 40 40", `<path d="M4 22l32-12-2 5-20 10 2 8-3 1-4-7-6 1z" fill="#f2f2f5" ${s(1.2)}/><path d="M20 18l-4-8 3-1 7 7" fill="#c8c1ae" ${s(1)}/><path d="M6 34h28" stroke="#3e7cc6" stroke-width="1.6" stroke-dasharray="3 3"/>`),
};
