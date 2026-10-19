// Icônes des fruits et légumes pour le widget de saison (05 décision 9) : dessins plats 64×64 avec reflets blancs.
// Une icône par fruit ou légume du catalogue ; un ingrédient ajouté ensuite reçoit une pastille avec son initiale.
const H = (d) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
const fanes = (x,y,c='#4E9A3A') => `<path d="M${x} ${y}c-3-5-8-8-12-8 1 5 6 8 12 8zM${x} ${y}c0-6 2-11 6-14 1 5-1 10-6 14zM${x} ${y}c3-4 8-6 12-5-2 4-7 6-12 5z" fill="${c}"/>`;
const bulbe = (c1,c2,peau) => `<path d="M32 14c-2 6-4 8-10 12-6 4-9 9-9 15 0 8 8 13 19 13s19-5 19-13c0-6-3-11-9-15-6-4-8-6-10-12z" fill="${c1}"/>
<path d="M42 26c6 4 9 9 9 15 0 8-8 13-19 13 9-2 14-7 14-14 0-5-2-10-4-14z" fill="${c2}"/>
<path d="M32 14V7" stroke="${peau}" stroke-width="2.5" stroke-linecap="round"/><path d="M28 54l4 4 4-4" stroke="${peau}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
${H('M19 38c0 4 2 8 5 10')}${H('M27 22c-1 1-2 2-3 3')}`;
const chou = (c1,c2,c3) => `<circle cx="32" cy="34" r="20" fill="${c1}"/><path d="M32 14c11 0 20 9 20 20s-9 20-20 20c8-4 13-12 13-20s-5-16-13-20z" fill="${c2}"/>
<path d="M32 16c-6 6-8 12-8 18s2 14 8 18M32 16c6 6 8 12 8 18s-2 14-8 18M14 30c6 2 12 2 18 0M50 30c-6 2-12 2-18 0" stroke="${c3}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
${H('M18 26c2-4 5-7 9-8')}`;
const agrume = (c1,c2,feuille=true) => `<circle cx="32" cy="35" r="19" fill="${c1}"/><path d="M45 21c4 4 6 9 6 14 0 10-9 19-19 19 9-3 15-10 15-19 0-5-1-10-2-14z" fill="${c2}"/>
${[[24,30],[30,26],[38,30],[26,40],[34,42],[40,38]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9" fill="${c2}"/>`).join('')}
${feuille?`<path d="M32 16c3-6 9-8 13-6-2 5-8 8-13 6z" fill="#4E9A3A"/>`:''}<circle cx="32" cy="16.5" r="1.6" fill="#6B8A2B"/>${H('M19 32c0-4 2-8 5-10')}`;
const courge = (c1,c2,c3,tige='#6B5A2B') => `<path d="M32 18c-14-4-24 4-24 18 0 10 10 16 24 16s24-6 24-16c0-14-10-22-24-18z" fill="${c1}"/>
<path d="M32 18c-6 0-9 8-9 17s3 17 9 17 9-8 9-17-3-17-9-17z" fill="${c2}"/>
<path d="M44 18c8 2 12 9 12 18 0 10-10 16-24 16 10-2 16-8 16-17 0-7-1-13-4-17z" fill="${c3}" opacity=".5"/>
<path d="M32 19c0-5 1-8 4-10" stroke="${tige}" stroke-width="3.5" stroke-linecap="round" fill="none"/>${H('M14 32c0-4 2-8 5-10')}${H('M31 26v14')}`;
const fruitRond = (c1,c2,extra='') => `<circle cx="32" cy="36" r="18" fill="${c1}"/><path d="M44 23c4 3 6 8 6 13 0 10-8 18-18 18 8-3 13-10 13-18 0-5-1-9-1-13z" fill="${c2}"/>${extra}${H('M20 32c0-4 2-7 5-9')}`;

export const ICONES_SAISON = {
'Châtaigne': `<path d="M32 10c-4 6-18 12-20 26 0 10 9 16 20 16s20-6 20-16C50 22 36 16 32 10z" fill="#8B4A2B"/>
<path d="M32 10c-2 6-10 12-12 24 4-8 10-14 12-24z" fill="#A65E3A"/>
<path d="M12.5 40c4 6 12 9 19.5 9s15.5-3 19.5-9c-.4 7-9 12-19.5 12S12.9 47 12.5 40z" fill="#E8B04E"/>
${H('M16 39c6 5 26 5 32 0')}${H('M24 22c-3 3-5 6-6 9')}`,
'Coing': `<path d="M32 13c-5 0-9 3-10 8-6 3-10 10-10 18 0 9 9 15 20 15s20-6 20-15c0-8-4-15-10-18-1-5-5-8-10-8z" fill="#F2D43C"/>
<path d="M44 21c6 3 8 10 8 18 0 9-9 15-20 15 8-2 15-8 15-17 0-6-1-12-3-16z" fill="#DDB928"/>
<path d="M32 13V6" stroke="#6B4A2B" stroke-width="2.5" stroke-linecap="round"/>
<path d="M33 9c4-5 10-5 13-3-2 5-8 7-13 3z" fill="#4E9A3A"/>${H('M20 30c-2 4-2 8 0 12')}${H('M24 22c-1 1-2 3-2 4')}`,
'Figue': `<path d="M32 12c-3 6-6 8-11 13-6 6-9 11-9 17 0 8 9 12 20 12s20-4 20-12c0-6-3-11-9-17-5-5-8-7-11-13z" fill="#5B3A7A"/>
<path d="M41 25c6 6 11 11 11 17 0 8-9 12-20 12 9-2 14-6 14-13 0-5-2-11-5-16z" fill="#46295F"/>
<path d="M29 12h6l-1-5h-4z" fill="#6E8B3D"/>${H('M20 36c0 4 1 7 3 9')}${H('M27 18c-1 2-2 3-3 4')}`,
'Poire': `<path d="M32 12c-6 0-8 6-8 11 0 4-12 10-12 20 0 7 8 11 20 11s20-4 20-11c0-10-12-16-12-20 0-5-2-11-8-11z" fill="#B5CC4A"/>
<path d="M18 42c0 6 6 10 14 10 6 0 11-2 13-6-3 1-7 2-11 1-8-1-13-3-16-5z" fill="#E09A5A" opacity=".55"/>
<path d="M32 13l2-7" stroke="#6B4A2B" stroke-width="2.5" stroke-linecap="round"/>${H('M19 38c0 3 1 5 2 7')}${H('M28 18c-1 2-1 4-1 5')}`,
'Raisin': `<path d="M32 13V5" stroke="#6B4A2B" stroke-width="2.5" stroke-linecap="round"/>
<path d="M33 9c5-3 10-1 12 2-4 3-9 3-12-2z" fill="#4E9A3A"/>
${[[24,18],[34,17],[44,20],[19,28],[29,27],[39,28],[24,37],[34,37],[44,32],[29,46],[38,45]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6.5" fill="#A9C94F"/><circle cx="${x+1.5}" cy="${y+1.5}" r="5" fill="#93B53E" opacity=".6"/>${H(`M${x-3} ${y-2}c1-2 2-3 4-3`)}`).join('')}`,
'Betterave': `<path d="M30 22c-4-6-10-10-14-9 0 5 4 10 12 12zM34 22c2-8 7-13 12-13 1 5-3 11-10 14z" fill="#4E9A3A"/>
<path d="M28 25l2-10M34 24l4-11" stroke="#C2306A" stroke-width="2.2" stroke-linecap="round"/>
<path d="M32 22c-10 0-16 7-16 15 0 8 7 13 13 14l3 7 3-7c6-1 13-6 13-14 0-8-6-15-16-15z" fill="#6B1E4A"/>
<path d="M42 27c3 3 4 6 4 10 0 7-6 12-12 14 4-4 8-9 8-15 0-3 0-6 0-9z" fill="#55163A"/>${H('M21 33c-1 3 0 6 2 8')}${H('M26 27c-1 1-2 2-2 3')}`,
'Blette': `<path d="M30 10c-12 2-18 12-17 24 1 9 8 14 16 14 1-12 2-26 1-38z" fill="#3E8A3A"/>
<path d="M30 10c12 1 20 11 19 23-1 9-8 15-17 15-1-12-1-26-2-38z" fill="#4FA545"/>
<path d="M30 58c-1-14-1-30 0-46" stroke="#F1EFE2" stroke-width="5" stroke-linecap="round" fill="none"/>
${H('M20 22c-3 5-4 10-3 15')}${H('M41 18c3 3 5 7 5 11')}${H('M24 30c2 2 4 3 6 4')}${H('M38 28c-2 2-4 3-6 4')}`,
'Brocoli': `<path d="M27 54l2-16h6l2 16z" fill="#7DBA4C"/><path d="M30 40l-6-4M34 40l6-4" stroke="#7DBA4C" stroke-width="3" stroke-linecap="round"/>
<circle cx="21" cy="30" r="9" fill="#2F8A3A"/><circle cx="43" cy="30" r="9" fill="#2F8A3A"/><circle cx="32" cy="22" r="11" fill="#3C9E45"/>
<circle cx="26" cy="33" r="7" fill="#3C9E45"/><circle cx="38" cy="33" r="7" fill="#348F3F"/>
${H('M24 16c2-3 5-4 8-4')}${H('M14 28c0-2 1-4 3-5')}${H('M29 50l1-8')}`,
'Poireau': `<path d="M26 56c-1-12-1-22 1-30h10c2 8 2 18 1 30z" fill="#F1EFE2"/>
<path d="M27 26h10l1 10H26z" fill="#BFD87A"/>
<path d="M27 27C22 18 16 12 12 8c8 2 14 8 17 15zM37 27c2-10 7-17 13-21-2 8-6 15-11 22zM31 27c-1-9 0-16 3-22 2 7 1 15-1 22z" fill="#3E8A3A"/>
<path d="M27 56h10" stroke="#E2D9B8" stroke-width="2" stroke-linecap="round"/>${H('M30 52c-1-6-1-12 0-18')}${H('M18 13c3 2 6 5 8 9')}`,
'Chou-fleur': `<path d="M12 36c2-10 10-14 20-14s18 4 20 14c-4 10-12 16-20 16s-16-6-20-16z" fill="#5E9B44"/>
${[[22,30],[32,26],[42,30],[27,36],[37,36],[32,43]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#F5EFD8"/><circle cx="${x+1}" cy="${y+1.5}" r="5" fill="#E6DDB8" opacity=".7"/>`).join('')}
<path d="M12 36c4 4 8 10 14 14-8 0-14-6-14-14zM52 36c-4 4-8 10-14 14 8 0 14-6 14-14z" fill="#7DBA5C"/>${H('M28 22c2-1 5-1 7 0')}${H('M15 39c2 3 4 6 7 8')}`,
'Butternut': `<path d="M32 9c-5 0-6 5-6 12 0 6-1 9-5 14-3 4-4 7-4 10 0 7 7 11 15 11s15-4 15-11c0-3-1-6-4-10-4-5-5-8-5-14 0-7-1-12-6-12z" fill="#EFA640"/>
<path d="M38 22c0 6 2 9 6 13 3 4 3 7 3 10 0 7-7 11-15 11 8-3 11-7 11-12 0-4-2-8-4-12-1-3-1-6-1-10z" fill="#D88A28"/>
<path d="M30 9V5h4v4z" fill="#7A5A2B"/>${H('M24 40c-1 3-1 6 1 8')}${H('M30 14v8')}${H('M34 38v12')}`,
'Cèpe': `<path d="M26 34c-2 6-3 12-1 18 4 3 10 3 14 0 2-6 1-12-1-18z" fill="#EFE4C8"/>
<path d="M36 34c2 6 3 12 1 18 2-1 2-2 2-2 2-6 1-12-1-16z" fill="#D8C8A0"/>
<path d="M10 33c0-12 10-21 22-21s22 9 22 21c0 2-2 3-5 3H15c-3 0-5-1-5-3z" fill="#8A5A2E"/>
<path d="M40 14c8 3 14 10 14 19 0 2-2 3-5 3h-6c4-6 3-15-3-22z" fill="#734820"/>${H('M17 26c2-5 6-8 11-9')}${H('M28 42v7')}`,
'Carotte': `${fanes(36,18)}<path d="M33 16c6-1 11 4 10 10-2 10-14 24-22 30-3 2-5 0-4-3 3-9 8-26 11-32 1-3 3-5 5-5z" fill="#F08A2C"/>
<path d="M43 26c-2 10-14 24-22 30 6-8 14-20 18-32 2 0 4 1 4 2z" fill="#D9701A"/>${H('M30 26l4 2')}${H('M27 34l4 2')}${H('M24 42l3 2')}`,
'Oignon': bulbe('#D99A4E','#C07F35','#8A5A2B'),
'Oignon rouge': bulbe('#9A3E6A','#7E2D55','#5A2040'),
'Ail': `<path d="M32 12c-2 6-6 8-12 12-6 4-8 9-8 15 0 9 9 15 20 15s20-6 20-15c0-6-2-11-8-15-6-4-10-6-12-12z" fill="#F3EEE2"/>
<path d="M32 22c-4 6-5 14-4 30M32 22c4 6 5 14 4 30M24 28c-5 6-6 14-2 22M40 28c5 6 6 14 2 22" stroke="#DCD3BE" stroke-width="1.6" fill="none"/>
<path d="M32 12V6" stroke="#CFC3A6" stroke-width="3" stroke-linecap="round"/>${H('M17 36c0 4 2 8 5 10')}`,
'Échalote': `<path d="M24 16c-2 6-10 10-10 22 0 9 5 15 11 15s9-6 9-15c0-12-8-16-10-22z" fill="#C98A6A"/>
<path d="M40 20c-2 6-9 9-9 19 0 8 4 14 10 14s10-6 10-14c0-10-9-13-11-19z" fill="#B5735A"/>
<path d="M24 16V9M40 20v-7" stroke="#8A5A3B" stroke-width="2.2" stroke-linecap="round"/>${H('M18 34c0 4 1 8 3 10')}${H('M36 36c0 3 1 6 2 8')}`,
'Pomme de terre': `<path d="M12 34c0-10 8-18 20-18 12 0 20 6 20 16 0 12-8 20-20 20S12 44 12 34z" fill="#D9B06A"/>
<path d="M44 20c6 3 8 7 8 12 0 12-8 20-20 20 10-4 15-12 15-20 0-5-1-9-3-12z" fill="#C49650"/>
<circle cx="24" cy="30" r="1.4" fill="#A67C3A"/><circle cx="34" cy="38" r="1.4" fill="#A67C3A"/><circle cx="40" cy="28" r="1.2" fill="#A67C3A"/><circle cx="26" cy="43" r="1.2" fill="#A67C3A"/>${H('M17 30c1-4 4-7 8-9')}`,
'Champignon de Paris': `<path d="M26 34c-1 6-1 12 0 18 4 2 8 2 12 0 1-6 1-12 0-18z" fill="#EEE8DA"/>
<path d="M10 34c0-12 10-21 22-21s22 9 22 21c0 2-2 3-4 3H14c-2 0-4-1-4-3z" fill="#F2EDE2"/>
<path d="M42 15c7 4 12 11 12 19 0 2-2 3-4 3h-6c3-7 2-15-2-22z" fill="#DCD4C2"/><path d="M14 37h36" stroke="#CFC5AE" stroke-width="2" stroke-linecap="round"/>${H('M17 27c2-5 6-8 11-9')}`,
'Artichaut': `<path d="M32 50v8" stroke="#6E8B3D" stroke-width="4" stroke-linecap="round"/>
<path d="M32 12c-12 4-18 14-18 24 0 8 8 14 18 14s18-6 18-14c0-10-6-20-18-24z" fill="#6E9A4A"/>
<path d="M32 22c-8 3-12 9-12 16 4 4 8 6 12 6s8-2 12-6c0-7-4-13-12-16z" fill="#86AE5E"/>
<path d="M32 30c-4 2-6 5-6 9 2 2 4 3 6 3s4-1 6-3c0-4-2-7-6-9z" fill="#A3C47A"/>
<path d="M32 12c-2 4-2 8 0 10M32 12c2 4 2 8 0 10" stroke="#8E5A8A" stroke-width="1.5" fill="none"/>${H('M18 34c0-4 2-8 6-11')}`,
'Asperge': `${[[24,'#7FAE4A'],[32,'#6E9F3E'],[40,'#7FAE4A']].map(([x,c],i)=>`<path d="M${x-3} 56V${20-i%2*4}c0-4 1-6 3-8 2 2 3 4 3 8v36z" fill="${c}"/><path d="M${x-3} ${24-i%2*4}l3 3 3-3M${x-3} ${34-i%2*4}l3 3 3-3" stroke="#4E7A2A" stroke-width="1.3" fill="none"/>`).join('')}
<path d="M18 46h28v6H18z" fill="#C79A5A"/>${H('M22 30v12')}`,
'Aubergine': `<path d="M24 22c-8 4-12 14-10 24 2 8 10 10 16 6 6-4 10-10 14-14 4-4 4-10 0-14-6-6-14-6-20-2z" fill="#4A2A5E"/>
<path d="M44 24c4 4 4 10 0 14-4 4-8 10-14 14-4 2-8 2-11 0 6-1 11-6 15-12 4-5 9-10 10-16z" fill="#3A1F4A"/>
<path d="M38 18c4-2 8 0 10 4-3 2-7 4-10 3-1 3-4 4-6 3 0-4 2-8 6-10z" fill="#5E8A3A"/><path d="M44 18l4-6" stroke="#5E8A3A" stroke-width="3" stroke-linecap="round"/>${H('M19 34c-2 4-2 8-1 11')}`,
'Céleri branche': `<path d="M24 56c-2-12-2-24 0-34M32 56c0-12 0-24 1-36M40 56c2-12 2-24 0-34" stroke="#A9CC6A" stroke-width="7" stroke-linecap="round" fill="none"/>
<path d="M24 22c-6-2-10-8-8-12 4 0 8 4 8 8 0-6 4-10 8-10 4 0 6 4 4 8 4-4 8-4 10 0 0 4-4 8-8 8" fill="#4FA545"/>${H('M23 50c-1-8-1-16 0-24')}${H('M31 50V30')}`,
'Céleri-rave': `<path d="M28 20l-4-12M32 20V6M36 20l4-12" stroke="#4FA545" stroke-width="3" stroke-linecap="round"/>
<path d="M14 36c0-10 8-16 18-16s18 6 18 16-8 16-18 16-18-6-18-16z" fill="#E8E0C4"/>
<path d="M42 23c5 3 8 8 8 13 0 10-8 16-18 16 9-3 13-9 13-16 0-5-1-9-3-13z" fill="#D2C7A4"/>
<path d="M22 50l-2 6M32 52v6M42 50l2 6" stroke="#B8AA80" stroke-width="1.5" stroke-linecap="round"/>${H('M19 34c0-4 3-8 7-10')}${H('M28 40c3 1 6 1 9 0')}`,
'Chou blanc': chou('#DCE8B8','#C5D69A','#B0C47E'),
'Chou vert': chou('#7DBA5C','#5E9B44','#4E8A3A'),
'Chou rouge': chou('#8E3E7A','#722E62','#B76AA0'),
'Chou de Bruxelles': `${[[22,22],[42,24],[32,42]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="11" fill="#7DBA5C"/><path d="M${x} ${y-11}c-5 4-6 8-6 11s1 8 6 11M${x} ${y-11}c5 4 6 8 6 11s-1 8-6 11" stroke="#4E8A3A" stroke-width="1.5" fill="none"/>${H(`M${x-7} ${y-3}c1-3 3-5 5-6`)}`).join('')}`,
'Chou kale': `<path d="M32 58V30" stroke="#5E8A3A" stroke-width="4" stroke-linecap="round"/>
<path d="M32 10c-6 2-8 6-12 6-4 2-6 6-4 10-4 2-4 8 0 10-2 4 2 8 6 8 2 3 6 4 10 2 4 2 8 1 10-2 4 0 8-4 6-8 4-2 4-8 0-10 2-4 0-8-4-10-4 0-6-4-12-6z" fill="#2E6E3A"/>
<path d="M32 14c4 2 6 6 10 6 3 2 4 5 3 8 3 2 3 6 0 8 1 3-2 6-5 6-2 2-5 3-8 2" fill="#3E8A4A"/>${H('M32 18v24M24 26l8 6M40 26l-8 6M24 36l8 4M40 36l-8 4')}`,
'Concombre': `<path d="M14 46c-4-4-2-10 4-16 8-8 16-14 24-16 6-2 10 2 8 8-2 8-8 16-16 24-6 6-14 6-20 0z" fill="#3E8A3A"/>
<path d="M48 18c2 2 2 4 2 6-2 8-8 16-16 24-6 6-14 6-20 0 6 2 12 0 18-6 8-8 14-16 16-24z" fill="#2E6E2E"/>
${[[22,36],[30,30],[38,24],[28,40],[36,34]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1" fill="#A9CC6A"/>`).join('')}${H('M18 36c4-4 8-8 12-10')}`,
'Courgette': `<path d="M12 44c-3-4 0-10 6-15 8-7 18-13 26-15 4-1 7 1 6 5-2 8-10 17-18 23-8 6-16 7-20 2z" fill="#4E8A2E"/>
<path d="M44 14l6-6" stroke="#6E8B3D" stroke-width="4" stroke-linecap="round"/>
<path d="M16 42c8-4 18-12 28-22M18 46c8-4 16-10 24-18" stroke="#7DBA4C" stroke-width="1.5" fill="none" stroke-linecap="round"/>${H('M17 37c3-3 6-6 9-8')}`,
'Potimarron': `<path d="M32 16c-12 0-20 10-20 21 0 10 9 16 20 16s20-6 20-16c0-11-8-21-20-21z" fill="#E8722A"/>
<path d="M44 19c5 4 8 11 8 18 0 10-9 16-20 16 9-3 15-9 15-17 0-7-1-13-3-17z" fill="#C95A1A"/>
<path d="M24 22c-3 6-3 20 0 28M40 22c3 6 3 20 0 28M32 18v34" stroke="#C95A1A" stroke-width="1.5" fill="none"/>
<path d="M32 17c0-4 2-8 5-10" stroke="#6B5A2B" stroke-width="3.5" stroke-linecap="round" fill="none"/>${H('M17 32c0-4 2-8 5-10')}`,
'Potiron': courge('#F09A3A','#F5AE52','#D97F20'),
'Courge musquée': courge('#C9A24A','#D6B25E','#A8842E','#5A4A2B'),
'Endive': `<path d="M32 8c-8 8-12 20-10 34 1 8 5 14 10 14s9-6 10-14c2-14-2-26-10-34z" fill="#F4F0D8"/>
<path d="M32 8c-4 6-6 14-6 22 0 4 1 8 2 10M32 8c4 6 6 14 6 22 0 4-1 8-2 10" stroke="#DCD6B4" stroke-width="1.5" fill="none"/>
<path d="M32 8c-4 4-6 8-7 13 3-2 5-2 7-1 2-1 4-1 7 1-1-5-3-9-7-13z" fill="#D8E07A"/>${H('M26 30c-1 6 0 12 2 16')}`,
'Épinard': `<path d="M20 56c4-8 8-14 12-18M44 56c-4-8-8-14-12-18" stroke="#5E9B3A" stroke-width="3" stroke-linecap="round"/>
<path d="M30 38c-12 2-20-6-18-18 2-8 10-10 16-6 6 4 6 14 2 24z" fill="#2E7A3A"/>
<path d="M34 38c12 2 20-6 18-18-2-8-10-10-16-6-6 4-6 14-2 24z" fill="#3E8A4A"/>${H('M30 36c-6-4-10-10-12-16')}${H('M34 36c6-4 10-10 12-16')}`,
'Fenouil': `<path d="M28 22l-6-12M32 22V8M36 22l6-12" stroke="#A9CC6A" stroke-width="3.5" stroke-linecap="round"/>
<path d="M20 12c-2-2-4-2-6 0M32 8c-2-2 0-4 2-4M44 10c2-2 4-2 6 0" stroke="#4FA545" stroke-width="2" stroke-linecap="round" fill="none"/>
<path d="M26 20h12c8 4 12 12 12 20 0 8-8 14-18 14s-18-6-18-14c0-8 4-16 12-20z" fill="#EAF0D0"/>
<path d="M32 20c-4 6-6 14-4 34M32 20c4 6 6 14 4 34" stroke="#C9D6A0" stroke-width="1.6" fill="none"/>${H('M18 38c0 4 2 8 5 10')}`,
'Fève': `<path d="M14 44c-4-6 0-14 8-20 8-6 18-12 26-12 4 0 6 4 4 8-4 10-14 20-24 26-6 3-12 2-14-2z" fill="#6EAA3E"/>
<path d="M50 16c2 2 2 4 2 4-4 10-14 20-24 26-6 3-12 2-14-2 6 2 12 0 18-4 8-6 14-14 18-24z" fill="#5A8F30"/>
${[[22,36],[31,29],[40,22]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.5" fill="#B5DA7A" transform="rotate(-35 ${x} ${y})"/>`).join('')}${H('M16 40c2-3 4-5 6-7')}`,
'Haricot vert': `${[[0,'#4E9A3A'],[8,'#5EAA45'],[16,'#4E9A3A']].map(([d,c])=>`<path d="M${16+d} 54c-2-14 2-30 10-42" stroke="${c}" stroke-width="5" stroke-linecap="round" fill="none"/>`).join('')}${H('M17 48c0-10 2-20 7-30')}`,
'Mâche': `${[0,60,120,180,240,300].map((r,i)=>`<ellipse cx="32" cy="20" rx="7.5" ry="11" fill="${i%2?'#3E8A3A':'#4FA545'}" transform="rotate(${r} 32 34)"/>`).join('')}
${[30,150,270].map(r=>`<ellipse cx="32" cy="25" rx="5" ry="7" fill="#6EBE55" transform="rotate(${r} 32 34)"/>`).join('')}
<circle cx="32" cy="34" r="3.5" fill="#2E6E2E"/>${H('M29 14c1-2 3-3 5-3')}`,
'Maïs': `<path d="M32 8c-7 0-10 10-10 22 0 12 4 22 10 22s10-10 10-22c0-12-3-22-10-22z" fill="#F5C93A"/>
${[0,1,2,3,4,5].map(r=>`<path d="M23 ${16+r*6}h18" stroke="#DDAA1E" stroke-width="1.2"/>`).join('')}<path d="M27 10v40M32 8v44M37 10v40" stroke="#DDAA1E" stroke-width="1.2"/>
<path d="M32 58c-10-4-14-14-14-30 4 8 8 14 14 20 6-6 10-12 14-20 0 16-4 26-14 30z" fill="#7DBA4C"/>${H('M25 18v10')}`,
'Navet': `${fanes(32,22)}<path d="M32 22c-10 0-17 6-17 15 0 8 7 13 14 15l3 6 3-6c7-2 14-7 14-15 0-9-7-15-17-15z" fill="#F4F0F0"/>
<path d="M15.5 33c1-6 8-11 16.5-11s15.5 5 16.5 11c-5-3-11-4-16.5-4s-11.5 1-16.5 4z" fill="#A04A9A"/>${H('M20 40c1 3 3 6 6 7')}`,
'Panais': `${fanes(36,18,'#6EAA4A')}<path d="M33 16c6-1 11 4 10 10-2 10-14 24-22 30-3 2-5 0-4-3 3-9 8-26 11-32 1-3 3-5 5-5z" fill="#F0E2B8"/>
<path d="M43 26c-2 10-14 24-22 30 6-8 14-20 18-32 2 0 4 1 4 2z" fill="#DCC890"/>${H('M30 26l4 2')}${H('M27 34l4 2')}`,
'Petit pois': `<path d="M10 40c4-10 14-18 26-20 8-2 16 0 18 4-6 2-12 6-16 12-6 8-14 12-22 10-4-1-6-3-6-6z" fill="#5EAA45"/>
${[[20,38],[28,34],[36,30],[44,27]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#9ED35E"/>${H(`M${x-3} ${y-1}c1-2 2-3 3-3`)}`).join('')}
<path d="M10 40c8 4 18 2 26-6 6-6 12-10 18-10-2 6-8 12-14 18-8 6-18 8-24 6-4-1-6-4-6-8z" fill="#4E9A3A"/>`,
'Poivron': `<path d="M32 18c-4-4-12-4-16 2-4 6-4 16-2 24 2 8 8 12 12 10 2-1 4-2 6-2s4 1 6 2c4 2 10-2 12-10 2-8 2-18-2-24-4-6-12-6-16-2z" fill="#E03A2E"/>
<path d="M48 20c4 6 4 16 2 24-2 8-8 12-12 10 6-4 9-12 9-20 0-6-1-10 1-14z" fill="#B82A20"/><path d="M32 18v14" stroke="#B82A20" stroke-width="1.5"/>
<path d="M32 19c0-6 2-10 6-12" stroke="#4E8A2E" stroke-width="4" stroke-linecap="round" fill="none"/>${H('M18 28c-1 4-1 8 0 12')}`,
'Radis': `${fanes(32,20)}<path d="M32 20c-9 0-15 7-15 15 0 8 6 14 13 15l2 8 2-8c7-1 13-7 13-15 0-8-6-15-15-15z" fill="#E0365A"/>
<path d="M18 40c3 6 8 9 14 9s11-3 14-9c-2 7-7 10-14 10s-12-3-14-10z" fill="#F4F0F0"/>
<path d="M41 24c4 3 6 7 6 11 0 4-1 7-3 9 1-3 1-6 0-9 0-4-1-8-3-11z" fill="#B82A48"/>${H('M21 32c0-3 2-6 4-8')}`,
'Laitue': `<circle cx="32" cy="38" r="18" fill="#7DC45C"/>
<path d="M14 38c0-10 8-18 18-18 0 6-2 12-6 16-4 3-8 3-12 2zM50 38c0-10-8-18-18-18 0 6 2 12 6 16 4 3 8 3 12 2z" fill="#9AD670"/>
<path d="M14 38c4 8 10 14 18 16-2-6-6-10-10-12-3-2-6-3-8-4zM50 38c-4 8-10 14-18 16 2-6 6-10 10-12 3-2 6-3 8-4z" fill="#5EAA45"/>
<path d="M32 22c-5 4-6 10-4 16 2 4 6 4 8 0 2-6 1-12-4-16z" fill="#C2E890"/>${H('M18 34c1-4 3-7 6-9')}`,
'Tomate': `<circle cx="32" cy="36" r="18" fill="#E63A2E"/><path d="M44 23c4 3 6 8 6 13 0 10-8 18-18 18 8-3 13-10 13-18 0-5-1-9-1-13z" fill="#C42A20"/>
<path d="M32 20l-8-3 5 6-7 3h8l2 5 2-5h8l-7-3 5-6z" fill="#3E8A2E"/><path d="M32 20v-6" stroke="#3E8A2E" stroke-width="2.5" stroke-linecap="round"/>${H('M20 32c0-4 2-7 5-9')}`,
'Topinambour': `<path d="M16 32c-2-8 4-14 10-12 2-6 10-8 14-2 6-2 12 4 10 10 4 4 2 12-4 14-2 6-10 8-14 4-6 2-12-2-12-8-4-2-6-4-4-6z" fill="#C98A5A"/>
<path d="M46 28c4 4 2 12-4 14-2 6-10 8-14 4 6-2 10-6 12-12 2-4 4-6 6-6z" fill="#A86E40"/>
<path d="M24 28h4M34 26h4M28 36h4M38 36h3" stroke="#8A5A30" stroke-width="1.4" stroke-linecap="round"/>${H('M20 30c1-3 3-6 6-7')}`,
'Girolle': `<path d="M10 22c4-6 14-8 22-8s18 2 22 8c-4 8-12 12-16 18-2 4-2 10-2 16h-8c0-6 0-12-2-16-4-6-12-10-16-18z" fill="#F0B83A"/>
<path d="M54 22c-4 8-12 12-16 18-2 4-2 10-2 16h-3c0-6 1-12 3-16 4-6 10-10 12-16 2-1 4-2 6-2z" fill="#D89A20"/>
<path d="M18 24c4 4 8 8 10 14M26 22c2 4 4 10 4 16M38 22c-2 4-4 10-4 16M46 24c-4 4-8 8-10 14" stroke="#D89A20" stroke-width="1.2" fill="none"/>${H('M16 20c4-2 9-3 14-3')}`,
'Patate douce': `<path d="M8 38c2-10 14-20 28-22 10-2 18 4 20 10 2 8-6 16-18 20-14 4-30 4-30-8z" fill="#B84A3A"/>
<path d="M54 24c4 8-4 18-16 22-12 4-26 4-29-4 6 4 16 2 26-2 10-4 16-10 19-16z" fill="#963A2C"/>
<path d="M8 38l-4 2M56 26l4-2" stroke="#963A2C" stroke-width="2" stroke-linecap="round"/>${H('M16 32c4-6 10-10 16-12')}`,
'Rutabaga': `<path d="M28 18l-4-10M32 18V6M36 18l4-10" stroke="#5E9B6A" stroke-width="3" stroke-linecap="round"/>
<path d="M32 18c-10 0-18 7-18 17 0 9 8 17 18 17s18-8 18-17c0-10-8-17-18-17z" fill="#F0D88A"/>
<path d="M14.5 31c2-8 9-13 17.5-13s15.5 5 17.5 13c-5-3-11-5-17.5-5s-12.5 2-17.5 5z" fill="#8E5A8A"/>
<path d="M32 52l-1 6" stroke="#B89A50" stroke-width="2" stroke-linecap="round"/>${H('M19 38c1 4 3 7 6 9')}`,
'Salsifis': `${[[24,'#3A2A22'],[32,'#4A362A'],[40,'#3A2A22']].map(([x,c],i)=>`<path d="M${x} 12l${i-1} 44" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>`).join('')}
<path d="M18 30h28v6H18z" fill="#C79A5A"/>${H('M23 16v10')}`,
'Citron': agrume('#F5D63A','#DDB920'),
'Pomme': fruitRond('#E8402E','#C42E20',`<path d="M32 20c-1-5 0-8 2-11" stroke="#6B4A2B" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M34 14c4-5 10-5 13-3-2 5-8 7-13 3z" fill="#4E9A3A"/><path d="M27 19c3 2 7 2 10 0" stroke="#A82418" stroke-width="2" fill="none" stroke-linecap="round"/>`),
'Abricot': fruitRond('#F5A040','#E08528',`<path d="M32 18c-3 8-3 26 0 36" stroke="#D97A20" stroke-width="1.5" fill="none"/><path d="M32 19c3-5 8-7 12-6-2 5-7 7-12 6z" fill="#4E9A3A"/>`),
'Cerise': `<path d="M22 40c4-14 8-24 18-32M42 42c-2-14-2-24-2-34" stroke="#5E7A2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<path d="M40 8c4-4 10-4 12-1-3 4-8 4-12 1z" fill="#4E9A3A"/>
<circle cx="21" cy="45" r="10" fill="#B8182A"/><circle cx="43" cy="46" r="10" fill="#C42030"/>
<path d="M28 39c2 3 3 6 3 9-1 4-4 7-8 7 4-3 6-8 5-16zM50 40c2 3 3 6 3 9-1 4-4 7-8 7 4-3 6-8 5-16z" fill="#8A1020"/>${H('M15 42c0-2 1-4 3-5')}${H('M37 43c0-2 1-4 3-5')}`,
'Clémentine': agrume('#F58A20','#DD7010'),
'Fraise': `<path d="M32 18c-10 0-18 4-18 12 0 12 10 24 18 26 8-2 18-14 18-26 0-8-8-12-18-12z" fill="#E6303A"/>
<path d="M44 20c4 2 6 6 6 10 0 12-10 24-18 26 6-6 13-16 13-26 0-4 0-7-1-10z" fill="#C21E2A"/>
${[[22,28],[30,26],[38,27],[25,36],[33,35],[41,34],[28,44],[36,43]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx=".9" ry="1.4" fill="#F5D68A"/>`).join('')}
<path d="M32 19l-10-3 6 5-8 3 10 0 2 3 2-3 10 0-8-3 6-5z" fill="#3E8A2E"/><path d="M32 18v-6" stroke="#3E8A2E" stroke-width="2.5" stroke-linecap="round"/>${H('M18 30c0 3 1 6 2 8')}`,
'Framboise': `${[[26,24],[32,22],[38,24],[23,31],[29,30],[35,30],[41,31],[25,38],[31,38],[37,38],[28,45],[34,45],[31,51]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.6" fill="#D8305A"/><circle cx="${x+1}" cy="${y+1}" r="3" fill="#B82048" opacity=".6"/><circle cx="${x-1.5}" cy="${y-1.5}" r=".9" fill="#fff" opacity=".7"/>`).join('')}
<path d="M32 19l-8-4 4 5-6 2 8 0 2 2 2-2 8 0-6-2 4-5z" fill="#4E9A3A"/>`,
'Kiwi': `<ellipse cx="32" cy="34" rx="20" ry="18" fill="#8A6A3A"/><ellipse cx="34" cy="34" rx="15" ry="14" fill="#7DBA2E"/>
<ellipse cx="34" cy="34" rx="5" ry="4.5" fill="#F0F0C8"/>${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>{const r=a*Math.PI/180;return `<ellipse cx="${(34+8.5*Math.cos(r)).toFixed(1)}" cy="${(34+8*Math.sin(r)).toFixed(1)}" rx="1.1" ry=".7" fill="#2A2A1A" transform="rotate(${a} ${(34+8.5*Math.cos(r)).toFixed(1)} ${(34+8*Math.sin(r)).toFixed(1)})"/>`}).join('')}${H('M24 26c2-3 5-5 8-5')}`,
'Melon': `<circle cx="32" cy="34" r="20" fill="#B8C87A"/><path d="M46 20c4 4 6 9 6 14 0 11-9 20-20 20 9-4 15-11 15-20 0-5-1-10-1-14z" fill="#9AAE5A"/>
<path d="M32 14c-6 6-8 13-8 20s2 14 8 20M32 14c6 6 8 13 8 20s-2 14-8 20M14 26c4 4 10 6 18 6s14-2 18-6M14 42c4-4 10-6 18-6s14 2 18 6" stroke="#E8E8C0" stroke-width="1.2" fill="none" opacity=".8"/>
<path d="M32 14c0-4 1-6 3-8" stroke="#6B5A2B" stroke-width="3" stroke-linecap="round" fill="none"/>${H('M17 30c0-4 2-8 5-11')}`,
'Noix': `<path d="M32 12c-12 0-18 10-18 22s6 20 18 20 18-8 18-20-6-22-18-22z" fill="#C9A06A"/>
<path d="M44 16c4 4 6 10 6 18 0 12-6 20-18 20 8-3 13-10 13-20 0-7-1-13-1-18z" fill="#A9824C"/>
<path d="M32 12v42" stroke="#8A6A3A" stroke-width="2"/><path d="M22 22c4 2 6 6 4 10s-2 8 2 12M42 22c-4 2-6 6-4 10s2 8-2 12M18 34c4-2 6 0 6 2M46 34c-4-2-6 0-6 2" stroke="#A9824C" stroke-width="1.4" fill="none" stroke-linecap="round"/>${H('M19 28c0-4 2-8 5-10')}`,
'Orange': agrume('#F59A20','#DD7F10'),
'Pêche': fruitRond('#F59060','#E06A4A',`<path d="M24 22c-6 4-8 10-8 16 0 8 6 14 14 16-4-4-6-10-6-16 0-6 2-12 6-16-2-1-4-1-6 0z" fill="#F5C060" opacity=".7"/><path d="M32 18c-3 8-3 26 0 36" stroke="#D85A3A" stroke-width="1.5" fill="none"/><path d="M32 19c3-5 8-7 12-6-2 5-7 7-12 6z" fill="#4E9A3A"/>`),
'Nectarine': fruitRond('#D8403A','#B02A2A',`<path d="M24 22c-6 4-8 10-8 16 0 8 6 14 14 16-4-4-6-10-6-16 0-6 2-12 6-16-2-1-4-1-6 0z" fill="#F5B040" opacity=".8"/><path d="M32 18c-3 8-3 26 0 36" stroke="#902020" stroke-width="1.5" fill="none"/><path d="M32 19c3-5 8-7 12-6-2 5-7 7-12 6z" fill="#4E9A3A"/>`),
'Prune': `<ellipse cx="32" cy="36" rx="15" ry="18" fill="#5A3A8A"/><path d="M40 21c4 4 7 9 7 15 0 10-7 18-15 18 6-4 10-10 10-18 0-6-1-11-2-15z" fill="#46287A"/>
<path d="M32 18c-2 8-2 28 0 36" stroke="#46287A" stroke-width="1.5" fill="none"/><path d="M32 19c0-4 1-7 3-9" stroke="#6B4A2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>${H('M22 30c0-4 2-7 4-9')}`,
'Rhubarbe': `${[[22,'#D8304A'],[32,'#C22040'],[42,'#D8304A']].map(([x,c],i)=>`<path d="M${x} 58c-1-10-1-20 ${i-1} -30" stroke="${c}" stroke-width="6" stroke-linecap="round" fill="none"/>`).join('')}
<path d="M32 28c-10 0-20-4-22-14 6-6 16-6 22 0 6-6 16-6 22 0-2 10-12 14-22 14z" fill="#4E9A3A"/><path d="M32 28c0-6 0-10 0-14" stroke="#3E7A2E" stroke-width="1.5"/>${H('M21 54c0-8 0-16 1-22')}`,
'Citron vert': agrume('#7DBA2E','#5E9B1E'),
};
