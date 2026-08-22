/* ==========================================================================
 * Sweet Home Bakery · Buchhaltung
 * --------------------------------------------------------------------------
 * Rechnungen, Belege für Einnahmen und Ausgaben, Auswertungen.
 *
 * Rechtlicher Rahmen (Schweiz, Stand der Umsetzung):
 * Einzelunternehmen mit weniger als CHF 500'000 Umsatz führen nach
 * Art. 957 Abs. 2 OR eine vereinfachte Buchhaltung – Einnahmen, Ausgaben
 * und Vermögenslage. Eine doppelte Buchhaltung mit Bilanz ist nicht
 * vorgeschrieben. Genau das bildet dieser Baustein ab: eine saubere
 * Einnahmen-Ausgaben-Rechnung plus Vermögensübersicht.
 *
 * Die Mehrwertsteuer ist standardmässig ausgeschaltet. Sie wird erst ab
 * CHF 100'000 Jahresumsatz obligatorisch; wer darunter liegt, weist keine
 * MwSt aus. Der Satz lässt sich in den Einstellungen einschalten.
 *
 * Dieser Baustein ersetzt keine Steuer- oder Rechtsberatung.
 *
 * Reine Rechenfunktionen ohne DOM-Zugriff – dadurch einzeln prüfbar.
 * ========================================================================== */

'use strict';

var SHB_BUCH = (function(){

/* ==========================================================================
 * 1. Kataloge
 * ========================================================================== */
const KAT_AUSGABE = ['zutaten','verpackung','werkzeug','geraete','miete','energie',
                     'fahrzeug','marketing','versicherung','gebuehren','weiterbildung',
                     'buero','beitraege','sonstiges'];
const KAT_EINNAHME = ['torten','gebaeck','kurse','lieferung','sonstiges'];
const ZAHLARTEN    = ['bar','twint','bank','karte','sonstiges'];
const RG_STATUS    = ['offen','bezahlt','storniert'];

/* ==========================================================================
 * 2. Zustand
 * ========================================================================== */
function blankBooks(){
  return {
    v:1,
    invoices:[],
    entries:[],
    assets:{ kasse:0, bank:0, schulden:0, stand:today() },
    cfg:{
      nextNr: 1,
      praefix: 'R',
      iban: '',
      refTyp: 'NON',        // NON = Mitteilung, SCOR = Creditor Reference
      zahlungsfrist: 30,    // Tage
      mwstPflicht: false,
      mwstSatz: 8.1,        // Normalsatz Schweiz
      mwstNr: ''
    }
  };
}

const today = ()=> new Date().toISOString().slice(0,10);
const nid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

/* ==========================================================================
 * 3. Hilfsfunktionen
 * ========================================================================== */
function n(v){ const x = parseFloat(String(v).replace(',','.')); return isFinite(x) ? x : 0; }

/** Kaufmännisch auf Rappen runden.
 *  Der kleine Zuschlag fängt die Ungenauigkeit der Gleitkommazahlen ab:
 *  485 × 8.1 % ergibt intern 39.28499999…, gerundet werden muss aber 39.29. */
function r2(x){
  const v = n(x);
  const s = v < 0 ? -1 : 1;
  return s * Math.round(Math.abs(v)*100 + 1e-8) / 100;
}

/** Datum + Tage, als ISO-Zeichenkette. */
function addDays(iso, days){
  const d = new Date(iso + 'T12:00:00');
  if(isNaN(d)) return iso;
  d.setDate(d.getDate() + n(days));
  return d.toISOString().slice(0,10);
}

/** Rechnungsnummer bilden: R-2026-001 */
function makeNr(cfg, datum){
  const jahr = (datum||today()).slice(0,4);
  const nr = String(n(cfg.nextNr)||1).padStart(3,'0');
  return `${cfg.praefix||'R'}-${jahr}-${nr}`;
}

/* --- IBAN --- */
function ibanClean(s){ return String(s||'').replace(/[\s-]/g,'').toUpperCase(); }
function ibanValid(s){
  const v = ibanClean(s);
  if(!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(v)) return false;
  const re = v.slice(4) + v.slice(0,4);
  let rest = 0;
  for(const ch of re){
    const d = /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0)-55);
    for(const c of d) rest = (rest*10 + (+c)) % 97;
  }
  return rest === 1;
}
function ibanFormat(s){ return ibanClean(s).replace(/(.{4})/g,'$1 ').trim(); }

/** Ist es eine QR-IBAN? Dann liegt die Institutsnummer zwischen 30000 und 31999. */
function isQrIban(s){
  const v = ibanClean(s);
  if(v.length < 9) return false;
  const iid = parseInt(v.slice(4,9), 10);
  return iid >= 30000 && iid <= 31999;
}

