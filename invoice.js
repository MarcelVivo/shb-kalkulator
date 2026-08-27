/* ==========================================================================
 * Sweet Home Bakery · Rechnung mit Schweizer QR-Zahlteil
 * --------------------------------------------------------------------------
 * Erzeugt eine A4-Rechnung. Die unteren 105 mm nehmen Empfangsschein und
 * Zahlteil ein, aufgebaut nach den Implementation Guidelines QR-Rechnung
 * und dem zugehörigen Style Guide:
 *
 *   · Zahlteil-Bereich  105 mm hoch, über die volle Blattbreite
 *   · Empfangsschein     62 mm breit, Zahlteil 148 mm breit
 *   · QR-Code            46 × 46 mm, Schweizerkreuz 7 × 7 mm in der Mitte
 *   · Schrift            Helvetica, Überschriften fett
 *
 * Der Zahlteil ist immer deutsch beschriftet – so verlangt es die
 * Spezifikation für die Sprache der Zahlungspflichtigen in der Schweiz.
 * Der Rechnungsteil darüber folgt der Sprache der App.
 * ========================================================================== */

'use strict';

var SHB_INVOICE = (function(){

  const PAGE = { w:210, h:297 };
  const M    = { l:20, r:20, t:16 };
  const PP   = { top:192, h:105, esW:62, ztX:62 };   // Zahlteil-Bereich

  /* Beschriftung des Zahlteils – fest deutsch */
  const QR_TX = {
    empfang:'Empfangsschein', zahlteil:'Zahlteil',
    konto:'Konto / Zahlbar an', ref:'Referenz', info:'Zusätzliche Informationen',
    zahlbar:'Zahlbar durch', zahlbarLeer:'Zahlbar durch (Name/Adresse)',
    waehrung:'Währung', betrag:'Betrag', annahme:'Annahmestelle',
    trenn:'Vor der Einzahlung abzutrennen'
  };

  const B = () => SHB_BUCH;

  /* ---------------------------------------------------------------- Hilfen */
  function fmt(v){
    return Number(v||0).toLocaleString('de-CH',{minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function dateStr(iso){
    if(!iso) return '';
    const p = String(iso).split('-');
    return p.length===3 ? `${p[2]}.${p[1]}.${p[0]}` : String(iso);
  }
  function addrLines(a){
    return [ a.name, a.street, [a.zip, a.city].filter(Boolean).join(' ') ].filter(Boolean);
  }

  /* ==========================================================================
   * QR-Code zeichnen
   * ========================================================================== */
  function drawQr(doc, text, x, y, size){
    const q = qrcode(0, 'M');              // Fehlerkorrektur M – so verlangt
    q.addData(text, 'Byte');
    q.make();
    const n = q.getModuleCount();
    const m = size/n;
    doc.setFillColor(0,0,0);
    for(let r=0; r<n; r++){
      let run = 0;
      for(let c=0; c<=n; c++){
        const dark = c<n && q.isDark(r,c);
        if(dark){ run++; continue; }
        if(run){                            // zusammenhängende Module in einem Zug
          doc.rect(x + (c-run)*m, y + r*m, run*m + 0.02, m + 0.02, 'F');
          run = 0;
        }
      }
    }
    /* Schweizerkreuz, 7 × 7 mm, mittig */
    const cs = 7, cx = x + size/2 - cs/2, cy = y + size/2 - cs/2;
    doc.setFillColor(255,255,255);
    doc.rect(cx-0.7, cy-0.7, cs+1.4, cs+1.4, 'F');
    doc.setFillColor(0,0,0);
    doc.rect(cx, cy, cs, cs, 'F');
    doc.setFillColor(255,255,255);
    const arm = cs*0.60, thick = cs*0.19;
    doc.rect(cx + cs/2 - arm/2, cy + cs/2 - thick/2, arm, thick, 'F');
    doc.rect(cx + cs/2 - thick/2, cy + cs/2 - arm/2, thick, arm, 'F');
  }

  /* ==========================================================================
   * Empfangsschein und Zahlteil
   * ========================================================================== */
  function paymentPart(doc, inv, co, cfg){
    const T = B().invoiceTotals(inv);
    const top = PP.top;

    /* Trennlinien */
    doc.setDrawColor(0,0,0); doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.2, 1.2], 0);
    doc.line(0, top, PAGE.w, top);
    doc.line(PP.ztX, top, PP.ztX, PAGE.h);
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(0,0,0);
    doc.text(QR_TX.trenn, PAGE.w - 5, top - 2, {align:'right'});

    const kontoBlock = [ B().ibanFormat(cfg.iban) ].concat(addrLines(co));
    const kunde = inv.kunde && inv.kunde.name ? addrLines(inv.kunde) : null;
    const refText = (inv.refTyp==='SCOR' && inv.ref)
      ? inv.ref.replace(/(.{4})/g,'$1 ').trim() : '';

    /* ---------------- Empfangsschein (links, 62 mm) ---------------- */
    let x = 5, y = top + 5;
    doc.setFont('helvetica','bold'); doc.setFontSize(11);
    doc.text(QR_TX.empfang, x, y + 3);
    y += 12;

    const esHead = (label)=>{ doc.setFont('helvetica','bold'); doc.setFontSize(6);
                              doc.text(label, x, y); y += 3; };
    const esVal  = (lines)=>{ doc.setFont('helvetica','normal'); doc.setFontSize(8);
                              lines.forEach(l=>{ doc.text(l, x, y, {maxWidth:52}); y += 3; }); y += 3; };

    esHead(QR_TX.konto); esVal(kontoBlock);
    if(refText){ esHead(QR_TX.ref); esVal([refText]); }
    esHead(kunde ? QR_TX.zahlbar : QR_TX.zahlbarLeer);
    if(kunde) esVal(kunde);
    else {
      /* Leerfeld zum Ausfüllen von Hand */
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.3);
      const bx = x, by = y - 1, bw = 52, bh = 20, c = 3;
      [[bx,by,c,0],[bx,by,0,c],[bx+bw,by,-c,0],[bx+bw,by,0,c],
       [bx,by+bh,c,0],[bx,by+bh,0,-c],[bx+bw,by+bh,-c,0],[bx+bw,by+bh,0,-c]]
        .forEach(([ax,ay,dx,dy])=>doc.line(ax,ay,ax+dx,ay+dy));
      y += bh + 3;
    }

    /* Währung und Betrag nebeneinander, unten */
    const esBaseY = top + PP.h - 22;
    doc.setFont('helvetica','bold'); doc.setFontSize(6);
    doc.text(QR_TX.waehrung, x, esBaseY);
    doc.text(QR_TX.betrag,  x + 12, esBaseY);
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    doc.text('CHF', x, esBaseY + 4);
    doc.text(T.brutto > 0 ? fmt(T.brutto) : '', x + 12, esBaseY + 4);
    doc.setFont('helvetica','bold'); doc.setFontSize(6);
    doc.text(QR_TX.annahme, PP.esW - 5, top + PP.h - 8, {align:'right'});

    /* ---------------- Zahlteil (rechts, 148 mm) ---------------- */
    x = PP.ztX + 5; y = top + 5;
    doc.setFont('helvetica','bold'); doc.setFontSize(11);
    doc.text(QR_TX.zahlteil, x, y + 3);

    /* QR-Code */
    const payload = B().qrPayload(inv, co, cfg);
    drawQr(doc, payload, x, top + 17, 46);

    /* Währung und Betrag unter dem QR-Code */
    const zBase = top + 17 + 46 + 8;
    doc.setFont('helvetica','bold'); doc.setFontSize(8);
    doc.text(QR_TX.waehrung, x, zBase);
    doc.text(QR_TX.betrag,  x + 15, zBase);
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    doc.text('CHF', x, zBase + 5);
    doc.text(T.brutto > 0 ? fmt(T.brutto) : '', x + 15, zBase + 5);

    /* Angaben rechts daneben – Beginn bei 118 mm, damit der QR-Code
       ringsum die vorgeschriebene Ruhezone von 5 mm behält */
    let ix = PP.ztX + 56, iy = top + 10;
    const ztHead = (label)=>{ doc.setFont('helvetica','bold'); doc.setFontSize(8);
                              doc.text(label, ix, iy); iy += 4; };
    const ztVal  = (lines)=>{ doc.setFont('helvetica','normal'); doc.setFontSize(10);
                              lines.forEach(l=>{ doc.text(l, ix, iy, {maxWidth:87}); iy += 4.2; }); iy += 3; };

    ztHead(QR_TX.konto); ztVal(kontoBlock);
    if(refText){ ztHead(QR_TX.ref); ztVal([refText]); }
    if(inv.refTyp !== 'SCOR'){ ztHead(QR_TX.info); ztVal(['Rechnung ' + inv.nr]); }
    ztHead(kunde ? QR_TX.zahlbar : QR_TX.zahlbarLeer);
    if(kunde) ztVal(kunde);
    else{
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.3);
      const bx = ix, by = iy - 1, bw = 65, bh = 25, c = 3;
      [[bx,by,c,0],[bx,by,0,c],[bx+bw,by,-c,0],[bx+bw,by,0,c],
       [bx,by+bh,c,0],[bx,by+bh,0,-c],[bx+bw,by+bh,-c,0],[bx+bw,by+bh,0,-c]]
        .forEach(([ax,ay,dx,dy])=>doc.line(ax,ay,ax+dx,ay+dy));
    }
  }

  /* ==========================================================================
   * Rechnungsteil
   * ========================================================================== */
  async function build(data){
    await SHB_PDF.ensure();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4', compress:true});
    SHB_PDF.registerFonts(doc);

    const C = SHB_PDF.C, F = SHB_PDF.F;
    const { inv, co, cfg, tx } = data;
    const T = B().invoiceTotals(inv);
    const W = PAGE.w - M.l - M.r;
    const set = (f,s,sz,c)=>{ doc.setFont(f,s); doc.setFontSize(sz); doc.setTextColor(c[0],c[1],c[2]); };

    let y = M.t;

    /* Briefkopf */
    if(data.logo){
      try{
        const p = doc.getImageProperties(data.logo);
        const lw = 18, lh = lw*(p.height/p.width);
        doc.addImage(data.logo, 'JPEG', M.l, y, lw, lh);
      }catch(e){ /* ohne Logo weiter */ }
    }
    set(F.serif,'normal',17,C.gold);
    doc.text(co.name, PAGE.w - M.r, y + 6, {align:'right', charSpace:.6});
    set(F.sans,'normal',7.6,C.gray);
    doc.text([ [co.street, co.hausnr].filter(Boolean).join(' '),
               [co.zip, co.city].filter(Boolean).join(' '),
               co.phone, co.mail ].filter(Boolean).join('  ·  '),
             PAGE.w - M.r, y + 11, {align:'right'});
    y += 24;
    doc.setDrawColor(...C.line); doc.setLineWidth(0.3);
    doc.line(M.l, y, PAGE.w - M.r, y);
    y += 12;

    /* Empfängeradresse */
    set(F.sans,'normal',10.5,C.ink);
    addrLines(inv.kunde).forEach(l=>{ doc.text(l, M.l, y); y += 5; });

    /* Titel und Eckdaten */
    y = Math.max(y, M.t + 52) + 12;
    set(F.serif,'normal',21,C.ink);
    doc.text((tx.invTitle || 'Rechnung') + ' ' + inv.nr, M.l, y);
    y += 9;
    set(F.sans,'normal',9,C.ink2);
    const meta = [
      [tx.invDate || 'Rechnungsdatum', dateStr(inv.datum)],
      [tx.invDue  || 'Zahlbar bis',    dateStr(inv.faellig)]
    ];
    if(cfg.mwstPflicht && cfg.mwstNr) meta.push([tx.invVatNo || 'MwSt-Nr.', cfg.mwstNr]);
    doc.text(meta.map(m=>m[0]+': '+m[1]).join('     ·     '), M.l, y);
    y += 10;

    /* Positionen */
    set(F.sans,'bold',7.6,C.gray);
    doc.text((tx.invPos || 'Beschreibung').toUpperCase(), M.l, y, {charSpace:.6});
    doc.text((tx.invQty || 'Menge').toUpperCase(), M.l + 116, y, {align:'right', charSpace:.6});
    doc.text((tx.invPrice || 'Preis').toUpperCase(), M.l + 143, y, {align:'right', charSpace:.6});
    doc.text((tx.invSum || 'Betrag').toUpperCase(), PAGE.w - M.r, y, {align:'right', charSpace:.6});
    y += 2.5;
    doc.setDrawColor(...C.ink); doc.setLineWidth(0.35);
    doc.line(M.l, y, PAGE.w - M.r, y);
    y += 6;

    (inv.positionen||[]).forEach(p=>{
      set(F.sans,'normal',9.6,C.ink);
      const lines = doc.splitTextToSize(String(p.text||''), 108);
      lines.forEach((l,i)=> doc.text(l, M.l, y + i*4.6));
      const menge = Number(p.menge||1), preis = Number(p.preis||0);
      doc.text(String(menge), M.l + 116, y, {align:'right'});
      doc.text(fmt(preis), M.l + 143, y, {align:'right'});
      doc.text(fmt(menge*preis), PAGE.w - M.r, y, {align:'right'});
      y += Math.max(lines.length*4.6, 4.6) + 3;
      doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
      doc.line(M.l, y - 1.5, PAGE.w - M.r, y - 1.5);
    });

    /* Summen */
    y += 4;
    const sumRow = (label, value, strong)=>{
      set(F.sans, strong?'bold':'normal', strong?10.5:9.6, strong?C.ink:C.ink2);
      doc.text(label, PAGE.w - M.r - 42, y, {align:'right'});
      doc.text(value, PAGE.w - M.r, y, {align:'right'});
      y += strong ? 7 : 5.4;
    };
    if(T.satz > 0){
      sumRow(tx.invNet || 'Zwischensumme', 'CHF ' + fmt(T.netto));
      sumRow((tx.invVat || 'MwSt') + ' ' + T.satz + ' %', 'CHF ' + fmt(T.mwst));
    }
    doc.setDrawColor(...C.ink); doc.setLineWidth(0.35);
    doc.line(PAGE.w - M.r - 62, y - 3, PAGE.w - M.r, y - 3);
    y += 2;
    sumRow(tx.invTotal || 'Gesamtbetrag', 'CHF ' + fmt(T.brutto), true);

    /* Zahlungshinweis */
    y += 4;
    set(F.sans,'normal',9,C.ink2);
    const hinweis = [
      (tx.invTerms || 'Zahlbar innert {d} Tagen bis {f}.')
        .replace('{d}', String(Math.max(0, Math.round((new Date(inv.faellig) - new Date(inv.datum))/86400000) || 30)))
        .replace('{f}', dateStr(inv.faellig)),
      inv.notiz || '',
      !cfg.mwstPflicht ? (tx.invNoVat || '') : ''
    ].filter(Boolean);
    hinweis.forEach(h=>{
      doc.splitTextToSize(h, W).forEach(l=>{
        if(y < PP.top - 12){ doc.text(l, M.l, y); y += 4.6; }
      });
      y += 1.5;
    });
    if(y < PP.top - 14){
      set(F.serif,'normal',11,C.gold);
      doc.text(tx.invThanks || 'Herzlichen Dank für Ihren Auftrag.', M.l, Math.min(y + 4, PP.top - 8));
    }

    /* Zahlteil */
    paymentPart(doc, inv, co, cfg);
    return doc;
  }

  function filename(inv){
    const n = SHB_PDF.safeName(inv.nr || 'Rechnung');
    const k = SHB_PDF.safeName(inv.kunde && inv.kunde.name || '');
    return ['Rechnung', n, k].filter(Boolean).join('_') + '.pdf';
  }

  async function save(data){
    const doc = await build(data);
    doc.save(filename(data.inv));
    return 'saved';
  }

  async function share(data){
    const doc  = await build(data);
    const blob = doc.output('blob');
    const file = new File([blob], filename(data.inv), {type:'application/pdf'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      try{
        await navigator.share({files:[file], title:data.shareTitle, text:data.shareText});
        return 'shared';
      }catch(err){ if(err && err.name==='AbortError') return 'cancelled'; }
    }
    doc.save(filename(data.inv));
    return 'saved';
  }

  return { build, save, share, filename, drawQr, QR_TX, PP };
})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_INVOICE;
