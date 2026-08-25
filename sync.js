/* ==========================================================================
 * Sweet Home Bakery · Abgleich zwischen Handy und Computer
 * --------------------------------------------------------------------------
 * Die App bleibt eine Anwendung, die im Gerät rechnet und speichert. Der
 * Abgleich legt sich darüber: Jede Änderung geht zuerst ins Gerät und dann,
 * sobald Netz da ist, in die Datenbank. Beim Öffnen wird geholt, was auf dem
 * anderen Gerät entstanden ist.
 *
 * Warum ohne fremde Bibliothek: Supabase spricht eine gewöhnliche
 * REST-Schnittstelle. Mit fetch sind es zweihundert Zeilen statt einer
 * Abhängigkeit von über hundert Kilobyte – und man sieht, was passiert.
 *
 * Zusammenführung: je Schlüssel gewinnt die neuere Änderung. Für zwei
 * Menschen, die abwechselnd arbeiten, ist das die richtige Regel; echte
 * Gleichzeitigkeit auf demselben Datensatz kommt hier nicht vor.
 *
 * Gemeinsames Konto: Olena und Marcel melden sich mit eigenen Zugängen an,
 * sehen aber dieselben Zahlen. Dazu gehört jede Person in der Datenbank zu
 * einem Konto; die Daten hängen am Konto, nicht an der Person. Wer zu keinem
 * Konto gehört, sieht nichts – dafür sorgt die Datenbank, nicht diese Datei.
 * ========================================================================== */

'use strict';

