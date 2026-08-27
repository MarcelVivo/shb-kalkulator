# Sweet Home Bakery · Torten-Kalkulator

Preisberechnung, Produktionsplanung und Gewinnkontrolle für individuelle Torten.
Läuft vollständig im Browser, ohne Server und ohne Konto. Zweisprachig Deutsch / Українська.

---

## Auf GitHub Pages veröffentlichen

Ziel: eine Adresse wie `https://marcelvivo.github.io/shb-kalkulator/`, die du Olena
per WhatsApp schicken kannst.

### 1 · Neues Repository anlegen

1. Auf [github.com/new](https://github.com/new) gehen
2. **Repository name:** `shb-kalkulator`
3. **Public** auswählen (GitHub Pages ist für private Repositories kostenpflichtig)
4. Bei «Add a README file» den Haken **nicht** setzen
5. **Create repository**

### 2 · Dateien hochladen

1. Im leeren Repository auf **uploading an existing file** klicken
2. **choose your files** anklicken, im Ordner `Cmd + A` drücken, **Öffnen**
3. Unten **Commit changes** klicken

Alle Dateien liegen flach nebeneinander, es gibt keine Unterordner — deshalb
funktioniert auch der Dateidialog, der keine Ordner mitnehmen kann.

> Die versteckte Datei `.nojekyll` wird im Finder nur mit `Cmd + Shift + .` sichtbar.
> Ohne sie funktioniert die Seite trotzdem, sie beschleunigt aber die Veröffentlichung.

Diese drei Dateien gehören **nicht** ins Repository — sie sind nur Vorschaubilder
und ein Überbleibsel aus der Entwicklung:
`off-de-1.png`, `off-ua-1.png`, `shb-logo-pdf.png`

### 3 · Pages einschalten

1. Im Repository auf **Settings → Pages**
2. Unter **Source** «Deploy from a branch» wählen
3. **Branch:** `main`, **Ordner:** `/ (root)` → **Save**
4. Ein bis zwei Minuten warten, dann erscheint die Adresse oben auf derselben Seite

Die Adresse lautet:

```
https://marcelvivo.github.io/shb-kalkulator/
```

### 4 · Auf Olenas iPhone einrichten

1. Adresse per WhatsApp schicken
2. Sie öffnet den Link **in Safari** (nicht im WhatsApp-Browser — dort fehlt der nächste Schritt)
3. Teilen-Symbol antippen → **Zum Home-Bildschirm**
4. Fertig: Der Kalkulator liegt als App-Icon auf dem Home-Bildschirm

**Dieser Schritt ist wichtig.** Safari löscht die gespeicherten Daten einer Website,
die sieben Tage lang nicht benutzt wurde. Für Web-Apps auf dem Home-Bildschirm gilt
diese Regel nicht — ihre gespeicherten Kalkulationen bleiben also erhalten.

---

## Offerten-PDF verschicken

In der Kalkulation auf **Kundenangebot erstellen** → **Offerte als PDF senden**.
Auf dem iPhone öffnet sich das normale Teilen-Menü: WhatsApp, Mail, AirDrop, Dateien.
Am Computer wird das PDF stattdessen heruntergeladen.

Das PDF enthält bewusst **keine** internen Zahlen — keine Stundensätze, keine
Materialkosten, keine Marge. Nur das, was die Kundschaft sehen soll.

Absenderangaben, Gültigkeitsdauer, Anzahlung und Allergenhinweis stehen unter
**Einstellungen → Firmendaten für die Offerte**. Adresse, Telefon und E-Mail sind
noch leer und sollten vor der ersten Offerte ausgefüllt werden.

---

## Rechnungen und Buchhaltung

Der Bereich **Buchhaltung** unten auf der Seite führt Rechnungen, Belege und
Auswertungen. Vor der ersten Rechnung muss unter **Buchhaltung → Konto** die
**IBAN** eingetragen werden — ohne sie lässt sich kein QR-Zahlteil erzeugen.

Rechnungen entstehen mit einem Knopfdruck aus der aktuellen Kalkulation und
tragen den Schweizer QR-Zahlteil auf den unteren 105 mm: Empfangsschein links,
Zahlteil mit QR-Code rechts. Die Kundschaft kann den Code direkt in der
Banking-App einlesen.

Wird eine Rechnung als bezahlt gebucht, entsteht automatisch ein Beleg über den
Zahlungseingang. Ausgaben werden von Hand erfasst, wahlweise mit Belegfoto.

Die Übersicht zeigt Umsatz, Aufwand, Gewinn, Monatsverlauf, Aufwand nach
Kategorie, offene und überfällige Rechnungen sowie die Vermögenslage. Für die
Treuhand gibt es das Belegjournal als CSV und eine Jahresübersicht als PDF.

**Rechtlicher Rahmen:** Einzelunternehmen mit weniger als CHF 500'000 Umsatz
führen nach Art. 957 Abs. 2 OR eine vereinfachte Buchhaltung aus Einnahmen,
Ausgaben und Vermögenslage — eine doppelte Buchhaltung mit Bilanz ist nicht
vorgeschrieben. Genau das bildet der Bereich ab. Die Mehrwertsteuer ist
ausgeschaltet und wird erst ab CHF 100'000 Jahresumsatz obligatorisch; ein
Balken in der Übersicht zeigt den Abstand zu dieser Grenze. Belege sind zehn
Jahre aufzubewahren. Das Werkzeug ersetzt keine Steuer- oder Rechtsberatung.

---

## Aktualisieren

Geänderte Dateien im Repository ersetzen. Damit die iPhones die neue Fassung laden,
in `sw.js` die Zeile

```js
const VERSION = 'shb-v3';
```

auf `'shb-v4'` erhöhen (und so weiter). Beim nächsten Öffnen aktualisiert sich die
App dann von selbst.

---

## Dateien

| Datei | Zweck |
|---|---|
| `kalkulator.html` | Aufbau der Oberfläche |
| `style.css` | Gestaltung, Dark Edition, iPhone-optimiert |
| `style-light.css` | helle Fassung, bei Bedarf umbenennen |
| `app.js` | Übersetzungen, Rechenkern, Bedienung, Projektverwaltung |
| `pdf.js` | Offerten-PDF |
| `design.js` | Zeichnung der Torte als SVG, Muster, Dekorationselemente |
| `photo.js` | Fotos laden, zuschneiden, korrigieren, freistellen |
| `design-ui.js` | Bedienung des Design-Konfigurators, Export der Vorlage |
| `buch.js` | Buchhaltung: Rechnungen, Belege, Auswertungen, QR-Nutzdaten |
| `invoice.js` | Rechnung mit Schweizer QR-Zahlteil |
| `buch-ui.js` | Bedienung der Buchhaltung, CSV- und Jahresexport |
| `qrcode.js` | QR-Code-Erzeugung für den Zahlteil |
| `pdf-fonts.js` | Schriften für das PDF (Latein + Kyrillisch) |
| `jspdf.umd.min.js` | PDF-Bibliothek |
| `sw.js` | Offline-Betrieb |
| `manifest.json` | Angaben für den Home-Bildschirm |
| `shb-logo.png` | Logo für den Bildschirm |
| `shb-logo-pdf.jpg` | kleine Fassung für das PDF |
| `LIZENZEN.md` | verwendete Fremdkomponenten |

---

## Gut zu wissen

**Die Daten liegen auf dem jeweiligen Gerät.** Olenas Kalkulationen erscheinen nicht
auf deinem Telefon und umgekehrt. Es gibt keine Anmeldung und keinen Server, der
mitliest.

**Die App ist öffentlich erreichbar.** Wer die Adresse kennt, kann den Rechner
benutzen — sehen kann er aber nichts, weil keine Daten übertragen werden. Wer das
nicht möchte, braucht ein privates Repository und damit einen kostenpflichtigen
GitHub-Tarif.

**Später auf Supabase umstellen:** In `app.js` sind sämtliche Speicherzugriffe im
Objekt `Store` gebündelt. Es genügt, einen zweiten Adapter mit denselben vier
Methoden zu hinterlegen und `Store.use(SupabaseAdapter)` aufzurufen — ein
Kommentar im Quelltext zeigt das Grundgerüst.
