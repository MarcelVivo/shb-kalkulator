/* ==========================================================================
 * Sweet Home Bakery · Offerten-PDF
 * --------------------------------------------------------------------------
 * Erzeugt aus einer Kalkulation eine druckreife A4-Offerte und übergibt sie
 * auf dem iPhone direkt an das Teilen-Menü (WhatsApp, Mail, AirDrop).
 *
 * jsPDF und die Schriften werden erst geladen, wenn zum ersten Mal ein PDF
 * erzeugt wird – der Start der App bleibt dadurch schnell.
 *
 * Öffentliche Schnittstelle:
 *   await SHB_PDF.build(data)   → jsPDF-Dokument
 *   await SHB_PDF.share(data)   → Teilen-Menü, sonst Download
 *   await SHB_PDF.save(data)    → Download
 * ========================================================================== */

var SHB_PDF = (function(){
  'use strict';

  /* ---------- Gestaltung ---------- */
  const PAGE = { w:210, h:297 };
  const M    = { l:20, r:20, t:14, b:18 };
  const C = {
    gold:[156,123,24],      // Druckgold, dunkel genug für Papier
    goldLight:[247,240,222],
    ink:[38,35,32],
    ink2:[92,85,77],
    gray:[130,122,112],
    line:[221,213,199],
    soft:[250,247,241]
  };
  const F = { serif:'SHBSerif', sans:'SHBSans' };

  let libsReady = null;
  let logoImg   = null;

  /* ---------- Nachladen von jsPDF, Schriften und Logo ---------- */
  function loadScript(src){
    return new Promise((res,rej)=>{
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = res;
      s.onerror = ()=>rej(new Error('Konnte '+src+' nicht laden'));
      document.head.appendChild(s);
    });
  }
  /* Logo als Data-URL laden. Über fetch statt <img>, damit jsPDF die Datei
     direkt einbetten kann und kein Canvas nötig ist. Schlägt das Laden fehl,
     wird die Offerte ohne Logo erzeugt statt gar nicht. */
  /* Für das PDF eine kleine JPEG-Fassung auf weissem Grund: jsPDF bettet JPEG
     unverändert ein, während transparente PNG als Rohbild landen und das
     Dokument auf mehrere hundert Kilobyte aufblähen würden. Die Offertenseite
     ist ohnehin weiss, das Ergebnis sieht identisch aus. */
  function loadLogo(){
    return fetch('shb-logo-pdf.jpg')
      .then(r=>{ if(!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b=>new Promise((res,rej)=>{
        const fr = new FileReader();
        fr.onload = ()=>res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(b);
      }))
      .catch(()=>null);
  }
  async function ensure(){
    if(libsReady) return libsReady;
    libsReady = (async()=>{
      if(!window.jspdf)      await loadScript('jspdf.umd.min.js');
      if(!window.SHB_PDF_FONTS) await loadScript('pdf-fonts.js');
      logoImg = await loadLogo();
    })();
    return libsReady;
  }

  /* ---------- Hilfsfunktionen ---------- */
  function registerFonts(doc){
    const f = window.SHB_PDF_FONTS;
    doc.addFileToVFS('shb-serif-regular.ttf', f['shb-serif-regular']);
    doc.addFont('shb-serif-regular.ttf', F.serif, 'normal');
    doc.addFileToVFS('shb-serif-bold.ttf', f['shb-serif-bold']);
    doc.addFont('shb-serif-bold.ttf', F.serif, 'bold');
    doc.addFileToVFS('shb-sans-regular.ttf', f['shb-sans-regular']);
    doc.addFont('shb-sans-regular.ttf', F.sans, 'normal');
    doc.addFileToVFS('shb-sans-bold.ttf', f['shb-sans-bold']);
    doc.addFont('shb-sans-bold.ttf', F.sans, 'bold');
  }
  const set = (doc, font, style, size, color)=>{
    doc.setFont(font, style); doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };
  function dateStr(iso){
    if(!iso) return '';
    const p = String(iso).split('-');
    return p.length===3 ? `${p[2]}.${p[1]}.${p[0]}` : String(iso);
  }
  function safeName(s){
    return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'')
      .replace(/[^A-Za-z0-9\-_ ]/g,'').trim().replace(/\s+/g,'-').slice(0,40);
  }

  /* ==========================================================================
   * Aufbau des Dokuments
   * data = {
   *   lang, tx:{…Beschriftungen…}, company:{…}, currency,
   *   customer, offerNo, dateOrder, dateDelivery, occasion,
   *   shape, size, height, tiers, portions, description, decoration,
   *   price, pricePerPortion
   * }
   * ========================================================================== */
  async function build(data){
    await ensure();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4', compress:true});
    registerFonts(doc);

    const T   = data.tx;
    const co  = data.company;
    const W   = PAGE.w - M.l - M.r;      // 170 mm Satzspiegel
    let   y   = M.t;
    let   page = 1;

    /* --- Seitenumbruch bei Bedarf --- */
    function need(h){
      if(y + h <= PAGE.h - M.b - 8) return;
      doc.addPage(); page++; y = M.t;
    }
    /* --- Fusszeile, wird am Schluss auf alle Seiten gesetzt --- */
    function drawFooters(){
      const total = doc.getNumberOfPages();
      const fy = PAGE.h - M.b + 4;
      const parts = [
        co.name,
        [co.street, [co.zip, co.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        co.phone, co.mail, co.insta
      ].filter(Boolean).join('  ·  ');
      for(let i=1; i<=total; i++){
        doc.setPage(i);
        doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
        doc.line(M.l, fy - 5, PAGE.w - M.r, fy - 5);
        set(doc, F.sans, 'normal', 7.5, C.gray);
        doc.text(parts, PAGE.w/2, fy, {align:'center', maxWidth:W});
        // Seitenzahl nur, wenn die Offerte mehr als eine Seite hat
        if(total > 1) doc.text(i + ' / ' + total, PAGE.w - M.r, fy, {align:'right'});
      }
    }

    /* ---------- Briefkopf ---------- */
    if(logoImg){
      try{
        const p  = doc.getImageProperties(logoImg);
        const lw = 21, lh = lw * (p.height / p.width);
        doc.addImage(logoImg, 'JPEG', (PAGE.w - lw)/2, y, lw, lh);
        y += lh + 4.5;
      }catch(e){ y += 6; }
    }else{
      y += 6;
    }
    set(doc, F.serif, 'normal', 21, C.gold);
    doc.text(co.name.toUpperCase(), PAGE.w/2, y, {align:'center', charSpace:1.1});
    y += 5.5;
    set(doc, F.sans, 'normal', 7.5, C.gray);
    doc.text(T.tagline.toUpperCase(), PAGE.w/2, y, {align:'center', charSpace:1.4});
    y += 4.5;
    doc.setDrawColor(...C.gold); doc.setLineWidth(0.4);
    doc.line(PAGE.w/2 - 18, y, PAGE.w/2 + 18, y);
    y += 11;

    /* ---------- Empfänger und Offertdaten ---------- */
    const yTop = y;
    set(doc, F.sans, 'normal', 7.5, C.gray);
    doc.text(T.customer.toUpperCase(), M.l, y, {charSpace:.6});
    set(doc, F.serif, 'normal', 13, C.ink);
    doc.text(data.customer || '—', M.l, y + 6);

    y = yTop;
    const rx = PAGE.w - M.r, lx = rx - 32;
    const metaRows = [
      [T.offerNo,      data.offerNo],
      [T.dateOrder,    dateStr(data.dateOrder)],
      [T.dateDelivery, dateStr(data.dateDelivery)]
    ].filter(r=>r[1]);
    metaRows.forEach(r=>{
      set(doc, F.sans, 'normal', 8, C.gray);
      doc.text(r[0], lx, y, {align:'right'});
      set(doc, F.sans, 'bold', 8.5, C.ink);
      doc.text(String(r[1]), rx, y, {align:'right'});
      y += 4.6;
    });
    y = Math.max(yTop + 11, y) + 9;

    /* ---------- Titel ---------- */
    set(doc, F.sans, 'normal', 7.5, C.gold);
    doc.text(T.offerLabel.toUpperCase(), M.l, y, {charSpace:1.2});
    y += 7;
    set(doc, F.serif, 'normal', 22, C.ink);
    const titleLines = doc.splitTextToSize(data.title, W);
    titleLines.forEach(l=>{ doc.text(l, M.l, y); y += 9; });
    y += 2.5;

    /* ---------- Ausführung / Details ---------- */
    const specs = data.specs.filter(s=>s[1]);
    if(specs.length){
      set(doc, F.sans, 'normal', 7.5, C.gray);
      doc.text(T.details.toUpperCase(), M.l, y, {charSpace:.8});
      y += 3.5;
      doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
      doc.line(M.l, y, PAGE.w - M.r, y);
      y += 4.6;

      const labelW = 42;
      specs.forEach(([label, value])=>{
        set(doc, F.sans, 'normal', 9.3, C.ink);
        const valLines = doc.splitTextToSize(String(value), W - labelW);
        need(valLines.length * 4.6 + 3);
        set(doc, F.sans, 'normal', 8.8, C.gray);
        doc.text(label, M.l, y);
        set(doc, F.sans, 'normal', 9.3, C.ink);
        valLines.forEach((l,i)=>{ doc.text(l, M.l + labelW, y + i*4.6); });
        y += valLines.length * 4.6 + 1.9;
      });
      y += 5;
    }

    /* ---------- Positionen ---------- */
    need(46);
    set(doc, F.sans, 'bold', 7.5, C.gray);
    doc.text(T.position.toUpperCase(), M.l, y, {charSpace:.6});
    doc.text(T.amount.toUpperCase(), PAGE.w - M.r, y, {align:'right', charSpace:.6});
    y += 3;
    doc.setDrawColor(...C.ink); doc.setLineWidth(0.35);
    doc.line(M.l, y, PAGE.w - M.r, y);
    y += 6.5;

    data.positions.forEach(p=>{
      set(doc, F.sans, 'normal', 10, C.ink);
      const lines = doc.splitTextToSize(p.text, W - 38);
      need(lines.length*5 + 8);
      lines.forEach((l,i)=> doc.text(l, M.l, y + i*5));
      set(doc, F.sans, 'normal', 10, C.ink);
      doc.text(p.amount, PAGE.w - M.r, y, {align:'right'});
      y += lines.length*5 + 2.5;
      if(p.note){
        set(doc, F.sans, 'normal', 8, C.gray);
        doc.text(p.note, M.l, y); y += 4;
      }
      doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
      doc.line(M.l, y, PAGE.w - M.r, y);
      y += 5.5;
    });

    /* ---------- Gesamtpreis ---------- */
    need(26);
    doc.setFillColor(...C.goldLight);
    doc.setDrawColor(...C.gold); doc.setLineWidth(0.4);
    doc.roundedRect(M.l, y, W, 17, 2, 2, 'FD');
    set(doc, F.sans, 'bold', 9, C.ink2);
    doc.text(T.total.toUpperCase(), M.l + 7, y + 10.5, {charSpace:.8});
    set(doc, F.serif, 'bold', 19, C.ink);
    doc.text(data.price, PAGE.w - M.r - 7, y + 11.5, {align:'right'});
    y += 20;
    if(data.pricePerPortion){
      set(doc, F.sans, 'normal', 8, C.gray);
      doc.text(data.pricePerPortion, PAGE.w - M.r, y, {align:'right'});
      y += 5;
    }
    y += 6;

    /* ---------- Konditionen ---------- */
    const conds = data.conditions.filter(Boolean);
    if(conds.length){
      need(12 + conds.length*5.5);
      set(doc, F.sans, 'normal', 7.5, C.gray);
      doc.text(T.conditions.toUpperCase(), M.l, y, {charSpace:.8});
      y += 3.5;
      doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
      doc.line(M.l, y, PAGE.w - M.r, y);
      y += 5;
      conds.forEach(c=>{
        set(doc, F.sans, 'normal', 8.6, C.ink2);
        const lines = doc.splitTextToSize(c, W - 5);
        need(lines.length*4.3 + 2);
        doc.setFillColor(...C.gold);
        doc.circle(M.l + 1, y - 1.2, 0.6, 'F');
        lines.forEach((l,i)=> doc.text(l, M.l + 4.5, y + i*4.3));
        y += lines.length*4.3 + 2;
      });
      y += 5;
    }

    /* ---------- Schlusssatz ---------- */
    need(14);
    set(doc, F.serif, 'normal', 12, C.gold);
    doc.text(T.closing, M.l, y);
    y += 5.5;
    set(doc, F.sans, 'normal', 9, C.ink2);
    if(co.owner) doc.text(co.owner, M.l, y);

    drawFooters();
    return doc;
  }

  /* ---------- Ausgabe ---------- */
  function filename(data){
    const parts = ['Offerte', safeName(data.offerNo), safeName(data.customer)].filter(Boolean);
    return parts.join('_') + '.pdf';
  }

  async function save(data){
    const doc = await build(data);
    doc.save(filename(data));
    return 'saved';
  }

  /** Teilen über das native Menü (iPhone: WhatsApp, Mail, AirDrop).
   *  Fällt auf Download zurück, wenn der Browser keine Dateien teilen kann. */
  async function share(data){
    const doc  = await build(data);
    const blob = doc.output('blob');
    const file = new File([blob], filename(data), {type:'application/pdf'});

    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{
        await navigator.share({ files:[file], title:data.shareTitle, text:data.shareText });
        return 'shared';
      }catch(err){
        if(err && err.name === 'AbortError') return 'cancelled';   // Nutzer hat abgebrochen
        // sonst: unten Download versuchen
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename(data);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 4000);
    return 'saved';
  }

  /* Für andere Bausteine (Design-Vorlage) mit veröffentlicht, damit dort
     dieselben Schriften und Farben verwendet werden können. */
  return { ensure, build, save, share, filename, registerFonts, C, F, PAGE, M, dateStr, safeName };
})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_PDF;
