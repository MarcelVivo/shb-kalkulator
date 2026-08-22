/* ==========================================================================
 * Sweet Home Bakery · Bedienung des Design-Konfigurators
 * --------------------------------------------------------------------------
 * Baut die Oberfläche auf, verbindet Zeichenfläche, Fotowerkzeug und
 * Kalkulation und erzeugt die Ausgaben.
 *
 * Setzt design.js, photo.js, pdf.js und app.js voraus.
 * ========================================================================== */

'use strict';

(function(){

/* Übersetzungen einhängen */
if(typeof translations !== 'undefined' && typeof SHB_DESIGN !== 'undefined'){
  Object.assign(translations.de, SHB_DESIGN.TX.de);
  Object.assign(translations.ua, SHB_DESIGN.TX.ua);
}

const D = SHB_DESIGN;
let design   = null;      // aktueller Entwurf (Referenz auf state.design)
let selected = null;      // id des ausgewählten Objekts
let tab      = 'tiers';
let editorBuilt = false;
let photoSession = null;  // laufende Fotobearbeitung
let photoTarget  = null;  // {mode:'cake'|'board', id?}

/* ==========================================================================
 * 1. Gerüst der Oberfläche
 * ========================================================================== */
function buildEditor(){
  if(editorBuilt) return;
  const html = `
  <div class="modal modal-full" id="modalDesign" hidden>
    <div class="modal-box design-box" role="dialog" aria-modal="true">
      <header class="modal-head">
        <h2 data-i18n="secDesign">Torten-Design</h2>
        <button class="modal-x" type="button" data-close aria-label="X">×</button>
      </header>

      <div class="design-stage"><div id="designCanvas"></div></div>

      <nav class="design-tabs" id="designTabs">
        <button type="button" data-tab="tiers"  class="is-active" data-i18n="tabTiers">Etagen</button>
        <button type="button" data-tab="deco"   data-i18n="tabDeco">Dekor</button>
        <button type="button" data-tab="text"   data-i18n="tabText">Schrift</button>
        <button type="button" data-tab="photo"  data-i18n="tabPhoto">Fotos</button>
        <button type="button" data-tab="sel"    data-i18n="tabSel">Auswahl</button>
      </nav>
      <div class="design-panel" id="designPanel"></div>

      <footer class="modal-foot modal-foot-wrap">
        <button class="btn btn-quiet"   type="button" data-close data-i18n="btnClose">Schliessen</button>
        <button class="btn btn-outline" type="button" id="btnDesignPng" data-i18n="dExportPng">Bild speichern</button>
        <button class="btn btn-outline" type="button" id="btnDesignPdf" data-i18n="dExportPdf">Vorlage als PDF</button>
        <button class="btn btn-primary" type="button" id="btnDesignShare" data-i18n="dSend">An Kundschaft senden</button>
      </footer>
    </div>
  </div>

  <div class="modal modal-full" id="modalPhoto" hidden>
    <div class="modal-box design-box" role="dialog" aria-modal="true">
      <header class="modal-head">
        <h2 data-i18n="pTitle">Foto bearbeiten</h2>
        <button class="modal-x" type="button" data-close aria-label="X">×</button>
      </header>
      <div class="photo-stage"><canvas id="photoCanvas"></canvas></div>
      <div class="design-panel" id="photoPanel"></div>
      <footer class="modal-foot modal-foot-wrap">
        <button class="btn btn-quiet"   type="button" data-close data-i18n="btnClose">Schliessen</button>
        <button class="btn btn-outline" type="button" id="btnPhotoReset" data-i18n="pReset">Zurücksetzen</button>
        <button class="btn btn-primary" type="button" id="btnPhotoApply" data-i18n="pApply">Übernehmen</button>
      </footer>
    </div>
  </div>

  <input type="file" id="photoInput" accept="image/*" hidden>`;

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  while(wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);
  editorBuilt = true;

  /* Ereignisse */
  $$('#designTabs button').forEach(b=>b.addEventListener('click', ()=>{
    tab = b.dataset.tab;
    $$('#designTabs button').forEach(x=>x.classList.toggle('is-active', x===b));
    renderPanel();
  }));
  $$('#modalDesign, #modalPhoto').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeModal(m); });
  });
  $('#btnDesignPng').addEventListener('click', exportPng);
  $('#btnDesignPdf').addEventListener('click', ()=>exportPdf('intern'));
  $('#btnDesignShare').addEventListener('click', ()=>exportPdf('kunde'));
  $('#photoInput').addEventListener('change', onPhotoPicked);
  $('#btnPhotoApply').addEventListener('click', applyPhoto);
  $('#btnPhotoReset').addEventListener('click', ()=>{
    if(!photoSession) return;
    photoSession.set('bright',0); photoSession.set('contrast',0); photoSession.set('sat',0);
    photoSession.set('rot',0); photoSession.set('crop',null); photoSession.set('round',false);
    photoSession.rebuild(false); photoSession.resetMask();
    drawPhoto(); renderPhotoPanel();
  });
}

/* ==========================================================================
 * 2. Zeichenfläche
 * ========================================================================== */
