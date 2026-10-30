// Coverage follows Manhattan-distance combat rules. Cast range is separate from area size.
function skillTargetingInfo(s){const diamond=r=>1+2*r*(r+1);if(s.targeting==='global')return 'Global · entire battlefield';if(s.type==='sweep'){const r=s.range||1;return `AoE · ${diamond(r)-1} tiles · radius ${r}, centered on caster · enemies only`}
 if(s.type==='rally')return 'AoE · 41 tiles · radius 4, including caster · living allies';
 if(s.type==='ward'||['cl_sanctuary','kn_shield_guard'].includes(s.id))return 'AoE · 13 tiles · radius 2, including caster · allies';
 if(s.type==='taunt')return 'AoE · 40 tiles · radius 4 around caster · up to 2 enemies';
 if(s.type==='trap')return 'Single target · mine trigger zone: 5 tiles (radius 1) · hits one enemy';
 if(s.type==='passive')return 'Single target · Self (equipped passive)';
 if(['guard','stealth','meditate','summon'].includes(s.type))return 'Single target · Self'+(s.type==='summon'?' (one bound companion)':'');
 if(['heal','revive'].includes(s.type))return 'Single target · '+(s.type==='revive'?'one downed ally':'one living ally');
 return 'Single target · one enemy'+(s.type==='reaction'?' (reaction)':'')}
const targetingFormatSkill=formatJobSkill;formatJobSkill=function(h,job,s){const node=document.createElement('div');node.innerHTML=targetingFormatSkill(h,job,s);const card=node.firstElementChild,label=document.createElement('p');label.className='skill-targeting';label.textContent=skillTargetingInfo(s);label.style.cssText='font-size:11px;font-weight:600;color:var(--gold);line-height:1.5;margin:8px 0';card.querySelector('.skill-card-title')?.after(label);return node.innerHTML};
const targetingJobPanel=jobPanelMarkup;jobPanelMarkup=function(h){return '<p class="modalhint">AoE tile counts show the full area on open ground. Battlefield edges, obstacles, and line of sight can reduce the affected tiles. Cast range is separate from area size. No current job skill affects the entire battlefield.</p>'+targetingJobPanel(h)};
