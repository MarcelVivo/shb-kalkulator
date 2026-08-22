/* ==========================================================================
 * Sweet Home Bakery · Fotowerkzeug
 * --------------------------------------------------------------------------
 * Laden, Verkleinern, Zuschneiden, Drehen, Helligkeit/Kontrast/Sättigung
 * und Freistellen – alles im Gerät, ohne Dienst von aussen.
 *
 * Das Freistellen arbeitet mit einem Flutfüller: Man tippt auf den
 * Hintergrund, von dort breitet sich die Auswahl über alle benachbarten
 * Pixel ähnlicher Farbe aus. Das gelingt zuverlässig bei ruhigem Hintergrund
 * und lässt sich mit Toleranz, weicher Kante und Radiergummi nachbessern.
 *
 * Ausgabe ist immer ein PNG mit Transparenz als Data-URL.
 * ========================================================================== */

'use strict';

var SHB_PHOTO = (function(){

  const MAX_EDGE = 1400;      // Kantenlänge beim Laden begrenzen
  const OUT_EDGE = 900;       // Kantenlänge der Ausgabe – hält den Browserspeicher klein

  /* ---------------------------------------------------------------- Laden */
  /** Datei einlesen, drehen nach EXIF ist auf iOS bereits erledigt,
   *  auf die Höchstgrösse verkleinern und als Bitmap zurückgeben. */
  function loadFile(file){
    return new Promise((res, rej)=>{
      if(!file || !/^image\//.test(file.type)) return rej(new Error('Keine Bilddatei'));
      const fr = new FileReader();
      fr.onerror = ()=>rej(new Error('Datei nicht lesbar'));
      fr.onload = ()=>{
        const img = new Image();
        img.onerror = ()=>rej(new Error('Bild nicht lesbar'));
        img.onload  = ()=>{
          const sc = Math.min(1, MAX_EDGE/Math.max(img.width, img.height));
          const w  = Math.max(1, Math.round(img.width*sc));
          const h  = Math.max(1, Math.round(img.height*sc));
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          res(cv);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------------- Bearbeiten */

  /** Neue Bearbeitungssitzung auf Basis eines Canvas. */
  function session(sourceCanvas){
    const src = sourceCanvas;                        // Originalpixel, bleibt unberührt
    let work  = clone(src);                          // Arbeitsstand
    let alpha = null;                                // Alphamaske (Uint8, 0…255)
    const seeds = [];                                // gemerkte Antippstellen
    let state = {rot:0, crop:null, bright:0, contrast:0, sat:0, tol:32, feather:2, round:false};

    function clone(cv){
      const c = document.createElement('canvas');
      c.width = cv.width; c.height = cv.height;
      c.getContext('2d').drawImage(cv, 0, 0);
      return c;
    }

    /** Geometrie anwenden: zuschneiden und drehen. */
    function geometry(){
      let cv = src;
      if(state.crop){
        const {x,y,w,h} = state.crop;
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
        c.getContext('2d').drawImage(src, Math.round(x), Math.round(y),
                                    Math.round(w), Math.round(h), 0, 0, c.width, c.height);
        cv = c;
      }
      const r = ((state.rot%360)+360)%360;
      if(r === 0) return cv;
      const c = document.createElement('canvas');
      const swap = (r===90 || r===270);
      c.width  = swap ? cv.height : cv.width;
      c.height = swap ? cv.width  : cv.height;
      const x = c.getContext('2d');
      x.translate(c.width/2, c.height/2);
      x.rotate(r*Math.PI/180);
      x.drawImage(cv, -cv.width/2, -cv.height/2);
      return c;
    }

    /** Farbkorrektur über die eingebauten Filter des Canvas. */
    function tone(cv){
      const f = `brightness(${1+state.bright/100}) contrast(${1+state.contrast/100}) saturate(${1+state.sat/100})`;
      const c = document.createElement('canvas');
      c.width = cv.width; c.height = cv.height;
      const x = c.getContext('2d');
      if('filter' in x) x.filter = f;
      x.drawImage(cv, 0, 0);
      return c;
    }

    /** Aktuellen Stand neu aufbauen (Geometrie → Farbe → Maske). */
    function rebuild(keepMask){
      const geo = geometry();
      work = tone(geo);
      if(!keepMask || !alpha || alpha.length !== work.width*work.height){
        alpha = new Uint8ClampedArray(work.width*work.height).fill(255);
        if(seeds.length) seeds.forEach(s=>flood(s.x, s.y, false));
      }
      return work;
    }

    /* ------------------------------------------------------- Freistellen */

    /** Flutfüllung ab einem Punkt: benachbarte Pixel ähnlicher Farbe
     *  werden durchsichtig. Iterativ mit eigenem Stapel, damit auch
     *  grosse Flächen ohne Rekursionsgrenze funktionieren. */
    function flood(sx, sy, remember){
      const w = work.width, h = work.height;
      if(sx<0||sy<0||sx>=w||sy>=h) return 0;
      const px = work.getContext('2d').getImageData(0,0,w,h).data;
      const i0 = (sy*w+sx)*4;
      const r0 = px[i0], g0 = px[i0+1], b0 = px[i0+2];
      const tol = state.tol*state.tol*3;
      const seen = new Uint8Array(w*h);
      const stack = [sy*w+sx];
      let count = 0;
      while(stack.length){
        const p = stack.pop();
        if(seen[p]) continue;
        seen[p] = 1;
        const i = p*4;
        const dr = px[i]-r0, dg = px[i+1]-g0, db = px[i+2]-b0;
        if(dr*dr + dg*dg + db*db > tol) continue;
        alpha[p] = 0; count++;
        const x = p%w, y = (p-x)/w;
        if(x>0)   stack.push(p-1);
        if(x<w-1) stack.push(p+1);
        if(y>0)   stack.push(p-w);
        if(y<h-1) stack.push(p+w);
      }
      if(remember) seeds.push({x:sx, y:sy});
      return count;
    }

    /** Automatik: von allen vier Ecken aus fluten. */
    function autoCut(){
      const w = work.width, h = work.height;
      seeds.length = 0;
      alpha.fill(255);
      [[2,2],[w-3,2],[2,h-3],[w-3,h-3]].forEach(p=>flood(p[0], p[1], true));
      return coverage();
    }

    /** Toleranz ändern und alle gemerkten Stellen neu fluten. */
    function setTolerance(v){
      state.tol = Math.max(1, Math.min(120, v));
      alpha.fill(255);
      seeds.slice().forEach(s=>flood(s.x, s.y, false));
      return coverage();
    }

    /** Pinsel: radieren (0) oder zurückholen (255). */
    function brush(x, y, r, value){
      const w = work.width, h = work.height;
      const x0 = Math.max(0, Math.floor(x-r)), x1 = Math.min(w-1, Math.ceil(x+r));
      const y0 = Math.max(0, Math.floor(y-r)), y1 = Math.min(h-1, Math.ceil(y+r));
      for(let yy=y0; yy<=y1; yy++){
        for(let xx=x0; xx<=x1; xx++){
          const dx = xx-x, dy = yy-y;
          if(dx*dx + dy*dy <= r*r) alpha[yy*w+xx] = value;
        }
      }
    }

    /** Anteil der entfernten Fläche in Prozent – als Rückmeldung im Regler. */
    function coverage(){
      let n = 0;
      for(let i=0;i<alpha.length;i++) if(alpha[i]===0) n++;
      return Math.round(n/alpha.length*100);
    }

    /** Weiche Kante: Alphakante über wenige Pixel verlaufen lassen. */
    function featherAlpha(a, w, h, rad){
      if(rad<1) return a;
      const out = new Uint8ClampedArray(a);
      const r = Math.min(6, Math.round(rad));
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const p = y*w+x;
          if(a[p]===0) continue;
          let near = false;
          for(let dy=-r; dy<=r && !near; dy++){
            for(let dx=-r; dx<=r; dx++){
              const nx = x+dx, ny = y+dy;
              if(nx<0||ny<0||nx>=w||ny>=h) continue;
              if(a[ny*w+nx]===0){ near = true; break; }
            }
          }
          if(near) out[p] = 120;
        }
      }
      return out;
    }

    /* --------------------------------------------------------- Ausgabe */

    /** Vorschau für die Bearbeitungsfläche (mit Schachbrett dahinter). */
    function preview(){
      const c = clone(work);
      applyAlpha(c, alpha);
      return c;
    }

    function applyAlpha(cv, a){
      const x = cv.getContext('2d');
      const img = x.getImageData(0,0,cv.width,cv.height);
      const d = img.data;
      for(let i=0, p=0; p<a.length; p++, i+=4) d[i+3] = Math.min(d[i+3], a[p]);
      x.putImageData(img, 0, 0);
    }

    /** Endgültiges PNG als Data-URL, auf Ausgabegrösse verkleinert. */
    function output(){
      const soft = featherAlpha(alpha, work.width, work.height, state.feather);
      const c = clone(work);
      applyAlpha(c, soft);

      let out = c;
      const sc = Math.min(1, OUT_EDGE/Math.max(c.width, c.height));
      if(sc < 1){
        const s = document.createElement('canvas');
        s.width = Math.round(c.width*sc); s.height = Math.round(c.height*sc);
        s.getContext('2d').drawImage(c, 0, 0, s.width, s.height);
        out = s;
      }
      if(state.round){
        const s = document.createElement('canvas');
        s.width = out.width; s.height = out.height;
        const x = s.getContext('2d');
        x.save();
        x.beginPath();
        x.ellipse(out.width/2, out.height/2, out.width/2, out.height/2, 0, 0, Math.PI*2);
        x.clip();
        x.drawImage(out, 0, 0);
        x.restore();
        out = s;
      }
      /* Nur wenn wirklich freigestellt wurde, braucht es PNG mit Transparenz.
         Sonst JPEG – das spart im Browserspeicher ein Vielfaches. */
      const transparent = state.round || alpha.some(v=>v<255);
      const src = transparent ? out.toDataURL('image/png') : out.toDataURL('image/jpeg', 0.85);
      return { src, w: out.width, h: out.height };
    }

    rebuild(false);

    return {
      get state(){ return state; },
      get canvas(){ return work; },
      set(k, v){ state[k] = v; },
      rebuild, geometry, flood, autoCut, setTolerance, brush, coverage, preview, output,
      resetMask(){ seeds.length = 0; alpha.fill(255); },
      hasCut(){ return seeds.length>0 || alpha.some(v=>v===0); }
    };
  }

  /** Kleines Vorschaubild für Listen und Moodboard. */
  function thumb(cvOrSrc, size){
    return new Promise(res=>{
      const draw = img => {
        const s = Math.min(size/img.width, size/img.height);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width*s));
        c.height = Math.max(1, Math.round(img.height*s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.72));
      };
      if(typeof cvOrSrc === 'string'){
        const i = new Image(); i.onload = ()=>draw(i); i.src = cvOrSrc;
      }else draw(cvOrSrc);
    });
  }

  return { loadFile, session, thumb, MAX_EDGE, OUT_EDGE };
})();

if(typeof module !== 'undefined' && module.exports) module.exports = SHB_PHOTO;
