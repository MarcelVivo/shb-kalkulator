/* ==========================================================================
 * Sweet Home Bakery · Torten-Design-Konfigurator
 * --------------------------------------------------------------------------
 * Entwurf einer Torte als SVG: Etagen, Farben, Muster, Dekoration,
 * Schriftzug und freigestellte Fotos. Daraus entstehen zwei Ausgaben —
 * eine Produktionsvorlage für die Küche und eine Vorschau für die Kundschaft.
 *
 * Warum SVG und nicht Canvas: die Zeichnung bleibt in jeder Grösse scharf,
 * lässt sich als Text speichern, im Projekt ablegen und verlustfrei drucken.
 * Nur die Fotobearbeitung braucht Pixelzugriff — sie läuft über ein
 * verstecktes Canvas und liefert ein fertiges PNG zurück.
 *
 * Baut auf den globalen Funktionen aus app.js auf (t, num, $, toast, state).
 * ========================================================================== */

'use strict';

var SHB_DESIGN = (function(){

/* ==========================================================================
 * 1. Übersetzungen (werden in die Struktur aus app.js eingehängt)
 * ========================================================================== */
const DESIGN_TX = {
  de:{
    secDesign:'Torten-Design',
    designOpen:'Design öffnen', designHint:'Entwirf die Torte, lege Fotos und Schriftzug fest und schicke der Kundschaft eine Vorschau.',
    designEmpty:'Noch kein Entwurf angelegt.',
    designSaved:'Entwurf gespeichert.',
    tabTiers:'Etagen', tabDeco:'Dekor', tabText:'Schrift', tabPhoto:'Fotos', tabSel:'Auswahl',
    dTier:'Etage', dAddTier:'Etage hinzufügen', dRemoveTier:'Etage entfernen',
    dDiameter:'Durchmesser (cm)', dHeight:'Höhe (cm)', dShape:'Form',
    dFill:'Oberfläche', dColor:'Farbe', dColor2:'Zweite Farbe', dPattern:'Muster',
    fills:{farbe:'Einfarbig', ombre:'Verlauf', muster:'Muster'},
    patterns:{
      streifen:'Streifen', punkte:'Punkte', karo:'Karo', spitze:'Spitze',
      marmor:'Marmor', rustikal:'Rustikal', herzen:'Herzen', sterne:'Sterne', gold:'Goldsprenkel'
    },
    dDrip:'Drip (Tropfenrand)', dDripColor:'Drip-Farbe', dBoard:'Cake Board',
    dElements:'Dekorationselemente', dTapToAdd:'Antippen zum Hinzufügen',
    els:{
      blume:'Blüte', rose:'Rose', zweig:'Eukalyptuszweig', beeren:'Beeren',
      macaron:'Macaron', perlen:'Perlenkette', blattgold:'Blattgold', kerze:'Kerze',
      schleife:'Schleife', stern:'Stern', herz:'Herz', krone:'Krone',
      schmetterling:'Schmetterling', topper:'Cake Topper'
    },
    dText:'Schriftzug', dTextContent:'Text', dFont:'Schrift', dSize:'Grösse',
    dAddText:'Schriftzug hinzufügen',
    dPhotoAdd:'Foto hochladen', dPhotoBoard:'Als Referenz ins Moodboard',
    dPhotoCake:'Auf die Torte legen', dPhotoEdit:'Bearbeiten', dPhotoNone:'Noch keine Fotos.',
    dSelNone:'Nichts ausgewählt. Tippe ein Element in der Zeichnung an.',
    dMove:'Verschieben', dScale:'Grösse', dRotate:'Drehung', dLayerUp:'Nach vorne',
    dLayerDown:'Nach hinten', dDuplicate:'Duplizieren', dDelete:'Entfernen',
    dNotes:'Notizen zur Umsetzung',
    dExportPng:'Bild speichern', dExportPdf:'Vorlage als PDF', dSend:'An Kundschaft senden',
    dToCalc:'Dekoration in die Kalkulation übernehmen',
    dToCalcDone:'{n} Positionen in den Dekorationsbereich übernommen.',
    dToCalcNone:'Keine Dekorationselemente im Entwurf.',
    /* Fotobearbeitung */
    pTitle:'Foto bearbeiten', pCrop:'Zuschneiden', pRotate:'Drehen',
    pBright:'Helligkeit', pContrast:'Kontrast', pSat:'Sättigung',
    pCut:'Freistellen', pCutAuto:'Hintergrund automatisch entfernen',
    pCutPick:'Hintergrund antippen', pCutPickOn:'Tippe im Bild auf den Hintergrund',
    pTolerance:'Toleranz', pFeather:'Kante weich', pEraser:'Radieren', pRestore:'Zurückholen',
    pBrush:'Pinselgrösse', pReset:'Zurücksetzen', pApply:'Übernehmen',
    pRound:'Rund zuschneiden', pCutHint:'Am besten gelingt das Freistellen bei Fotos mit ruhigem, einfarbigem Hintergrund.',
    /* Vorlage */
    tplTitle:'Torten-Vorlage', tplCustomer:'Entwurf für', tplSpecs:'Aufbau',
    tplColors:'Farben', tplDeco:'Dekoration', tplText:'Schriftzug', tplNotes:'Notizen',
    tplRef:'Referenzfotos', tplPreviewTitle:'So ist die Torte geplant',
    tplPreviewNote:'Der Entwurf zeigt die Gestaltung. Handgefertigte Dekoration kann im Detail abweichen.',
    tplTier:'Etage {n}', tplShape:'Form', tplPortions:'Portionen', tplDelivery:'Lieferdatum',
    shareTitle:'Torten-Entwurf Sweet Home Bakery',
    shareText:'Guten Tag {name}, so habe ich mir Ihre Torte vorgestellt. Herzliche Grüsse',
    errStorage:'Der Speicher ist voll. Entferne ein Foto oder wähle kleinere Bilder.',
    errPhoto:'Das Bild konnte nicht geladen werden.'
  },
  ua:{
    secDesign:'Дизайн торта',
    designOpen:'Відкрити дизайн', designHint:'Створи ескіз торта, додай фото та напис — і надішли клієнту попередній вигляд.',
    designEmpty:'Ескіз ще не створено.',
    designSaved:'Ескіз збережено.',
    tabTiers:'Яруси', tabDeco:'Декор', tabText:'Напис', tabPhoto:'Фото', tabSel:'Вибране',
    dTier:'Ярус', dAddTier:'Додати ярус', dRemoveTier:'Видалити ярус',
    dDiameter:'Діаметр (см)', dHeight:'Висота (см)', dShape:'Форма',
    dFill:'Поверхня', dColor:'Колір', dColor2:'Другий колір', dPattern:'Візерунок',
    fills:{farbe:'Однотонна', ombre:'Градієнт', muster:'Візерунок'},
    patterns:{
      streifen:'Смуги', punkte:'Крапки', karo:'Клітинка', spitze:'Мереживо',
      marmor:'Мармур', rustikal:'Рустик', herzen:'Сердечка', sterne:'Зірочки', gold:'Золоті крапки'
    },
    dDrip:'Патьоки', dDripColor:'Колір патьоків', dBoard:'Підкладка',
    dElements:'Елементи декору', dTapToAdd:'Натисни, щоб додати',
    els:{
      blume:'Квітка', rose:'Троянда', zweig:'Гілка евкаліпта', beeren:'Ягоди',
      macaron:'Макарон', perlen:'Намисто', blattgold:'Сусальне золото', kerze:'Свічка',
      schleife:'Бант', stern:'Зірка', herz:'Серце', krone:'Корона',
      schmetterling:'Метелик', topper:'Топер'
    },
    dText:'Напис', dTextContent:'Текст', dFont:'Шрифт', dSize:'Розмір',
    dAddText:'Додати напис',
    dPhotoAdd:'Завантажити фото', dPhotoBoard:'До дошки натхнення',
    dPhotoCake:'Покласти на торт', dPhotoEdit:'Редагувати', dPhotoNone:'Фото ще немає.',
    dSelNone:'Нічого не вибрано. Натисни елемент на малюнку.',
    dMove:'Пересунути', dScale:'Розмір', dRotate:'Поворот', dLayerUp:'Наперед',
    dLayerDown:'Назад', dDuplicate:'Дублювати', dDelete:'Видалити',
    dNotes:'Нотатки щодо виконання',
    dExportPng:'Зберегти зображення', dExportPdf:'Шаблон у PDF', dSend:'Надіслати клієнту',
    dToCalc:'Перенести декор у розрахунок',
    dToCalcDone:'{n} позицій перенесено до розділу декору.',
    dToCalcNone:'В ескізі немає елементів декору.',
    pTitle:'Редагувати фото', pCrop:'Обрізати', pRotate:'Повернути',
    pBright:'Яскравість', pContrast:'Контраст', pSat:'Насиченість',
    pCut:'Вирізати фон', pCutAuto:'Прибрати фон автоматично',
    pCutPick:'Натисни на фон', pCutPickOn:'Натисни на фон у зображенні',
    pTolerance:'Допуск', pFeather:'Мʼякий край', pEraser:'Стерти', pRestore:'Повернути',
    pBrush:'Розмір пензля', pReset:'Скинути', pApply:'Застосувати',
    pRound:'Обрізати колом', pCutHint:'Найкраще виходить із фото на спокійному однотонному тлі.',
    tplTitle:'Шаблон торта', tplCustomer:'Ескіз для', tplSpecs:'Будова',
    tplColors:'Кольори', tplDeco:'Декор', tplText:'Напис', tplNotes:'Нотатки',
    tplRef:'Референсні фото', tplPreviewTitle:'Так запланований торт',
    tplPreviewNote:'Ескіз показує задум. Декор ручної роботи може дещо відрізнятися в деталях.',
    tplTier:'Ярус {n}', tplShape:'Форма', tplPortions:'Порції', tplDelivery:'Дата доставки',
    shareTitle:'Ескіз торта Sweet Home Bakery',
    shareText:'Доброго дня, {name}! Ось як я уявляю ваш торт. З найкращими побажаннями',
    errStorage:'Памʼять переповнена. Прибери одне фото або обери менші зображення.',
    errPhoto:'Не вдалося завантажити зображення.'
  }
};

/* ==========================================================================
 * 2. Kataloge · Farben, Muster, Schriften, Dekorationselemente
 * ========================================================================== */

/** Abgestimmte Palette – Tortentöne, keine grellen Farben. */
const PALETTE = [
  '#FFFFFF','#FBF6EF','#F3E9DC','#EADBC8','#E4CDB3','#D8B996',
  '#F7E4E4','#EFC9C6','#DDA9A4','#C48B86','#A3625E','#7E4A47',
  '#EAF0EA','#C9D8C6','#9DB79A','#6F8B6C','#4E6A4C','#33472F',
  '#E8EEF4','#C7D6E4','#9BB4CB','#6E8CA8','#4A6C8A','#2E4257',
  '#F2E6F0','#DDC4DA','#BE9BBA','#96718F','#6E4E6B','#2A2724',
  '#F6EFD9','#E9D9A8','#D9BE6E','#C9A227','#9C7B18','#6E5610'
];

const FILL_KINDS   = ['farbe','ombre','muster'];
const PATTERN_KEYS = ['streifen','punkte','karo','spitze','marmor','rustikal','herzen','sterne','gold'];
const SHAPES       = ['rund','quadrat','herz'];

/** Schriften für den Tortenschriftzug. Jede Angabe ist ein Stapel mit
 *  Rückfallebenen, damit auch ohne Internet etwas Passendes erscheint. */
const FONTS = [
  {key:'script',  label:'Schreibschrift', stack:"'Snell Roundhand','Segoe Script','Brush Script MT',cursive"},
  {key:'serif',   label:'Klassisch',      stack:"'Cormorant Garamond',Georgia,'Times New Roman',serif"},
  {key:'sans',    label:'Modern',         stack:"'Inter','Helvetica Neue',Arial,sans-serif"},
  {key:'display', label:'Elegant breit',  stack:"'Didot','Bodoni 72','Playfair Display',Georgia,serif"},
  {key:'round',   label:'Freundlich',     stack:"'Avenir Next','Trebuchet MS','Verdana',sans-serif"},
  {key:'mono',    label:'Schlicht',       stack:"'SF Mono','Courier New',monospace"}
];

const ELEMENT_KEYS = ['blume','rose','zweig','beeren','macaron','perlen','blattgold',
                      'kerze','schleife','stern','herz','krone','schmetterling','topper'];

/* --- Dekorationselemente: gezeichnet in einem Feld von 100 × 100 --- */
function elementSvg(type, color){
  const c = color || '#C9A227';
  const dark  = shade(c, -0.22);
  const light = shade(c,  0.30);
  switch(type){
    case 'blume':
      return petals(5, c, light) +
        `<circle cx="50" cy="50" r="9" fill="${dark}"/>`;
    case 'rose':{
      /* Gefüllte Rose: äusserer Blütenkranz, innerer Kranz, gedrehte Mitte */
      const ring = (n, rx, ry, dist, fill, off)=>{
        let s2 = '';
        for(let i=0;i<n;i++){
          const a = off + i*360/n;
          s2 += `<ellipse cx="50" cy="${50-dist}" rx="${rx}" ry="${ry}" fill="${fill}"
                   transform="rotate(${a} 50 50)"/>`;
        }
        return s2;
      };
      return ring(6, 15, 19, 20, c, 0)
           + ring(5, 11, 14, 13, shade(c, .16), 34)
           + ring(4, 8, 10, 7, light, 18)
           + `<circle cx="50" cy="50" r="7" fill="${dark}"/>
              <path d="M50 44a6 6 0 1 1-6 6" fill="none" stroke="${light}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    case 'zweig':
      return `<g stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round">
        <path d="M18 82C34 66 52 44 82 20"/></g>` +
        [0,1,2,3,4].map(i=>{
          const t = .15 + i*.17, x = 18 + (82-18)*t, y = 82 - (82-20)*t;
          return `<ellipse cx="${x-8}" cy="${y-4}" rx="11" ry="7" fill="${c}" transform="rotate(${-38+i*4} ${x-8} ${y-4})"/>
                  <ellipse cx="${x+6}" cy="${y+7}" rx="10" ry="6.5" fill="${light}" transform="rotate(${18+i*3} ${x+6} ${y+7})"/>`;
        }).join('');
    case 'beeren':
      return `<circle cx="38" cy="58" r="16" fill="${c}"/><circle cx="63" cy="49" r="13" fill="${dark}"/>
              <circle cx="55" cy="72" r="11" fill="${light}"/>
              <circle cx="33" cy="52" r="4" fill="#fff" opacity=".45"/>`;
    case 'macaron':
      return `<path d="M14 46a36 22 0 0 1 72 0z" fill="${c}"/>
              <path d="M14 54a36 22 0 0 0 72 0z" fill="${c}"/>
              <rect x="14" y="45" width="72" height="10" rx="4" fill="${light}"/>`;
    case 'perlen':
      return [0,1,2,3,4,5].map(i=>
        `<circle cx="${12+i*15.5}" cy="${50+Math.sin(i*1.1)*9}" r="${7-(i%2)*1.4}" fill="${c}"/>`).join('') +
        [0,1,2,3,4,5].map(i=>
        `<circle cx="${10+i*15.5}" cy="${47+Math.sin(i*1.1)*9}" r="2" fill="#fff" opacity=".5"/>`).join('');
    case 'blattgold':
      return `<path d="M22 62 34 30l16 12 14-20 16 26-12 24-24-6z" fill="${c}"/>
              <path d="M34 30l16 12-6 20z" fill="${light}" opacity=".8"/>
              <path d="M64 22l16 26-14 4z" fill="${dark}" opacity=".7"/>`;
    case 'kerze':
      return `<rect x="42" y="34" width="16" height="52" rx="4" fill="${c}"/>
              <rect x="42" y="34" width="6" height="52" fill="${light}" opacity=".55"/>
              <path d="M50 34c0-8-7-9-7-16 5 3 12 6 12 14 0 1 0 2-5 2z" fill="#E8A33D"/>
              <path d="M50 30c0-4-3-5-3-8 3 2 6 3 6 6 0 1 0 2-3 2z" fill="#F6D77A"/>`;
    case 'schleife':
      return `<path d="M50 50 20 32c-8 6-8 24 0 30z" fill="${c}"/>
              <path d="M50 50 80 32c8 6 8 24 0 30z" fill="${c}"/>
              <path d="M50 50 38 82l14-8 14 8z" fill="${dark}"/>
              <circle cx="50" cy="50" r="8" fill="${light}"/>`;
    case 'stern':
      return `<path d="${starPath(50,50,34,15,5)}" fill="${c}"/>`;
    case 'herz':
      return `<path d="M50 84C24 64 16 52 16 39a20 20 0 0 1 34-11 20 20 0 0 1 34 11c0 13-8 25-34 45z" fill="${c}"/>`;
    case 'krone':
      return `<path d="M18 72h64l6-38-20 14-18-24-18 24-20-14z" fill="${c}"/>
              <rect x="18" y="72" width="64" height="10" rx="3" fill="${dark}"/>
              <circle cx="50" cy="38" r="5" fill="${light}"/><circle cx="26" cy="44" r="4" fill="${light}"/>
              <circle cx="74" cy="44" r="4" fill="${light}"/>`;
    case 'schmetterling':
      return `<ellipse cx="32" cy="38" rx="19" ry="15" fill="${c}" transform="rotate(-22 32 38)"/>
              <ellipse cx="68" cy="38" rx="19" ry="15" fill="${c}" transform="rotate(22 68 38)"/>
              <ellipse cx="36" cy="64" rx="14" ry="11" fill="${light}" transform="rotate(-14 36 64)"/>
              <ellipse cx="64" cy="64" rx="14" ry="11" fill="${light}" transform="rotate(14 64 64)"/>
              <rect x="47" y="32" width="6" height="42" rx="3" fill="${dark}"/>`;
    case 'topper':
      return `<rect x="47" y="52" width="6" height="40" rx="2" fill="${dark}"/>
              <path d="M12 14h76v34H12z" fill="${c}"/>
              <path d="M12 48l14-8h48l14 8z" fill="${dark}" opacity=".35"/>
              <rect x="18" y="22" width="64" height="4" rx="2" fill="${light}"/>
              <rect x="26" y="32" width="48" height="4" rx="2" fill="${light}"/>`;
    default:
      return `<circle cx="50" cy="50" r="30" fill="${c}"/>`;
  }
}
function petals(n, c, light){
  let s = '';
  for(let i=0;i<n;i++){
    const a = i*360/n;
    s += `<ellipse cx="50" cy="27" rx="14" ry="22" fill="${i%2?light:c}" transform="rotate(${a} 50 50)"/>`;
  }
  return s;
}
function starPath(cx,cy,ro,ri,pts){
  let d = '';
  for(let i=0;i<pts*2;i++){
    const r = i%2 ? ri : ro, a = (i*Math.PI/pts) - Math.PI/2;
    d += (i?'L':'M') + (cx+r*Math.cos(a)).toFixed(1) + ' ' + (cy+r*Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}

/** Farbe aufhellen (t > 0) oder abdunkeln (t < 0). */
function shade(hex, t){
  const h = String(hex).replace('#','');
  const n = h.length===3 ? h.split('').map(x=>x+x).join('') : h;
  let r = parseInt(n.slice(0,2),16), g = parseInt(n.slice(2,4),16), b = parseInt(n.slice(4,6),16);
  if(!isFinite(r)) return hex;
  const f = v => Math.max(0, Math.min(255, Math.round(t>0 ? v+(255-v)*t : v*(1+t))));
  return '#' + [f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

/* ==========================================================================
 * 3. Zustand des Entwurfs
 * ========================================================================== */
const VB = 1000;                       // Zeichenfläche 1000 × 1000
let uid = 0;
const newId = p => p + (++uid) + '_' + Math.random().toString(36).slice(2,6);

function blankDesign(){
  return {
    v:1,
    shape:'rund',
    board:'#EFE7DA',
    bg:'#FBF6EF',
    tiers:[ blankTier(20,12,'#FBF6EF'), blankTier(14,10,'#F3E9DC') ],
    drip:{on:false, color:'#C9A227'},
    elements:[],
    texts:[],
    photos:[],
    boardPhotos:[],
    notes:''
  };
}
function blankTier(d,h,color){
  return {d, h, fill:'farbe', color, color2:'#EADBC8', pattern:'punkte', patternColor:'#C9A227'};
}

/* ==========================================================================
 * 4. Zeichnung erzeugen
 * --------------------------------------------------------------------------
 * Reine Funktion: Entwurf rein, SVG-Text raus. Dadurch lässt sie sich
 * ausserhalb des Browsers rendern und prüfen.
 * ========================================================================== */
function buildSvg(d, opt){
  opt = opt || {};
  const showGuides = !!opt.guides;
  const sel        = opt.selected || null;

  const tiers = d.tiers.length ? d.tiers : [blankTier(20,12,'#FBF6EF')];
  const maxD  = Math.max(...tiers.map(t=>num2(t.d,20)), 10);
  const totH  = tiers.reduce((s,t)=>s+num2(t.h,10), 0) || 10;

  /* Massstab: breiteste Etage auf 62 % der Fläche, Gesamthöhe auf höchstens 52 % */
  const pxPerCm = Math.min( (VB*0.62)/maxD, (VB*0.52)/totH );
  const baseY   = VB*0.80;
  const cx      = VB/2;

  let defs = '', body = '', y = baseY;
  const layers = [];

  tiers.forEach((t,i)=>{
    const w = num2(t.d,20)*pxPerCm, h = num2(t.h,10)*pxPerCm;
    const x = cx - w/2, top = y - h;
    const pid = 'p'+i;

    /* Füllung bestimmen */
    let fill = t.color || '#FBF6EF';
    if(t.fill==='ombre'){
      defs += `<linearGradient id="g${i}" x1="0" y1="1" x2="0" y2="0">
                 <stop offset="0" stop-color="${esc(t.color)}"/>
                 <stop offset="1" stop-color="${esc(t.color2||shade(t.color,.35))}"/>
               </linearGradient>`;
      fill = `url(#g${i})`;
    }else if(t.fill==='muster'){
      defs += patternDef(pid, t.pattern, t.patternColor||'#C9A227', t.color||'#FBF6EF');
      fill = `url(#${pid})`;
    }

    body += tierShape(d.shape, x, top, w, h, fill, i);

    /* Drip nur auf der obersten Etage */
    if(d.drip && d.drip.on && i===tiers.length-1){
      body += dripPath(x, top, w, d.drip.color||'#C9A227');
    }
    layers.push({i, x, top, w, h});
    y = top;
  });

  /* Cake Board */
  const bw = maxD*pxPerCm*1.24, bh = 26;
  const board = `<ellipse cx="${cx}" cy="${baseY+8}" rx="${(bw/2).toFixed(1)}" ry="${(bh/2).toFixed(1)}"
                    fill="${esc(d.board||'#EFE7DA')}" />
                 <ellipse cx="${cx}" cy="${(baseY+4).toFixed(1)}" rx="${(bw/2).toFixed(1)}" ry="${(bh/2).toFixed(1)}"
                    fill="${esc(shade(d.board||'#EFE7DA', .18))}" />`;

  /* Fotos, Elemente und Schriftzüge in Reihenfolge ihrer Ebene */
  const movable = []
    .concat((d.photos||[]).map(o=>({kind:'photo', o})))
    .concat((d.elements||[]).map(o=>({kind:'element', o})))
    .concat((d.texts||[]).map(o=>({kind:'text', o})))
    .sort((a,b)=>(a.o.z||0)-(b.o.z||0));

  let overlay = '';
  movable.forEach(m=>{
    const o = m.o;
    const selected = sel && sel===o.id;
    /* x und y bezeichnen immer den Mittelpunkt – so bleibt das Ziehen
       mit dem Finger auch nach Drehung und Skalierung berechenbar. */
    if(m.kind==='photo'){
      const w = o.w||260, h = o.h||(w*(o.ratio||1));
      let clip = '';
      if(o.round){
        defs += `<clipPath id="c${o.id}"><ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}"/></clipPath>`;
        clip = ` clip-path="url(#c${o.id})"`;
      }
      overlay += `<g class="dz" data-id="${o.id}" data-kind="photo"
          transform="translate(${o.x} ${o.y}) rotate(${o.rot||0}) translate(${-w/2} ${-h/2})">
          <image href="${o.src}" xlink:href="${o.src}" x="0" y="0" width="${w}" height="${h}"
                 preserveAspectRatio="xMidYMid slice"${clip}/>
          ${selected?selBox(w,h):''}</g>`;
    }
    if(m.kind==='element'){
      const s = (o.s||1);
      overlay += `<g class="dz" data-id="${o.id}" data-kind="element"
          transform="translate(${o.x} ${o.y}) rotate(${o.rot||0}) scale(${s}) translate(-50 -50)">
          ${elementSvg(o.type, o.color)}
          ${selected?selBox(100,100):''}</g>`;
    }
    if(m.kind==='text'){
      const f  = FONTS.find(x=>x.key===o.font) || FONTS[0];
      const sz = o.size||64;
      overlay += `<g class="dz" data-id="${o.id}" transform="translate(${o.x} ${o.y}) rotate(${o.rot||0})">
          <text x="0" y="0" font-family="${f.stack}" font-size="${sz}" fill="${esc(o.color||'#C9A227')}"
                text-anchor="middle" dominant-baseline="middle"
                style="paint-order:stroke">${esc(o.content||'')}</text>
          ${selected?`<rect x="${-sz*3}" y="${-sz*0.8}" width="${sz*6}" height="${sz*1.6}"
                 fill="none" stroke="#C9A227" stroke-width="3" stroke-dasharray="10 8"/>`:''}</g>`;
    }
  });

  const guides = showGuides ? `
    <line x1="0" y1="${baseY}" x2="${VB}" y2="${baseY}" stroke="#C9A227" stroke-width="1" opacity=".25"/>
    <line x1="${cx}" y1="0" x2="${cx}" y2="${VB}" stroke="#C9A227" stroke-width="1" opacity=".18"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${VB} ${VB}" width="${opt.width||VB}" height="${opt.height||VB}">
  <defs>${defs}</defs>
  <rect width="${VB}" height="${VB}" fill="${esc(d.bg||'#FBF6EF')}"/>
  ${guides}
  ${board}
  ${body}
  ${overlay}
</svg>`;
}

function selBox(w,h){
  return `<rect x="-6" y="-6" width="${w+12}" height="${h+12}" fill="none"
            stroke="#C9A227" stroke-width="3" stroke-dasharray="10 8"/>`;
}

/** Kontur einer Etage je nach Tortenform. */
function tierShape(shape, x, y, w, h, fill, i){
  const rx = w/2, cx = x + rx;
  const edge = shade(typeof fill==='string' && fill.startsWith('#') ? fill : '#EADBC8', -0.10);
  if(shape==='herz' && i===0){
    // Herzform nur für die unterste Etage, darüber runde Etagen
    const p = `M${cx} ${y+h} C${x-w*0.10} ${y+h*0.55} ${x+w*0.12} ${y-h*0.18} ${cx} ${y+h*0.24}
               C${x+w*0.88} ${y-h*0.18} ${x+w*1.10} ${y+h*0.55} ${cx} ${y+h}Z`;
    return `<path d="${p}" fill="${fill}"/>`;
  }
  if(shape==='quadrat'){
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}"/>
            <rect x="${x}" y="${y}" width="${w}" height="7" rx="3" fill="${edge}" opacity=".55"/>`;
  }
  // rund: Zylinder mit elliptischer Deckfläche
  const ry = Math.max(8, w*0.085);
  return `<path d="M${x} ${y} v${h} a${rx} ${ry} 0 0 0 ${w} 0 v${-h}Z" fill="${fill}"/>
          <ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${shade(edge, .16)}"/>`;
}

/** Tropfenrand über der obersten Etage. */
function dripPath(x, top, w, color){
  const n = Math.max(6, Math.round(w/46));
  let d = `M${x} ${top+6}`;
  for(let i=0;i<n;i++){
    const seg = w/n, x0 = x + i*seg;
    const len = 26 + (i%3)*16 + (i%2)*10;
    d += ` q${seg*0.25} ${len} ${seg*0.5} 0 q${seg*0.25} ${-len*0.35} ${seg*0.5} 0`;
  }
  d += ` v-22 h${-w} Z`;
  return `<path d="${d}" fill="${esc(color)}" opacity=".95"/>`;
}

/** Musterdefinitionen als SVG-Kachel. */
function patternDef(id, kind, c, base){
  const b = esc(base), k = esc(c);
  const wrap = (size, inner) =>
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
       <rect width="${size}" height="${size}" fill="${b}"/>${inner}</pattern>`;
  switch(kind){
    case 'streifen': return wrap(34, `<rect x="0" y="0" width="14" height="34" fill="${k}" opacity=".85"/>`);
    case 'punkte':   return wrap(40, `<circle cx="12" cy="12" r="5" fill="${k}"/><circle cx="32" cy="32" r="5" fill="${k}"/>`);
    case 'karo':     return wrap(44, `<path d="M22 2 42 22 22 42 2 22Z" fill="none" stroke="${k}" stroke-width="3"/>`);
    case 'spitze':   return wrap(48, `<path d="M0 40q12 -18 24 0t24 0" fill="none" stroke="${k}" stroke-width="3"/>
                                       <circle cx="12" cy="18" r="3" fill="${k}"/><circle cx="36" cy="18" r="3" fill="${k}"/>`);
    case 'marmor':   return wrap(120,`<path d="M-10 40q40 -30 70 0t70 -10" fill="none" stroke="${k}" stroke-width="4" opacity=".55"/>
                                       <path d="M-10 84q34 24 62 -4t78 12" fill="none" stroke="${k}" stroke-width="3" opacity=".4"/>`);
    case 'rustikal': return wrap(60, `<path d="M0 10h60M0 26h60M0 42h60M0 58h60" stroke="${k}" stroke-width="6" opacity=".22"/>`);
    case 'herzen':   return wrap(54, `<path d="M27 42C15 32 11 27 11 21a7 7 0 0 1 16-5 7 7 0 0 1 16 5c0 6-4 11-16 21z" fill="${k}" opacity=".8"/>`);
    case 'sterne':   return wrap(56, `<path d="${starPath(28,28,13,6,5)}" fill="${k}" opacity=".85"/>`);
    case 'gold':     return wrap(70, `<circle cx="14" cy="18" r="3.5" fill="${k}"/><circle cx="46" cy="10" r="2.4" fill="${k}"/>
                                       <circle cx="30" cy="44" r="4" fill="${k}"/><circle cx="58" cy="52" r="2.8" fill="${k}"/>
                                       <circle cx="8" cy="56" r="2.2" fill="${k}"/>`);
    default:         return wrap(20, '');
  }
}

const num2 = (v,f)=>{ const n = parseFloat(v); return isFinite(n) && n>0 ? n : f; };
function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ==========================================================================
 * 5. Zusammenfassung für die Vorlage
 * ========================================================================== */
function summary(d, tr){
  const T = k => (tr && tr[k]) || k;
  const rows = [];
  d.tiers.forEach((t,i)=>{
    const fill = t.fill==='muster' ? (T('patterns.'+t.pattern) || t.pattern)
               : t.fill==='ombre'  ? `${t.color} → ${t.color2}` : t.color;
    rows.push([ (T('tplTier')||'Etage {n}').replace('{n}', i+1),
                `Ø ${num2(t.d,20)} cm · ${num2(t.h,10)} cm · ${fill}` ]);
  });
  if(d.drip && d.drip.on) rows.push([T('dDrip'), d.drip.color]);
  const els = {};
  (d.elements||[]).forEach(e=>{ els[e.type] = (els[e.type]||0)+1; });
  const decoList = Object.keys(els).map(k=>`${els[k]} × ${T('els.'+k)||k}`);
  const texts = (d.texts||[]).map(x=>{
    const f = FONTS.find(y=>y.key===x.font)||FONTS[0];
    return `«${x.content}» · ${f.label}`;
  });
  return {rows, decoList, texts, colors:colorList(d)};
}
function colorList(d){
  const set = [];
  const add = c => { if(c && set.indexOf(c)<0) set.push(c); };
  d.tiers.forEach(t=>{ add(t.color); if(t.fill==='ombre') add(t.color2); if(t.fill==='muster') add(t.patternColor); });
  if(d.drip && d.drip.on) add(d.drip.color);
  (d.elements||[]).forEach(e=>add(e.color));
  (d.texts||[]).forEach(t=>add(t.color));
  add(d.board);
  return set;
}

/* ==========================================================================
 * 6. Öffentliche Schnittstelle
 * ========================================================================== */
return {
  TX: DESIGN_TX,
  PALETTE, FILL_KINDS, PATTERN_KEYS, SHAPES, FONTS, ELEMENT_KEYS, VB,
  blankDesign, blankTier, buildSvg, elementSvg, patternDef, summary, shade, newId, esc
};

})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_DESIGN;