function renderCanvas(){
  const host = $('#designCanvas');
  if(!host) return;
  host.innerHTML = D.buildSvg(design, {selected, width:'100%', height:'100%'});
  const svg = host.querySelector('svg');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.style.width = '100%'; svg.style.height = '100%'; svg.style.touchAction = 'none';
  bindDrag(svg);
}

/** Ziehen mit Maus oder Finger. Während der Bewegung wird nur die
 *  Transformation der gezogenen Gruppe geändert – erst beim Loslassen
 *  wird die ganze Zeichnung neu aufgebaut. Das bleibt auch auf dem
 *  Telefon flüssig. */
function bindDrag(svg){
  let drag = null;

  const toSvg = (ev)=>{
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : {x:0,y:0};
  };

  svg.addEventListener('pointerdown', ev=>{
    const g = ev.target.closest('.dz');
    if(!g){ selected = null; renderCanvas(); renderPanel(); return; }
    const id  = g.dataset.id;
    const obj = findObj(id);
    if(!obj) return;
    selected = id;
    tab = 'sel';
    $$('#designTabs button').forEach(x=>x.classList.toggle('is-active', x.dataset.tab==='sel'));
    const p = toSvg(ev);
    drag = {g, obj, dx:p.x-obj.x, dy:p.y-obj.y, moved:false};
    g.setPointerCapture(ev.pointerId);
    renderPanel();
  });

  svg.addEventListener('pointermove', ev=>{
    if(!drag) return;
    const p = toSvg(ev);
    drag.obj.x = Math.round(p.x - drag.dx);
    drag.obj.y = Math.round(p.y - drag.dy);
    drag.moved = true;
    applyTransform(drag.g, drag.obj);
  });

  const end = ()=>{ if(!drag) return; const m = drag.moved; drag = null; if(m){ renderCanvas(); save(); } };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
}

