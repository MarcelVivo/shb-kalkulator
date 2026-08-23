/* ==========================================================================
 * Sweet Home Bakery · Bedienung der Buchhaltung
 * --------------------------------------------------------------------------
 * Vier Bereiche: Übersicht, Rechnungen, Belege, Einstellungen.
 * Setzt buch.js, invoice.js, qrcode.js, photo.js, pdf.js und app.js voraus.
 * ========================================================================== */

'use strict';

(function(){

/* ==========================================================================
 * 1. Übersetzungen
 * ========================================================================== */
const TX = {
  de:{
    secBuch:'Buchhaltung', buchOpen:'Buchhaltung öffnen',
    buchHint:'Rechnungen stellen, Ausgaben erfassen und jederzeit sehen, was unter dem Strich bleibt.',
    bTabOverview:'Übersicht', bTabInvoices:'Rechnungen', bTabEntries:'Belege', bTabSettings:'Konto',
    bPeriod:'Zeitraum', bYear:'Jahr', bAll:'Alles',
    bRevenue:'Umsatz', bExpense:'Aufwand', bProfit:'Gewinn', bMargin:'Marge',
    bOpen:'Offene Rechnungen', bOverdue:'Überfällig', bLiquid:'Flüssige Mittel',
    bReceivables:'Forderungen', bDebts:'Schulden', bAssets:'Vermögen',
    bByCategory:'Aufwand nach Kategorie', bByMonth:'Monatsverlauf', bNoData:'Für diesen Zeitraum ist noch nichts erfasst.',
    bVatWatch:'Mehrwertsteuer-Schwelle', bVatNote:'{p} % von CHF 100’000 Jahresumsatz. Ab dieser Grenze wird die Mehrwertsteuer obligatorisch.',
    bNewInvoice:'Rechnung aus dieser Kalkulation', bInvoiceShort:'Rechnung erstellen', bNewEntry:'Beleg erfassen',
    bInvNr:'Nummer', bInvDate:'Datum', bInvDue:'Fällig', bInvCustomer:'Kunde', bInvAmount:'Betrag',
    bStatus:'Status', bStatusOpen:'offen', bStatusPaid:'bezahlt', bStatusVoid:'storniert',
    bMarkPaid:'Als bezahlt buchen', bUnmarkPaid:'Zahlung zurücknehmen',
    bInvPdf:'Rechnung als PDF', bInvSend:'Rechnung senden', bVoid:'Stornieren',
    bNoInvoices:'Noch keine Rechnungen.', bNoEntries:'Noch keine Belege.',
    bEntryKind:'Art', bIncome:'Einnahme', bExpenseOne:'Ausgabe',
    bDate:'Datum', bAmount:'Betrag', bCategory:'Kategorie', bParty:'Lieferant / Kunde',
    bPayment:'Zahlungsart', bReceipt:'Beleg', bReceiptAdd:'Beleg anhängen', bNote:'Notiz',
    bReceiptHint:'Foto oder PDF – zum Beispiel die Quittung vom Einkauf.',
    bReceiptRemove:'Beleg entfernen', bReceiptPdf:'PDF-Beleg',
    errReceipt:'Diese Datei lässt sich nicht anhängen. Möglich sind Fotos und PDF.',
    errReceiptBig:'Der Beleg ist zu gross ({mb} MB). Bitte ein kleineres Foto oder PDF wählen.',
    bLinkOrder:'Zu diesem Auftrag', bSave:'Speichern', bDelete:'Löschen',
    kat:{
      zutaten:'Zutaten', verpackung:'Verpackung', werkzeug:'Werkzeug', geraete:'Geräte',
      miete:'Miete / Raum', energie:'Strom, Wasser, Gas', fahrzeug:'Fahrzeug',
      marketing:'Marketing', versicherung:'Versicherung', gebuehren:'Gebühren',
      weiterbildung:'Weiterbildung', buero:'Büro / Software', beitraege:'Sozialbeiträge',
      torten:'Torten', gebaeck:'Gebäck', kurse:'Kurse', lieferung:'Lieferung', sonstiges:'Sonstiges'
    },
    zahl:{ bar:'Bar', twint:'TWINT', bank:'Bank', karte:'Karte', sonstiges:'Sonstiges' },
    bIban:'IBAN für Zahlungen', bIbanBad:'Diese IBAN ist nicht gültig.',
    bIbanQrScor:'Bei einer QR-IBAN ist nur die QR-Referenz zulässig, nicht SCOR.',
    bIbanQrNon:'Eine QR-IBAN verlangt zwingend eine QR-Referenz.',
    bRefType:'Referenz', bRefNon:'Mitteilung mit Rechnungsnummer', bRefScor:'Creditor Reference (RF)',
    bTerm:'Zahlungsfrist (Tage)', bPrefix:'Nummernkreis', bNextNr:'Nächste Nummer',
    bVat:'Mehrwertsteuerpflichtig', bVatRate:'Satz (%)', bVatNr:'MwSt-Nummer',
    bAssetsTitle:'Vermögenslage', bCash:'Kasse', bBank:'Bankkonto', bDebtsIn:'Offene Schulden',
    bAssetsDate:'Stand per',
    bExportCsv:'Journal als CSV', bExportPdf:'Jahresübersicht als PDF',
    bLegal:'Rechtlicher Rahmen',
    bLegalText:'Einzelunternehmen mit weniger als CHF 500’000 Umsatz führen nach Art. 957 Abs. 2 OR eine vereinfachte Buchhaltung: Einnahmen, Ausgaben und Vermögenslage. Eine doppelte Buchhaltung mit Bilanz ist nicht vorgeschrieben. Belege sind zehn Jahre aufzubewahren. Dieses Werkzeug ersetzt keine Steuer- oder Rechtsberatung.',
    bInvNeedIban:'Für die QR-Rechnung fehlt eine gültige IBAN. Bitte unter «Konto» eintragen.',
    bInvCreated:'Rechnung {nr} erstellt.', bInvPaid:'Zahlung verbucht.',
    bEntrySaved:'Beleg gespeichert.', bDeleted:'Gelöscht.',
    bAskDelete:'Diesen Eintrag wirklich löschen?', bAskVoid:'Diese Rechnung stornieren?',
    bNoCalc:'Trage zuerst Kundenname und Preis in der Kalkulation ein.',
    /* Beschriftungen im Rechnungs-PDF */
    invTitle:'Rechnung', invDate:'Rechnungsdatum', invDue:'Zahlbar bis',
    invPos:'Beschreibung', invQty:'Menge', invPrice:'Preis', invSum:'Betrag',
    invNet:'Zwischensumme', invVat:'MwSt', invTotal:'Gesamtbetrag', invVatNo:'MwSt-Nr.',
    invTerms:'Zahlbar innert {d} Tagen bis {f}.',
    invNoVat:'Kein Mehrwertsteuerausweis, da der Umsatz unter der Eintragungsgrenze liegt.',
    invThanks:'Herzlichen Dank für Ihren Auftrag.',
    invShareTitle:'Rechnung Sweet Home Bakery',
    invShareText:'Guten Tag {name}, anbei die Rechnung für Ihre Bestellung. Herzliche Grüsse',
    yearTitle:'Jahresübersicht', yearFor:'Geschäftsjahr'
  },
  ua:{
    secBuch:'Бухгалтерія', buchOpen:'Відкрити бухгалтерію',
    buchHint:'Виставляй рахунки, вноси витрати й бачиш, скільки залишається в підсумку.',
    bTabOverview:'Огляд', bTabInvoices:'Рахунки', bTabEntries:'Документи', bTabSettings:'Рахунок',
    bPeriod:'Період', bYear:'Рік', bAll:'Усе',
    bRevenue:'Оборот', bExpense:'Витрати', bProfit:'Прибуток', bMargin:'Маржа',
    bOpen:'Неоплачені рахунки', bOverdue:'Прострочені', bLiquid:'Готівка та рахунок',
    bReceivables:'Дебіторська заборгованість', bDebts:'Борги', bAssets:'Майно',
    bByCategory:'Витрати за категоріями', bByMonth:'За місяцями', bNoData:'За цей період ще нічого не внесено.',
    bVatWatch:'Поріг ПДВ', bVatNote:'{p} % від CHF 100’000 річного обороту. Після цієї межі ПДВ стає обов’язковим.',
    bNewInvoice:'Рахунок із цього розрахунку', bInvoiceShort:'Створити рахунок', bNewEntry:'Внести документ',
    bInvNr:'Номер', bInvDate:'Дата', bInvDue:'Термін', bInvCustomer:'Клієнт', bInvAmount:'Сума',
    bStatus:'Статус', bStatusOpen:'неоплачений', bStatusPaid:'оплачений', bStatusVoid:'скасований',
    bMarkPaid:'Провести оплату', bUnmarkPaid:'Скасувати оплату',
    bInvPdf:'Рахунок у PDF', bInvSend:'Надіслати рахунок', bVoid:'Скасувати',
    bNoInvoices:'Рахунків ще немає.', bNoEntries:'Документів ще немає.',
    bEntryKind:'Тип', bIncome:'Надходження', bExpenseOne:'Витрата',
    bDate:'Дата', bAmount:'Сума', bCategory:'Категорія', bParty:'Постачальник / клієнт',
    bPayment:'Спосіб оплати', bReceipt:'Документ', bReceiptAdd:'Додати документ', bNote:'Нотатка',
    bReceiptHint:'Фото або PDF — наприклад чек із закупівлі.',
    bReceiptRemove:'Видалити документ', bReceiptPdf:'PDF-документ',
    errReceipt:'Цей файл не вдається додати. Підходять фото та PDF.',
    errReceiptBig:'Документ завеликий ({mb} МБ). Обери менше фото або PDF.',
    bLinkOrder:'До цього замовлення', bSave:'Зберегти', bDelete:'Видалити',
    kat:{
      zutaten:'Інгредієнти', verpackung:'Пакування', werkzeug:'Інструменти', geraete:'Обладнання',
      miete:'Оренда', energie:'Електрика, вода, газ', fahrzeug:'Транспорт',
      marketing:'Маркетинг', versicherung:'Страхування', gebuehren:'Комісії',
      weiterbildung:'Навчання', buero:'Офіс / програми', beitraege:'Соцвнески',
      torten:'Торти', gebaeck:'Випічка', kurse:'Курси', lieferung:'Доставка', sonstiges:'Інше'
    },
    zahl:{ bar:'Готівка', twint:'TWINT', bank:'Банк', karte:'Картка', sonstiges:'Інше' },
    bIban:'IBAN для платежів', bIbanBad:'Цей IBAN недійсний.',
    bIbanQrScor:'Для QR-IBAN допустима лише QR-референція, не SCOR.',
    bIbanQrNon:'QR-IBAN вимагає обов’язкової QR-референції.',
    bRefType:'Референція', bRefNon:'Повідомлення з номером рахунку', bRefScor:'Creditor Reference (RF)',
    bTerm:'Термін оплати (днів)', bPrefix:'Префікс номера', bNextNr:'Наступний номер',
    bVat:'Платник ПДВ', bVatRate:'Ставка (%)', bVatNr:'Номер ПДВ',
    bAssetsTitle:'Майновий стан', bCash:'Каса', bBank:'Банківський рахунок', bDebtsIn:'Непогашені борги',
    bAssetsDate:'Станом на',
    bExportCsv:'Журнал у CSV', bExportPdf:'Річний огляд у PDF',
    bLegal:'Правова основа',
    bLegalText:'Одноосібні підприємства з оборотом до CHF 500’000 ведуть спрощений облік за ст. 957 абз. 2 CO: надходження, витрати та майновий стан. Подвійна бухгалтерія з балансом не обов’язкова. Документи зберігаються десять років. Цей інструмент не замінює податкову чи юридичну консультацію.',
    bInvNeedIban:'Для QR-рахунку бракує дійсного IBAN. Внеси його в розділі «Рахунок».',
    bInvCreated:'Рахунок {nr} створено.', bInvPaid:'Оплату проведено.',
    bEntrySaved:'Документ збережено.', bDeleted:'Видалено.',
    bAskDelete:'Справді видалити цей запис?', bAskVoid:'Скасувати цей рахунок?',
    bNoCalc:'Спочатку внеси ім’я клієнта та ціну в розрахунку.',
    invTitle:'Рахунок', invDate:'Дата рахунку', invDue:'Оплатити до',
    invPos:'Опис', invQty:'Кількість', invPrice:'Ціна', invSum:'Сума',
    invNet:'Проміжна сума', invVat:'ПДВ', invTotal:'Загальна сума', invVatNo:'Номер ПДВ',
    invTerms:'Оплатити протягом {d} днів до {f}.',
    invNoVat:'ПДВ не нараховується, оскільки оборот нижчий за поріг реєстрації.',
    invThanks:'Щиро дякуємо за ваше замовлення.',
    invShareTitle:'Рахунок Sweet Home Bakery',
    invShareText:'Доброго дня, {name}! Надсилаю рахунок за ваше замовлення. З найкращими побажаннями',
    yearTitle:'Річний огляд', yearFor:'Фінансовий рік'
  }
};

if(typeof translations !== 'undefined'){
  Object.assign(translations.de, TX.de);
  Object.assign(translations.ua, TX.ua);
}

const B = SHB_BUCH;
let books = null;
let bTab  = 'overview';
let period = { von:'', bis:'' };
let built = false;
let editEntry = null;      // Beleg in Bearbeitung
let receiptSession = null;

/* ==========================================================================
 * 2. Gerüst
 * ========================================================================== */
function buildUi(){
  if(built) return;
  const html = `
  <div class="modal modal-full" id="modalBuch" hidden>
    <div class="modal-box design-box" role="dialog" aria-modal="true">
      <header class="modal-head">
        <h2 data-i18n="secBuch">Buchhaltung</h2>
        <button class="modal-x" type="button" data-close aria-label="X">×</button>
      </header>
      <nav class="design-tabs" id="buchTabs">
        <button type="button" data-btab="overview" class="is-active" data-i18n="bTabOverview">Übersicht</button>
        <button type="button" data-btab="invoices" data-i18n="bTabInvoices">Rechnungen</button>
        <button type="button" data-btab="entries"  data-i18n="bTabEntries">Belege</button>
        <button type="button" data-btab="settings" data-i18n="bTabSettings">Konto</button>
      </nav>
      <div class="buch-body" id="buchBody"></div>
      <footer class="modal-foot modal-foot-wrap">
        <button class="btn btn-quiet"   type="button" data-close data-i18n="btnClose">Schliessen</button>
        <button class="btn btn-outline" type="button" id="btnBuchCsv" data-i18n="bExportCsv">Journal als CSV</button>
        <button class="btn btn-outline" type="button" id="btnBuchPdf" data-i18n="bExportPdf">Jahresübersicht als PDF</button>
      </footer>
    </div>
  </div>
  <input type="file" id="receiptInput" accept="image/*,application/pdf,.pdf,.heic,.heif" hidden>`;

  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  while(wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);
  built = true;

  $$('#buchTabs button').forEach(b=>b.addEventListener('click', ()=>{
    bTab = b.dataset.btab;
    $$('#buchTabs button').forEach(x=>x.classList.toggle('is-active', x===b));
    render();
  }));
  $('#modalBuch').addEventListener('click', e=>{ if(e.target.closest('[data-close]')) closeModal($('#modalBuch')); });
  $('#btnBuchCsv').addEventListener('click', exportCsv);
  $('#btnBuchPdf').addEventListener('click', exportYearPdf);
  $('#receiptInput').addEventListener('change', onReceipt);
}

/* ==========================================================================
 * 3. Darstellung
 * ========================================================================== */
const chf = v => settings.waehrung + ' ' + Number(v||0).toLocaleString('de-CH',{minimumFractionDigits:2,maximumFractionDigits:2});
const dat = iso => { const p = String(iso||'').split('-'); return p.length===3 ? `${p[2]}.${p[1]}.${p[0]}` : (iso||''); };

function render(){
  const b = $('#buchBody');
  if(!b) return;
  if(bTab==='overview') b.innerHTML = viewOverview();
  if(bTab==='invoices') b.innerHTML = viewInvoices();
  if(bTab==='entries')  b.innerHTML = viewEntries();
  if(bTab==='settings') b.innerHTML = viewSettings();
  bind();
}

function periodBar(){
  const ys = B.years(books);
  const cur = period.von ? period.von.slice(0,4) : '';
  return `<div class="b-period">
    <label class="field field-inline"><span>${escapeHtml(t('bPeriod'))}</span>
      <select id="bYear">
        <option value=""${cur?'':' selected'}>${escapeHtml(t('bAll'))}</option>
        ${ys.map(y=>`<option value="${y}"${cur===y?' selected':''}>${y}</option>`).join('')}
      </select></label>
  </div>`;
}

function kpi(label, value, cls){
  return `<div class="kpi ${cls||''}"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function viewOverview(){
  const r = B.report(books, period.von, period.bis);
  const maxMonth = Math.max(1, ...r.monate.map(m=>Math.max(m.einnahmen, m.ausgaben)));
  const katMax = Math.max(1, ...Object.values(r.aufwandKat));

  let h = periodBar();
  h += `<div class="kpi-grid b-kpi">
      ${kpi(t('bRevenue'), chf(r.umsatz))}
      ${kpi(t('bExpense'), chf(r.aufwand))}
      ${kpi(t('bProfit'), chf(r.gewinn), r.gewinn>=0?'kpi-strong':'kpi-bad')}
      ${kpi(t('bMargin'), r.marge.toFixed(1)+' %')}
    </div>`;

  if(!r.anzahlBelege && !r.rechnungen){
    h += `<p class="hint">${escapeHtml(t('bNoData'))}</p>`;
  }

  /* Offene Posten */
  h += `<div class="subcard">
      <h3>${escapeHtml(t('bOpen'))}</h3>
      <div class="sum-grid">
        <div><span>${escapeHtml(t('bOpen'))}</span><b>${escapeHtml(chf(r.offenSumme))}</b></div>
        <div><span>${escapeHtml(t('bOverdue'))}</span><b class="${r.ueberfaellig?'is-bad':''}">${escapeHtml(chf(r.ueberfaelligSumme))}</b></div>
      </div>
    </div>`;

  /* Monatsverlauf */
  if(r.monate.length){
    h += `<div class="subcard"><h3>${escapeHtml(t('bByMonth'))}</h3><div class="b-bars">`;
    r.monate.forEach(m=>{
      const he = Math.round(m.einnahmen/maxMonth*100), ha = Math.round(m.ausgaben/maxMonth*100);
      h += `<div class="b-bar" title="${m.monat}">
              <div class="b-bar-cols">
                <i class="in"  style="height:${he}%"></i>
                <i class="out" style="height:${ha}%"></i>
              </div>
              <em>${m.monat.slice(5)}</em></div>`;
    });
    h += `</div><div class="b-legend"><span class="in"></span>${escapeHtml(t('bRevenue'))}
          <span class="out"></span>${escapeHtml(t('bExpense'))}</div></div>`;
  }

  /* Aufwand nach Kategorie */
  const kats = Object.entries(r.aufwandKat).sort((a,b2)=>b2[1]-a[1]);
  if(kats.length){
    h += `<div class="subcard"><h3>${escapeHtml(t('bByCategory'))}</h3>`;
    kats.forEach(([k,v])=>{
      h += `<div class="b-cat"><span>${escapeHtml(t('kat.'+k)||k)}</span>
              <i style="width:${Math.round(v/katMax*100)}%"></i>
              <b>${escapeHtml(chf(v))}</b></div>`;
    });
    h += `</div>`;
  }

  /* Vermögenslage */
  h += `<div class="subcard"><h3>${escapeHtml(t('bAssetsTitle'))}</h3>
      <div class="sum-grid">
        <div><span>${escapeHtml(t('bLiquid'))}</span><b>${escapeHtml(chf(r.fluessig))}</b></div>
        <div><span>${escapeHtml(t('bReceivables'))}</span><b>${escapeHtml(chf(r.forderungen))}</b></div>
        <div><span>${escapeHtml(t('bDebts'))}</span><b>${escapeHtml(chf(r.schulden))}</b></div>
      </div>
      <div class="sum-line"><span>${escapeHtml(t('bAssets'))}</span><b>${escapeHtml(chf(r.vermoegen))}</b></div>
    </div>`;

  /* Schwelle zur Mehrwertsteuer */
  h += `<div class="subcard"><h3>${escapeHtml(t('bVatWatch'))}</h3>
      <div class="b-progress"><i style="width:${Math.min(100, r.mwstAnteil).toFixed(1)}%"></i></div>
      <p class="hint">${escapeHtml(tf('bVatNote',{p:r.mwstAnteil.toFixed(1)}))}</p>
    </div>`;

  h += `<div class="subcard"><h3>${escapeHtml(t('bLegal'))}</h3>
      <p class="hint">${escapeHtml(t('bLegalText'))}</p></div>`;
  return h;
}

function viewInvoices(){
  let h = `<button type="button" class="btn btn-primary b-wide" id="bNewInvoice">${escapeHtml(t('bNewInvoice'))}</button>`;
  const list = (books.invoices||[]).slice().sort((a,b2)=>a.datum<b2.datum?1:-1);
  if(!list.length) return h + `<p class="hint">${escapeHtml(t('bNoInvoices'))}</p>`;
  const heute = B.today();
  h += `<div class="b-list">`;
  list.forEach(i=>{
    const T = B.invoiceTotals(i);
    const overdue = i.status==='offen' && i.faellig && i.faellig < heute;
    const st = i.status==='bezahlt' ? t('bStatusPaid') : i.status==='storniert' ? t('bStatusVoid') : t('bStatusOpen');
    h += `<div class="b-item" data-inv="${i.id}">
      <div class="b-item-top">
        <div>
          <div class="b-item-title">${escapeHtml(i.nr)} · ${escapeHtml(i.kunde.name||'—')}</div>
          <div class="b-item-meta">${escapeHtml(dat(i.datum))} · ${escapeHtml(t('bInvDue'))} ${escapeHtml(dat(i.faellig))}
            <span class="b-tag ${i.status}${overdue?' overdue':''}">${escapeHtml(st)}</span></div>
        </div>
        <div class="b-item-sum">${escapeHtml(chf(T.brutto))}</div>
      </div>
      <div class="b-item-acts">
        <button type="button" data-inv-pdf="${i.id}">${escapeHtml(t('bInvPdf'))}</button>
        <button type="button" data-inv-send="${i.id}">${escapeHtml(t('bInvSend'))}</button>
        ${i.status==='offen'
          ? `<button type="button" data-inv-paid="${i.id}">${escapeHtml(t('bMarkPaid'))}</button>
             <button type="button" class="del" data-inv-void="${i.id}">${escapeHtml(t('bVoid'))}</button>`
          : i.status==='bezahlt'
            ? `<button type="button" data-inv-unpaid="${i.id}">${escapeHtml(t('bUnmarkPaid'))}</button>` : ''}
      </div>
    </div>`;
  });
  return h + `</div>`;
}

function viewEntries(){
  if(editEntry) return entryForm();
  let h = `<div class="d-acts">
      <button type="button" class="btn btn-primary" id="bNewExpense">+ ${escapeHtml(t('bExpenseOne'))}</button>
      <button type="button" class="btn btn-outline" id="bNewIncome">+ ${escapeHtml(t('bIncome'))}</button>
    </div>` + periodBar();
  const inR = d => (!period.von || d>=period.von) && (!period.bis || d<=period.bis);
  const list = (books.entries||[]).filter(e=>inR(e.datum)).sort((a,b2)=>a.datum<b2.datum?1:-1);
  if(!list.length) return h + `<p class="hint">${escapeHtml(t('bNoEntries'))}</p>`;
  h += `<div class="b-list">`;
  list.forEach(e=>{
    h += `<div class="b-item" data-entry="${e.id}">
      <div class="b-item-top">
        <div>
          <div class="b-item-title">${escapeHtml(t('kat.'+e.kategorie)||e.kategorie)}
            ${e.gegenpartei?' · '+escapeHtml(e.gegenpartei):''}</div>
          <div class="b-item-meta">${escapeHtml(dat(e.datum))} · ${escapeHtml(t('zahl.'+e.zahlungsart)||e.zahlungsart)}
            ${e.beleg?' · '+(e.belegTyp==='pdf'?'PDF':'📎'):''}${e.notiz?' · '+escapeHtml(e.notiz):''}</div>
        </div>
        <div class="b-item-sum ${e.art==='einnahme'?'is-in':'is-out'}">
          ${e.art==='einnahme'?'+':'−'} ${escapeHtml(chf(e.betrag))}</div>
      </div>
      <div class="b-item-acts">
        <button type="button" data-entry-edit="${e.id}">${escapeHtml(t('dPhotoEdit'))}</button>
        <button type="button" class="del" data-entry-del="${e.id}">${escapeHtml(t('bDelete'))}</button>
      </div>
    </div>`;
  });
  return h + `</div>`;
}

function entryForm(){
  const e = editEntry;
  const kats = e.art==='einnahme' ? B.KAT_EINNAHME : B.KAT_AUSGABE;
  return `<div class="subcard">
    <h3>${escapeHtml(e.art==='einnahme'? t('bIncome') : t('bExpenseOne'))}</h3>
    <div class="d-row">
      <label class="field"><span>${escapeHtml(t('bDate'))}</span>
        <input type="date" id="eDate" value="${escapeHtml(e.datum)}"></label>
      <label class="field"><span>${escapeHtml(t('bAmount'))}</span>
        <span class="input-chf"><em>${settings.waehrung}</em>
          <input type="number" inputmode="decimal" id="eAmount" min="0" step="0.05" value="${e.betrag||''}"></span></label>
      <label class="field"><span>${escapeHtml(t('bCategory'))}</span>
        <select id="eKat">${kats.map(k=>`<option value="${k}"${e.kategorie===k?' selected':''}>${escapeHtml(t('kat.'+k)||k)}</option>`).join('')}</select></label>
    </div>
    <div class="d-row">
      <label class="field"><span>${escapeHtml(t('bParty'))}</span>
        <input type="text" id="eParty" value="${escapeHtml(e.gegenpartei)}"></label>
      <label class="field"><span>${escapeHtml(t('bPayment'))}</span>
        <select id="eZahl">${B.ZAHLARTEN.map(z=>`<option value="${z}"${e.zahlungsart===z?' selected':''}>${escapeHtml(t('zahl.'+z)||z)}</option>`).join('')}</select></label>
      <label class="field"><span>${escapeHtml(t('bNote'))}</span>
        <input type="text" id="eNote" value="${escapeHtml(e.notiz)}"></label>
    </div>
    <div class="b-receipt">
      ${e.beleg
        ? (e.belegTyp === 'pdf'
            ? `<a class="b-pdf" href="${e.beleg}" target="_blank" rel="noopener">
                 <span class="b-pdf-ico">PDF</span>
                 <span>${escapeHtml(e.belegName || t('bReceiptPdf'))}</span></a>`
            : `<img src="${e.beleg}" alt="">`)
        : ''}
      <div class="b-receipt-acts">
        <button type="button" class="btn btn-outline" id="eReceipt">${escapeHtml(t('bReceiptAdd'))}</button>
        ${e.beleg ? `<button type="button" class="btn btn-quiet" id="eReceiptDel">${escapeHtml(t('bReceiptRemove'))}</button>` : ''}
      </div>
    </div>
    <p class="hint">${escapeHtml(t('bReceiptHint'))}</p>
    <div class="d-acts">
      <button type="button" class="btn btn-quiet" id="eCancel">${escapeHtml(t('btnClose'))}</button>
      <button type="button" class="btn btn-primary" id="eSave">${escapeHtml(t('bSave'))}</button>
    </div>
  </div>`;
}

function viewSettings(){
  const c = books.cfg, a = books.assets;
  const ibanOk = !c.iban || B.ibanValid(c.iban);
  return `<div class="subcard">
    <h3>${escapeHtml(t('bTabSettings'))}</h3>
    <label class="field"><span>${escapeHtml(t('bIban'))}</span>
      <input type="text" id="cIban" value="${escapeHtml(B.ibanFormat(c.iban))}" placeholder="CH.. .... .... .... ...."
        class="${ibanOk?'':'is-error'}" autocomplete="off" spellcheck="false"></label>
    ${ibanOk?'':`<p class="hint" style="color:var(--bad)">${escapeHtml(t('bIbanBad'))}</p>`}
    ${B.isQrIban(c.iban) ? `<p class="hint" style="color:var(--warn)">${escapeHtml(c.refTyp==='SCOR'?t('bIbanQrScor'):t('bIbanQrNon'))}</p>` : ''}
    <div class="d-row">
      <label class="field"><span>${escapeHtml(t('bRefType'))}</span>
        <select id="cRef">
          <option value="NON"${c.refTyp==='NON'?' selected':''}>${escapeHtml(t('bRefNon'))}</option>
          <option value="SCOR"${c.refTyp==='SCOR'?' selected':''}>${escapeHtml(t('bRefScor'))}</option>
        </select></label>
      <label class="field"><span>${escapeHtml(t('bTerm'))}</span>
        <input type="number" inputmode="decimal" id="cTerm" min="0" step="1" value="${c.zahlungsfrist}"></label>
      <label class="field"><span>${escapeHtml(t('bPrefix'))}</span>
        <input type="text" id="cPrefix" value="${escapeHtml(c.praefix)}" maxlength="4"></label>
      <label class="field"><span>${escapeHtml(t('bNextNr'))}</span>
        <input type="number" inputmode="decimal" id="cNext" min="1" step="1" value="${c.nextNr}"></label>
    </div>
  </div>
  <div class="subcard">
    <h3>${escapeHtml(t('bVat'))}</h3>
    <label class="check"><input type="checkbox" id="cVat"${c.mwstPflicht?' checked':''}>
      <span>${escapeHtml(t('bVat'))}</span></label>
    ${c.mwstPflicht ? `<div class="d-row">
      <label class="field"><span>${escapeHtml(t('bVatRate'))}</span>
        <span class="input-chf"><input type="number" inputmode="decimal" id="cVatRate" min="0" max="30" step="0.1" value="${c.mwstSatz}"><em>%</em></span></label>
      <label class="field"><span>${escapeHtml(t('bVatNr'))}</span>
        <input type="text" id="cVatNr" value="${escapeHtml(c.mwstNr)}" placeholder="CHE-123.456.789 MWST"></label>
    </div>` : ''}
  </div>
  <div class="subcard">
    <h3>${escapeHtml(t('bAssetsTitle'))}</h3>
    <div class="d-row">
      <label class="field"><span>${escapeHtml(t('bCash'))}</span>
        <span class="input-chf"><em>${settings.waehrung}</em>
          <input type="number" inputmode="decimal" id="aKasse" step="0.05" value="${a.kasse}"></span></label>
      <label class="field"><span>${escapeHtml(t('bBank'))}</span>
        <span class="input-chf"><em>${settings.waehrung}</em>
          <input type="number" inputmode="decimal" id="aBank" step="0.05" value="${a.bank}"></span></label>
      <label class="field"><span>${escapeHtml(t('bDebtsIn'))}</span>
        <span class="input-chf"><em>${settings.waehrung}</em>
          <input type="number" inputmode="decimal" id="aSchulden" step="0.05" value="${a.schulden}"></span></label>
    </div>
    <label class="field"><span>${escapeHtml(t('bAssetsDate'))}</span>
      <input type="date" id="aStand" value="${escapeHtml(a.stand)}"></label>
  </div>`;
}

/* ==========================================================================
 * 4. Ereignisse
 * ========================================================================== */
function bind(){
  const p = $('#buchBody');
  const on = (sel, ev, fn)=>{ const el = p.querySelector(sel); if(el) el.addEventListener(ev, fn); };

  on('#bYear','change', e=>{
    const y = e.target.value;
    period = y ? B.yearRange(y) : {von:'',bis:''};
    render();
  });

  /* Rechnungen */
  on('#bNewInvoice','click', createInvoice);
  p.querySelectorAll('[data-inv-pdf]').forEach(b=>b.addEventListener('click',()=>invoicePdf(b.dataset.invPdf,'save')));
  p.querySelectorAll('[data-inv-send]').forEach(b=>b.addEventListener('click',()=>invoicePdf(b.dataset.invSend,'share')));
  p.querySelectorAll('[data-inv-paid]').forEach(b=>b.addEventListener('click',()=>{
    B.markPaid(books, b.dataset.invPaid, B.today(), 'bank');
    save(); render(); toast(t('bInvPaid'));
  }));
  p.querySelectorAll('[data-inv-unpaid]').forEach(b=>b.addEventListener('click',()=>{
    B.unmarkPaid(books, b.dataset.invUnpaid); save(); render();
  }));
  p.querySelectorAll('[data-inv-void]').forEach(b=>b.addEventListener('click',()=>{
    if(!confirm(t('bAskVoid'))) return;
    const i = books.invoices.find(x=>x.id===b.dataset.invVoid);
    if(i){ i.status = 'storniert'; save(); render(); }
  }));

  /* Belege */
  on('#bNewExpense','click', ()=>{ editEntry = B.blankEntry('ausgabe'); render(); });
  on('#bNewIncome','click',  ()=>{ editEntry = B.blankEntry('einnahme'); render(); });
  p.querySelectorAll('[data-entry-edit]').forEach(b=>b.addEventListener('click',()=>{
    editEntry = books.entries.find(x=>x.id===b.dataset.entryEdit) || null; render();
  }));
  p.querySelectorAll('[data-entry-del]').forEach(b=>b.addEventListener('click',()=>{
    if(!confirm(t('bAskDelete'))) return;
    books.entries = books.entries.filter(x=>x.id!==b.dataset.entryDel);
    save(); render(); toast(t('bDeleted'));
  }));
  on('#eCancel','click', ()=>{ editEntry = null; render(); });
  on('#eReceipt','click', ()=>$('#receiptInput').click());
  on('#eReceiptDel','click', ()=>{
    editEntry.beleg = null; editEntry.belegTyp = ''; editEntry.belegName = '';
    render();
  });
  on('#eSave','click', ()=>{
    const e = editEntry;
    e.datum = p.querySelector('#eDate').value || B.today();
    e.betrag = B.r2(p.querySelector('#eAmount').value);
    e.kategorie = p.querySelector('#eKat').value;
    e.gegenpartei = p.querySelector('#eParty').value.trim();
    e.zahlungsart = p.querySelector('#eZahl').value;
    e.notiz = p.querySelector('#eNote').value.trim();
    if(!books.entries.some(x=>x.id===e.id)) books.entries.push(e);
    editEntry = null; save(); render(); toast(t('bEntrySaved'));
  });

  /* Konto */
  const cfgBind = (sel, fn)=>on(sel,'change', e=>{ fn(e.target.value, e.target); save(); render(); });
  cfgBind('#cIban',  v=>books.cfg.iban = B.ibanClean(v));
  cfgBind('#cRef',   v=>books.cfg.refTyp = v);
  cfgBind('#cTerm',  v=>books.cfg.zahlungsfrist = num(v));
  cfgBind('#cPrefix',v=>books.cfg.praefix = String(v||'R').toUpperCase());
  cfgBind('#cNext',  v=>books.cfg.nextNr = Math.max(1, num(v)));
  cfgBind('#cVat',   (v,el)=>books.cfg.mwstPflicht = el.checked);
  cfgBind('#cVatRate', v=>books.cfg.mwstSatz = num(v));
  cfgBind('#cVatNr',   v=>books.cfg.mwstNr = v.trim());
  cfgBind('#aKasse',   v=>books.assets.kasse = B.r2(v));
  cfgBind('#aBank',    v=>books.assets.bank = B.r2(v));
  cfgBind('#aSchulden',v=>books.assets.schulden = B.r2(v));
  cfgBind('#aStand',   v=>books.assets.stand = v);
}

/* ==========================================================================
 * 5. Rechnung aus der Kalkulation
 * ========================================================================== */
function createInvoice(){
  const c = (typeof calc !== 'undefined' && calc) ? calc : calculate(state);
  const preis = num(state.meta.kundenpreis) > 0 ? num(state.meta.kundenpreis) : c.price;
  if(preis <= 0){ toast(t('bNoCalc')); return; }
  if(!B.ibanValid(books.cfg.iban)){ toast(t('bInvNeedIban')); bTab = 'settings'; syncTabs(); render(); return; }

  const portionen = num(state.cake.portionen);
  const occ = t('occasions')[num(state.meta.anlass)] || '';
  const text = [ t('pdfTitlePlain'), occ, portionen ? tf('projPortions',{n:portionen}) : '' ]
    .filter(Boolean).join(' · ');

  const inv = B.invoiceFromCalc(books, {
    kunde: state.meta.kundenname,
    datum: B.today(),
    positionen: [{text, menge:1, preis: B.r2(preis)}],
    projectId: currentProjectId || '',
    notiz: state.meta.bemerkungen || ''
  });
  books.invoices.push(inv);
  books.cfg.nextNr = num(books.cfg.nextNr) + 1;
  save();
  bTab = 'invoices'; syncTabs(); render();
  toast(tf('bInvCreated',{nr:inv.nr}));
}

function syncTabs(){ $$('#buchTabs button').forEach(x=>x.classList.toggle('is-active', x.dataset.btab===bTab)); }

async function invoicePdf(id, mode){
  const inv = books.invoices.find(i=>i.id===id);
  if(!inv) return;
  const co = companyForQr();
  const fehlt = B.qrCheck(inv, co, books.cfg);
  if(fehlt.includes('iban')){ toast(t('bInvNeedIban')); return; }
  toast(t('pdfBusy'));
  try{
    let logo = null;
    try{
      const r = await fetch('shb-logo-pdf.jpg');
      if(r.ok){
        const bl = await r.blob();
        logo = await new Promise(res=>{ const fr = new FileReader(); fr.onload = ()=>res(fr.result); fr.readAsDataURL(bl); });
      }
    }catch(e){ /* ohne Logo weiter */ }

    const data = {
      inv, co, cfg:books.cfg, logo,
      tx: {
        invTitle:t('invTitle'), invDate:t('invDate'), invDue:t('invDue'), invPos:t('invPos'),
        invQty:t('invQty'), invPrice:t('invPrice'), invSum:t('invSum'), invNet:t('invNet'),
        invVat:t('invVat'), invTotal:t('invTotal'), invVatNo:t('invVatNo'),
        invTerms:t('invTerms'), invNoVat:t('invNoVat'), invThanks:t('invThanks')
      },
      shareTitle: t('invShareTitle'),
      shareText: tf('invShareText',{name: inv.kunde.name || ''})
    };
    const res = mode==='share' ? await SHB_INVOICE.share(data) : await SHB_INVOICE.save(data);
    if(res==='shared') toast(t('msgPdfShared'));
    else if(res==='saved') toast(t('msgPdfSaved'));
  }catch(e){ console.error('Rechnung:', e); toast(t('errPdf')); }
}

/** Firmendaten in die Form bringen, die der Zahlteil braucht. */
function companyForQr(){
  const co = {...DEFAULT_COMPANY, ...(settings.company||{})};
  const m = String(co.street||'').match(/^(.*?)[\s,]+(\d+[a-zA-Z]?)$/);
  return {
    name: co.name, street: m ? m[1].trim() : co.street, hausnr: m ? m[2] : '',
    zip: co.zip, city: co.city, land: 'CH', phone: co.phone, mail: co.mail
  };
}

/* ==========================================================================
 * 6. Belegfoto
 * ========================================================================== */
async function onReceipt(ev){
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = '';
  if(!file || !editEntry) return;

  const MAX = 3 * 1024 * 1024;                 // 3 MB Rohdatei
  if(file.size > MAX){
    toast(tf('errReceiptBig',{mb:(file.size/1048576).toFixed(1)}));
    return;
  }

  const istPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  try{
    if(istPdf){
      /* PDF unverändert ablegen – es soll sich später öffnen lassen */
      editEntry.beleg = await datenUrl(file);
      editEntry.belegTyp = 'pdf';
      editEntry.belegName = file.name;
    }else{
      /* Foto verkleinern, damit der Speicher nicht überläuft */
      const cv = await SHB_PHOTO.loadFile(file);
      editEntry.beleg = await SHB_PHOTO.thumb(cv, 900);
      editEntry.belegTyp = 'bild';
      editEntry.belegName = file.name;
    }
    render();
  }catch(e){
    console.error('Beleg:', e);
    toast(t('errReceipt'));
  }
}

/** Datei als Data-URL einlesen. */
function datenUrl(file){
  return new Promise((res, rej)=>{
    const fr = new FileReader();
    fr.onload  = ()=>res(fr.result);
    fr.onerror = ()=>rej(new Error('nicht lesbar'));
    fr.readAsDataURL(file);
  });
}

/* ==========================================================================
 * 7. Ausgaben
 * ========================================================================== */
function labelsForCsv(){
  const L = { einnahme:t('bIncome'), ausgabe:t('bExpenseOne'),
              umsatz:t('bRevenue'), aufwand:t('bExpense'), gewinn:t('bProfit') };
  B.KAT_AUSGABE.concat(B.KAT_EINNAHME).forEach(k=>L['kat_'+k] = t('kat.'+k)||k);
  B.ZAHLARTEN.forEach(z=>L['zahl_'+z] = t('zahl.'+z)||z);
  return L;
}

function exportCsv(){
  const data = B.csv(books, period.von, period.bis, labelsForCsv());
  const blob = new Blob([data], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Journal_' + (period.von ? period.von.slice(0,4) : 'alle') + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 4000);
  toast(t('msgPdfSaved'));
}

async function exportYearPdf(){
  toast(t('pdfBusy'));
  try{
    await SHB_PDF.ensure();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4', compress:true});
    SHB_PDF.registerFonts(doc);
    const C = SHB_PDF.C, F = SHB_PDF.F, P = SHB_PDF.PAGE, M = SHB_PDF.M;
    const W = P.w - M.l - M.r;
    const co = {...DEFAULT_COMPANY, ...(settings.company||{})};
    const r  = B.report(books, period.von, period.bis);
    const set = (f,s,sz,c)=>{ doc.setFont(f,s); doc.setFontSize(sz); doc.setTextColor(c[0],c[1],c[2]); };
    let y = M.t + 4;

    set(F.serif,'normal',19,C.gold);
    doc.text(co.name.toUpperCase(), P.w/2, y, {align:'center', charSpace:1.1}); y += 5;
    set(F.sans,'normal',7.5,C.gray);
    doc.text(t('yearTitle').toUpperCase(), P.w/2, y, {align:'center', charSpace:1.4}); y += 4.5;
    doc.setDrawColor(...C.gold); doc.setLineWidth(0.4);
    doc.line(P.w/2-18, y, P.w/2+18, y); y += 10;

    set(F.sans,'normal',9.5,C.ink2);
    doc.text(t('yearFor') + ': ' + (period.von ? period.von.slice(0,4) : t('bAll')), P.w/2, y, {align:'center'});
    y += 12;

    const line = (label, value, strong)=>{
      set(F.sans, strong?'bold':'normal', strong?11:9.6, strong?C.ink:C.ink2);
      doc.text(label, M.l, y);
      doc.text(value, P.w-M.r, y, {align:'right'});
      y += strong ? 8 : 5.6;
    };
    const head = label =>{
      set(F.sans,'normal',7.5,C.gray);
      doc.text(label.toUpperCase(), M.l, y, {charSpace:.8}); y += 3.4;
      doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
      doc.line(M.l, y, P.w-M.r, y); y += 5;
    };

    head(t('bRevenue') + ' / ' + t('bExpense'));
    line(t('bRevenue'), chf(r.umsatz));
    line(t('bExpense'), chf(r.aufwand));
    doc.setDrawColor(...C.ink); doc.setLineWidth(0.35);
    doc.line(M.l, y-2, P.w-M.r, y-2); y += 3;
    line(t('bProfit'), chf(r.gewinn), true);
    y += 4;

    const kats = Object.entries(r.aufwandKat).sort((a,b2)=>b2[1]-a[1]);
    if(kats.length){
      head(t('bByCategory'));
      kats.forEach(([k,v])=>line(t('kat.'+k)||k, chf(v)));
      y += 4;
    }
    if(r.monate.length){
      head(t('bByMonth'));
      r.monate.forEach(m=>line(m.monat, chf(m.einnahmen) + '   /   ' + chf(m.ausgaben)));
      y += 4;
    }
    head(t('bAssetsTitle'));
    line(t('bLiquid'), chf(r.fluessig));
    line(t('bReceivables'), chf(r.forderungen));
    line(t('bDebts'), chf(r.schulden));
    line(t('bAssets'), chf(r.vermoegen), true);
    y += 4;
    head(t('bOpen'));
    line(t('bOpen') + ' (' + r.offen + ')', chf(r.offenSumme));
    line(t('bOverdue') + ' (' + r.ueberfaellig + ')', chf(r.ueberfaelligSumme));

    y += 6;
    set(F.sans,'normal',8,C.gray);
    doc.splitTextToSize(t('bLegalText'), W).forEach(l=>{ doc.text(l, M.l, y); y += 4.2; });

    const fy = P.h - M.b + 4;
    doc.setDrawColor(...C.line); doc.setLineWidth(0.2);
    doc.line(M.l, fy-5, P.w-M.r, fy-5);
    set(F.sans,'normal',7.4,C.gray);
    doc.text([co.name,[co.zip,co.city].filter(Boolean).join(' '),co.mail].filter(Boolean).join('  ·  '),
             P.w/2, fy, {align:'center'});

    doc.save('Jahresuebersicht_' + (period.von ? period.von.slice(0,4) : 'alle') + '.pdf');
    toast(t('msgPdfSaved'));
  }catch(e){ console.error(e); toast(t('errPdf')); }
}

/* ==========================================================================
 * 8. Speichern und Öffnen
 * ========================================================================== */
async function save(){
  try{ await Store.set('books', books); }
  catch(e){ console.warn(e); toast(t('errStorage')); }
  updateCard();
}

function updateCard(){
  const box = $('#buchSummary');
  if(!box || !books) return;
  const jahr = String(new Date().getFullYear());
  const r = B.report(books, jahr+'-01-01', jahr+'-12-31');
  box.innerHTML = `
    <div class="sum-grid">
      <div><span>${escapeHtml(t('bRevenue'))}</span><b>${escapeHtml(chf(r.umsatz))}</b></div>
      <div><span>${escapeHtml(t('bExpense'))}</span><b>${escapeHtml(chf(r.aufwand))}</b></div>
      <div><span>${escapeHtml(t('bProfit'))}</span><b>${escapeHtml(chf(r.gewinn))}</b></div>
    </div>
    ${r.offen ? `<p class="hint">${escapeHtml(t('bOpen'))}: ${escapeHtml(chf(r.offenSumme))}
       ${r.ueberfaellig ? '· <span style="color:var(--bad)">'+escapeHtml(t('bOverdue'))+': '+escapeHtml(chf(r.ueberfaelligSumme))+'</span>' : ''}</p>` : ''}`;
}

async function open(){
  buildUi();
  if(!books){
    books = (await Store.get('books')) || B.blankBooks();
    books = {...B.blankBooks(), ...books,
             cfg:{...B.blankBooks().cfg, ...(books.cfg||{})},
             assets:{...B.blankBooks().assets, ...(books.assets||{})}};
  }
  const jahr = String(new Date().getFullYear());
  if(!period.von) period = B.yearRange(jahr);
  bTab = 'overview'; syncTabs(); editEntry = null;
  applyI18n();
  openModal('#modalBuch');
  render();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const btn = $('#btnBuch');
  if(btn) btn.addEventListener('click', open);
  const nav = $('#btnBuchNav');
  if(nav) nav.addEventListener('click', open);
  const btnInv = $('#btnBuchInvoice');
  if(btnInv) btnInv.addEventListener('click', async ()=>{ await open(); createInvoice(); });
  books = (await Store.get('books')) || B.blankBooks();
  setTimeout(updateCard, 80);
});

window.SHB_BUCH_UI = { open, updateCard };

})();
