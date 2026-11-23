const rows=[["Shahryar","Vizier","Before the first night","Orders","Authority","Directs the vizier to find a bride and put her to death the following morning.","Frame Narrative and Pedagogy · Haddawy p. 14"],["Shahrazad","Vizier","Before the first night","Requests","Strategy","Asks her father to arrange her marriage to the king and explains her aim of saving others.","Shahrazad’s Intellectual and Erotic Pedagogy · Haddawy p. 15"],["Shahrazad","Vizier","Before the first night","Insists","Strategy","Says she will go to the king herself if her father refuses.","Shahrazad’s Intellectual and Erotic Pedagogy · Haddawy p. 20"],["Shahrazad","Dinarzad","Before the first night","Plans","Strategy","Arranges for her sister to ask for a story at the agreed moment.","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy pp. 20–21"],["Shahryar","Vizier","Before the first night","Threatens","Authority","Tells the vizier that refusal to execute his daughter will cost him his life.","Shahrazad’s Intellectual and Erotic Pedagogy · Haddawy pp. 20–21"],["Shahrazad","Shahryar","The first telling","Requests","Invitation","Asks to say goodbye to her sister, creating the occasion for Dinarzad to enter.","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy p. 21"],["Dinarzad","Shahrazad","The first telling","Invites","Invitation","“Sister, if you are not sleepy, tell us one of your lovely little tales…”","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy p. 21"],["Shahrazad","Shahryar","The first telling","Asks","Invitation","“May I have your permission to tell a story?”","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy p. 21"],["Shahryar","Shahrazad","The first telling","Permits","Authority","“Yes.”","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy p. 21"],["Shahrazad","Shahryar","The first telling","Tells","Suspense","Begins the tale by calling on the audience to listen.","Shahrazad’s Narrative Authority and Adaptive Power · Haddawy p. 21"],["Shahrazad","Shahryar","At dawn","Pauses","Suspense","The arrival of morning interrupts her telling and leaves the story unfinished.","Storytelling as Containment, Resistance, and Moral Reform · Haddawy p. 25"]].map(([actor,target,scene,word,category,evidence,source])=>({actor,target,scene,word,category,evidence,source}));
const names=['Shahrazad','Shah Zaman','Dinarzad','Shahryar','Vizier'];
const colors={Authority:'#984a53',Strategy:'#356584',Invitation:'#337264',Suspense:'#77578d'};
const $=id=>document.getElementById(id);
const put=(tag,value,root)=>{const e=document.createElement(tag);e.textContent=value;root.append(e);return e;};
function button(root,label,run){const e=put('button',label,root);e.type='button';e.onclick=run;return e;}
function tally(data,key){const m=new Map();for(const r of data)m.set(r[key],(m.get(r[key])||0)+1);return [...m].sort((a,b)=>b[1]-a[1]);}
for(const name of names)$('actor').add(new Option(name,name));
for(const [name] of tally(rows,'scene'))$('scene').add(new Option(name,name));
let filtered=rows;
function evidence(data,label,jump=false){
  $('selection').textContent=label+' · '+data.length+' records';
  $('table').replaceChildren();
  for(const r of data){const tr=put('tr','',$('table'));for(const val of [r.actor+' → '+r.target,r.scene+' · '+r.word,r.evidence,r.source])put('td',val,tr);}
  if(jump){$('evidence-title').focus({preventScroll:true});$('evidence').scrollIntoView();}
}
function graph(){
  const root=$('graph'), nav=$('nodes');root.replaceChildren();nav.replaceChildren();
  const ns='http://www.w3.org/2000/svg';
  function svg(tag,attributes,parent){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attributes))el.setAttribute(k,v);parent.append(el);return el;}
  const canvas=svg('svg',{viewBox:'0 0 800 320',role:'img','aria-label':'Directed character relationships. Use the buttons beneath the diagram to inspect evidence.'},root);
  const defs=svg('defs',{},canvas);
  const mark=svg('marker',{id:'arrow',markerWidth:8,markerHeight:8,refX:7,refY:4,orient:'auto'},defs);
  svg('path',{d:'M0 0L8 4L0 8Z',fill:'#f2be79'},mark);
  const coords=[[375,155],[650,250],[170,65],[625,65],[135,235]];
  for(const [pair,n] of tally(filtered.map(r=>({pair:r.actor+'|'+r.target})),'pair')){
    const [from,to]=pair.split('|');const [x,y]=coords[names.indexOf(from)];const [a,b]=coords[names.indexOf(to)];
    const d=Math.hypot(a-x,b-y),u=(a-x)/d,v=(b-y)/d;
    svg('line',{x1:x+30*u-6*v,y1:y+30*v+6*u,x2:a-35*u-6*v,y2:b-35*v+6*u,'stroke-width':1+n*.6,'marker-end':'url(#arrow)'},canvas);
  }
  names.forEach((n,i)=>{const [x,y]=coords[i];svg('circle',{cx:x,cy:y,r:24},canvas);svg('text',{x,y:y+51,'text-anchor':'middle'},canvas).textContent=n;
    button(nav,n,()=>evidence(filtered.filter(r=>r.actor===n||r.target===n),n,true));});
}
function render(){
  const a=$('actor').value,s=$('scene').value;
  filtered=rows.filter(r=>(!a||r.actor===a||r.target===a)&&(!s||r.scene===s));
  $('total').textContent=filtered.length+' coded records in this view';
  for(const id of ['bars','pie','legend','cloud'])$(id).replaceChildren();
  const counts=tally(filtered,'actor');
  for(const name of names){
    const count=counts.find(([actor])=>actor===name)?.[1]||0;
    const e=button($('bars'),name+' · '+count,()=>evidence(filtered.filter(r=>r.actor===name),name,true));e.className='bar';e.style.setProperty('--color','#48688d');e.style.setProperty('--fill',100*count/(counts[0]?.[1]||1)+'%');
  }
  if(filtered.length){let stop=0;const segments=[];for(const [cat,n] of tally(filtered,'category')){const next=stop+100*n/filtered.length;segments.push(colors[cat]+' '+stop+'% '+next+'%');stop=next;button($('legend'),cat+' · '+n+' ('+(100*n/filtered.length).toFixed(0)+'%)',()=>evidence(filtered.filter(r=>r.category===cat),cat,true)).style.borderColor=colors[cat];}
    const pie=put('div','',$('pie'));pie.className='pie';pie.style.background='conic-gradient('+segments.join(',')+')';pie.setAttribute('aria-hidden','true');}
  else put('p','No coded records for these filters.',$('pie'));
  const words=tally(filtered,'word');
  for(const [i,[word,n]] of words.entries()){const e=button($('cloud'),word+' '+n,()=>evidence(filtered.filter(r=>r.word===word),word,true));e.style.fontSize=(1+1.6*Math.sqrt(n/words[0][1]))+'rem';e.style.setProperty('--word',Object.values(colors)[i%4]);}
  if(!words.length)put('p','No matching action labels.',$('cloud')).style.color='#122033';
  graph();evidence(filtered,'Filtered evidence');
}
$('actor').onchange=render;$('scene').onchange=render;$('reset').onclick=()=>{$('actor').value='';$('scene').value='';render();};$('clear').onclick=()=>evidence(filtered,'Filtered evidence');
render();