function applyTransform(g, o){
  const kind = g.dataset.kind;
  if(kind==='element'){
    g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.rot||0}) scale(${o.s||1}) translate(-50 -50)`);
  }else if(kind==='photo'){
    const w = o.w||260, h = o.h||(w*(o.ratio||1));
    g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.rot||0}) translate(${-w/2} ${-h/2})`);
  }else{
    g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.rot||0})`);
  }
}

function findObj(id){
  return (design.elements||[]).find(o=>o.id===id)
      || (design.photos||[]).find(o=>o.id===id)
      || (design.texts||[]).find(o=>o.id===id) || null;
}
function objKind(id){
  if((design.elements||[]).some(o=>o.id===id)) return 'element';
  if((design.photos||[]).some(o=>o.id===id))   return 'photo';
  if((design.texts||[]).some(o=>o.id===id))    return 'text';
  return null;
}
function topZ(){
  const all = [].concat(design.elements||[], design.photos||[], design.texts||[]);
  return all.reduce((m,o)=>Math.max(m, o.z||0), 0);
}

/* ==========================================================================
 * 3. Bedienfelder
 * ========================================================================== */
function swatches(current, attr){
  return `<div class="sw-grid">` + D.PALETTE.map(c=>
    `<button type="button" class="sw${c.toLowerCase()===String(current).toLowerCase()?' is-on':''}"
       style="background:${c}" data-color="${c}" data-attr="${attr}" aria-label="${c}"></button>`).join('') + `</div>`;
}
function slider(label, id, min, max, step, val, unit){
  return `<label class="d-slider"><span>${escapeHtml(label)}</span>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}">
    <b id="${id}Out">${val}${unit||''}</b></label>`;
}

function renderPanel(){
  const p = $('#designPanel');
  if(!p) return;
  if(tab==='tiers') p.innerHTML = panelTiers();
  if(tab==='deco')  p.innerHTML = panelDeco();
  if(tab==='text')  p.innerHTML = panelText();
  if(tab==='photo') p.innerHTML = panelPhoto();
  if(tab==='sel')   p.innerHTML = panelSel();
  bindPanel();
}

function panelTiers(){
  const shapeOpts = D.SHAPES.map(s=>
    `<option value="${s}"${design.shape===s?' selected':''}>${escapeHtml(t('shapes')[D.SHAPES.indexOf(s)] || s)}</option>`).join('');
  let h = `<div class="d-row">
      <label class="field"><span>${escapeHtml(t('dShape'))}</span>
        <select id="dShape">${shapeOpts}</select></label>
      <label class="field"><span>${escapeHtml(t('dBoard'))}</span>
        <input type="color" id="dBoard" value="${design.board}"></label>
    </div>
    <label class="check"><input type="checkbox" id="dDrip"${design.drip.on?' checked':''}>
      <span>${escapeHtml(t('dDrip'))}</span></label>`;
  if(design.drip.on){
    h += `<div class="d-sub"><span class="d-lbl">${escapeHtml(t('dDripColor'))}</span>${swatches(design.drip.color,'drip')}</div>`;
  }
  design.tiers.forEach((tr,i)=>{
    const fillOpts = D.FILL_KINDS.map(k=>
      `<option value="${k}"${tr.fill===k?' selected':''}>${escapeHtml(t('fills.'+k))}</option>`).join('');
    h += `<div class="d-tier" data-i="${i}">
      <div class="d-tier-head"><b>${escapeHtml(t('dTier'))} ${i+1}</b>
        <button type="button" class="d-x" data-remove-tier="${i}">×</button></div>
      <div class="d-row">
        <label class="field"><span>${escapeHtml(t('dDiameter'))}</span>
          <input type="number" inputmode="decimal" data-tier="d" min="4" max="60" step="1" value="${tr.d}"></label>
        <label class="field"><span>${escapeHtml(t('dHeight'))}</span>
          <input type="number" inputmode="decimal" data-tier="h" min="3" max="40" step="1" value="${tr.h}"></label>
        <label class="field"><span>${escapeHtml(t('dFill'))}</span>
          <select data-tier="fill">${fillOpts}</select></label>
      </div>
      <span class="d-lbl">${escapeHtml(t('dColor'))}</span>${swatches(tr.color,'tier:'+i+':color')}`;
    if(tr.fill==='ombre'){
      h += `<span class="d-lbl">${escapeHtml(t('dColor2'))}</span>${swatches(tr.color2,'tier:'+i+':color2')}`;
    }
    if(tr.fill==='muster'){
      h += `<span class="d-lbl">${escapeHtml(t('dPattern'))}</span>
        <div class="pat-grid">` + D.PATTERN_KEYS.map(k=>
          `<button type="button" class="pat${tr.pattern===k?' is-on':''}" data-pattern="${i}:${k}">
             <svg viewBox="0 0 60 60"><defs>${D.patternDef('pv'+i+k, k, tr.patternColor, tr.color)}</defs>
             <rect width="60" height="60" fill="url(#pv${i}${k})"/></svg>
             <em>${escapeHtml(t('patterns.'+k))}</em></button>`).join('') + `</div>
        <span class="d-lbl">${escapeHtml(t('dPattern'))} · ${escapeHtml(t('dColor'))}</span>${swatches(tr.patternColor,'tier:'+i+':patternColor')}`;
    }
    h += `</div>`;
  });
  h += `<button type="button" class="btn btn-add" id="dAddTier">+ ${escapeHtml(t('dAddTier'))}</button>`;
  return h;
}

function panelDeco(){
  return `<p class="hint">${escapeHtml(t('dTapToAdd'))}</p>
    <div class="el-grid">` + D.ELEMENT_KEYS.map(k=>
      `<button type="button" class="el" data-add-el="${k}">
         <svg viewBox="0 0 100 100">${D.elementSvg(k,'#C9A227')}</svg>
         <em>${escapeHtml(t('els.'+k))}</em></button>`).join('') + `</div>`;
}

function panelText(){
  const fontOpts = D.FONTS.map(f=>`<option value="${f.key}">${escapeHtml(f.label)}</option>`).join('');
  return `<div class="d-row">
      <label class="field"><span>${escapeHtml(t('dTextContent'))}</span>
        <input type="text" id="dTextNew" placeholder="Emilia"></label>
      <label class="field"><span>${escapeHtml(t('dFont'))}</span>
        <select id="dFontNew">${fontOpts}</select></label>
    </div>
    <button type="button" class="btn btn-add" id="dAddText">+ ${escapeHtml(t('dAddText'))}</button>
    ${(design.texts||[]).length ? `<div class="d-list">` + design.texts.map(x=>
      `<button type="button" class="d-item" data-sel="${x.id}">
        <span style="font-family:${(D.FONTS.find(f=>f.key===x.font)||D.FONTS[0]).stack};font-size:19px">${escapeHtml(x.content)}</span>
      </button>`).join('') + `</div>` : ''}`;
}

function panelPhoto(){
  const list = (design.photos||[]).concat(design.boardPhotos||[]);
  return `<button type="button" class="btn btn-add" id="dAddPhoto">+ ${escapeHtml(t('dPhotoAdd'))}</button>
    <p class="hint">${escapeHtml(t('pCutHint'))}</p>
    ${list.length ? `<div class="ph-grid">` + list.map(p=>
      `<div class="ph"><img src="${p.thumb||p.src}" alt="">
        <div class="ph-acts">
          <button type="button" data-ph-edit="${p.id}">${escapeHtml(t('dPhotoEdit'))}</button>
          <button type="button" data-ph-del="${p.id}">${escapeHtml(t('dDelete'))}</button>
        </div>
        <em>${p.board ? escapeHtml(t('dPhotoBoard')) : escapeHtml(t('dPhotoCake'))}</em>
      </div>`).join('') + `</div>` : `<p class="hint">${escapeHtml(t('dPhotoNone'))}</p>`}
    <label class="field"><span>${escapeHtml(t('dNotes'))}</span>
      <textarea id="dNotes" rows="3">${escapeHtml(design.notes||'')}</textarea></label>`;
}

function panelSel(){
  const o = selected && findObj(selected);
  if(!o) return `<p class="hint">${escapeHtml(t('dSelNone'))}</p>`;
  const kind = objKind(selected);
  let h = '';
  if(kind==='element' || kind==='photo'){
    h += slider(t('dScale'), 'selScale', 20, 400, 5,
      Math.round(kind==='photo' ? (o.w/260*100) : (o.s||1)*100), ' %');
  }
  h += slider(t('dRotate'), 'selRot', -180, 180, 1, o.rot||0, '°');
  if(kind==='text'){
    h += `<label class="field"><span>${escapeHtml(t('dTextContent'))}</span>
            <input type="text" id="selText" value="${escapeHtml(o.content)}"></label>
          <label class="field"><span>${escapeHtml(t('dFont'))}</span>
            <select id="selFont">${D.FONTS.map(f=>
              `<option value="${f.key}"${o.font===f.key?' selected':''}>${escapeHtml(f.label)}</option>`).join('')}</select></label>`
       + slider(t('dSize'), 'selSize', 20, 180, 2, o.size||64, ' px');
  }
  if(kind==='element' || kind==='text'){
    h += `<span class="d-lbl">${escapeHtml(t('dColor'))}</span>${swatches(o.color,'sel:color')}`;
  }
  if(kind==='photo'){
    h += `<label class="check"><input type="checkbox" id="selRound"${o.round?' checked':''}>
            <span>${escapeHtml(t('pRound'))}</span></label>`;
  }
  h += `<div class="d-acts">
      <button type="button" class="btn btn-outline" id="selUp">${escapeHtml(t('dLayerUp'))}</button>
      <button type="button" class="btn btn-outline" id="selDown">${escapeHtml(t('dLayerDown'))}</button>
      <button type="button" class="btn btn-outline" id="selDup">${escapeHtml(t('dDuplicate'))}</button>
      <button type="button" class="btn btn-quiet"   id="selDel">${escapeHtml(t('dDelete'))}</button>
    </div>`;
  return h;
}

/* ---- Ereignisse der Bedienfelder ---- */
function bindPanel(){
  const p = $('#designPanel');

  p.querySelectorAll('.sw').forEach(b=>b.addEventListener('click',()=>{
    const c = b.dataset.color, a = b.dataset.attr;
    if(a==='drip') design.drip.color = c;
    else if(a.startsWith('tier:')){ const [,i,k] = a.split(':'); design.tiers[+i][k] = c; }
    else if(a==='sel:color'){ const o = findObj(selected); if(o) o.color = c; }
    renderCanvas(); renderPanel(); save();
  }));

  const s = (sel, ev, fn)=>{ const el = p.querySelector(sel); if(el) el.addEventListener(ev, fn); };

  s('#dShape','change', e=>{ design.shape = e.target.value; renderCanvas(); save(); });
  s('#dBoard','input',  e=>{ design.board = e.target.value; renderCanvas(); save(); });
  s('#dDrip','change',  e=>{ design.drip.on = e.target.checked; renderCanvas(); renderPanel(); save(); });
  s('#dAddTier','click',()=>{
    const last = design.tiers[design.tiers.length-1] || D.blankTier(20,12,'#FBF6EF');
    design.tiers.push(D.blankTier(Math.max(6, last.d-6), Math.max(6, last.h-2), last.color));
    renderCanvas(); renderPanel(); save();
  });
  p.querySelectorAll('[data-remove-tier]').forEach(b=>b.addEventListener('click',()=>{
    if(design.tiers.length<=1) return;
    design.tiers.splice(+b.dataset.removeTier,1);
    renderCanvas(); renderPanel(); save();
  }));
  p.querySelectorAll('.d-tier [data-tier]').forEach(el=>el.addEventListener('input',()=>{
    const i = +el.closest('.d-tier').dataset.i, k = el.dataset.tier;
    design.tiers[i][k] = (k==='fill') ? el.value : num(el.value);
    renderCanvas(); if(k==='fill') renderPanel(); save();
  }));
  p.querySelectorAll('[data-pattern]').forEach(b=>b.addEventListener('click',()=>{
    const [i,k] = b.dataset.pattern.split(':');
    design.tiers[+i].pattern = k;
    renderCanvas(); renderPanel(); save();
  }));

  p.querySelectorAll('[data-add-el]').forEach(b=>b.addEventListener('click',()=>{
    design.elements.push({id:D.newId('e'), type:b.dataset.addEl, x:500, y:430,
                          s:1, rot:0, color:'#C9A227', z:topZ()+1});
    selected = design.elements[design.elements.length-1].id;
    renderCanvas(); tab='sel'; syncTabs(); renderPanel(); save();
  }));

  s('#dAddText','click', ()=>{
    const v = p.querySelector('#dTextNew').value.trim();
    if(!v) return;
    design.texts.push({id:D.newId('t'), content:v, font:p.querySelector('#dFontNew').value,
                       size:64, color:'#C9A227', x:500, y:640, rot:0, z:topZ()+1});
    selected = design.texts[design.texts.length-1].id;
    renderCanvas(); tab='sel'; syncTabs(); renderPanel(); save();
  });
  p.querySelectorAll('[data-sel]').forEach(b=>b.addEventListener('click',()=>{
    selected = b.dataset.sel; tab='sel'; syncTabs(); renderCanvas(); renderPanel();
  }));

  s('#dAddPhoto','click', ()=>{ photoTarget = {mode:'new'}; $('#photoInput').click(); });
  p.querySelectorAll('[data-ph-edit]').forEach(b=>b.addEventListener('click',()=>editPhoto(b.dataset.phEdit)));
  p.querySelectorAll('[data-ph-del]').forEach(b=>b.addEventListener('click',()=>{
    const id = b.dataset.phDel;
    design.photos = (design.photos||[]).filter(x=>x.id!==id);
    design.boardPhotos = (design.boardPhotos||[]).filter(x=>x.id!==id);
    if(selected===id) selected = null;
    renderCanvas(); renderPanel(); save();
  }));
  s('#dNotes','input', e=>{ design.notes = e.target.value; save(); });

  /* Auswahl */
  const bindRange = (id, fn)=>{
    const el = p.querySelector('#'+id); if(!el) return;
    const out = p.querySelector('#'+id+'Out');
    el.addEventListener('input', ()=>{
      if(out) out.textContent = el.value + (out.textContent.match(/[^\d\-]+$/)||[''])[0];
      fn(+el.value); renderCanvas();
    });
    el.addEventListener('change', save);
  };
  bindRange('selScale', v=>{
    const o = findObj(selected); if(!o) return;
    if(objKind(selected)==='photo'){ o.w = Math.round(260*v/100); o.h = Math.round(o.w*(o.ratio||1)); }
    else o.s = v/100;
  });
  bindRange('selRot',  v=>{ const o = findObj(selected); if(o) o.rot = v; });
  bindRange('selSize', v=>{ const o = findObj(selected); if(o) o.size = v; });
  s('#selText','input', e=>{ const o = findObj(selected); if(o){ o.content = e.target.value; renderCanvas(); save(); } });
  s('#selFont','change',e=>{ const o = findObj(selected); if(o){ o.font = e.target.value; renderCanvas(); save(); } });
  s('#selRound','change',e=>{ const o = findObj(selected); if(o){ o.round = e.target.checked; renderCanvas(); save(); } });
  s('#selUp','click',   ()=>{ const o = findObj(selected); if(o){ o.z = topZ()+1; renderCanvas(); save(); } });
  s('#selDown','click', ()=>{ const o = findObj(selected); if(o){ o.z = -1; renderCanvas(); save(); } });
  s('#selDup','click',  ()=>{
    const o = findObj(selected); if(!o) return;
    const c = JSON.parse(JSON.stringify(o));
    c.id = D.newId('c'); c.x += 40; c.y += 30; c.z = topZ()+1;
    const k = objKind(selected);
    (k==='element'?design.elements : k==='photo'?design.photos : design.texts).push(c);
    selected = c.id; renderCanvas(); renderPanel(); save();
  });
  s('#selDel','click', ()=>{
    const k = objKind(selected); if(!k) return;
    const arr = k==='element'?design.elements : k==='photo'?design.photos : design.texts;
    const i = arr.findIndex(o=>o.id===selected);
    if(i>=0) arr.splice(i,1);
    selected = null; renderCanvas(); renderPanel(); save();
  });
}
function syncTabs(){
  $$('#designTabs button').forEach(x=>x.classList.toggle('is-active', x.dataset.tab===tab));
}

/* ==========================================================================
 * 4. Fotos
 * ========================================================================== */
async function onPhotoPicked(ev){
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = '';
  if(!file) return;
  try{
    const cv = await SHB_PHOTO.loadFile(file);
    photoSession = SHB_PHOTO.session(cv);
    openModal('#modalPhoto');
    drawPhoto(); renderPhotoPanel();
  }catch(err){
    console.error(err); toast(t('errPhoto'));
  }
}

function editPhoto(id){
  const p = (design.photos||[]).concat(design.boardPhotos||[]).find(x=>x.id===id);
  if(!p) return;
  const img = new Image();
  img.onload = ()=>{
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    cv.getContext('2d').drawImage(img,0,0);
    photoSession = SHB_PHOTO.session(cv);
    photoTarget = {mode:'replace', id};
    openModal('#modalPhoto');
    drawPhoto(); renderPhotoPanel();
  };
  img.onerror = ()=>toast(t('errPhoto'));
  img.src = p.src;
}

let photoMode = 'none';    // 'pick' | 'erase' | 'restore'
let brushSize = 24;

function drawPhoto(){
  const cv = $('#photoCanvas');
  const pv = photoSession.preview();
  cv.width = pv.width; cv.height = pv.height;
  const x = cv.getContext('2d');
  /* Schachbrett als Hinweis auf Transparenz */
  const s = 12;
  for(let yy=0; yy<cv.height; yy+=s)
    for(let xx=0; xx<cv.width; xx+=s){
      x.fillStyle = ((xx/s + yy/s) % 2) ? '#2A2724' : '#221F1C';
      x.fillRect(xx,yy,s,s);
    }
  x.drawImage(pv,0,0);
}

function renderPhotoPanel(){
  const st = photoSession.state;
  const p = $('#photoPanel');
  p.innerHTML = `
    <div class="d-acts">
      <button type="button" class="btn btn-outline" id="phRot">${escapeHtml(t('pRotate'))} 90°</button>
      <button type="button" class="btn btn-outline${photoMode==='pick'?' is-on':''}" id="phPick">${escapeHtml(t('pCutPick'))}</button>
      <button type="button" class="btn btn-outline" id="phAuto">${escapeHtml(t('pCutAuto'))}</button>
      <button type="button" class="btn btn-outline${photoMode==='erase'?' is-on':''}" id="phErase">${escapeHtml(t('pEraser'))}</button>
      <button type="button" class="btn btn-outline${photoMode==='restore'?' is-on':''}" id="phRestore">${escapeHtml(t('pRestore'))}</button>
    </div>
    ${photoMode==='pick' ? `<p class="hint">${escapeHtml(t('pCutPickOn'))}</p>` : ''}
    ${slider(t('pTolerance'),'phTol',4,120,1,st.tol,'')}
    ${slider(t('pFeather'),'phFeather',0,6,1,st.feather,' px')}
    ${(photoMode==='erase'||photoMode==='restore') ? slider(t('pBrush'),'phBrush',6,120,2,brushSize,' px') : ''}
    ${slider(t('pBright'),'phBright',-60,60,1,st.bright,' %')}
    ${slider(t('pContrast'),'phContrast',-60,60,1,st.contrast,' %')}
    ${slider(t('pSat'),'phSat',-100,100,1,st.sat,' %')}
    <label class="check"><input type="checkbox" id="phRound"${st.round?' checked':''}>
      <span>${escapeHtml(t('pRound'))}</span></label>`;

  const q = sel => p.querySelector(sel);
  q('#phRot').addEventListener('click', ()=>{
    photoSession.set('rot', (photoSession.state.rot+90)%360);
    photoSession.rebuild(false); drawPhoto();
  });
  q('#phPick').addEventListener('click', ()=>{ photoMode = photoMode==='pick'?'none':'pick'; renderPhotoPanel(); });
  q('#phErase').addEventListener('click', ()=>{ photoMode = photoMode==='erase'?'none':'erase'; renderPhotoPanel(); });
  q('#phRestore').addEventListener('click', ()=>{ photoMode = photoMode==='restore'?'none':'restore'; renderPhotoPanel(); });
  q('#phAuto').addEventListener('click', ()=>{ photoSession.autoCut(); drawPhoto(); });

  const range = (id, fn)=>{
    const el = q('#'+id); if(!el) return;
    const out = q('#'+id+'Out');
    el.addEventListener('input', ()=>{ if(out) out.firstChild && (out.textContent = el.value + (out.textContent.replace(/^-?[\d.]+/,''))); fn(+el.value); });
  };
  range('phTol',   v=>{ photoSession.setTolerance(v); drawPhoto(); });
  range('phFeather',v=>{ photoSession.set('feather', v); });
  range('phBrush', v=>{ brushSize = v; });
  range('phBright',v=>{ photoSession.set('bright', v); photoSession.rebuild(true); drawPhoto(); });
  range('phContrast',v=>{ photoSession.set('contrast', v); photoSession.rebuild(true); drawPhoto(); });
  range('phSat',   v=>{ photoSession.set('sat', v); photoSession.rebuild(true); drawPhoto(); });
  q('#phRound').addEventListener('change', e=>photoSession.set('round', e.target.checked));

  bindPhotoCanvas();
}

function bindPhotoCanvas(){
  const cv = $('#photoCanvas');
  if(cv.dataset.bound) return;
  cv.dataset.bound = '1';
  cv.style.touchAction = 'none';
  let down = false;
  const pos = ev=>{
    const r = cv.getBoundingClientRect();
    return { x: Math.round((ev.clientX-r.left)*cv.width/r.width),
             y: Math.round((ev.clientY-r.top)*cv.height/r.height) };
  };
  const paint = ev=>{
    const p = pos(ev);
    if(photoMode==='erase')   photoSession.brush(p.x,p.y,brushSize,0);
    if(photoMode==='restore') photoSession.brush(p.x,p.y,brushSize,255);
    drawPhoto();
  };
  cv.addEventListener('pointerdown', ev=>{
    const p = pos(ev);
    if(photoMode==='pick'){ photoSession.flood(p.x,p.y,true); drawPhoto(); return; }
    if(photoMode==='erase' || photoMode==='restore'){ down = true; cv.setPointerCapture(ev.pointerId); paint(ev); }
  });
  cv.addEventListener('pointermove', ev=>{ if(down) paint(ev); });
  cv.addEventListener('pointerup',   ()=>{ down = false; });
  cv.addEventListener('pointercancel',()=>{ down = false; });
}

async function applyPhoto(){
  if(!photoSession) return;
  const out = photoSession.output();
  const th  = await SHB_PHOTO.thumb(out.src, 220);
  const ratio = out.h/out.w;

  if(photoTarget && photoTarget.mode==='replace'){
    const p = (design.photos||[]).concat(design.boardPhotos||[]).find(x=>x.id===photoTarget.id);
    if(p){ p.src = out.src; p.thumb = th; p.ratio = ratio; p.h = Math.round((p.w||260)*ratio); }
  }else{
    const id = D.newId('p');
    design.photos.push({id, src:out.src, thumb:th, ratio, w:260, h:Math.round(260*ratio),
                        x:500, y:420, rot:0, round:false, z:topZ()+1});
    selected = id;
  }
  photoTarget = null; photoSession = null; photoMode = 'none';
  closeModal($('#modalPhoto'));
  renderCanvas(); renderPanel();
  save();
}

/* ==========================================================================
 * 5. Ausgaben
 * ========================================================================== */

/** SVG in ein PNG umwandeln (für Download, PDF und Versand). */
function toPng(px){
  const size = px || 1600;
  const svg  = D.buildSvg(design, {width:size, height:size});
  const blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>{
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      const x = c.getContext('2d');
      x.fillStyle = '#FFFFFF'; x.fillRect(0,0,size,size);
      x.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = e=>{ URL.revokeObjectURL(url); rej(e); };
    img.src = url;
  });
}

async function exportPng(){
  try{
    const data = await toPng(1600);
    const a = document.createElement('a');
    a.href = data; a.download = fileBase() + '.jpg';
    document.body.appendChild(a); a.click(); a.remove();
    toast(t('msgPdfSaved'));
  }catch(e){ console.error(e); toast(t('errPdf')); }
}

function fileBase(){
  const n = SHB_PDF.safeName(state.meta.auftragsnummer || state.meta.kundenname || 'Entwurf');
  return 'Torten-Entwurf_' + (n || 'SHB');
}

/** Vorlage als PDF.
 *  mode 'intern' → Produktionsvorlage mit allen Angaben
 *  mode 'kunde'  → eine Seite Vorschau, ohne interne Hinweise */
async function exportPdf(mode){
  const btns = [$('#btnDesignPdf'), $('#btnDesignShare')];
  btns.forEach(b=>b && (b.disabled = true));
  toast(t('pdfBusy'));
  try{
    await SHB_PDF.ensure();
    const img = await toPng(1400);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4', compress:true});
    SHB_PDF.registerFonts(doc);
    const C = SHB_PDF.C, F = SHB_PDF.F, P = SHB_PDF.PAGE, M = SHB_PDF.M;
    const W = P.w - M.l - M.r;
    const co = {...DEFAULT_COMPANY, ...(settings.company||{})};
    const set = (f,st,sz,c)=>{ doc.setFont(f,st); doc.setFontSize(sz); doc.setTextColor(c[0],c[1],c[2]); };

    let y = M.t + 2;
    set(F.serif,'normal',19,C.gold);
    doc.text(co.name.toUpperCase(), P.w/2, y, {align:'center', charSpace:1.1});
    y += 5;
    set(F.sans,'normal',7.5,C.gray);
    doc.text((mode==='kunde' ? t('tplPreviewTitle') : t('tplTitle')).toUpperCase(),
             P.w/2, y, {align:'center', charSpace:1.4});
    y += 4.5;
    doc.setDrawColor(...C.gold); doc.setLineWidth(0.4);
    doc.line(P.w/2-18, y, P.w/2+18, y);
    y += 8;

    /* Kopfzeile mit Kunde und Termin */
    const meta = [
      [t('tplCustomer'), state.meta.kundenname],
      [t('tplDelivery'), SHB_PDF.dateStr(state.meta.lieferdatum)],
      [t('tplPortions'), num(state.cake.portionen) ? String(num(state.cake.portionen)) : '']
    ].filter(r=>r[1]);
    if(meta.length){
      set(F.sans,'normal',9,C.ink2);
      doc.text(meta.map(r=>r[0]+': '+r[1]).join('     ·     '), P.w/2, y, {align:'center', maxWidth:W});
      y += 7;
    }

    /* Zeichnung */
    const iw = mode==='kunde' ? 150 : 108;
    doc.addImage(img, 'JPEG', (P.w-iw)/2, y, iw, iw);
    y += iw + 7;

    const s = D.summary(design, translations[lang]);

    if(mode==='kunde'){
      set(F.sans,'normal',9,C.ink2);
      const note = doc.splitTextToSize(t('tplPreviewNote'), W-20);
      note.forEach(l=>{ doc.text(l, P.w/2, y, {align:'center'}); y += 5; });
      if(design.notes){
        y += 3; set(F.sans,'normal',9.5,C.ink);
        doc.splitTextToSize(design.notes, W-20).forEach(l=>{ doc.text(l, P.w/2, y, {align:'center'}); y += 5; });
      }
    }else{
      const block = (title, lines)=>{
        if(!lines.length) return;
        set(F.sans,'normal',7.5,C.gray);
        doc.text(title.toUpperCase(), M.l, y, {charSpace:.8}); y += 3.4;
        doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
        doc.line(M.l, y, P.w-M.r, y); y += 5;
        set(F.sans,'normal',9.3,C.ink);
        lines.forEach(l=>{
          doc.splitTextToSize(l, W).forEach(t2=>{ doc.text(t2, M.l, y); y += 4.6; });
        });
        y += 4;
      };
      block(t('tplSpecs'), s.rows.map(r=>r[0]+':   '+r[1]));
      block(t('tplDeco'),  s.decoList);
      block(t('tplText'),  s.texts);
      /* Farbfelder */
      if(s.colors.length){
        set(F.sans,'normal',7.5,C.gray);
        doc.text(t('tplColors').toUpperCase(), M.l, y, {charSpace:.8}); y += 4;
        let cx2 = M.l;
        s.colors.forEach(c=>{
          if(cx2 + 26 > P.w - M.r){ cx2 = M.l; y += 15; }
          doc.setFillColor(c); doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
          doc.rect(cx2, y, 11, 9, 'FD');
          set(F.sans,'normal',6.6,C.gray);
          doc.text(c, cx2, y+12.6);
          cx2 += 26;
        });
        y += 20;
      }
      block(t('tplNotes'), design.notes ? [design.notes] : []);
    }

    /* Fusszeile */
    const fy = P.h - M.b + 4;
    doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
    doc.line(M.l, fy-5, P.w-M.r, fy-5);
    set(F.sans,'normal',7.4,C.gray);
    doc.text([co.name, [co.zip, co.city].filter(Boolean).join(' '), co.phone, co.mail, co.insta]
             .filter(Boolean).join('  ·  '), P.w/2, fy, {align:'center', maxWidth:W});

    const name = fileBase() + (mode==='kunde' ? '_Vorschau.pdf' : '_Vorlage.pdf');

    if(mode==='kunde'){
      const blob = doc.output('blob');
      const file = new File([blob], name, {type:'application/pdf'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try{
          await navigator.share({files:[file], title:t('shareTitle'),
                                 text:tf('shareText',{name:state.meta.kundenname||''})});
          toast(t('msgPdfShared')); return;
        }catch(err){ if(err && err.name==='AbortError') return; }
      }
      doc.save(name); toast(t('msgPdfSaved'));
    }else{
      doc.save(name); toast(t('msgPdfSaved'));
    }
  }catch(e){
    console.error('Design-PDF:', e); toast(t('errPdf'));
  }finally{
    btns.forEach(b=>b && (b.disabled = false));
  }
}

/* ==========================================================================
 * 6. Verbindung zur Kalkulation
 * ========================================================================== */

/** Masse aus der Kalkulation übernehmen, wenn der Entwurf noch leer ist. */
function seedFromCalc(){
  const base = state.cake.groesse==='custom' ? num(state.cake.groesseCustom) : num(state.cake.groesse);
  const etagen = Math.min(num(state.cake.etagen)+1, 5);
  const h = num(state.cake.hoehe) || 10;
  if(base > 0){
    design.tiers = [];
    for(let i=0;i<etagen;i++){
      design.tiers.push(D.blankTier(Math.max(6, base - i*4), Math.max(5, h - i), i%2 ? '#F3E9DC' : '#FBF6EF'));
    }
  }
  const shapeMap = {0:'rund',1:'quadrat',2:'quadrat',3:'herz',4:'rund'};
  design.shape = shapeMap[num(state.cake.form)] || 'rund';
}

/** Dekorationselemente als Positionen in die Kalkulation schreiben. */
function toCalculation(){
  const groups = {};
  (design.elements||[]).forEach(e=>{ groups[e.type] = (groups[e.type]||0)+1; });
  const keys = Object.keys(groups);
  if(!keys.length){ toast(t('dToCalcNone')); return; }

  /* Zuordnung der Entwurfselemente zu den Kategorien der Kalkulation */
  const catMap = {
    blume:'blumen', rose:'zuckerblumen', zweig:'blumen', beeren:'fruechte',
    macaron:'sonstiges', perlen:'perlen', blattgold:'blattgold', kerze:'sonstiges',
    schleife:'fondant', stern:'sonstiges', herz:'sonstiges', krone:'krone',
    schmetterling:'sonstiges', topper:'topper'
  };
  keys.forEach(k=>{
    state.deko.push({
      cat: catMap[k] || 'sonstiges',
      desc: t('els.'+k),
      mode: 'stueck',
      material: 0,
      anzahl: groups[k],
      minuten: 0,
      rate: settings.stundenansatz
    });
  });
  /* leere Startzeile entfernen */
  state.deko = state.deko.filter((d,i)=> i>0 || d.desc || num(d.material)>0 || num(d.minuten)>0);
  renderDeco(); update();
  toast(tf('dToCalcDone',{n:keys.length}));
}

/* ==========================================================================
 * 7. Speichern
 * ========================================================================== */
function save(){
  state.design = design;
  updateCard();
  try{ persist(); }
  catch(e){ console.warn(e); toast(t('errStorage')); }
}

/** Vorschau in der Karte auf der Startseite. */
function updateCard(){
  const box = $('#designPreview');
  if(!box) return;
  const has = state.design && ((state.design.elements||[]).length || (state.design.texts||[]).length
              || (state.design.photos||[]).length || (state.design.tiers||[]).length);
  if(!has){ box.innerHTML = `<p class="hint">${escapeHtml(t('designEmpty'))}</p>`; return; }
  box.innerHTML = D.buildSvg(state.design, {width:'100%', height:'100%'});
  const svg = box.querySelector('svg');
  svg.style.width = '100%'; svg.style.height = 'auto';
}

/* ==========================================================================
 * 8. Öffnen
 * ========================================================================== */
function open(){
  buildEditor();
  if(!state.design){ state.design = D.blankDesign(); seedFromCalcSafe(); }
  design = state.design;
  selected = null; tab = 'tiers'; syncTabs();
  applyI18n();
  openModal('#modalDesign');
  renderCanvas(); renderPanel();
}
function seedFromCalcSafe(){ design = state.design; try{ seedFromCalc(); }catch(e){ console.warn(e); } }

/* ---- Anbindung an die Startseite ---- */
document.addEventListener('DOMContentLoaded', ()=>{
  const btn = $('#btnDesign');
  if(btn) btn.addEventListener('click', open);
  const nav = $('#btnDesignNav');
  if(nav) nav.addEventListener('click', open);
  const btnCalc = $('#btnDesignToCalc');
  if(btnCalc) btnCalc.addEventListener('click', ()=>{ design = state.design || D.blankDesign(); toCalculation(); });
  setTimeout(updateCard, 60);
});

window.SHB_DESIGN_UI = { open, updateCard, toCalculation };

})();
