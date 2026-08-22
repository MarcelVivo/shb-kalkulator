# Verwendete Fremdkomponenten

| Komponente | Verwendung | Lizenz |
|---|---|---|
| [jsPDF](https://github.com/parallax/jsPDF) 2.5.2 | Erzeugung des Offerten-PDF | MIT |
| [Liberation Serif](https://github.com/liberationfonts) | Überschriften im PDF | SIL Open Font License 1.1 |
| [Carlito](https://github.com/googlefonts/carlito) | Fliesstext im PDF | SIL Open Font License 1.1 |
| [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) | Bildschirmschrift | SIL Open Font License 1.1 |
| [Inter](https://fonts.google.com/specimen/Inter) | Bildschirmschrift | SIL Open Font License 1.1 |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) | QR-Code im Zahlteil der Rechnung | MIT |

Die beiden PDF-Schriften liegen als Teilmenge in `pdf-fonts.js` (nur lateinische
und kyrillische Zeichen). Cormorant Garamond und Inter werden von Google Fonts
geladen; ohne Internetverbindung greift der Browser auf Systemschriften zurück.

Logo, Texte und Kalkulationslogik gehören Sweet Home Bakery.