/* --- Creditor Reference nach ISO 11649 (SCOR) --- */
function scorReference(nr){
  const base = String(nr||'').toUpperCase().replace(/[^0-9A-Z]/g,'').slice(0,21);
  if(!base) return '';
  const conv = s => s.replace(/[A-Z]/g, c => String(c.charCodeAt(0)-55));
  let rest = 0;
  for(const c of conv(base + 'RF00')) rest = (rest*10 + (+c)) % 97;
  const pruef = String(98 - rest).padStart(2,'0');
  return 'RF' + pruef + base;
}
function scorValid(ref){
  const v = String(ref||'').replace(/\s/g,'').toUpperCase();
  if(!/^RF[0-9]{2}[0-9A-Z]{1,21}$/.test(v)) return false;
  const re = v.slice(4) + v.slice(0,4);
  let rest = 0;
  for(const c of re.replace(/[A-Z]/g, ch=>String(ch.charCodeAt(0)-55))) rest = (rest*10 + (+c)) % 97;
  return rest === 1;
}

/* ==========================================================================
 * 4. Rechnungen
 * ========================================================================== */

/** Neue Rechnung aus einer Kalkulation. */
function invoiceFromCalc(books, opts){
  const cfg = books.cfg;
  const datum = opts.datum || today();
  const nr = opts.nr || makeNr(cfg, datum);
  const inv = {
    id: nid('r'),
    nr,
    datum,
    faellig: addDays(datum, cfg.zahlungsfrist),
    kunde: {
      name:  opts.kunde || '',
      street:opts.street || '',
      zip:   opts.zip || '',
      city:  opts.city || '',
      land:  opts.land || 'CH',
      mail:  opts.mail || ''
    },
    positionen: opts.positionen || [],
    mwstSatz: cfg.mwstPflicht ? n(cfg.mwstSatz) : 0,
    status: 'offen',
    bezahltAm: '',
    zahlungsart: '',
    projectId: opts.projectId || '',
    refTyp: cfg.refTyp || 'NON',
    ref: '',
    notiz: opts.notiz || ''
  };
  if(inv.refTyp === 'SCOR') inv.ref = scorReference(nr.replace(/[^0-9A-Za-z]/g,''));
  return inv;
}

/** Summen einer Rechnung. Bei Mehrwertsteuerpflicht gelten die Positionen
 *  als Nettobeträge, die Steuer wird zusätzlich ausgewiesen. */
function invoiceTotals(inv){
  const netto = (inv.positionen||[]).reduce((s,p)=> s + n(p.menge||1)*n(p.preis), 0);
  const satz  = n(inv.mwstSatz);
  const mwst  = r2(netto * satz/100);
  return { netto:r2(netto), satz, mwst, brutto:r2(netto + mwst) };
}

/** Rechnung als bezahlt markieren und den Zahlungseingang verbuchen. */
function markPaid(books, invId, datum, zahlungsart){
  const inv = books.invoices.find(i=>i.id===invId);
  if(!inv || inv.status==='bezahlt') return null;
  inv.status = 'bezahlt';
  inv.bezahltAm = datum || today();
  inv.zahlungsart = zahlungsart || 'bank';
  const t = invoiceTotals(inv);
  const e = {
    id: nid('e'), art:'einnahme', datum: inv.bezahltAm, betrag: t.brutto,
    kategorie:'torten', gegenpartei: inv.kunde.name, zahlungsart: inv.zahlungsart,
    projectId: inv.projectId, invoiceId: inv.id, beleg:null,
    notiz: 'Rechnung ' + inv.nr
  };
  books.entries.push(e);
  return e;
}

/** Zahlung zurücknehmen. */
function unmarkPaid(books, invId){
  const inv = books.invoices.find(i=>i.id===invId);
  if(!inv) return;
  inv.status = 'offen'; inv.bezahltAm = ''; inv.zahlungsart = '';
  books.entries = books.entries.filter(e=>e.invoiceId !== invId);
}

/* ==========================================================================
 * 5. Belege
 * ========================================================================== */
function blankEntry(art){
  return {
    id: nid('e'), art: art||'ausgabe', datum: today(), betrag: 0,
    kategorie: art==='einnahme' ? 'torten' : 'zutaten',
    gegenpartei:'', zahlungsart:'bar', projectId:'', invoiceId:'',
    beleg:null, notiz:''
  };
}

/* ==========================================================================
 * 6. Auswertung
 * ========================================================================== */

