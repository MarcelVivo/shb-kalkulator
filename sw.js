/* ==========================================================================
 * Sweet Home Bakery · Service Worker
 * --------------------------------------------------------------------------
 * Legt die App beim ersten Aufruf im Gerät ab. Danach startet sie sofort und
 * funktioniert auch ohne Empfang – wichtig, wenn Olena in der Küche steht.
 *
 * Nach jeder Änderung an den Dateien die VERSION erhöhen. Beim nächsten
 * Öffnen lädt das iPhone dann automatisch die neue Fassung.
 * ========================================================================== */

const VERSION = 'shb-v22';

/* Alles, was die App zum Laufen braucht. Die PDF-Bausteine sind bewusst
   dabei, damit auch offline eine Offerte erstellt werden kann. */
const ASSETS = [
  'kalkulator.html',
  'style.css',
  'app.js',
  'pdf.js',
  'design.js',
  'photo.js',
  'design-ui.js',
  'qrcode.js',
  'buch.js',
  'invoice.js',
  'buch-ui.js',
  'sync.js',
  'sync-config.js',
  'pdf-fonts.js',
  'jspdf.umd.min.js',
  'shb-logo.png',
  'shb-logo-pdf.jpg',
  'shb-icon-192.png',
  'shb-icon-512.png',
  'apple-touch-icon.png',
  'manifest.json'
];

self.addEventListener('install', event=>{
  event.waitUntil(
    caches.open(VERSION)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

/* Die App selbst – Seite, Code, Gestaltung – wird zuerst aus dem Netz geholt.
   So ist eine Korrektur sofort da und nicht erst beim übernächsten Start.
   Damit das in einer Küche mit schlechtem Empfang nicht bremst, warten wir
   höchstens zweieinhalb Sekunden und nehmen dann, was im Gerät liegt.

   Alles Grosse und Unveränderliche – Schriften, PDF-Baustein, Logo – kommt
   weiterhin sofort aus dem Speicher. Das ist der Löwenanteil der Bytes. */
const SHELL = /\.(html|js|css)$|\/$/;

/* Fremdbibliotheken und eingebettete Schriften ändern sich nie und wiegen
   zusammen über ein halbes Megabyte. Die bleiben im Speicher, sonst holt
   das Handy sie bei jedem Start neu. */
const UNVERAENDERLICH = ['jspdf.umd.min.js', 'pdf-fonts.js', 'qrcode.js'];

const NETZ_FRIST = 2500;

function ausDemNetz(req){
  return new Promise((fertig, daneben)=>{
    const uhr = setTimeout(()=>daneben(new Error('zu langsam')), NETZ_FRIST);
    fetch(req).then(res=>{ clearTimeout(uhr); fertig(res); },
                    err=>{ clearTimeout(uhr); daneben(err); });
  });
}

function merken(req, res){
  if(res && res.status === 200 && new URL(req.url).origin === location.origin){
    const kopie = res.clone();
    caches.open(VERSION).then(c=>c.put(req, kopie));
  }
  return res;
}

self.addEventListener('fetch', event=>{
  const req = event.request;
  if(req.method !== 'GET') return;

  const pfad     = new URL(req.url).pathname;
  const eigen    = new URL(req.url).origin === location.origin;
  const seite    = req.mode === 'navigate';
  const schwer   = UNVERAENDERLICH.some(n => pfad.endsWith(n));
  const shell    = eigen && !schwer && (seite || SHELL.test(pfad));

  if(shell){
    // Zuerst das Netz, im Zweifel der Speicher
    event.respondWith(
      ausDemNetz(req)
        .then(res => merken(req, res))
        .catch(async ()=>{
          const hit = await caches.match(req);
          if(hit) return hit;
          // Nur beim Aufruf der Seite ist die Startseite die richtige Antwort.
          // Für ein fehlendes Skript wäre sie es nicht.
          if(seite){
            const start = await caches.match('kalkulator.html');
            if(start) return start;
          }
          return new Response('', {status:504, statusText:'offline'});
        })
    );
    return;
  }

  // Alles andere: was im Speicher liegt, kommt sofort
  event.respondWith(
    caches.match(req).then(hit=>{
      if(hit) return hit;
      return fetch(req).then(res=>merken(req, res)).catch(()=>
        new Response('', {status:504, statusText:'offline'}));
    })
  );
});
