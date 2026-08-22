/* ==========================================================================
 * Sweet Home Bakery · Service Worker
 * --------------------------------------------------------------------------
 * Legt die App beim ersten Aufruf im Gerät ab. Danach startet sie sofort und
 * funktioniert auch ohne Empfang – wichtig, wenn Olena in der Küche steht.
 *
 * Nach jeder Änderung an den Dateien die VERSION erhöhen. Beim nächsten
 * Öffnen lädt das iPhone dann automatisch die neue Fassung.
 * ========================================================================== */

const VERSION = 'shb-v15';

/* Alles, was die App zum Laufen braucht. Die PDF-Bausteine sind bewusst
   dabei, damit auch offline eine Offerte erstellt werden kann. */
const ASSETS = [
  './',
  'index.html',
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

self.addEventListener('fetch', event=>{
  const req = event.request;
  if(req.method !== 'GET') return;

  // Schriften von Google: wenn vorhanden aus dem Zwischenspeicher, sonst laden
  event.respondWith(
    caches.match(req).then(hit=>{
      if(hit) return hit;
      return fetch(req).then(res=>{
        // Erfolgreiche Antworten der eigenen Herkunft mitspeichern
        if(res && res.status === 200 && new URL(req.url).origin === location.origin){
          const copy = res.clone();
          caches.open(VERSION).then(c=>c.put(req, copy));
        }
        return res;
      }).catch(()=>{
        // Offline und nichts im Speicher: Startseite ausliefern
        if(req.mode === 'navigate') return caches.match('index.html');
        return new Response('', {status:504, statusText:'offline'});
      });
    })
  );
});