/** Kennzahlen für einen Zeitraum.
 *  von/bis als ISO-Zeichenketten; leer bedeutet unbegrenzt. */
function report(books, von, bis){
  const inRange = d => (!von || d >= von) && (!bis || d <= bis);
  const entries = (books.entries||[]).filter(e=>inRange(e.datum));

  let umsatz = 0, aufwand = 0;
  const umsatzKat = {}, aufwandKat = {}, monate = {};

  entries.forEach(e=>{
    const b = r2(e.betrag);
    const m = String(e.datum).slice(0,7);
    monate[m] = monate[m] || {monat:m, einnahmen:0, ausgaben:0};
    if(e.art === 'einnahme'){
      umsatz += b;
      umsatzKat[e.kategorie] = r2((umsatzKat[e.kategorie]||0) + b);
      monate[m].einnahmen = r2(monate[m].einnahmen + b);
    }else{
      aufwand += b;
      aufwandKat[e.kategorie] = r2((aufwandKat[e.kategorie]||0) + b);
      monate[m].ausgaben = r2(monate[m].ausgaben + b);
    }
  });
  umsatz = r2(umsatz); aufwand = r2(aufwand);
  const gewinn = r2(umsatz - aufwand);

  /* Rechnungen im Zeitraum */
  const invs = (books.invoices||[]).filter(i=>inRange(i.datum) && i.status!=='storniert');
  const offen = invs.filter(i=>i.status==='offen');
  const heute = today();
  const offenSumme = r2(offen.reduce((s,i)=>s + invoiceTotals(i).brutto, 0));
  const ueberfaellig = offen.filter(i=>i.faellig && i.faellig < heute);
  const ueberfaelligSumme = r2(ueberfaellig.reduce((s,i)=>s + invoiceTotals(i).brutto, 0));

  /* Vermögenslage: flüssige Mittel + Forderungen − Schulden */
  const a = books.assets || {};
  const fluessig = r2(n(a.kasse) + n(a.bank));
  const vermoegen = r2(fluessig + offenSumme - n(a.schulden));

  /* Fortschritt in Richtung Mehrwertsteuerpflicht (CHF 100'000 Jahresumsatz) */
  const mwstSchwelle = 100000;

  return {
    von, bis, umsatz, aufwand, gewinn,
    marge: umsatz > 0 ? r2(gewinn/umsatz*100) : 0,
    umsatzKat, aufwandKat,
    monate: Object.values(monate).sort((x,y)=>x.monat<y.monat?-1:1),
    anzahlBelege: entries.length,
    rechnungen: invs.length,
    offen: offen.length, offenSumme,
    ueberfaellig: ueberfaellig.length, ueberfaelligSumme,
    fluessig, forderungen: offenSumme, schulden: r2(n(a.schulden)), vermoegen,
    mwstSchwelle, mwstAnteil: umsatz>0 ? r2(umsatz/mwstSchwelle*100) : 0
  };
}

/** Jahresbereich als {von,bis}. */
function yearRange(jahr){ return { von: jahr+'-01-01', bis: jahr+'-12-31' }; }

/** Alle Jahre, in denen Bewegungen liegen. */
function years(books){
  const set = {};
  (books.entries||[]).forEach(e=>{ if(e.datum) set[e.datum.slice(0,4)] = 1; });
  (books.invoices||[]).forEach(i=>{ if(i.datum) set[i.datum.slice(0,4)] = 1; });
  const y = Object.keys(set).sort().reverse();
  const now = String(new Date().getFullYear());
  if(y.indexOf(now) < 0) y.unshift(now);
  return y;
}

/* ==========================================================================
 * 7. Ausgabe für die Treuhand
 * ========================================================================== */

/** Belegjournal als CSV mit Semikolon – lässt sich in Excel und Numbers
 *  ohne Umweg öffnen. */