var SHB_SYNC = (function(){

  /* Diese Schlüssel werden abgeglichen. Der Verlauf für «Rückgängig» bleibt
     bewusst auf dem Gerät – er gehört zur Sitzung, nicht zur Buchhaltung. */
  const KEYS = ['current','settings','projects','books','lang'];

  const PREFIX   = 'shb.cakecalc.';
  const META_KEY = PREFIX + 'sync.meta';      // {schluessel: zeitstempel}
  const SESS_KEY = PREFIX + 'sync.session';
  const QUEUE_KEY= PREFIX + 'sync.queue';

  let cfg      = (typeof SHB_SYNC_CONFIG !== 'undefined') ? SHB_SYNC_CONFIG : {url:'',key:''};
  let session  = null;          // {access_token, refresh_token, user_id, email, konto}
  let status   = 'aus';         // aus · abgemeldet · keinZugang · bereit · arbeitet · offline · fehler
  let pushTimer= null;
  let listeners= [];

  const konfiguriert = ()=> !!(cfg.url && cfg.key);

  /* ---------------------------------------------------------------- Hilfen */
  function lese(k, fallback){
    try{ const r = localStorage.getItem(k); return r ? JSON.parse(r) : fallback; }
    catch(e){ return fallback; }
  }
  function schreibe(k, v){
    try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; }
  }
  function meta(){ return lese(META_KEY, {}); }
  function setzeMeta(k, ts){ const m = meta(); m[k] = ts || Date.now(); schreibe(META_KEY, m); }
  function queue(){ return lese(QUEUE_KEY, []); }
  function setzeQueue(q){ schreibe(QUEUE_KEY, q); }

  function melde(neu){
    if(neu) status = neu;
    listeners.forEach(fn=>{ try{ fn(status, session); }catch(e){} });
  }

  /* ------------------------------------------------------------ Anmeldung */
  async function anfrage(pfad, opts){
    opts = opts || {};
    const headers = Object.assign({
      'apikey': cfg.key,
      'Content-Type': 'application/json'
    }, opts.headers || {});
    if(session && session.access_token && !opts.ohneToken){
      headers['Authorization'] = 'Bearer ' + session.access_token;
    }
    const res = await fetch(cfg.url.replace(/\/$/,'') + pfad, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if(res.status === 401 && !opts.zweiterVersuch && session && session.refresh_token){
      const ok = await erneuere();
      if(ok) return anfrage(pfad, Object.assign({}, opts, {zweiterVersuch:true}));
    }
    if(!res.ok){
      const txt = await res.text().catch(()=> '');
      throw new Error('HTTP ' + res.status + ' ' + txt.slice(0,200));
    }
    const t = await res.text();
    return t ? JSON.parse(t) : null;
  }

  async function anmelden(email, passwort){
    if(!konfiguriert()) throw new Error('nicht eingerichtet');
    melde('arbeitet');
    const d = await anfrage('/auth/v1/token?grant_type=password', {
      method:'POST', ohneToken:true, body:{ email, password: passwort }
    });
    session = { access_token:d.access_token, refresh_token:d.refresh_token,
                user_id:d.user && d.user.id, email:(d.user && d.user.email) || email,
                konto:null };
    schreibe(SESS_KEY, session);
    await holeKonto();
    if(!session.konto){ melde('keinZugang'); return session; }
    melde('bereit');
    await abgleichen();
    return session;
  }

  /** Zu welchem Konto gehört die angemeldete Person? Ohne Eintrag: zu keinem –
      dann bleibt die App rein örtlich, statt still nichts zu tun. */
  async function holeKonto(){
    try{
      const rows = await anfrage('/rest/v1/shb_zugang?select=konto');
      session.konto = (rows && rows[0] && rows[0].konto) || null;
    }catch(e){
      console.warn('Konto:', e.message);
      session.konto = null;
    }
    schreibe(SESS_KEY, session);
    return session.konto;
  }

  async function erneuere(){
    if(!session || !session.refresh_token) return false;
    try{
      const d = await anfrage('/auth/v1/token?grant_type=refresh_token', {
        method:'POST', ohneToken:true, body:{ refresh_token: session.refresh_token }
      });
      session = Object.assign({}, session, {
        access_token:d.access_token, refresh_token:d.refresh_token
      });
      schreibe(SESS_KEY, session);
      return true;
    }catch(e){
      session = null; localStorage.removeItem(SESS_KEY);
      melde('abgemeldet');
      return false;
    }
  }

  function abmelden(){
    session = null;
    localStorage.removeItem(SESS_KEY);
    localStorage.removeItem(META_KEY);
    localStorage.removeItem(QUEUE_KEY);
    melde('abgemeldet');
  }

  /* ------------------------------------------------------------- Übertragen */

  /** Alles aus der Datenbank holen und mit dem Gerät zusammenführen. */
  async function holen(){
    const rows = await anfrage('/rest/v1/shb_daten?select=schluessel,wert,geaendert');
    const m = meta();
    let veraendert = false;

    (rows || []).forEach(r=>{
      if(KEYS.indexOf(r.schluessel) < 0) return;
      const fern  = new Date(r.geaendert).getTime();
      const nah   = m[r.schluessel] || 0;
      if(fern > nah + 1000){                 // eine Sekunde Toleranz
        schreibe(PREFIX + r.schluessel, r.wert);
        m[r.schluessel] = fern;
        veraendert = true;
      }
    });
    schreibe(META_KEY, m);
    return veraendert;
  }

  /** Geänderte Schlüssel in die Datenbank schreiben. */
  async function senden(schluessel){
    if(!session || !session.konto) return;
    const zeilen = schluessel.map(k=>({
      konto:     session.konto,
      schluessel:k,
      wert:      lese(PREFIX + k, null)
    })).filter(z=>z.wert !== null);
    if(!zeilen.length) return;

    await anfrage('/rest/v1/shb_daten?on_conflict=konto,schluessel', {
      method:'POST',
      headers:{ 'Prefer':'resolution=merge-duplicates,return=minimal' },
      body: zeilen
    });
    const m = meta();
    zeilen.forEach(z=> m[z.schluessel] = Date.now());
    schreibe(META_KEY, m);
  }

  /** Holen und Senden in einem Zug. */
  async function abgleichen(){
    if(!bereit()) return false;
    melde('arbeitet');
    try{
      const veraendert = await holen();
      const offen = queue();
      if(offen.length){ await senden(offen); setzeQueue([]); }
      melde('bereit');
      if(veraendert) benachrichtigeApp();
      return veraendert;
    }catch(e){
      console.warn('Abgleich:', e.message);
      melde(navigator.onLine ? 'fehler' : 'offline');
      return false;
    }
  }

  /** Wird von Store.set aufgerufen: Änderung vormerken und gesammelt senden. */
  function vorgemerkt(key){
    if(!bereit() || KEYS.indexOf(key) < 0) return;
    setzeMeta(key, Date.now());
    const q = queue();
    if(q.indexOf(key) < 0){ q.push(key); setzeQueue(q); }
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async ()=>{
      const offen = queue();
      if(!offen.length) return;
      try{
        melde('arbeitet');
        await senden(offen);
        setzeQueue([]);
        melde('bereit');
      }catch(e){
        console.warn('Senden:', e.message);
        melde(navigator.onLine ? 'fehler' : 'offline');   // Warteschlange bleibt bestehen
      }
    }, 1500);
  }

  function benachrichtigeApp(){
    if(typeof reloadFromStore === 'function'){ try{ reloadFromStore(); }catch(e){} }
    if(window.SHB_BUCH_UI && SHB_BUCH_UI.reload){ try{ SHB_BUCH_UI.reload(); }catch(e){} }
  }

  const angemeldet = ()=> konfiguriert() && !!(session && session.access_token);
  const bereit     = ()=> angemeldet() && !!session.konto;

  /* ------------------------------------------------------------------ Start */
  function start(){
    if(!konfiguriert()){ melde('aus'); return; }
    session = lese(SESS_KEY, null);
    if(!session){ melde('abgemeldet'); }
    else if(!session.konto){
      /* Zugang wurde vielleicht erst nachträglich freigeschaltet */
      melde('arbeitet');
      holeKonto().then(k=>{ melde(k ? 'bereit' : 'keinZugang'); if(k) abgleichen(); });
    }
    else { melde('bereit'); abgleichen(); }

    /* Beim Zurückkehren zur App und beim Wiedererlangen der Verbindung
       holen, was auf dem anderen Gerät passiert ist. */
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState === 'visible') abgleichen();
    });
    window.addEventListener('online', abgleichen);
    window.addEventListener('offline', ()=>melde('offline'));
  }

  return {
    start, anmelden, abmelden, abgleichen, vorgemerkt, bereit, angemeldet,
    konfiguriert, holeKonto,
    get status(){ return status; },
    get benutzer(){ return session && session.email; },
    get konto(){ return session && session.konto; },
    beiAenderung(fn){ listeners.push(fn); },
    KEYS
  };
})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_SYNC;