function csv(books, von, bis, labels){
  const L = labels || {};
  const inRange = d => (!von || d >= von) && (!bis || d <= bis);
  const esc = v => {
    const s = String(v==null ? '' : v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  };
  const head = ['Datum','Art','Kategorie','Gegenpartei','Zahlungsart','Betrag CHF','Beleg','Rechnung','Notiz'];
  const rows = [head.join(';')];

  (books.entries||[]).filter(e=>inRange(e.datum))
    .sort((a,b)=>a.datum<b.datum?-1:1)
    .forEach(e=>{
      const inv = (books.invoices||[]).find(i=>i.id===e.invoiceId);
      rows.push([
        e.datum,
        e.art==='einnahme' ? (L.einnahme||'Einnahme') : (L.ausgabe||'Ausgabe'),
        (L['kat_'+e.kategorie] || e.kategorie),
        e.gegenpartei, (L['zahl_'+e.zahlungsart] || e.zahlungsart),
        r2(e.betrag).toFixed(2),
        e.beleg ? 'ja' : '',
        inv ? inv.nr : '',
        e.notiz
      ].map(esc).join(';'));
    });

  const rep = report(books, von, bis);
  rows.push('');
  rows.push([esc(L.umsatz||'Umsatz'),'','','','',rep.umsatz.toFixed(2)].join(';'));
  rows.push([esc(L.aufwand||'Aufwand'),'','','','',rep.aufwand.toFixed(2)].join(';'));
  rows.push([esc(L.gewinn||'Gewinn'),'','','','',rep.gewinn.toFixed(2)].join(';'));
  return '﻿' + rows.join('\r\n');     // BOM, damit Excel die Umlaute erkennt
}

/* ==========================================================================
 * 8. Nutzdaten der Schweizer QR-Rechnung
 * --------------------------------------------------------------------------
 * Aufbau nach den Implementation Guidelines QR-Rechnung: 31 Zeilen,
 * getrennt durch Zeilenumbrüche, abgeschlossen mit EPD.
 * ========================================================================== */
function qrPayload(inv, co, cfg){
  const t = invoiceTotals(inv);
  const cut = (s, max) => String(s||'').slice(0, max);

  const refTyp = inv.refTyp === 'SCOR' && scorValid(inv.ref) ? 'SCOR' : 'NON';
  const ref    = refTyp === 'SCOR' ? inv.ref.replace(/\s/g,'') : '';
  const mitteilung = refTyp === 'SCOR' ? '' : cut('Rechnung ' + inv.nr, 140);

  const lines = [
    'SPC',                                   // 1  QRType
    '0200',                                  // 2  Version
    '1',                                     // 3  Codierung UTF-8
    ibanClean(cfg.iban),                     // 4  Konto
    'S',                                     // 5  Adresstyp Zahlungsempfänger
    cut(co.name, 70),                        // 6  Name
    cut(co.street, 70),                      // 7  Strasse
    cut(co.hausnr || '', 16),                // 8  Hausnummer
    cut(co.zip, 16),                         // 9  PLZ
    cut(co.city, 35),                        // 10 Ort
    cut(co.land || 'CH', 2),                 // 11 Land
    '', '', '', '', '', '', '',              // 12–18 Endgültiger Zahlungsempfänger (leer)
    t.brutto > 0 ? t.brutto.toFixed(2) : '', // 19 Betrag
    'CHF',                                   // 20 Währung
    inv.kunde.name ? 'S' : '',               // 21 Adresstyp Zahlungspflichtiger
    cut(inv.kunde.name, 70),                 // 22 Name
    cut(inv.kunde.street, 70),               // 23 Strasse
    '',                                      // 24 Hausnummer
    cut(inv.kunde.zip, 16),                  // 25 PLZ
    cut(inv.kunde.city, 35),                 // 26 Ort
    inv.kunde.name ? cut(inv.kunde.land || 'CH', 2) : '',  // 27 Land
    refTyp,                                  // 28 Referenztyp
    ref,                                     // 29 Referenz
    mitteilung,                              // 30 Unstrukturierte Mitteilung
    'EPD'                                    // 31 Endekennzeichen
  ];
  return lines.join('\n');
}

/** Prüft die Angaben, die für eine gültige QR-Rechnung nötig sind. */
function qrCheck(inv, co, cfg){
  const fehlt = [];
  if(!ibanValid(cfg.iban))                fehlt.push('iban');
  if(!co.name)                            fehlt.push('coName');
  if(!co.zip || !co.city)                 fehlt.push('coOrt');
  if(invoiceTotals(inv).brutto <= 0)      fehlt.push('betrag');
  if(inv.refTyp === 'SCOR' && isQrIban(cfg.iban)) fehlt.push('qrIbanScor');
  if(inv.refTyp === 'NON'  && isQrIban(cfg.iban)) fehlt.push('qrIbanNon');
  return fehlt;
}

/* ==========================================================================
 * 9. Öffentliche Schnittstelle
 * ========================================================================== */
return {
  KAT_AUSGABE, KAT_EINNAHME, ZAHLARTEN, RG_STATUS,
  blankBooks, blankEntry, today, nid, addDays, makeNr,
  ibanClean, ibanValid, ibanFormat, isQrIban,
  scorReference, scorValid,
  invoiceFromCalc, invoiceTotals, markPaid, unmarkPaid,
  report, yearRange, years, csv,
  qrPayload, qrCheck, r2
};

})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_BUCH;
