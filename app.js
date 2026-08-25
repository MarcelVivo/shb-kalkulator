/* ==========================================================================
 * Sweet Home Bakery · Torten-Produktionsrechner
 * --------------------------------------------------------------------------
 * Vanilla JavaScript, keine Abhängigkeiten.
 * Aufbau:
 *   1. Übersetzungen (DE / UA)
 *   2. Stammdaten & Vorlagen
 *   3. Speicher-Adapter (localStorage – vorbereitet für Supabase)
 *   4. Zustand (State) & Standardwerte
 *   5. Hilfsfunktionen (Formatierung, Zahlen, Plausibilität)
 *   6. Rechenkern  ← alle Formeln an einem Ort, ohne DOM-Zugriff
 *   7. Rendering (dynamische Zeilen)
 *   8. Ausgabe / Anzeige
 *   9. Warnsystem
 *  10. Übersetzungs-Engine
 *  11. Projekte (speichern, öffnen, duplizieren, löschen)
 *  12. Kundenangebot & Druck
 *  13. Ereignisse & Start
 * ========================================================================== */

'use strict';

/* ==========================================================================
 * 1. ÜBERSETZUNGEN
 * Zentrale Struktur – weitere Sprachen einfach als neuen Schlüssel ergänzen.
 * ========================================================================== */
const translations = {

  de: {
    /* Kopf & Navigation */
    brandSub:'Torten-Kalkulator · Grenchen SO',
    navProjects:'Meine Kalkulationen', navSettings:'Einstellungen',
    actSave:'Kalkulation speichern', actOffer:'Kundenangebot erstellen',
    actPrintCalc:'Kalkulation drucken', actPrintOffer:'Kundenangebot drucken',
    actDemo:'Beispiel laden', actReset:'Zurücksetzen', actUndo:'Rückgängig',
    undoNone:'Nichts zum Rückgängigmachen.',
    undoReady:'{n} Schritte können zurückgenommen werden.',
    undoDone:'Rückgängig gemacht.',
    undoOffer:'Rückgängig',
    msgRowDeleted:'Zeile entfernt.',
    askResetSafe:'Alle Eingaben zurücksetzen? Die aktuelle Kalkulation wird vorher automatisch gesichert.',
    autoBackup:'Automatische Sicherung',
    msgBackupSaved:'Vorherige Kalkulation unter «Meine Kalkulationen» gesichert.',

    /* 1 Auftrag */
    secOrder:'Auftrag',
    fCustomer:'Kundenname', phCustomer:'z. B. Familie Meier',
    fOrderNo:'Auftragsnummer', fOrderDate:'Bestelldatum', fDeliveryDate:'Lieferdatum',
    fOccasion:'Anlass', fWishPrice:'Gewünschter Kundenpreis (optional)',
    fNotes:'Bemerkungen', phNotes:'Wünsche, Farben, Allergien …',
    occasions:['Geburtstag','Hochzeit','Kindergeburtstag','Jubiläum','Taufe','Firmenanlass','Verlobung','Baby Shower','Sonstiges'],

    /* 2 Torte */
    secCake:'Torte',
    fShape:'Form', fSize:'Durchmesser / Grösse', fSizeCustom:'Individuelle Grösse (cm)',
    fHeight:'Höhe (cm)', fTiers:'Anzahl Etagen', fPortions:'Portionen (Personen)',
    fWeight:'Gewicht (kg)',
    hintWeight:'Portionen und Gewicht hängen zusammen: {g} g pro Person. Ändere das eine, das andere folgt. Aus dem Gewicht entsteht der Preis.',
    secCakeDesc:'Angaben für Offerte und Entwurf',
    hintCakeDesc:'Diese Angaben beeinflussen den Preis nicht. Sie erscheinen in der Offerte und legen im Design-Konfigurator die Etagen an.',
    portionsCheck:'Zur Kontrolle: Eine Torte dieser Grösse ergibt üblicherweise etwa {n} Portionen.',
    portionsCheckOff:'Zur Kontrolle: Eine Torte dieser Grösse ergibt üblicherweise etwa {n} Portionen – eingetragen sind {p}. Prüfe Grösse oder Gewicht.',

    /* Preisbildung */
    kKiloBase:'Tortenbasis · {kg} kg × {p}', kKiloDeco:'Dekoration', kKiloTravel:'Lieferung',
    kKiloTotal:'Verkaufspreis', kKiloBaseShort:'Tortenbasis', kWeight:'Gewicht',
    hintOrderNo:'Wird automatisch vergeben, kann überschrieben werden.',
    basisLabel:'Tortenbasis · {kg} kg × {p}',
    setGram:'Gramm pro Person', setKilo:'Kilopreis (CHF/kg)',

    /* Kostenkontrolle */
    secCosts:'Was es dich kostet',
    fSimpleMat:'Material und Zutaten',
    fSimpleHours:'Arbeitszeit (Stunden)',
    hintSimple:'Zwei Zahlen genügen. Wenn du es einmal genau wissen willst, schalte unten auf die ausführliche Erfassung um.',
    toDetail:'Genauer erfassen',
    toSimple:'Einfach erfassen',
    actNew:'Neue Torte',
    askNew:'Neue Torte beginnen? Die aktuelle Kalkulation wird vorher gesichert.',
    msgNew:'Neue Torte begonnen. Die vorherige liegt unter «Meine Kalkulationen».',
    hintCosts:'Diese Angaben ändern den Preis nicht. Sie zeigen, ob der Preis deine Kosten und deine Zeit deckt.',
    kCostsShort:'Kosten',

    /* Ergebnis in Klartext */
    okAll:'Der Preis deckt Material, Zeit und Nebenkosten. Es bleiben {g} bei {l} pro Stunde.',
    warnThin:'Es bleibt wenig übrig: {g} — das sind {l} pro Stunde. Prüfe die Dekoration oder den Kilopreis.',
    badLoss:'Dieser Preis deckt deine Kosten nicht. Du legst {g} drauf.',
    badWage:'Bei diesem Preis arbeitest du für {l} pro Stunde.',
    hintNoCosts:'Trage unter «Was es dich kostet» Zutaten und Arbeitszeit ein, dann siehst du, was wirklich übrig bleibt.',
    shapes:['Rund','Quadratisch','Rechteckig','Herz','Sonderform'],
    tiers:['1','2','3','4','5+'],
    sizeCustom:'Individuelle Grösse',
    portionsHint:'Richtwert für diese Tortengrösse: ca. {n} Portionen.',
    portionsApply:'übernehmen',

    /* 3 Zutaten */
    secIngredients:'Zutaten',
    hintIngredients:'Verbrauchspreis = verwendete Menge ÷ Packungsgrösse × Einkaufspreis.',
    btnAddIngredient:'Zutat hinzufügen', fTemplate:'Vorlage', tplChoose:'Vorlage wählen …',
    sumIngredients:'Gesamtkosten Zutaten',
    rName:'Zutat', rQty:'Menge', rUnit:'Einheit', rPack:'Packungsgrösse',
    rPackUnit:'Einheit Packung', rPackPrice:'Einkaufspreis', rCost:'Verbrauchspreis',
    units:{g:'g', kg:'kg', ml:'ml', l:'l', stk:'Stück', pkg:'Packung'},
    errUnit:'Einheiten passen nicht zusammen',

    /* 4 Arbeitszeit */
    secWork:'Arbeitszeit',
    hintWork:'Trage jede Tätigkeit einzeln ein. Passive Wartezeit (Backen, Kühlen, Ruhezeit) kannst du als nicht verrechenbar markieren.',
    btnAddWork:'Tätigkeit hinzufügen',
    sumWorkActual:'Tatsächliche Arbeitszeit', sumWorkBillable:'Verrechenbare Arbeitszeit',
    rActivity:'Tätigkeit', rHours:'Stunden', rMinutes:'Minuten',
    rBillable:'verrechenbar', rRate:'Stundenansatz', rWorkCost:'Arbeitskosten',
    phases:{
      vorbereitung:'Vorbereitung und Einkauf', backen:'Backen und Abkühlen',
      creme:'Creme und Füllung', zusammen:'Zusammensetzen',
      dekoration:'Dekorieren', lieferung:'Verpacken und Liefern',
      /* weiterhin unterstützt, falls in gespeicherten Kalkulationen vorhanden */
      einkauf:'Einkauf', abkuehlen:'Abkühlen', grundierung:'Grundierung',
      verpackung:'Verpackung', reinigung:'Reinigung',
      kommunikation:'Kommunikation', sonstige:'Sonstige Arbeit'
    },

    /* 9 Effizienz */
    secEfficiency:'Lernzeit / Effizienz',
    hintEfficiency:'Wenn du für eine Dekoration heute 8 Stunden brauchst, eine erfahrene Konditorin aber 5 Stunden, sollte der Kunde nicht die volle Lernzeit bezahlen.',
    tipEfficiency:'Die tatsächliche Zeit zeigt, wie lange du wirklich gearbeitet hast. Die kalkulatorische Zeit ist jene Zeit, die du dem Kunden fairerweise verrechnest. Die Differenz ist deine Lern- und Übungszeit.',
    fActualHours:'Tatsächliche Arbeitszeit (h)', fCalcHours:'Kalkulatorisch verrechenbare Zeit (h)',
    fEffAuto:'Automatisch aus verrechenbarer Arbeitszeit übernehmen',
    effInfo:'Du verrechnest {k} von {i} Stunden. {d} Stunden gehen als Lern- und Übungszeit zu deinen Lasten.',
    effInfoEqual:'Du verrechnest deine gesamte verrechenbare Arbeitszeit.',

    /* 5 Dekoration */
    secDeco:'Dekoration',
    hintDeco:'Berechne je Position nach Materialpreis, Stückpreis, Zeitaufwand – oder kombiniert (Material + Zeit).',
    btnAddDeco:'Dekoration hinzufügen',
    sumDecoMat:'Dekorationsmaterial', sumDecoTime:'Dekorationsarbeit', sumDecoTotal:'Dekoration total',
    rDecoCat:'Kategorie', rDecoDesc:'Beschreibung', rMode:'Berechnung',
    rMaterial:'Materialpreis', rPieces:'Anzahl', rMinutes:'Minuten',
    decoCats:{
      fondant:'Fondant', buttercreme:'Buttercreme', ganache:'Ganache', fruechte:'Früchte',
      blumen:'Blumen', zuckerblumen:'Zuckerblumen', schokolade:'Schokolade', blattgold:'Blattgold',
      glitzer:'Glitzer', perlen:'Perlen', figuren:'Figuren', topper:'Cake Topper',
      schrift:'Schrift', krone:'Krone', bilder:'essbare Bilder',
      spezial:'Spezialanfertigung', sonstiges:'Sonstiges'
    },
    decoModes:{
      anteil:'Anteil einer Packung', stueck:'Stückpreis', material:'Pauschale',
      werkzeug:'Werkzeug anteilig', zeit:'Zeitaufwand', kombi:'Material + Zeit'
    },
    rDecoUse:'Verbraucht', rDecoPack:'Packungsgrösse', rDecoPackPrice:'Preis der Packung',
    rDecoTool:'Anschaffungspreis', rDecoUses:'Reicht für (Einsätze)',
    rDecoFlat:'Betrag',
    hintDecoTypes:'Am schnellsten geht es über die Vorlage – sie bringt die richtige Rechenart gleich mit. Anteil einer Packung für Ganache und Velours · Stückpreis für Kronen und Topper · Werkzeug anteilig für Stempel und Formen, die viele Torten überleben.',
    hintDecoPack:'Schachteln, Bänder und Unterlagen gehören nicht hierher, sondern unter Nebenkosten zu «Verpackung» und «Cake Board» – sie fallen bei jeder Torte an.',
    fDecoTemplate:'Vorlage',
    decoTplChoose:'Vorlage wählen …',
    decoTpl:{
      ganache:'Ganache-Glasur', velours:'Veloursbeschichtung', fondantdecke:'Fondantdecke',
      stempel:'Zuckerstempel', krone:'Krone', topper:'Cake Topper', zuckerblume:'Zuckerblume',
      blattgold:'Blattgold', essbild:'Essbares Bild', perlen:'Zuckerperlen',
      farben:'Lebensmittelfarben', airbrush:'Airbrush-Farbe', schrift:'Schriftzug von Hand',
      form:'Silikonform'
    },

    /* 6 Nebenkosten */
    secOverhead:'Nebenkosten',
    neben:{ energie:'Strom, Wasser, Gas', sonstige:'Sonstiges' },
    pack:{ schachtel:'Tortenschachtel', band:'Band, Schleife',
           unterlage:'Cake Board, Unterlage', sonstiges:'Sonstiges' },
    secPack:'Verpackung',
    hintPack:'Was bei jeder Torte an Verpackung anfällt. Wird dem Kunden weiterverrechnet.',
    sumPack:'Verpackung total',
    secDelivery:'Lieferung',
    hintDelivery:'Nur ausfüllen, wenn du lieferst. Bei Abholung alles auf 0 lassen – denk an Hin- und Rückweg.',
    fDriveTime:'Fahrzeit hin und zurück (Minuten)',
    sumDelivery:'Lieferung total',
    kKiloPack:'Verpackung',
    secOther:'Weitere Kosten',
    secTravel:'Fahrtkosten', fKm:'Kilometer', fKmPrice:'Kosten pro km', fTravelCost:'Fahrtkosten',
    hintTravelTime:'Die Fahrzeit erfasst du als Tätigkeit «Lieferung» im Bereich Arbeitszeit.',
    fOverheadPct:'Betriebskosten-Zuschlag', fOverheadPctShort:'Betriebskosten (%)', fOverheadAmount:'Betrag',
    tipOverhead:'Anteil an deinen laufenden Kosten (Miete, Versicherung, Geräte, Buchhaltung), der nicht direkt einer einzelnen Torte zugeordnet werden kann. Üblich sind 5–15 %.',
    sumOverhead:'Nebenkosten total',

    /* 7 Gewinn */
    secProfit:'Gewinn & Marge',
    modeMarkup:'Gewinnaufschlag', modeAmount:'Gewinnbetrag', modeMargin:'Zielmarge',
    hintMarkupMargin:'Aufschlag rechnet auf die Kosten, Marge rechnet vom Verkaufspreis. 20 % Aufschlag ≠ 20 % Marge.',
    tipMarkupMargin:'Aufschlag: Selbstkosten CHF 200 + 20 % = CHF 240. Marge: CHF 200 ÷ (1 − 0.20) = CHF 250. Bei gleicher Prozentzahl ist die Marge immer der höhere Preis.',
    fMarkupPct:'Gewinnaufschlag (%)', fProfitAmount:'Gewünschter Gewinn',
    fTargetMargin:'Zielmarge', fMarginCustom:'Individuelle Marge (%)', marginCustom:'individuell',
    fRounding:'Preis runden',
    roundings:['exakt','auf CHF 1','auf CHF 5','auf CHF 10'],

    /* 8 Ergebnis */
    secResult:'Ergebnis',
    kMaterial:'Materialkosten', kLabour:'Arbeitskosten', kDeco:'Dekorationskosten',
    kOverhead:'Nebenkosten', kCost:'Deine Kosten', kProfit:'Es bleibt',
    kPrice:'Verkaufspreis', kPriceShort:'Verkaufspreis',
    kPerPortion:'Preis pro Portion', kPerPortionShort:'Pro Portion',
    kMinAbs:'Absoluter Mindestpreis', kMinAbsSub:'Nur Sachkosten gedeckt – deine Arbeit ist gratis.',
    kMinSus:'Nachhaltiger Mindestpreis', kMinSusSub:'Kosten + faire Bezahlung deiner Arbeit, ohne Gewinn.',
    kRec:'Empfohlener Verkaufspreis', kRecSub:'Kosten + Arbeit + Gewinn.',
    kWage:'Effektiver Stundenlohn bei diesem Preis', kWageShort:'Stundenlohn', kHoursShort:'Arbeitszeit',
    wageSub:'Berechnet auf {h} tatsächlich geleisteten Stunden (Ziel: {z}).',
    sumTitle:'Aktuelle Kalkulation',

    /* Kundenpreis-Vergleich */
    secCompare:'Kundenpreis vergleichen',
    fPlannedPrice:'Geplanter Kundenpreis', fDifference:'Differenz',
    cmpNone:'Trage einen geplanten Kundenpreis ein, um ihn mit deiner Kalkulation zu vergleichen.',
    cmpBelow:'Du würdest {d} unter deinem kalkulierten Preis verkaufen. Effektiver Stundenlohn: {l}.',
    cmpAbove:'Dein geplanter Preis liegt {d} über dem kalkulierten Preis. Effektiver Stundenlohn: {l}.',
    cmpEqual:'Dein geplanter Preis entspricht deiner Kalkulation.',
    cmpUnderCost:'Achtung: Dieser Preis liegt unter deinen Selbstkosten von {s}.',

    /* Interne Ansicht */
    secInternal:'Alle Zahlen im Detail',
    iOrder:'Auftrag', iCosts:'Kosten', iTime:'Zeit', iPricing:'Preisbildung',
    iHoursActual:'Tatsächliche Stunden', iHoursBillable:'Verrechenbare Stunden',
    iHoursCalc:'Kalkulatorische Stunden', iRate:'Ø Stundenansatz',
    iLearn:'Nicht verrechnete Lernzeit', iOverheadPct:'Betriebskosten-Zuschlag',
    iMarkup:'Gewinnaufschlag', iMargin:'Marge', iWage:'Effektiver Stundenlohn',
    iPerPortion:'Preis pro Portion', iCostPerPortion:'Selbstkosten pro Portion',

    /* Warnsystem */
    flagOk:'Gute Kalkulation', flagWarn:'Knapp kalkuliert', flagBad:'Wirtschaftlich nicht sinnvoll',
    okBody:'Die Torte deckt Kosten, Arbeitszeit und deinen gewünschten Gewinn.',
    warnLowWage:'Bei diesem Verkaufspreis arbeitest du effektiv für {l} pro Stunde.',
    warnBelowSus:'Der Preis liegt unter deinem nachhaltigen Mindestpreis von {s}.',
    warnBelowCost:'Du verkaufst diese Torte unter deinen Selbstkosten.',
    warnBelowMaterial:'Deine Material- und Nebenkosten sind höher als dein Verkaufspreis.',
    warnNoHours:'Es ist noch keine Arbeitszeit erfasst – der Stundenlohn kann nicht berechnet werden.',
    warnNoPortions:'Ohne Portionen kann kein Preis pro Portion berechnet werden.',
    warnMarginHigh:'Eine Marge von 100 % oder mehr ist rechnerisch nicht möglich. Wert auf 95 % begrenzt.',
    warnNoMaterial:'Es sind noch keine Zutaten erfasst.',
    warnLearn:'{d} Stunden Lernzeit werden nicht verrechnet – das ist bewusst so kalkuliert.',

    /* Einstellungen */
    setHourly:'Standard-Stundenlohn', setKm:'Kilometerpreis', setOverhead:'Betriebskosten (%)',
    setMargin:'Gewünschte Marge (%)', setMarkup:'Standard-Aufschlag (%)', setCurrency:'Standardwährung',
    setRounding:'Rundungsregel', setLang:'Sprache',
    secSync:'Konto und Abgleich', navSync:'Mein Konto',
    syncHint:'Melde dich an, damit Handy und Computer dieselben Zahlen zeigen. Olena und Marcel haben je einen eigenen Zugang und sehen dieselben Daten.',
    syncOff:'Der Abgleich ist nicht eingerichtet. Die Daten bleiben auf diesem Gerät.',
    syncMail:'E-Mail', syncPass:'Passwort',
    syncLogin:'Anmelden', syncLogout:'Abmelden', syncNow:'Jetzt abgleichen',
    syncAs:'Angemeldet als {mail}',
    syncStatus:{ aus:'nicht eingerichtet', abgemeldet:'nicht angemeldet', bereit:'abgeglichen',
                 arbeitet:'gleicht ab …', offline:'kein Netz – wird nachgeholt', fehler:'Abgleich gestört',
                 keinZugang:'dieser Zugang ist noch nicht freigeschaltet' },
    syncFail:'Anmeldung fehlgeschlagen. Stimmen E-Mail und Passwort?',
    syncDone:'Abgeglichen.',
    setHint:'Diese Werte gelten als Vorgabe für neue Kalkulationen und werden im Browser gespeichert.',
    btnClose:'Schliessen', btnSaveSettings:'Einstellungen speichern',

    /* Projekte */
    projOpen:'Öffnen', projCopy:'Duplizieren', projDel:'Löschen',
    projEmpty:'Noch keine Kalkulationen gespeichert.',
    projPortions:'{n} Portionen', projHours:'{h} h Arbeit', projProfit:'Gewinn {p}',
    projCopySuffix:'(Kopie)', projUnnamed:'Ohne Namen',

    /* Kundenangebot */
    offerTitle:'Kundenangebot', offerFor:'Offerte für', offerOccasion:'Anlass',
    offerSize:'Tortengrösse', offerPortions:'Portionen', offerDesc:'Beschreibung',
    offerDeco:'Besondere Dekoration', offerDelivery:'Lieferdatum', offerTotal:'Gesamtpreis',
    offerDefaultDesc:'Individuell gefertigte Torte nach Ihren Wünschen, handwerklich hergestellt.',
    offerFoot:'Sweet Home Bakery · Grenchen SO · @sweet_home_bakery_ch · Preis gültig 30 Tage.',
    offerTiers:'Etagen', offerShape:'Form',

    /* Offerten-PDF */
    actPdfShare:'Offerte als PDF senden', actPdfSave:'PDF speichern',
    pdfBusy:'PDF wird erstellt …', msgPdfSaved:'PDF gespeichert.', msgPdfShared:'PDF gesendet.',
    errPdf:'Das PDF konnte nicht erstellt werden. Bitte Internetverbindung prüfen und erneut versuchen.',
    pdfTagline:'Individuelle Torten und Patisserie',
    pdfCustomer:'Kunde', pdfOfferNo:'Offerte-Nr.', pdfDateOrder:'Datum', pdfDateDelivery:'Lieferdatum',
    pdfOfferLabel:'Offerte', pdfDetails:'Ausführung', pdfPosition:'Position', pdfAmount:'Betrag',
    pdfTotal:'Gesamtpreis', pdfConditions:'Konditionen',
    pdfClosing:'Wir freuen uns auf Ihren Auftrag.',
    pdfTitle:'Individuelle Torte · {occ}', pdfTitlePlain:'Individuelle Torte',
    pdfPosText:'Individuelle Torte nach Kundenwunsch, handwerklich hergestellt · {n} Portionen',
    pdfPosNote:'Inklusive Dekoration, Verpackung und Übergabe.',
    pdfPerPortion:'entspricht {p} pro Portion',
    pdfValidity:'Dieses Angebot ist {d} Tage gültig.',
    pdfDeposit:'{p} % Anzahlung bei Auftragsbestätigung, Restbetrag bei Lieferung.',
    pdfAllergen:'Die Torte kann Spuren von Milch, Ei, Gluten, Soja und Schalenfrüchten enthalten. Allergien bitte bei der Bestellung mitteilen.',
    pdfShareTitle:'Offerte Sweet Home Bakery',
    pdfShareText:'Guten Tag {name}, hier meine Offerte für Ihre Torte. Herzliche Grüsse',

    /* Firmendaten */
    setCompany:'Firmendaten für die Offerte',
    setCompanyHint:'Diese Angaben erscheinen im Briefkopf und in der Fusszeile des Offerten-PDF.',
    coName:'Firmenname', coOwner:'Name der Konditorin', coStreet:'Strasse und Nummer',
    coZip:'PLZ', coCity:'Ort', coPhone:'Telefon', coMail:'E-Mail', coInsta:'Instagram',
    coValidity:'Gültigkeit (Tage)', coDeposit:'Anzahlung (%)',
    coAllergen:'Allergenhinweis', coTaxNote:'Preishinweis / MwSt.',
    phTaxNote:'z. B. Preise in Schweizer Franken',

    /* Meldungen */
    msgSaved:'Kalkulation gespeichert.', msgDeleted:'Kalkulation gelöscht.',
    msgLoaded:'Kalkulation geöffnet.', msgDuplicated:'Kalkulation dupliziert.',
    msgReset:'Neue Kalkulation gestartet.', msgDemo:'Beispielkalkulation geladen.',
    msgSettingsSaved:'Einstellungen gespeichert.',
    askDelete:'Diese Kalkulation wirklich löschen?',
    askReset:'Alle Eingaben zurücksetzen?',
    footNote:'Alle Berechnungen erfolgen lokal auf deinem Gerät. Daten werden im Browser gespeichert.',
    newRow:'Neue Position'
  },

  ua: {
    /* Шапка та навігація */
    brandSub:'Калькулятор тортів · Гренхен SO',
    navProjects:'Мої розрахунки', navSettings:'Налаштування',
    actSave:'Зберегти розрахунок', actOffer:'Створити пропозицію для клієнта',
    actPrintCalc:'Друк розрахунку', actPrintOffer:'Друк пропозиції',
    actDemo:'Завантажити приклад', actReset:'Скинути', actUndo:'Скасувати дію',
    undoNone:'Немає що скасовувати.',
    undoReady:'Можна скасувати кроків: {n}.',
    undoDone:'Дію скасовано.',
    undoOffer:'Скасувати',
    msgRowDeleted:'Рядок видалено.',
    askResetSafe:'Скинути всі дані? Поточний розрахунок буде автоматично збережено.',
    autoBackup:'Автоматичне збереження',
    msgBackupSaved:'Попередній розрахунок збережено в «Мої розрахунки».',

    /* 1 Замовлення */
    secOrder:'Замовлення',
    fCustomer:'Ім’я клієнта', phCustomer:'напр. родина Маєр',
    fOrderNo:'Номер замовлення', fOrderDate:'Дата замовлення', fDeliveryDate:'Дата доставки',
    fOccasion:'Привід', fWishPrice:'Бажана ціна клієнта (необов’язково)',
    fNotes:'Примітки', phNotes:'Побажання, кольори, алергії …',
    occasions:['День народження','Весілля','Дитячий день народження','Ювілей','Хрестини','Корпоративна подія','Заручини','Baby Shower','Інше'],

    /* 2 Торт */
    secCake:'Торт',
    fShape:'Форма', fSize:'Діаметр / розмір', fSizeCustom:'Індивідуальний розмір (см)',
    fHeight:'Висота (см)', fTiers:'Кількість ярусів', fPortions:'Порції (осіб)',
    fWeight:'Вага (кг)',
    hintWeight:'Порції та вага пов’язані: {g} г на особу. Зміни одне — друге підлаштується. Ціна рахується з ваги.',
    secCakeDesc:'Дані для пропозиції та ескізу',
    hintCakeDesc:'Ці дані не впливають на ціну. Вони з’являються у пропозиції та задають яруси в конфігураторі дизайну.',
    portionsCheck:'Для перевірки: торт такого розміру зазвичай дає близько {n} порцій.',
    portionsCheckOff:'Для перевірки: торт такого розміру зазвичай дає близько {n} порцій — внесено {p}. Перевір розмір або вагу.',

    /* Формування ціни */
    kKiloBase:'Основа торта · {kg} кг × {p}', kKiloDeco:'Декор', kKiloTravel:'Доставка',
    kKiloTotal:'Ціна продажу', kKiloBaseShort:'Основа торта', kWeight:'Вага',
    hintOrderNo:'Присвоюється автоматично, можна змінити.',
    basisLabel:'Основа торта · {kg} кг × {p}',
    setGram:'Грамів на особу', setKilo:'Ціна за кілограм (CHF/кг)',

    /* Контроль витрат */
    secCosts:'Скільки це коштує тобі',
    fSimpleMat:'Матеріали та інгредієнти',
    fSimpleHours:'Робочий час (годин)',
    hintSimple:'Досить двох чисел. Якщо колись захочеш порахувати точно, унизу можна перемкнутися на докладний облік.',
    toDetail:'Порахувати точно',
    toSimple:'Порахувати просто',
    actNew:'Новий торт',
    askNew:'Почати новий торт? Поточний розрахунок буде збережено.',
    msgNew:'Новий торт розпочато. Попередній лежить у «Мої розрахунки».',
    hintCosts:'Ці дані не змінюють ціну. Вони показують, чи покриває ціна твої витрати й твій час.',
    kCostsShort:'Витрати',

    /* Результат простими словами */
    okAll:'Ціна покриває матеріали, час і супутні витрати. Залишається {g} — це {l} на годину.',
    warnThin:'Залишається небагато: {g} — це {l} на годину. Перевір декор або ціну за кілограм.',
    badLoss:'Ця ціна не покриває твоїх витрат. Ти доплачуєш {g}.',
    badWage:'За цією ціною ти працюєш за {l} на годину.',
    hintNoCosts:'Внеси у розділі «Скільки це коштує тобі» інгредієнти та робочий час — тоді побачиш, скільки справді залишається.',
    shapes:['Круглий','Квадратний','Прямокутний','Серце','Особлива форма'],
    tiers:['1','2','3','4','5+'],
    sizeCustom:'Індивідуальний розмір',
    portionsHint:'Орієнтовно для цього розміру: близько {n} порцій.',
    portionsApply:'застосувати',

    /* 3 Інгредієнти */
    secIngredients:'Інгредієнти',
    hintIngredients:'Вартість витрати = використана кількість ÷ розмір упаковки × ціна закупівлі.',
    btnAddIngredient:'Додати інгредієнт', fTemplate:'Шаблон', tplChoose:'Обрати шаблон …',
    sumIngredients:'Загальна вартість інгредієнтів',
    rName:'Інгредієнт', rQty:'Кількість', rUnit:'Одиниця', rPack:'Розмір упаковки',
    rPackUnit:'Одиниця упаковки', rPackPrice:'Ціна закупівлі', rCost:'Вартість витрати',
    units:{g:'г', kg:'кг', ml:'мл', l:'л', stk:'шт.', pkg:'упаковка'},
    errUnit:'Одиниці не збігаються',

    /* 4 Робочий час */
    secWork:'Робочий час',
    hintWork:'Зніми пташку, якщо в цей час ти не стоїш біля торта — наприклад під час випікання. Час на декорування вноситься вище, біля кожного елемента декору.',
    btnAddWork:'Додати етап',
    sumWorkActual:'Фактичний робочий час', sumWorkBillable:'Оплачуваний робочий час',
    rActivity:'Етап', rHours:'Години', rMinutes:'Хвилини',
    rBillable:'оплачується', rRate:'Ставка за годину', rWorkCost:'Вартість роботи',
    phases:{
      vorbereitung:'Підготовка та закупівля', backen:'Випікання та охолодження',
      creme:'Крем і начинка', zusammen:'Збирання',
      dekoration:'Декорування', lieferung:'Пакування та доставка',
      einkauf:'Закупівля', abkuehlen:'Охолодження', grundierung:'Чорнове вирівнювання',
      verpackung:'Пакування', reinigung:'Прибирання',
      kommunikation:'Комунікація', sonstige:'Інша робота'
    },

    /* 9 Ефективність */
    secEfficiency:'Час навчання / ефективність',
    hintEfficiency:'Якщо сьогодні на декор ти витрачаєш 8 годин, а досвідчена кондитерка — 5, клієнт не повинен оплачувати весь час навчання.',
    tipEfficiency:'Фактичний час показує, скільки ти справді працювала. Розрахунковий час — це той час, який справедливо виставити клієнту. Різниця — твій час на навчання та практику.',
    fActualHours:'Фактичний робочий час (год)', fCalcHours:'Розрахунковий оплачуваний час (год)',
    fEffAuto:'Брати автоматично з оплачуваного робочого часу',
    effInfo:'Ти виставляєш {k} з {i} годин. {d} год — це твій час на навчання та практику.',
    effInfoEqual:'Ти виставляєш увесь свій оплачуваний робочий час.',

    /* 5 Декор */
    secDeco:'Декор',
    hintDeco:'Рахуй кожну позицію за ціною матеріалу, за штуку, за витраченим часом — або комбіновано (матеріал + час).',
    btnAddDeco:'Додати декор',
    sumDecoMat:'Матеріал декору', sumDecoTime:'Робота з декором', sumDecoTotal:'Декор разом',
    rDecoCat:'Категорія', rDecoDesc:'Опис', rMode:'Розрахунок',
    rMaterial:'Ціна матеріалу', rPieces:'Кількість', rMinutes:'Хвилини',
    decoCats:{
      fondant:'Мастика', buttercreme:'Масляний крем', ganache:'Ганаш', fruechte:'Фрукти',
      blumen:'Квіти', zuckerblumen:'Цукрові квіти', schokolade:'Шоколад', blattgold:'Сусальне золото',
      glitzer:'Блиск', perlen:'Перли', figuren:'Фігурки', topper:'Топер',
      schrift:'Напис', krone:'Корона', bilder:'Їстівні картинки',
      spezial:'Спеціальне виготовлення', sonstiges:'Інше'
    },
    decoModes:{
      anteil:'Частина упаковки', stueck:'Ціна за штуку', material:'Фіксована сума',
      werkzeug:'Інструмент частково', zeit:'Витрачений час', kombi:'Матеріал + час'
    },
    rDecoUse:'Витрачено', rDecoPack:'Розмір упаковки', rDecoPackPrice:'Ціна упаковки',
    rDecoTool:'Ціна придбання', rDecoUses:'Вистачає на (разів)',
    rDecoFlat:'Сума',
    hintDecoTypes:'Найшвидше через шаблон — він одразу задає потрібний спосіб розрахунку. Частина упаковки — для ганашу та велюру · Ціна за штуку — для корон і топерів · Інструмент частково — для штампів і форм, які служать багатьом тортам.',
    hintDecoPack:'Коробки, стрічки та підкладки сюди не належать — їхнє місце у супутніх витратах під «Пакування» та «Підкладка для торта», бо вони потрібні для кожного торта.',
    fDecoTemplate:'Шаблон',
    decoTplChoose:'Обрати шаблон …',
    decoTpl:{
      ganache:'Ганаш', velours:'Велюрове покриття', fondantdecke:'Мастичне покриття',
      stempel:'Цукровий штамп', krone:'Корона', topper:'Топер', zuckerblume:'Цукрова квітка',
      blattgold:'Сусальне золото', essbild:'Їстівна картинка', perlen:'Цукрові перли',
      farben:'Харчові барвники', airbrush:'Фарба для аерографа', schrift:'Напис від руки',
      form:'Силіконова форма'
    },

    /* 6 Супутні витрати */
    secOverhead:'Супутні витрати',
    neben:{ energie:'Електрика, вода, газ', sonstige:'Інше' },
    pack:{ schachtel:'Коробка для торта', band:'Стрічка, бант',
           unterlage:'Підкладка для торта', sonstiges:'Інше' },
    secPack:'Пакування',
    hintPack:'Те, що потрібно для кожного торта. Перераховується клієнту.',
    sumPack:'Пакування разом',
    secDelivery:'Доставка',
    hintDelivery:'Заповнюй лише якщо доставляєш. При самовивозі залиш нулі — врахуй дорогу туди й назад.',
    fDriveTime:'Час у дорозі туди й назад (хвилин)',
    sumDelivery:'Доставка разом',
    kKiloPack:'Пакування',
    secOther:'Інші витрати',
    secTravel:'Транспортні витрати', fKm:'Кілометри', fKmPrice:'Вартість за км', fTravelCost:'Транспортні витрати',
    hintTravelTime:'Час у дорозі внось як етап «Доставка» у розділі робочого часу.',
    fOverheadPct:'Надбавка на операційні витрати', fOverheadPctShort:'Операційні витрати (%)', fOverheadAmount:'Сума',
    tipOverhead:'Частка твоїх постійних витрат (оренда, страхування, обладнання, бухгалтерія), яку неможливо віднести до одного торта. Зазвичай 5–15 %.',
    sumOverhead:'Супутні витрати разом',

    /* 7 Прибуток */
    secProfit:'Прибуток і маржа',
    modeMarkup:'Націнка', modeAmount:'Сума прибутку', modeMargin:'Цільова маржа',
    hintMarkupMargin:'Націнка рахується від собівартості, маржа — від ціни продажу. 20 % націнки ≠ 20 % маржі.',
    tipMarkupMargin:'Націнка: собівартість CHF 200 + 20 % = CHF 240. Маржа: CHF 200 ÷ (1 − 0.20) = CHF 250. За однакового відсотка маржа завжди дає вищу ціну.',
    fMarkupPct:'Націнка (%)', fProfitAmount:'Бажаний прибуток',
    fTargetMargin:'Цільова маржа', fMarginCustom:'Індивідуальна маржа (%)', marginCustom:'індивідуально',
    fRounding:'Округлення ціни',
    roundings:['точно','до CHF 1','до CHF 5','до CHF 10'],

    /* 8 Результат */
    secResult:'Результат',
    kMaterial:'Вартість матеріалів', kLabour:'Вартість роботи', kDeco:'Вартість декору',
    kOverhead:'Супутні витрати', kCost:'Твої витрати', kProfit:'Залишається',
    kPrice:'Ціна продажу', kPriceShort:'Ціна продажу',
    kPerPortion:'Ціна за порцію', kPerPortionShort:'За порцію',
    kMinAbs:'Абсолютна мінімальна ціна', kMinAbsSub:'Покриті лише матеріальні витрати — твоя робота безкоштовна.',
    kMinSus:'Стала мінімальна ціна', kMinSusSub:'Витрати + справедлива оплата роботи, без прибутку.',
    kRec:'Рекомендована ціна продажу', kRecSub:'Витрати + робота + прибуток.',
    kWage:'Фактична погодинна оплата за цією ціною', kWageShort:'Погодинно', kHoursShort:'Робочий час',
    wageSub:'Розраховано на {h} фактично відпрацьованих годин (ціль: {z}).',
    sumTitle:'Поточний розрахунок',

    /* Порівняння ціни */
    secCompare:'Порівняти ціну клієнта',
    fPlannedPrice:'Запланована ціна клієнта', fDifference:'Різниця',
    cmpNone:'Внеси заплановану ціну клієнта, щоб порівняти її з розрахунком.',
    cmpBelow:'Ти продаси на {d} дешевше за розраховану ціну. Фактична погодинна оплата: {l}.',
    cmpAbove:'Твоя запланована ціна на {d} вища за розраховану. Фактична погодинна оплата: {l}.',
    cmpEqual:'Твоя запланована ціна відповідає розрахунку.',
    cmpUnderCost:'Увага: ця ціна нижча за твою собівартість {s}.',

    /* Внутрішній перегляд */
    secInternal:'Усі цифри докладно',
    iOrder:'Замовлення', iCosts:'Витрати', iTime:'Час', iPricing:'Формування ціни',
    iHoursActual:'Фактичні години', iHoursBillable:'Оплачувані години',
    iHoursCalc:'Розрахункові години', iRate:'Середня ставка',
    iLearn:'Невиставлений час навчання', iOverheadPct:'Надбавка на операційні витрати',
    iMarkup:'Націнка', iMargin:'Маржа', iWage:'Фактична погодинна оплата',
    iPerPortion:'Ціна за порцію', iCostPerPortion:'Собівартість за порцію',

    /* Система попереджень */
    flagOk:'Хороший розрахунок', flagWarn:'Розраховано впритул', flagBad:'Економічно недоцільно',
    okBody:'Торт покриває витрати, робочий час і бажаний прибуток.',
    warnLowWage:'За цією ціною продажу ти фактично працюєш за {l} на годину.',
    warnBelowSus:'Ціна нижча за твою сталу мінімальну ціну {s}.',
    warnBelowCost:'Ти продаєш цей торт нижче собівартості.',
    warnBelowMaterial:'Твої витрати на матеріали та супутні витрати вищі за ціну продажу.',
    warnNoHours:'Робочий час ще не внесено — погодинну оплату розрахувати неможливо.',
    warnNoPortions:'Без кількості порцій неможливо розрахувати ціну за порцію.',
    warnMarginHigh:'Маржа 100 % або більше математично неможлива. Значення обмежено до 95 %.',
    warnNoMaterial:'Інгредієнти ще не внесено.',
    warnLearn:'{d} год часу навчання не виставляються клієнту — так закладено свідомо.',

    /* Налаштування */
    setHourly:'Стандартна ставка за годину', setKm:'Вартість за кілометр', setOverhead:'Операційні витрати (%)',
    setMargin:'Бажана маржа (%)', setMarkup:'Стандартна націнка (%)', setCurrency:'Основна валюта',
    setRounding:'Правило округлення', setLang:'Мова',
    secSync:'Обліковий запис і синхронізація', navSync:'Мій акаунт',
    syncHint:'Увійди, щоб телефон і комп’ютер показували однакові дані. Олена і Марсель мають окремі входи, але бачать ті самі дані.',
    syncOff:'Синхронізація не налаштована. Дані залишаються на цьому пристрої.',
    syncMail:'Електронна пошта', syncPass:'Пароль',
    syncLogin:'Увійти', syncLogout:'Вийти', syncNow:'Синхронізувати зараз',
    syncAs:'Ви увійшли як {mail}',
    syncStatus:{ aus:'не налаштовано', abgemeldet:'не виконано вхід', bereit:'синхронізовано',
                 arbeitet:'синхронізує …', offline:'немає мережі — буде пізніше', fehler:'помилка синхронізації',
                 keinZugang:'цей вхід ще не активовано' },
    syncFail:'Не вдалося увійти. Перевір пошту та пароль.',
    syncDone:'Синхронізовано.',
    setHint:'Ці значення використовуються за замовчуванням для нових розрахунків і зберігаються у браузері.',
    btnClose:'Закрити', btnSaveSettings:'Зберегти налаштування',

    /* Проєкти */
    projOpen:'Відкрити', projCopy:'Дублювати', projDel:'Видалити',
    projEmpty:'Збережених розрахунків ще немає.',
    projPortions:'{n} порцій', projHours:'{h} год роботи', projProfit:'Прибуток {p}',
    projCopySuffix:'(копія)', projUnnamed:'Без назви',

    /* Пропозиція для клієнта */
    offerTitle:'Пропозиція для клієнта', offerFor:'Пропозиція для', offerOccasion:'Привід',
    offerSize:'Розмір торта', offerPortions:'Порції', offerDesc:'Опис',
    offerDeco:'Особливий декор', offerDelivery:'Дата доставки', offerTotal:'Загальна ціна',
    offerDefaultDesc:'Торт, виготовлений індивідуально за вашими побажаннями, ручна робота.',
    offerFoot:'Sweet Home Bakery · Гренхен SO · @sweet_home_bakery_ch · Ціна дійсна 30 днів.',
    offerTiers:'Яруси', offerShape:'Форма',

    /* PDF пропозиції */
    actPdfShare:'Надіслати пропозицію у PDF', actPdfSave:'Зберегти PDF',
    pdfBusy:'PDF створюється …', msgPdfSaved:'PDF збережено.', msgPdfShared:'PDF надіслано.',
    errPdf:'Не вдалося створити PDF. Перевір з’єднання з інтернетом і спробуй ще раз.',
    pdfTagline:'Індивідуальні торти та кондитерські вироби',
    pdfCustomer:'Клієнт', pdfOfferNo:'Номер пропозиції', pdfDateOrder:'Дата', pdfDateDelivery:'Дата доставки',
    pdfOfferLabel:'Пропозиція', pdfDetails:'Виконання', pdfPosition:'Позиція', pdfAmount:'Сума',
    pdfTotal:'Загальна ціна', pdfConditions:'Умови',
    pdfClosing:'Будемо раді вашому замовленню.',
    pdfTitle:'Індивідуальний торт · {occ}', pdfTitlePlain:'Індивідуальний торт',
    pdfPosText:'Індивідуальний торт за побажанням клієнта, ручна робота · {n} порцій',
    pdfPosNote:'Включно з декором, пакуванням і передачею.',
    pdfPerPortion:'що відповідає {p} за порцію',
    pdfValidity:'Ця пропозиція дійсна {d} днів.',
    pdfDeposit:'{p} % передоплати при підтвердженні замовлення, залишок при доставці.',
    pdfAllergen:'Торт може містити сліди молока, яєць, глютену, сої та горіхів. Про алергії, будь ласка, повідомляйте при замовленні.',
    pdfShareTitle:'Пропозиція Sweet Home Bakery',
    pdfShareText:'Доброго дня, {name}! Надсилаю пропозицію для вашого торта. З найкращими побажаннями',

    /* Дані компанії */
    setCompany:'Дані компанії для пропозиції',
    setCompanyHint:'Ці дані з’являються у шапці та в нижньому колонтитулі PDF-пропозиції.',
    coName:'Назва компанії', coOwner:'Ім’я кондитерки', coStreet:'Вулиця та номер',
    coZip:'Індекс', coCity:'Місто', coPhone:'Телефон', coMail:'Електронна пошта', coInsta:'Instagram',
    coValidity:'Термін дії (днів)', coDeposit:'Передоплата (%)',
    coAllergen:'Застереження щодо алергенів', coTaxNote:'Примітка щодо ціни / ПДВ',
    phTaxNote:'напр. ціни у швейцарських франках',

    /* Повідомлення */
    msgSaved:'Розрахунок збережено.', msgDeleted:'Розрахунок видалено.',
    msgLoaded:'Розрахунок відкрито.', msgDuplicated:'Розрахунок здубльовано.',
    msgReset:'Розпочато новий розрахунок.', msgDemo:'Приклад розрахунку завантажено.',
    msgSettingsSaved:'Налаштування збережено.',
    askDelete:'Справді видалити цей розрахунок?',
    askReset:'Скинути всі введені дані?',
    footNote:'Усі обчислення виконуються локально на твоєму пристрої. Дані зберігаються у браузері.',
    newRow:'Нова позиція'
  }
};

/* ==========================================================================
 * 2. STAMMDATEN & VORLAGEN
 * ========================================================================== */

/** Arbeitsschritte einer Torte. Bewusst kurz gehalten – weitere Zeilen
 *  fügt Lena bei Bedarf selbst hinzu. */
const PHASE_KEYS = ['vorbereitung','backen','creme','zusammen','lieferung'];

/** Schritte ohne aktive Arbeit: Der Ofen läuft, Lena macht etwas anderes.
 *  Diese Zeit zählt nicht in den effektiven Stundenlohn. */
const PHASE_NON_BILLABLE = ['backen'];

const DECO_KEYS = ['fondant','buttercreme','ganache','fruechte','blumen','zuckerblumen','schokolade',
  'blattgold','glitzer','perlen','figuren','topper','schrift','krone','bilder','spezial','sonstiges'];

/** Nebenkosten: nur die Posten, die bei jeder Torte wirklich anfallen. */
const NEBEN_KEYS = ['energie','sonstige'];

/** Verpackung – ein eigener Preisbestandteil, der bei jeder Torte anfällt. */
const PACK_KEYS = ['schachtel','band','unterlage','sonstiges'];

const UNIT_KEYS = ['g','kg','ml','l','stk','pkg'];

/** Umrechnung auf Basiseinheit + Kategorie (für Plausibilitätsprüfung) */
const UNIT_INFO = {
  g:{f:1,    cat:'mass'},   kg:{f:1000, cat:'mass'},
  ml:{f:1,   cat:'vol'},    l:{f:1000,  cat:'vol'},
  stk:{f:1,  cat:'count'},  pkg:{f:1,   cat:'count'}
};

const SIZES = [12,14,16,18,20,22,24,26,28,30];

/** Zutaten-Vorlagen mit realistischen Schweizer Detailhandelspreisen (Stand 2026, anpassbar) */
const INGREDIENT_TEMPLATES = [
  {name:'Mehl',              menge:500, einheit:'g',  pack:1000, packEinheit:'g',  preis:1.60},
  {name:'Zucker',            menge:400, einheit:'g',  pack:1000, packEinheit:'g',  preis:1.50},
  {name:'Eier',              menge:6,   einheit:'stk',pack:10,   packEinheit:'stk',preis:5.50},
  {name:'Butter',            menge:250, einheit:'g',  pack:250,  packEinheit:'g',  preis:3.50},
  {name:'Mascarpone',        menge:350, einheit:'g',  pack:500,  packEinheit:'g',  preis:4.80},
  {name:'Rahm / Sahne 35 %', menge:500, einheit:'ml', pack:500,  packEinheit:'ml', preis:3.20},
  {name:'Frischkäse',        menge:300, einheit:'g',  pack:200,  packEinheit:'g',  preis:2.60},
  {name:'Dunkle Schokolade', menge:200, einheit:'g',  pack:100,  packEinheit:'g',  preis:2.40},
  {name:'Weisse Schokolade', menge:200, einheit:'g',  pack:100,  packEinheit:'g',  preis:2.60},
  {name:'Kakaopulver',       menge:60,  einheit:'g',  pack:250,  packEinheit:'g',  preis:4.20},
  {name:'Fondant',           menge:750, einheit:'g',  pack:1000, packEinheit:'g',  preis:12.90},
  {name:'Puderzucker',       menge:250, einheit:'g',  pack:500,  packEinheit:'g',  preis:1.90},
  {name:'Vanilleextrakt',    menge:10,  einheit:'ml', pack:50,   packEinheit:'ml', preis:8.50},
  {name:'Backpulver',        menge:15,  einheit:'g',  pack:100,  packEinheit:'g',  preis:2.20},
  {name:'Beeren frisch',     menge:300, einheit:'g',  pack:250,  packEinheit:'g',  preis:4.50},
  {name:'Lebensmittelfarbe', menge:1,   einheit:'stk',pack:1,    packEinheit:'stk',preis:3.90}
];

/** Absender- und Konditionsangaben für das Offerten-PDF.
 *  Adresse, Telefon und E-Mail trägt Olena in den Einstellungen nach. */
const DEFAULT_COMPANY = {
  name:'Sweet Home Bakery',
  owner:'Olena',
  street:'',
  zip:'2540',
  city:'Grenchen',
  phone:'',
  mail:'',
  insta:'@sweet_home_bakery_ch',
  validity:30,        // Tage
  deposit:50,         // % Anzahlung
  allergen:'',        // leer = Standardtext aus den Übersetzungen
  taxNote:''
};

/** Vorlagen für die Dekoration – Lenas wiederkehrende Posten.
 *  Die Beträge sind Startwerte und müssen einmal an ihre tatsächlichen
 *  Einkaufspreise angepasst werden; danach stimmen sie dauerhaft.
 *  Aufbau je Vorlage: Rechenart und die zugehörigen Felder. */
const DECO_TEMPLATES = [
  /* Anteil einer Packung: verbraucht ÷ Packungsgrösse × Preis */
  {key:'ganache',      cat:'ganache',      mode:'anteil',   use:400, pack:1000, material:22.00, minuten:25},
  {key:'velours',      cat:'spezial',      mode:'anteil',   use:80,  pack:400,  material:28.00, minuten:15},
  {key:'fondantdecke', cat:'fondant',      mode:'anteil',   use:600, pack:1000, material:12.90, minuten:35},
  {key:'perlen',       cat:'perlen',       mode:'anteil',   use:30,  pack:100,  material:6.50,  minuten:10},
  {key:'farben',       cat:'sonstiges',    mode:'anteil',   use:5,   pack:100,  material:24.00, minuten:0},
  {key:'airbrush',     cat:'spezial',      mode:'anteil',   use:10,  pack:60,   material:9.50,  minuten:10},
  /* Stückpreis */
  {key:'krone',        cat:'krone',        mode:'stueck',   material:9.00,  anzahl:1, minuten:10},
  {key:'topper',       cat:'topper',       mode:'stueck',   material:9.00,  anzahl:1, minuten:5},
  {key:'blattgold',    cat:'blattgold',    mode:'stueck',   material:12.00, anzahl:1, minuten:15},
  {key:'essbild',      cat:'bilder',       mode:'stueck',   material:9.50,  anzahl:1, minuten:10},
  /* Werkzeug: Anschaffungspreis ÷ Einsätze */
  {key:'stempel',      cat:'spezial',      mode:'werkzeug', material:38.00, einsaetze:50, minuten:10},
  {key:'form',         cat:'spezial',      mode:'werkzeug', material:24.00, einsaetze:60, minuten:10},
  /* Reine Arbeit */
  {key:'zuckerblume',  cat:'zuckerblumen', mode:'zeit',     minuten:25},
  {key:'schrift',      cat:'schrift',      mode:'zeit',     minuten:15}
];

/** Werkseinstellungen – Referenzwerte aus dem SHB-Businessplan */
const DEFAULT_SETTINGS = {
  stundenansatz: 40,      // CHF/h
  kmPreis: 0.70,          // CHF/km
  betriebProzent: 8,      // %
  grammProPerson: 200,    // g – Erfahrungswert für eine Portion
  kiloPreis: 55,          // CHF/kg Tortenbasis, Dekoration separat
  waehrung: 'CHF',
  rundung: 2,             // 0 exakt · 1 CHF 1 · 2 CHF 5 · 3 CHF 10
  sprache: '',            // leer = Sprache des Geräts verwenden
  nextAuftrag: 1,       // fortlaufende Auftragsnummer
  company: {...DEFAULT_COMPANY}
};

/* ==========================================================================
 * 3. SPEICHER-ADAPTER
 * --------------------------------------------------------------------------
 * Alle Lese-/Schreibzugriffe laufen über dieses Interface. Für Supabase
 * genügt es später, einen zweiten Adapter mit denselben vier Methoden zu
 * hinterlegen und `Store.use(SupabaseAdapter)` aufzurufen – der restliche
 * Code bleibt unverändert.
 *
 *   const SupabaseAdapter = {
 *     async get(key)       { const {data} = await sb.from('shb_kv').select('value').eq('key',key).single();
 *                            return data ? data.value : null; },
 *     async set(key,value) { await sb.from('shb_kv').upsert({key, value, user_id: sb.auth.user().id}); },
 *     async remove(key)    { await sb.from('shb_kv').delete().eq('key',key); },
 *     async keys()         { const {data} = await sb.from('shb_kv').select('key'); return data.map(r=>r.key); }
 *   };
 * ========================================================================== */
const PREFIX = 'shb.cakecalc.';

const LocalStorageAdapter = {
  async get(key){
    try{ const raw = localStorage.getItem(PREFIX+key); return raw ? JSON.parse(raw) : null; }
    catch(e){ console.warn('Storage lesen fehlgeschlagen:', e); return null; }
  },
  async set(key,value){
    try{ localStorage.setItem(PREFIX+key, JSON.stringify(value)); return true; }
    catch(e){ console.warn('Storage schreiben fehlgeschlagen:', e); return false; }
  },
  async remove(key){
    try{ localStorage.removeItem(PREFIX+key); }catch(e){ /* ignorieren */ }
  },
  async keys(){
    try{ return Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).map(k=>k.slice(PREFIX.length)); }
    catch(e){ return []; }
  }
};

const Store = {
  adapter: LocalStorageAdapter,
  use(a){ this.adapter = a; },
  get(k){ return this.adapter.get(k); },
  set(k,v){
    const r = this.adapter.set(k,v);
    /* Dem Abgleich Bescheid geben, falls eingerichtet und angemeldet */
    if(typeof SHB_SYNC !== 'undefined'){ try{ SHB_SYNC.vorgemerkt(k); }catch(e){} }
    return r;
  },
  remove(k){ return this.adapter.remove(k); },
  keys(){ return this.adapter.keys(); }
};

/* ==========================================================================
 * 4. ZUSTAND
 * ========================================================================== */
let settings = {...DEFAULT_SETTINGS};
let lang = 'de';
let state = null;          // aktuelle Kalkulation
let projects = [];         // gespeicherte Kalkulationen
let currentProjectId = null;
let calc = null;           // letztes Rechenergebnis

/* ==========================================================================
 * 4b. VERLAUF – Schutz vor versehentlichem Datenverlust
 * --------------------------------------------------------------------------
 * Vor jedem Schritt, der Eingaben vernichten kann, wird der bisherige
 * Zustand abgelegt. Der Verlauf liegt zusätzlich im Gerät, damit er auch
 * ein Schliessen der App übersteht.
 * ========================================================================== */
const HISTORY_MAX = 15;
let history = [];

/** Aktuellen Zustand sichern, bevor etwas verändert wird. */
function snapshot(label){
  try{
    history.push({ label: label || '', at: Date.now(),
                   state: JSON.parse(JSON.stringify(state)) });
    while(history.length > HISTORY_MAX) history.shift();
    saveHistory();
    updateUndoButton();
  }catch(e){ console.warn('Verlauf:', e); }
}

/** Verlauf ablegen. Bei vollem Speicher werden die ältesten Einträge
 *  verworfen, statt die Sicherung ganz aufzugeben. */
async function saveHistory(){
  for(let versuch = 0; versuch < 4; versuch++){
    const ok = await Store.set('history', history);
    if(ok) return;
    if(history.length <= 1) return;
    history = history.slice(Math.ceil(history.length/2));
  }
}

/** Letzten Schritt zurücknehmen. */
function undo(){
  if(!history.length){ toast(t('undoNone')); return; }
  const eintrag = history.pop();
  state = eintrag.state;
  saveHistory();
  renderAll();
  updateUndoButton();
  toast(t('undoDone'));
}

function updateUndoButton(){
  const b = $('#btnUndo');
  if(!b) return;
  /* Immer sichtbar, damit man weiss, dass es ihn gibt – nur ausgegraut,
     solange nichts zurückzunehmen ist. */
  b.disabled = history.length === 0;
  b.title = history.length ? tf('undoReady',{n:history.length}) : t('undoNone');
}

/** Meldung mit sofortigem Rückgängig – der schnellste Weg zurück. */
function toastUndo(text){
  const el = $('#toast');
  if(!el) return;
  el.innerHTML = `<span>${escapeHtml(text)}</span>` +
    `<button type="button" class="toast-undo">${escapeHtml(t('undoOffer'))}</button>`;
  el.hidden = false;
  requestAnimationFrame(()=>el.classList.add('show'));
  const btn = el.querySelector('.toast-undo');
  btn.onclick = ()=>{ el.classList.remove('show'); setTimeout(()=>el.hidden=true,220); undo(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.hidden=true,220); }, 6000);
}

/** Erzeugt eine leere Kalkulation mit den Standard-Produktionsphasen. */
/** Fortlaufende Auftragsnummer: SHB-2026-001 */
function nextOrderNo(){
  const jahr = new Date().getFullYear();
  const n = Math.max(1, num(settings.nextAuftrag) || 1);
  return `SHB-${jahr}-${String(n).padStart(3,'0')}`;
}

function newState(){
  const today = new Date().toISOString().slice(0,10);
  return {
    meta:{ kundenname:'', auftragsnummer:nextOrderNo(), bestelldatum:today, lieferdatum:'',
           anlass:0, bemerkungen:'', kundenpreis:'' },
    cake:{ form:0, groesse:'20', groesseCustom:'', hoehe:10, etagen:0, portionen:20,
           gewicht: 20*settings.grammProPerson/1000 },
    zutaten:[ blankIngredient() ],
    arbeit: PHASE_KEYS.map(k=>({
      key:k, name:'', h:0, m:0,
      billable: !PHASE_NON_BILLABLE.includes(k),
      rate: settings.stundenansatz
    })),
    deko:[],
    neben: NEBEN_KEYS.reduce((o,k)=>(o[k]=0,o),{}),
    verpackung: PACK_KEYS.reduce((o,k)=>(o[k]=0,o),{}),
    travel:{ km:0, kmPreis: settings.kmPreis, minuten:0 },
    /* Einfache Erfassung ist der Normalfall: zwei Zahlen statt zwei Listen */
    simple:{ on:true, material:0, stunden:0 },
    betriebProzent: settings.betriebProzent,
    rundung: settings.rundung,
    design: null            // Entwurf aus dem Design-Konfigurator
  };
}
function blankIngredient(){ return {name:'',menge:'',einheit:'g',pack:'',packEinheit:'g',preis:''}; }
function blankDeco(){
  return {cat:'fondant', desc:'', mode:'stueck', material:'', anzahl:1, minuten:0,
          use:'', pack:'', einsaetze:20, rate:settings.stundenansatz};
}

/* ==========================================================================
 * 5. HILFSFUNKTIONEN
 * ========================================================================== */
const $  = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));

/** Übersetzung holen; unterstützt Punktpfade wie 'phases.backen'. */
function t(key){
  const parts = key.split('.');
  let v = translations[lang];
  for(const p of parts){ if(v==null) break; v = v[p]; }
  if(v==null){
    let f = translations.de;
    for(const p of parts){ if(f==null) break; f = f[p]; }
    v = f;
  }
  return v==null ? key : v;
}
/** Platzhalter {x} ersetzen. */
function tf(key, vars){
  let s = String(t(key));
  for(const k in vars) s = s.replace(new RegExp('\\{'+k+'\\}','g'), vars[k]);
  return s;
}

/** Sichere Zahl: leer/NaN → 0, negative Werte → 0 (Plausibilitätsprüfung). */
function num(v, allowNegative=false){
  const n = parseFloat(String(v).replace(',','.'));
  if(!isFinite(n)) return 0;
  return (!allowNegative && n < 0) ? 0 : n;
}
/** Division ohne Division-durch-0. */
function div(a,b){ return (b && isFinite(b) && b!==0) ? a/b : 0; }

/** Währungsformat, immer zwei Dezimalstellen: «CHF 245.00» */
function fmt(n){
  const v = isFinite(n) ? n : 0;
  return settings.waehrung + ' ' + v.toLocaleString('de-CH',{minimumFractionDigits:2, maximumFractionDigits:2});
}
/** Stundenformat: «11.00 h» */
function fmtH(n){ return (isFinite(n)?n:0).toFixed(2) + ' h'; }

/** Rundung gemäss gewählter Regel.
 *  Es wird bewusst auf die nächste Stufe AUFgerundet (292.37 → CHF 295),
 *  damit der Verkaufspreis nie unter den kalkulierten Wert fällt. */
function roundPrice(v, rule){
  if(!isFinite(v) || v<=0) return 0;
  const step = {1:1, 2:5, 3:10}[Number(rule)];
  if(!step) return Math.round(v*100)/100;          // exakt
  return Math.ceil(Math.round(v*100)/100/step)*step;
}

function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/** Richtwert Portionen anhand Form, Grösse, Höhe und Etagen. */
function estimatePortions(cake){
  const base = cake.groesse === 'custom' ? num(cake.groesseCustom) : num(cake.groesse);
  if(base <= 0) return 0;
  const hoehe  = num(cake.hoehe) || 10;
  const etagen = Math.min(num(cake.etagen)+1, 5);
  const shape  = num(cake.form);
  let total = 0;
  for(let i=0;i<etagen;i++){
    const d = Math.max(base - i*4, 8);          // jede höhere Etage 4 cm kleiner
    let area;
    switch(shape){
      case 1:  area = d*d;               break;  // quadratisch
      case 2:  area = d*(d*0.75);        break;  // rechteckig
      case 3:  area = Math.PI*(d/2)**2*0.86; break; // Herz
      default: area = Math.PI*(d/2)**2;         // rund / Sonderform
    }
    total += area/16;                            // Portionsfläche ≈ 4 × 4 cm
  }
  return Math.max(1, Math.round(total * (hoehe/10)));
}

/* ==========================================================================
 * 6. RECHENKERN
 * --------------------------------------------------------------------------
 * Reine Funktion: nimmt den Zustand, gibt alle Kennzahlen zurück.
 * Kein DOM-Zugriff → einzeln testbar.
 * ========================================================================== */
function calculate(s){
  const warn = [];

  const einfach = !s.simple || s.simple.on !== false;

  /* --- 6.1 Materialkosten (Zutaten) ------------------------------------ */
  let material = 0;
  const zutatenCosts = s.zutaten.map(z=>{
    const uQ = UNIT_INFO[z.einheit]  || UNIT_INFO.g;
    const uP = UNIT_INFO[z.packEinheit] || UNIT_INFO.g;
    if(uQ.cat !== uP.cat) return {cost:0, error:true};        // Einheiten unvereinbar
    const menge = num(z.menge) * uQ.f;
    const pack  = num(z.pack)  * uP.f;
    const cost  = div(menge, pack) * num(z.preis);            // Division durch 0 abgesichert
    material += cost;
    return {cost, error:false};
  });
  if(einfach) material = num(s.simple && s.simple.material);
  if(material === 0) warn.push('warnNoMaterial');

  /* --- 6.2 Arbeitszeit -------------------------------------------------- */
  let hoursActual = 0, hoursBillable = 0, billableCostRaw = 0;
  const arbeitCosts = s.arbeit.map(a=>{
    const h = num(a.h) + div(num(a.m),60);
    hoursActual += h;
    if(a.billable){
      hoursBillable  += h;
      billableCostRaw += h * num(a.rate);
    }
    return h * num(a.rate);
  });
  // Durchschnittlicher Stundenansatz der verrechenbaren Tätigkeiten
  let avgRate = hoursBillable > 0 ? div(billableCostRaw, hoursBillable) : num(settings.stundenansatz);

  /* Einfache Erfassung: eine Stundenzahl zum Standardansatz */
  if(einfach){
    hoursBillable = num(s.simple && s.simple.stunden);
    hoursActual   = hoursBillable;
    avgRate       = num(settings.stundenansatz);
  }

  /* --- 6.3 Arbeitskosten ------------------------------------------------
     Bewertet werden die aktiven Stunden. Backen und Abkühlen zählen nicht,
     weil Lena in dieser Zeit nicht an der Torte steht. */
  const labour = hoursBillable * avgRate;

  /* --- 6.4 Dekoration --------------------------------------------------- */
  let decoMat = 0, decoTime = 0, decoHours = 0;
  const dekoCosts = s.deko.map(d=>{
    const mat = num(d.material), anz = Math.max(num(d.anzahl),0), min = num(d.minuten);
    let m = 0, z = 0;
    switch(d.mode){
      /* Anteil einer Packung: verbrauchte Menge ÷ Packungsgrösse × Preis.
         So werden Ganache, Velours-Spray oder Fondant korrekt umgelegt. */
      case 'anteil':
        m = div(num(d.use), num(d.pack)) * mat;
        break;
      /* Werkzeug wie Zuckerstempel oder Silikonform: der Anschaffungspreis
         verteilt sich auf die Zahl der Einsätze, nicht auf eine Torte. */
      case 'werkzeug':
        m = div(mat, num(d.einsaetze));
        break;
      case 'stueck':
        m = mat * anz;
        break;
      case 'zeit':
        z = div(min,60) * num(d.rate);
        break;
      case 'kombi':
        m = mat * (anz || 1);
        z = div(min,60) * num(d.rate);
        break;
      default:                                   // 'material' = Pauschalbetrag
        m = mat;
    }
    /* Zeit zählt bei jeder Rechenart, wenn Minuten erfasst sind */
    if(d.mode !== 'zeit' && d.mode !== 'kombi' && min > 0){
      z = div(min,60) * num(d.rate);
    }
    if(z > 0) decoHours += div(min,60);
    decoMat += m; decoTime += z;
    return m + z;
  });
  const deco = decoMat + decoTime;

  /* --- 6.5 Verpackung und Lieferung -------------------------------------
     Beides sind eigene Preisbestandteile: Sie kosten Lenas Geld und werden
     der Kundschaft eins zu eins weiterverrechnet. */
  let verpack = 0;
  PACK_KEYS.forEach(k=> verpack += num(s.verpackung[k]));

  const travelKm   = num(s.travel.km) * num(s.travel.kmPreis);
  const travelMin  = num(s.travel.minuten);
  const travelTime = div(travelMin,60) * num(settings.stundenansatz);
  const travel     = travelKm + travelTime;

  /* --- 6.6 Übrige Kosten ------------------------------------------------ */
  let nebenDirect = 0;
  NEBEN_KEYS.forEach(k=> nebenDirect += num(s.neben[k]));

  /* Betriebskosten-Zuschlag auf alle direkten Kosten */
  const betriebPct  = Math.min(num(s.betriebProzent), 100);
  const betriebBase = material + labour + deco + verpack + travelKm + nebenDirect;
  const betrieb     = betriebBase * betriebPct/100;
  const neben       = nebenDirect + betrieb + verpack + travelKm;

  /* --- 6.6 Selbstkosten -------------------------------------------------- */
  const selbst = material + labour + travelTime + deco + neben;

  /* Sachkosten = alles ausser der eigenen Arbeitszeit
     (Basis für Mindestpreis und effektiven Stundenlohn) */
  const sachBase   = material + decoMat + verpack + travelKm + nebenDirect;
  const sachBetr   = sachBase * betriebPct/100;
  const sachkosten = sachBase + sachBetr;

  /* --- 6.7 Preis nach Kilogramm ------------------------------------------
     Olenas Marktpreis: die Tortenbasis kostet je Kilogramm, Dekoration und
     Lieferung kommen separat dazu. Das Gewicht ergibt sich aus den Portionen,
     sofern es nicht von Hand gesetzt wurde. */
  const portionen   = Math.max(num(s.cake.portionen), 0);
  const grammProP   = num(settings.grammProPerson) || 200;
  const gewicht     = num(s.cake.gewicht) > 0 ? num(s.cake.gewicht) : portionen*grammProP/1000;
  const kiloPreis   = num(settings.kiloPreis) || 0;
  const kiloBasis   = gewicht * kiloPreis;
  const kiloRaw     = kiloBasis + deco + verpack + travel;

  /* --- 6.8 Verkaufspreis ------------------------------------------------
     Der Preis ist die Summe aus Tortenbasis, Dekoration und Lieferung.
     Was davon nach Abzug aller Kosten bleibt, ist der Gewinn. */
  const price       = roundPrice(kiloRaw, s.rundung);
  const kiloTotal   = price;
  const profitFinal = price - selbst;
  const margeFinal  = price > 0 ? profitFinal/price*100 : 0;

  const perPortion  = div(price, portionen);
  const costPortion = div(selbst, portionen);

  /* Effektiver Stundenlohn: was nach allen Sachkosten für die eigene Arbeit bleibt */
  const totalWorkHours = hoursActual + decoHours + div(travelMin,60);
  const wage = div(price - sachkosten, totalWorkHours);

  /* --- 6.9 Kundenpreis-Vergleich ---------------------------------------- */
  const kundenpreis = num(s.meta.kundenpreis);
  const diff        = kundenpreis > 0 ? kundenpreis - price : 0;
  const wageCustomer = kundenpreis > 0 ? div(kundenpreis - sachkosten, totalWorkHours) : wage;

  /* --- 6.10 Plausibilität ----------------------------------------------- */
  if(totalWorkHours === 0) warn.push('warnNoHours');
  if(portionen === 0)      warn.push('warnNoPortions');

  return {
    material, labour, deco, decoMat, decoTime, neben, nebenDirect, betrieb, betriebPct,
    selbst, sachkosten, profit:profitFinal, price, kiloRaw,
    verpack, travelKm, travelTime,
    gewicht, grammProP, kiloPreis, kiloBasis, kiloTotal,
    perPortion, costPortion,
    hoursActual, hoursBillable, decoHours, totalWorkHours,
    avgRate, wage, margeFinal,
    kundenpreis, diff, wageCustomer, travel,
    zutatenCosts, arbeitCosts, dekoCosts, warn
  };
}

/* ==========================================================================
 * 7. RENDERING – dynamische Zeilen
 * ========================================================================== */

/** Baut <option>-Liste. */
function opts(list, selected, valuesAreKeys){
  return list.map((item,i)=>{
    const value = valuesAreKeys ? item.key : (item.value !== undefined ? item.value : i);
    const label = valuesAreKeys ? item.label : (item.label !== undefined ? item.label : item);
    return `<option value="${escapeHtml(value)}"${String(value)===String(selected)?' selected':''}>${escapeHtml(label)}</option>`;
  }).join('');
}
function unitOpts(sel){
  return UNIT_KEYS.map(k=>`<option value="${k}"${k===sel?' selected':''}>${escapeHtml(t('units.'+k))}</option>`).join('');
}

/* ---- 7.1 Zutaten ---- */
function renderIngredients(){
  const box = $('#zutatenListe');
  box.innerHTML = state.zutaten.map((z,i)=>`
    <div class="row" data-list="zutaten" data-i="${i}">
      <button class="row-del" type="button" data-del aria-label="X">×</button>
      <div class="row-grid">
        <label class="field col-2 col-full"><span>${t('rName')}</span>
          <input type="text" data-k="name" value="${escapeHtml(z.name)}" placeholder="${escapeHtml(t('rName'))}"></label>
        <label class="field"><span>${t('rQty')}</span>
          <input type="number" inputmode="decimal" data-k="menge" min="0" step="any" value="${escapeHtml(z.menge)}"></label>
        <label class="field"><span>${t('rUnit')}</span>
          <select data-k="einheit">${unitOpts(z.einheit)}</select></label>
        <label class="field"><span>${t('rPack')}</span>
          <input type="number" inputmode="decimal" data-k="pack" min="0" step="any" value="${escapeHtml(z.pack)}"></label>
        <label class="field"><span>${t('rPackUnit')}</span>
          <select data-k="packEinheit">${unitOpts(z.packEinheit)}</select></label>
        <label class="field col-2"><span>${t('rPackPrice')}</span>
          <span class="input-chf"><em>${settings.waehrung}</em>
            <input type="number" inputmode="decimal" data-k="preis" min="0" step="0.05" value="${escapeHtml(z.preis)}"></span></label>
        <div class="row-out"><span>${t('rCost')}</span><b data-out="zutat-${i}">${fmt(0)}</b></div>
      </div>
    </div>`).join('');
}

/* ---- 7.2 Arbeitszeit ---- */
function renderWork(){
  const box = $('#arbeitListe');
  box.innerHTML = state.arbeit.map((a,i)=>{
    const label = a.key ? t('phases.'+a.key) : (a.name || t('newRow'));
    return `
    <div class="row${a.billable?'':' is-passive'}" data-list="arbeit" data-i="${i}">
      <button class="row-del" type="button" data-del aria-label="X">×</button>
      <div class="row-grid">
        <label class="field col-2 col-full"><span>${t('rActivity')}</span>
          ${a.key
            ? `<input type="text" value="${escapeHtml(label)}" readonly>`
            : `<input type="text" data-k="name" value="${escapeHtml(a.name)}" placeholder="${escapeHtml(t('rActivity'))}">`}
        </label>
        <label class="field"><span>${t('rHours')}</span>
          <input type="number" inputmode="decimal" data-k="h" min="0" step="1" value="${escapeHtml(a.h)}"></label>
        <label class="field"><span>${t('rMinutes')}</span>
          <input type="number" inputmode="decimal" data-k="m" min="0" max="59" step="5" value="${escapeHtml(a.m)}"></label>
        <label class="field"><span>${t('rRate')}</span>
          <span class="input-chf"><em>${settings.waehrung}</em>
            <input type="number" inputmode="decimal" data-k="rate" min="0" step="1" value="${escapeHtml(a.rate)}"></span></label>
        <label class="check" style="align-self:end">
          <input type="checkbox" data-k="billable"${a.billable?' checked':''}><span>${t('rBillable')}</span></label>
        <div class="row-out"><span>${t('rWorkCost')}</span><b data-out="arbeit-${i}">${fmt(0)}</b></div>
      </div>
    </div>`;
  }).join('');
}

/* ---- 7.3 Dekoration ---- */
function renderDeco(){
  const box = $('#dekoListe');
  const catList  = DECO_KEYS.map(k=>({key:k, label:t('decoCats.'+k)}));
  const modeList = ['anteil','stueck','material','werkzeug','zeit','kombi']
    .map(k=>({key:k, label:t('decoModes.'+k)}));
  box.innerHTML = state.deko.map((d,i)=>{
    const isAnteil = d.mode==='anteil', isWerk = d.mode==='werkzeug';
    const showMat = d.mode!=='zeit';
    const showQty = d.mode==='stueck' || d.mode==='kombi';
    const showMin = true;                        // Zeit ist bei jeder Art erfassbar
    /* Beschriftung des Betragsfeldes je nach Rechenart */
    const matLabel = isAnteil ? t('rDecoPackPrice')
                   : isWerk   ? t('rDecoTool')
                   : d.mode==='material' ? t('rDecoFlat') : t('rMaterial');
    return `
    <div class="row" data-list="deko" data-i="${i}">
      <button class="row-del" type="button" data-del aria-label="X">×</button>
      <div class="row-grid">
        <label class="field col-2"><span>${t('rDecoCat')}</span>
          <select data-k="cat">${opts(catList, d.cat, true)}</select></label>
        <label class="field col-2"><span>${t('rDecoDesc')}</span>
          <input type="text" data-k="desc" value="${escapeHtml(d.desc)}" placeholder="${escapeHtml(t('rDecoDesc'))}"></label>
        <label class="field col-2"><span>${t('rMode')}</span>
          <select data-k="mode">${opts(modeList, d.mode, true)}</select></label>
        <label class="field"${isAnteil?'':' hidden'}><span>${t('rDecoUse')}</span>
          <input type="number" inputmode="decimal" data-k="use" min="0" step="any" value="${escapeHtml(d.use)}"></label>
        <label class="field"${isAnteil?'':' hidden'}><span>${t('rDecoPack')}</span>
          <input type="number" inputmode="decimal" data-k="pack" min="0" step="any" value="${escapeHtml(d.pack)}"></label>
        <label class="field"${showMat?'':' hidden'}><span>${escapeHtml(matLabel)}</span>
          <span class="input-chf"><em>${settings.waehrung}</em>
            <input type="number" inputmode="decimal" data-k="material" min="0" step="0.05" value="${escapeHtml(d.material)}"></span></label>
        <label class="field"${isWerk?'':' hidden'}><span>${t('rDecoUses')}</span>
          <input type="number" inputmode="decimal" data-k="einsaetze" min="1" step="1" value="${escapeHtml(d.einsaetze)}"></label>
        <label class="field"${showQty?'':' hidden'}><span>${t('rPieces')}</span>
          <input type="number" inputmode="decimal" data-k="anzahl" min="0" step="1" value="${escapeHtml(d.anzahl)}"></label>
        <label class="field"><span>${t('rMinutes')}</span>
          <input type="number" inputmode="decimal" data-k="minuten" min="0" step="5" value="${escapeHtml(d.minuten)}"></label>
        <label class="field"${showMin?'':' hidden'}><span>${t('rRate')}</span>
          <span class="input-chf"><em>${settings.waehrung}</em>
            <input type="number" inputmode="decimal" data-k="rate" min="0" step="1" value="${escapeHtml(d.rate)}"></span></label>
        <div class="row-out"><span>${t('rCost')}</span><b data-out="deko-${i}">${fmt(0)}</b></div>
      </div>
    </div>`;
  }).join('');
}

/* ---- 7.4 Nebenkosten ---- */
function renderOverhead(){
  const box = $('#nebenListe');
  box.innerHTML = NEBEN_KEYS.map(k=>`
    <label class="field"><span>${t('neben.'+k)}</span>
      <span class="input-chf"><em>${settings.waehrung}</em>
        <input type="number" inputmode="decimal" data-neben="${k}" min="0" step="0.05" value="${escapeHtml(state.neben[k])}"></span></label>
  `).join('');
}

/* ---- 7.4b Verpackung ---- */
function renderPack(){
  const box = $('#packListe');
  if(!box) return;
  box.innerHTML = PACK_KEYS.map(k=>`
    <label class="field"><span>${t('pack.'+k)}</span>
      <span class="input-chf"><em>${settings.waehrung}</em>
        <input type="number" inputmode="decimal" data-pack="${k}" min="0" step="0.05" value="${escapeHtml(state.verpackung[k])}"></span></label>
  `).join('');
}

/* ---- 7.5 Auswahllisten ---- */
function renderSelects(){
  // Grösse
  const g = $('#groesse');
  g.innerHTML = SIZES.map(s=>`<option value="${s}">${s} cm</option>`).join('')
              + `<option value="custom">${escapeHtml(t('sizeCustom'))}</option>`;
  g.value = state.cake.groesse;

  // Zutaten-Vorlagen
  const v = $('#zutatVorlage');
  v.innerHTML = `<option value="">${escapeHtml(t('tplChoose'))}</option>`
              + INGREDIENT_TEMPLATES.map((x,i)=>`<option value="${i}">${escapeHtml(x.name)}</option>`).join('');

  // Dekorations-Vorlagen
  const dv = $('#dekoVorlage');
  if(dv){
    dv.innerHTML = `<option value="">${escapeHtml(t('decoTplChoose'))}</option>`
      + DECO_TEMPLATES.map((x,i)=>
          `<option value="${i}">${escapeHtml(t('decoTpl.'+x.key) || x.key)}</option>`).join('');
  }
}

/** Alle Formularfelder aus dem Zustand füllen. */
function renderForm(){
  const m = state.meta, c = state.cake;
  $('#kundenname').value    = m.kundenname;
  $('#auftragsnummer').value= m.auftragsnummer;
  $('#bestelldatum').value  = m.bestelldatum;
  $('#lieferdatum').value   = m.lieferdatum;
  $('#anlass').value        = m.anlass;
  $('#bemerkungen').value   = m.bemerkungen;
  $('#kundenpreis').value   = m.kundenpreis;
  $('#kundenpreis2').value  = m.kundenpreis;

  $('#form').value          = c.form;
  $('#groesse').value       = c.groesse;
  $('#groesseCustom').value = c.groesseCustom;
  $('#wrapGroesseCustom').hidden = c.groesse !== 'custom';
  $('#hoehe').value         = c.hoehe;
  $('#etagen').value        = c.etagen;
  $('#portionen').value     = c.portionen;

  $('#km').value            = state.travel.km;
  $('#kmPreis').value       = state.travel.kmPreis;
  const _fz=$('#fahrzeit'); if(_fz) _fz.value = state.travel.minuten;
  $('#betriebProzent').value= state.betriebProzent;
  const sm = $('#simpleMat'), sh = $('#simpleHours');
  if(sm) sm.value = state.simple.material || '';
  if(sh) sh.value = state.simple.stunden || '';
  toggleDetail(!state.simple.on, true);

}

/** Zwischen der einfachen und der genauen Erfassung wechseln. */
function toggleDetail(detail, nurAnzeige){
  const box = $('#detailBox'), simple = $('#simpleBox'), btn = $('#btnToggleDetail');
  if(!box) return;
  box.hidden = !detail;
  if(simple) simple.hidden = detail;
  if(btn) btn.textContent = detail ? t('toSimple') : t('toDetail');
  if(!nurAnzeige){
    state.simple.on = !detail;
    update();
  }
}

function renderAll(){
  renderSelects();
  renderIngredients();
  renderWork();
  renderDeco();
  renderOverhead();
  renderPack();
  renderForm();
  update();
}

/* ==========================================================================
 * 8. AUSGABE
 * ========================================================================== */
function update(){
  calc = calculate(state);
  const c = calc;

  /* Zeilenwerte */
  c.zutatenCosts.forEach((z,i)=>{
    const el = $(`[data-out="zutat-${i}"]`);
    if(el){ el.textContent = z.error ? t('errUnit') : fmt(z.cost); el.style.color = z.error ? 'var(--bad)' : ''; }
  });
  c.arbeitCosts.forEach((v,i)=>{ const el=$(`[data-out="arbeit-${i}"]`); if(el) el.textContent = fmt(v); });
  c.dekoCosts.forEach((v,i)=>{ const el=$(`[data-out="deko-${i}"]`); if(el) el.textContent = fmt(v); });

  /* Bereichs-Summen */
  $('#sumZutaten').textContent  = fmt(c.material);
  const _sai=$('#sumArbeitIst'); if(_sai) _sai.textContent = fmtH(c.hoursActual);
  const _sav=$('#sumArbeitVerr'); if(_sav) _sav.textContent = fmtH(c.hoursBillable);
  $('#sumDeko').textContent     = fmt(c.deco);

  const _fk=$('#fahrtkosten'); if(_fk) _fk.value = fmt(c.travel);
  const _sp=$('#sumPack');     if(_sp) _sp.textContent = fmt(c.verpack);
  const _sd=$('#sumDelivery'); if(_sd) _sd.textContent = fmt(c.travel);
  const _bb=$('#betriebBetrag'); if(_bb) _bb.value = fmt(c.betrieb);
  $('#sumNeben').textContent = fmt(c.neben);

  /* Kennzahlen */
  $('#kSelbst').textContent   = fmt(c.selbst);
  $('#kGewinn').textContent   = fmt(c.profit);
  $('#kPreis').textContent    = fmt(c.price);
  $('#kProPortion').textContent = fmt(c.perPortion);
  $('#kStundenlohn').textContent = fmt(c.wage);
  $('#kStundenlohnSub').textContent = c.totalWorkHours > 0
    ? tf('wageSub',{h:c.totalWorkHours.toFixed(2), z:fmt(settings.stundenansatz)+'/h'})
    : t('hintNoCosts');

  /* Sticky-Zusammenfassung und Bottom-Bar – dieselbe Gliederung wie das Ergebnis */
  const setTxt = (id, v)=>{ const el = $(id); if(el) el.textContent = v; };
  [['#sBasis',  fmt(c.kiloBasis)], ['#sDeko',  fmt(c.deco)],
   ['#sPack',   fmt(c.verpack)],   ['#sTravel',fmt(c.travel)],
   ['#sPreis',  fmt(c.price)],     ['#sSelbst',fmt(c.selbst)],
   ['#sGewinn', fmt(c.profit)],    ['#sLohn',  fmt(c.wage)],
   ['#sPortion',fmt(c.perPortion)],['#sStunden',fmtH(c.totalWorkHours)],
   ['#bPreis',  fmt(c.price)],     ['#bGewinn',fmt(c.profit)],
   ['#bBasis',  fmt(c.kiloBasis)], ['#bDeko',  fmt(c.deco)],
   ['#bPack',   fmt(c.verpack)],   ['#bTravel',fmt(c.travel)],
   ['#bSelbst', fmt(c.selbst)],    ['#bLohn',  fmt(c.wage)]
  ].forEach(([id,v])=>setTxt(id,v));

  /* Kopfzeilen-Badges */
  /* Kurzinfo in den Bereichsköpfen – nur setzen, was es auch gibt */
  const badge = (id, text)=>{ const el = $(id); if(el) el.textContent = text; };
  badge('#badgeAuftrag', state.meta.kundenname || '');
  badge('#badgeTorte',   c.gewicht.toFixed(2) + ' kg');
  badge('#badgeDeko',    fmt(c.deco));
  badge('#badgeKosten',  fmt(c.selbst));
  badge('#badgePack',    fmt(c.verpack));
  badge('#badgeDelivery',fmt(c.travel));
  const bd = $('#badgeDesign');
  if(bd){
    const d = state.design;
    const n = d ? (d.elements||[]).length + (d.texts||[]).length + (d.photos||[]).length : 0;
    bd.textContent = n ? n + ' ×' : '';
  }

  /* Aufschlüsselung des Verkaufspreises */
  const basis = tf('kKiloBase',{kg:c.gewicht.toFixed(2), p:fmt(c.kiloPreis)+'/kg'});
  const zeilen = [[basis, fmt(c.kiloBasis)]];
  if(c.deco > 0)    zeilen.push([t('kKiloDeco'),   fmt(c.deco)]);
  if(c.verpack > 0) zeilen.push([t('kKiloPack'),   fmt(c.verpack)]);
  if(c.travel > 0)  zeilen.push([t('kKiloTravel'), fmt(c.travel)]);
  $('#kiloTable').innerHTML =
    zeilen.map(r=>`<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td></tr>`).join('') +
    `<tr class="is-total"><td>${escapeHtml(t('kKiloTotal'))}</td><td>${escapeHtml(fmt(c.price))}</td></tr>`;

  /* Basispreis schon im Bereich Torte sichtbar */
  $('#basisLabel').textContent = basis;
  $('#sumBasis').textContent   = fmt(c.kiloBasis);

  /* Gewicht und Portionen im Einklang halten */
  const wIn = $('#gewicht');
  if(wIn && document.activeElement !== wIn) wIn.value = c.gewicht.toFixed(2);
  $('#weightHint').textContent = tf('hintWeight',{g:c.grammProP});

  /* Plausibilitätskontrolle: passt die eingetragene Grösse zu den Portionen?
     Der Preis hängt nicht daran – die Zeile weist nur auf Widersprüche hin. */
  const est = estimatePortions(state.cake);
  const p   = num(state.cake.portionen);
  const ph  = $('#portionsHint');
  if(est > 0 && p > 0){
    const abweichung = Math.abs(est - p) / Math.max(est, p);
    ph.textContent = abweichung > 0.35 ? tf('portionsCheckOff',{n:est, p}) : tf('portionsCheck',{n:est});
    ph.style.color = abweichung > 0.35 ? 'var(--warn)' : '';
  }else{
    ph.textContent = ''; ph.style.color = '';
  }

  renderWarnings(c);
  renderCompare(c);
  renderInternal(c);
  persist();
}

/* ==========================================================================
 * 9. WARNSYSTEM
 * ========================================================================== */
function renderWarnings(c){
  const box  = $('#alertBox');
  const flag = $('#sFlag');
  const bflag= $('#bFlag');

  const zielLohn = num(settings.stundenansatz) || 40;
  const hatKosten = c.selbst > 0;
  const stunden   = c.totalWorkHours;

  let level = 'ok', text = '';

  if(!hatKosten){
    /* Ohne erfasste Kosten lässt sich nichts beurteilen */
    level = 'warn';
    text = t('hintNoCosts');
  }else if(c.profit < 0){
    level = 'bad';
    text = tf('badLoss',{g:fmt(Math.abs(c.profit))});
  }else if(stunden > 0 && c.wage < zielLohn*0.5){
    level = 'bad';
    text = tf('badWage',{l:fmt(c.wage)});
  }else if(stunden > 0 && c.wage < zielLohn*0.85){
    level = 'warn';
    text = tf('warnThin',{g:fmt(c.profit), l:fmt(c.wage)});
  }else{
    level = 'ok';
    text = tf('okAll',{g:fmt(c.profit), l:fmt(c.wage)});
  }

  box.className = 'alert show ' + level;
  box.innerHTML = `<strong>${escapeHtml(
      level==='ok' ? t('flagOk') : level==='warn' ? t('flagWarn') : t('flagBad'))}</strong>
    <p style="margin:0">${escapeHtml(text)}</p>`;

  if(flag){ flag.className = 'summary-flag show ' + level; flag.textContent = text; }
  if(bflag) bflag.className = 'bb-flag ' + level;
}

/* ---- Kundenpreis-Vergleich ---- */
function renderCompare(c){
  const out = $('#differenz'), hint = $('#compareHint');
  if(!(c.kundenpreis > 0)){
    out.value = '–'; hint.textContent = t('cmpNone'); return;
  }
  const d = c.diff;
  out.value = (d>0?'+ ':d<0?'− ':'') + fmt(Math.abs(d));
  let txt;
  if(Math.abs(d) < 0.005)      txt = t('cmpEqual');
  else if(d < 0)               txt = tf('cmpBelow',{d:fmt(Math.abs(d)), l:fmt(c.wageCustomer)+'/h'});
  else                         txt = tf('cmpAbove',{d:fmt(d),           l:fmt(c.wageCustomer)+'/h'});
  if(c.kundenpreis < c.selbst) txt += ' ' + tf('cmpUnderCost',{s:fmt(c.selbst)});
  hint.textContent = txt;
}

/* ---- Interne Ansicht ---- */
function renderInternal(c){
  const row  = (l,v)=>`<tr><td>${escapeHtml(l)}</td><td>${escapeHtml(v)}</td></tr>`;
  const head = l=>`<tr class="is-head"><td colspan="2">${escapeHtml(l)}</td></tr>`;
  const tot  = (l,v)=>`<tr class="is-total"><td>${escapeHtml(l)}</td><td>${escapeHtml(v)}</td></tr>`;

  $('#internTable').innerHTML =
    head(t('kPrice')) +
    row(t('kWeight'), c.gewicht.toFixed(2) + ' kg') +
    row(t('kKiloBase').replace('{kg}', c.gewicht.toFixed(2)).replace('{p}', fmt(c.kiloPreis)+'/kg'), fmt(c.kiloBasis)) +
    row(t('kKiloDeco'), fmt(c.deco)) +
    row(t('kKiloTravel'), fmt(c.travel)) +
    tot(t('kKiloTotal'), fmt(c.price)) +

    head(t('secCosts')) +
    row(t('kMaterial'), fmt(c.material)) +
    row(t('sumDecoMat'), fmt(c.decoMat)) +
    row(t('kLabour'), fmt(c.labour)) +
    row(t('sumOverhead'), fmt(c.nebenDirect)) +
    row(t('iOverheadPct') + ' (' + c.betriebPct + ' %)', fmt(c.betrieb)) +
    tot(t('kCost'), fmt(c.selbst)) +

    head(t('iTime')) +
    row(t('sumWorkActual'), fmtH(c.totalWorkHours)) +
    row(t('sumWorkBillable'), fmtH(c.hoursBillable)) +
    row(t('iRate'), fmt(c.avgRate) + ' / h') +

    head(t('kProfit')) +
    row(t('kProfit'), fmt(c.profit)) +
    row(t('iMargin'), c.margeFinal.toFixed(1) + ' %') +
    row(t('iCostPerPortion'), fmt(c.costPortion)) +
    row(t('iPerPortion'), fmt(c.perPortion)) +
    tot(t('iWage'), fmt(c.wage) + ' / h');
}

/* ==========================================================================
 * 10. ÜBERSETZUNGS-ENGINE
 * ========================================================================== */
function applyI18n(){
  document.documentElement.lang = lang==='ua' ? 'uk' : 'de';

  $$('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el=>{ el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-title]').forEach(el=>{ el.title = t(el.dataset.i18nTitle); });
  $$('[data-tip]').forEach(el=>{ el.dataset.text = t(el.dataset.tip); });

  // Auswahllisten mit festen Optionslisten
  $$('[data-i18n-options]').forEach(sel=>{
    const list = t(sel.dataset.i18nOptions);
    if(!Array.isArray(list)) return;
    const keep = sel.value;
    sel.innerHTML = list.map((l,i)=>`<option value="${i}">${escapeHtml(l)}</option>`).join('');
    sel.value = keep || 0;
  });

  $$('.lang-btn').forEach(b=>b.classList.toggle('is-active', b.dataset.lang===lang));
  $('#setSprache').value = lang;
}

async function setLang(l){
  if(!translations[l]) return;
  lang = l;
  settings.sprache = l;
  await Store.set('lang', l);
  await Store.set('settings', settings);
  applyI18n();
  renderAll();
}

/* ==========================================================================
 * 11. PROJEKTE
 * ========================================================================== */
async function persist(){ await Store.set('current', {state, id:currentProjectId}); }

async function loadProjects(){ projects = (await Store.get('projects')) || []; }

async function saveProject(){
  const c = calculate(state);
  const name = state.meta.kundenname || t('projUnnamed');
  const entry = {
    id: currentProjectId || ('p'+Date.now()),
    name,
    datum: state.meta.lieferdatum || state.meta.bestelldatum || new Date().toISOString().slice(0,10),
    tortentyp: t('shapes')[num(state.cake.form)] + ' · ' +
               (state.cake.groesse==='custom' ? state.cake.groesseCustom : state.cake.groesse) + ' cm',
    portionen: num(state.cake.portionen),
    preis: c.price, kosten: c.selbst, gewinn: c.profit, stunden: c.totalWorkHours,
    saved: new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state))
  };
  const i = projects.findIndex(p=>p.id===entry.id);
  if(i>=0) projects[i] = entry; else projects.unshift(entry);
  currentProjectId = entry.id;
  await Store.set('projects', projects);
  /* Nummernkreis weiterzählen, damit die nächste Kalkulation eine eigene bekommt */
  const m = String(state.meta.auftragsnummer||'').match(/(\d+)\s*$/);
  if(m && num(m[1]) >= num(settings.nextAuftrag)){
    settings.nextAuftrag = num(m[1]) + 1;
    await Store.set('settings', settings);
  }
  toast(t('msgSaved'));
}

/** Legt die laufende Kalkulation als eigenes Projekt ab, bevor sie
 *  überschrieben wird. So bleibt sie über «Meine Kalkulationen» erreichbar. */
async function autoBackup(){
  const c = calculate(state);
  const leer = !state.meta.kundenname && !state.zutaten.length && !state.deko.length
               && c.totalWorkHours === 0;
  if(leer) return;
  const entry = {
    id: 'auto'+Date.now(),
    name: (state.meta.kundenname || t('projUnnamed')) + ' · ' + t('autoBackup'),
    datum: new Date().toISOString().slice(0,10),
    tortentyp: c.gewicht.toFixed(2) + ' kg',
    portionen: num(state.cake.portionen),
    preis: c.price, kosten: c.selbst, gewinn: c.profit, stunden: c.totalWorkHours,
    saved: new Date().toISOString(), auto: true,
    state: JSON.parse(JSON.stringify(state))
  };
  projects.unshift(entry);
  /* höchstens fünf automatische Sicherungen behalten */
  const autos = projects.filter(p=>p.auto);
  if(autos.length > 5){
    const weg = autos.slice(5).map(p=>p.id);
    projects = projects.filter(p=>weg.indexOf(p.id) < 0);
  }
  await Store.set('projects', projects);
  toast(t('msgBackupSaved'));
}

function renderProjects(){
  const box = $('#projectList');
  if(!projects.length){ box.innerHTML = `<p class="empty">${escapeHtml(t('projEmpty'))}</p>`; return; }
  box.innerHTML = projects.map(p=>`
    <div class="project" data-id="${escapeHtml(p.id)}">
      <div class="project-top">
        <div>
          <div class="project-name">${escapeHtml(p.name)}</div>
          <div class="project-meta">${escapeHtml(p.datum)} · ${escapeHtml(p.tortentyp)} ·
            ${escapeHtml(tf('projPortions',{n:p.portionen}))} ·
            ${escapeHtml(tf('projHours',{h:(p.stunden||0).toFixed(1)}))} ·
            ${escapeHtml(tf('projProfit',{p:fmt(p.gewinn)}))}</div>
        </div>
        <div class="project-price">${escapeHtml(fmt(p.preis))}</div>
      </div>
      <div class="project-acts">
        <button type="button" data-act="open">${escapeHtml(t('projOpen'))}</button>
        <button type="button" data-act="copy">${escapeHtml(t('projCopy'))}</button>
        <button type="button" class="del" data-act="del">${escapeHtml(t('projDel'))}</button>
      </div>
    </div>`).join('');
}

/* ==========================================================================
 * 12. KUNDENANGEBOT & DRUCK
 * ========================================================================== */
function buildOffer(){
  const c = calc || calculate(state);
  const m = state.meta, k = state.cake;
  const size = k.groesse==='custom' ? (k.groesseCustom||'–')+' cm' : k.groesse+' cm';
  const shape = t('shapes')[num(k.form)] || '';
  const tiers = t('tiers')[num(k.etagen)] || '1';
  const price = num(m.kundenpreis) > 0 ? num(m.kundenpreis) : c.price;

  // Dekoration: nur Beschreibungen, keine Preise
  const deko = state.deko
    .filter(d=>num(d.material)>0 || num(d.minuten)>0 || d.desc)
    .map(d=> d.desc ? d.desc : t('decoCats.'+d.cat))
    .filter((v,i,a)=>v && a.indexOf(v)===i)
    .join(' · ');

  const logo = '<img class="offer-logo" src="shb-logo.png" alt="Sweet Home Bakery">';
  const row = (l,v)=> v ? `<tr><td>${escapeHtml(l)}</td><td>${escapeHtml(v)}</td></tr>` : '';

  const co = {...DEFAULT_COMPANY, ...(settings.company||{})};
  $('#offerSheet').innerHTML = `
    <div class="offer-head">
      ${logo}
      <div class="offer-brand">${escapeHtml(co.name)}</div>
      <div class="offer-tag">${escapeHtml([co.city, t('pdfTagline')].filter(Boolean).join(' · '))}</div>
    </div>
    <h3>${escapeHtml(t('offerTitle'))}</h3>
    <table class="offer-rows"><tbody>
      ${row(t('offerFor'), m.kundenname)}
      ${row(t('fOrderNo'), m.auftragsnummer)}
      ${row(t('offerOccasion'), t('occasions')[num(m.anlass)])}
      ${row(t('offerShape'), shape)}
      ${row(t('offerSize'), size + ' · ' + num(k.hoehe) + ' cm')}
      ${row(t('offerTiers'), tiers)}
      ${row(t('offerPortions'), String(num(k.portionen)))}
      ${row(t('offerDesc'), m.bemerkungen || t('offerDefaultDesc'))}
      ${row(t('offerDeco'), deko)}
      ${row(t('offerDelivery'), m.lieferdatum)}
    </tbody></table>
    <div class="offer-total">
      <span>${escapeHtml(t('offerTotal'))}</span>
      <b>${escapeHtml(fmt(price))}</b>
    </div>
    <div class="offer-foot">${escapeHtml([
        co.name,
        [co.street, [co.zip, co.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        co.phone, co.mail, co.insta,
        num(co.validity)>0 ? tf('pdfValidity',{d:num(co.validity)}) : ''
      ].filter(Boolean).join(' · '))}</div>`;
}

/* ---- Daten für das Offerten-PDF zusammenstellen ----
 * Bewusst nur kundentaugliche Angaben: keine Stunden, keine Zutatenkosten,
 * keine Marge. Der Preis entspricht dem, was auch im Angebot am Bildschirm steht. */
function offerData(){
  const c = calc || calculate(state);
  const m = state.meta, k = state.cake;
  const co = {...DEFAULT_COMPANY, ...(settings.company||{})};

  const price   = num(m.kundenpreis) > 0 ? num(m.kundenpreis) : c.price;
  const portions= num(k.portionen);
  const occ     = t('occasions')[num(m.anlass)] || '';
  const shape   = t('shapes')[num(k.form)] || '';
  const size    = (k.groesse==='custom' ? (k.groesseCustom||'—') : k.groesse) + ' cm';
  const tiers   = t('tiers')[num(k.etagen)] || '1';

  const deko = state.deko
    .filter(d=>num(d.material)>0 || num(d.minuten)>0 || d.desc)
    .map(d=> d.desc ? d.desc : t('decoCats.'+d.cat))
    .filter((v,i,a)=>v && a.indexOf(v)===i)
    .join(' · ');

  return {
    lang, currency: settings.waehrung, company: co,
    customer: m.kundenname,
    offerNo:  m.auftragsnummer,
    dateOrder: m.bestelldatum,
    dateDelivery: m.lieferdatum,
    title: occ ? tf('pdfTitle',{occ}) : t('pdfTitlePlain'),
    specs: [
      [t('fOccasion'),     occ],
      [t('offerShape'),    shape],
      [t('offerSize'),     size + ' · ' + num(k.hoehe) + ' cm'],
      [t('offerTiers'),    tiers],
      [t('offerPortions'), portions ? String(portions) : ''],
      [t('offerDesc'),     m.bemerkungen || t('offerDefaultDesc')],
      [t('offerDeco'),     deko]
      /* Lieferdatum steht bereits im Kopf der Offerte */
    ],
    positions: [{
      text:   tf('pdfPosText',{n:portions}),
      amount: fmt(price),
      note:   t('pdfPosNote')
    }],
    price: fmt(price),
    pricePerPortion: portions ? tf('pdfPerPortion',{p:fmt(div(price,portions))}) : '',
    conditions: [
      num(co.validity) > 0 ? tf('pdfValidity',{d:num(co.validity)}) : '',
      num(co.deposit)  > 0 ? tf('pdfDeposit',{p:num(co.deposit)})   : '',
      co.allergen || t('pdfAllergen'),
      co.taxNote || ''
    ],
    shareTitle: t('pdfShareTitle'),
    shareText:  tf('pdfShareText',{name:m.kundenname || ''}),
    tx: {
      tagline:      t('pdfTagline'),
      customer:     t('pdfCustomer'),
      offerNo:      t('pdfOfferNo'),
      dateOrder:    t('pdfDateOrder'),
      dateDelivery: t('pdfDateDelivery'),
      offerLabel:   t('pdfOfferLabel'),
      details:      t('pdfDetails'),
      position:     t('pdfPosition'),
      amount:       t('pdfAmount'),
      total:        t('pdfTotal'),
      conditions:   t('pdfConditions'),
      closing:      t('pdfClosing')
    }
  };
}

/** PDF erzeugen und teilen bzw. speichern. */
async function makePdf(mode){
  const btns = [$('#btnPdfShare'), $('#btnPdfSave')];
  btns.forEach(b=>{ if(b) b.disabled = true; });
  toast(t('pdfBusy'));
  try{
    const data = offerData();
    const res  = mode === 'share' ? await SHB_PDF.share(data) : await SHB_PDF.save(data);
    if(res === 'shared')      toast(t('msgPdfShared'));
    else if(res === 'saved')  toast(t('msgPdfSaved'));
  }catch(err){
    console.error('PDF-Fehler:', err);
    toast(t('errPdf'));
  }finally{
    btns.forEach(b=>{ if(b) b.disabled = false; });
  }
}

function printWith(cls){
  document.body.classList.add(cls);
  const done = ()=>{ document.body.classList.remove(cls); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
  setTimeout(done, 1500);   // Rückfallebene für Browser ohne afterprint
}

/* ==========================================================================
 * 13. EREIGNISSE & START
 * ========================================================================== */
let toastTimer;
function toast(msg){
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  requestAnimationFrame(()=>el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.classList.remove('show'); setTimeout(()=>el.hidden=true,220); }, 2400);
}

function openModal(id){ $(id).hidden = false; document.body.style.overflow='hidden'; }
function closeModal(el){ el.hidden = true; document.body.style.overflow=''; }

function bindEvents(){

  /* --- Accordion --- */
  $$('.card-head').forEach(h=>h.addEventListener('click',()=>{
    h.setAttribute('aria-expanded', h.getAttribute('aria-expanded')==='true' ? 'false' : 'true');
  }));

  /* --- Sprache --- */
  $$('.lang-btn').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  $('#setSprache').addEventListener('change', e=>setLang(e.target.value));

  /* --- Tooltips (Touch) --- */
  document.addEventListener('click', e=>{
    const tip = e.target.closest('.tip');
    $$('.tip.is-open').forEach(x=>{ if(x!==tip) x.classList.remove('is-open'); });
    if(tip){ e.preventDefault(); tip.classList.toggle('is-open'); }
  });

  /* --- Einfache Felder --- */
  const bindField = (sel, apply)=>{
    const el = $(sel);
    el.addEventListener('input', ()=>{ apply(el.value, el); update(); });
    el.addEventListener('change',()=>{ apply(el.value, el); update(); });
  };
  bindField('#kundenname',     v=>state.meta.kundenname=v);
  bindField('#auftragsnummer', v=>state.meta.auftragsnummer=v);
  bindField('#bestelldatum',   v=>state.meta.bestelldatum=v);
  bindField('#lieferdatum',    v=>state.meta.lieferdatum=v);
  bindField('#anlass',         v=>state.meta.anlass=v);
  bindField('#bemerkungen',    v=>state.meta.bemerkungen=v);
  bindField('#kundenpreis',    v=>{ state.meta.kundenpreis=v; $('#kundenpreis2').value=v; });
  bindField('#kundenpreis2',   v=>{ state.meta.kundenpreis=v; $('#kundenpreis').value=v; });

  bindField('#form',           v=>state.cake.form=v);
  bindField('#groesse',        v=>{ state.cake.groesse=v; $('#wrapGroesseCustom').hidden = v!=='custom'; });
  bindField('#groesseCustom',  v=>state.cake.groesseCustom=v);
  bindField('#hoehe',          v=>state.cake.hoehe=v);
  bindField('#etagen',         v=>state.cake.etagen=v);
  /* Portionen und Gewicht hängen über die Gramm pro Person zusammen.
     Wer das eine ändert, bekommt das andere nachgeführt. */
  bindField('#portionen', (v,el)=>{
    const n = num(v);
    el.classList.toggle('is-error', n<=0);
    state.cake.portionen = n;
    state.cake.gewicht = n * (num(settings.grammProPerson)||200) / 1000;
  });
  bindField('#gewicht', (v,el)=>{
    const kg = num(v);
    el.classList.toggle('is-error', kg<=0);
    state.cake.gewicht = kg;
    const g = num(settings.grammProPerson)||200;
    const p = Math.round(kg*1000/g);
    if(p > 0){ state.cake.portionen = p; $('#portionen').value = p; }
  });

  bindField('#km',             v=>state.travel.km=num(v));
  bindField('#kmPreis',        v=>state.travel.kmPreis=num(v));
  bindField('#simpleMat',   v=>state.simple.material = num(v));
  bindField('#simpleHours', v=>state.simple.stunden  = num(v));
  const tg = $('#btnToggleDetail');
  if(tg) tg.addEventListener('click', ()=>toggleDetail($('#detailBox').hidden));

  bindField('#betriebProzent', (v,el)=>{ const n=Math.min(num(v),100); el.classList.toggle('is-error', num(v)>100); state.betriebProzent=n; });


  /* Verpackung (delegiert) */
  const packBox = $('#packListe');
  if(packBox) packBox.addEventListener('input', e=>{
    const k = e.target.dataset.pack; if(!k) return;
    state.verpackung[k] = num(e.target.value);
    update();
  });
  bindField('#fahrzeit', v=>state.travel.minuten=num(v));

  /* Nebenkosten (delegiert) */
  $('#nebenListe').addEventListener('input', e=>{
    const k = e.target.dataset.neben; if(!k) return;
    state.neben[k] = num(e.target.value);
    update();
  });

  /* --- Dynamische Zeilen (delegiert) --- */
  document.addEventListener('input', e=>{
    const row = e.target.closest('.row'); if(!row) return;
    const list = row.dataset.list, i = +row.dataset.i, k = e.target.dataset.k;
    if(!list || !k) return;
    const item = state[list][i]; if(!item) return;
    item[k] = e.target.type==='checkbox' ? e.target.checked : e.target.value;
    if(k==='billable') row.classList.toggle('is-passive', !e.target.checked);
    if(k==='mode'){ renderDeco(); }        // Felder je Berechnungsart ein-/ausblenden
    update();
  });
  document.addEventListener('change', e=>{
    const row = e.target.closest('.row'); if(!row) return;
    if(e.target.dataset.k==='mode'){ renderDeco(); update(); }
  });
  document.addEventListener('click', e=>{
    const del = e.target.closest('[data-del]'); if(!del) return;
    const row = del.closest('.row');
    const list = row.dataset.list, i = +row.dataset.i;
    snapshot('delete');                       // vorher sichern
    state[list].splice(i,1);
    if(list==='zutaten'){ if(!state.zutaten.length) state.zutaten.push(blankIngredient()); renderIngredients(); }
    if(list==='deko'){ renderDeco(); }
    if(list==='arbeit'){  renderWork(); }
    update();
    toastUndo(t('msgRowDeleted'));
  });

  /* Zeilen hinzufügen */
  $('#btnZutat').addEventListener('click', ()=>{ state.zutaten.push(blankIngredient()); renderIngredients(); update(); });
  $('#btnDeko').addEventListener('click',  ()=>{ state.deko.push(blankDeco());          renderDeco();        update(); });
  $('#btnArbeit').addEventListener('click',()=>{
    state.arbeit.push({key:'', name:'', h:0, m:0, billable:true, rate:settings.stundenansatz});
    renderWork(); update();
  });

  /* Dekorations-Vorlage: füllt eine Zeile mit Rechenart und Startwerten */
  const dv = $('#dekoVorlage');
  if(dv) dv.addEventListener('change', e=>{
    const i = e.target.value; if(i==='') return;
    const tpl = DECO_TEMPLATES[+i];
    const row = {
      ...blankDeco(),
      cat: tpl.cat,
      desc: t('decoTpl.'+tpl.key) || tpl.key,
      mode: tpl.mode,
      material: tpl.material || '',
      use: tpl.use || '',
      pack: tpl.pack || '',
      anzahl: tpl.anzahl || 1,
      einsaetze: tpl.einsaetze || 20,
      minuten: tpl.minuten || 0,
      rate: settings.stundenansatz
    };
    const empty = state.deko.findIndex(d=>!d.desc && !num(d.material) && !num(d.minuten));
    if(empty >= 0) state.deko[empty] = row; else state.deko.push(row);
    e.target.value = '';
    renderDeco(); update();
  });

  /* Zutaten-Vorlage */
  $('#zutatVorlage').addEventListener('change', e=>{
    const i = e.target.value; if(i==='') return;
    const tplRow = {...INGREDIENT_TEMPLATES[+i]};
    // erste leere Zeile füllen, sonst neue anhängen
    const empty = state.zutaten.findIndex(z=>!z.name && !num(z.menge));
    if(empty>=0) state.zutaten[empty] = tplRow; else state.zutaten.push(tplRow);
    e.target.value = '';
    renderIngredients(); update();
  });

  /* --- Aktionen --- */
  $('#btnSave').addEventListener('click', async()=>{ await saveProject(); renderProjects(); });
  $('#btnDemo').addEventListener('click', ()=>{ snapshot('demo'); loadDemo(); toastUndo(t('msgDemo')); });
  $('#btnNew').addEventListener('click', async ()=>{
    if(!confirm(t('askNew'))) return;
    snapshot('new');
    await autoBackup();                       // vorherige Torte sichern
    state = newState(); currentProjectId = null;
    renderAll();
    toastUndo(t('msgNew'));
  });
  $('#btnUndo').addEventListener('click', undo);
  $('#btnPrintCalc').addEventListener('click', ()=>{
    $$('.card-head').forEach(h=>h.setAttribute('aria-expanded','true'));
    printWith('print-calc');
  });
  $('#btnOffer').addEventListener('click', ()=>{ buildOffer(); openModal('#modalOffer'); });
  $('#btnPrintOffer').addEventListener('click', ()=>printWith('print-offer'));
  $('#btnPdfShare').addEventListener('click', ()=>makePdf('share'));
  $('#btnPdfSave').addEventListener('click',  ()=>makePdf('save'));

  /* Modale */
  $('#btnSettings').addEventListener('click', ()=>{ fillSettings(); openModal('#modalSettings'); });
  $('#btnProjekte').addEventListener('click', ()=>{ renderProjects(); openModal('#modalProjects'); });
  const bsn = $('#btnSyncNav');
  if(bsn) bsn.addEventListener('click', ()=>{ renderSync(); openModal('#modalSync'); });
  $$('.modal').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m || e.target.closest('[data-close]')) closeModal(m); });
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape') $$('.modal:not([hidden])').forEach(closeModal);
  });

  /* Konto und Abgleich */
  const bl = $('#btnSyncLogin');
  if(bl) bl.addEventListener('click', async ()=>{
    const mail = $('#syncMail').value.trim(), pass = $('#syncPass').value;
    if(!mail || !pass) return;
    bl.disabled = true;
    try{
      await SHB_SYNC.anmelden(mail, pass);
      $('#syncPass').value = '';
      if(SHB_SYNC.bereit()){
        toast(t('syncDone'));
        closeModal($('#modalSync'));
      }else{
        /* Anmeldung ging, aber der Zugang gehört zu keinem Konto. Das Fenster
           bleibt offen, damit die Meldung überhaupt gelesen wird. */
        toast((t('syncStatus')||{}).keinZugang || '');
      }
    }catch(e){
      console.warn('Anmeldung:', e.message);
      toast(t('syncFail'));
    }finally{ bl.disabled = false; renderSync(); }
  });
  const bo = $('#btnSyncLogout');
  if(bo) bo.addEventListener('click', ()=>{ SHB_SYNC.abmelden(); renderSync(); });
  const bn = $('#btnSyncNow');
  if(bn) bn.addEventListener('click', async ()=>{
    bn.disabled = true;
    await SHB_SYNC.abgleichen();
    bn.disabled = false; renderSync();
    toast(t('syncDone'));
  });
  if(typeof SHB_SYNC !== 'undefined') SHB_SYNC.beiAenderung(()=>renderSync());

  /* Einstellungen speichern */
  $('#btnSaveSettings').addEventListener('click', async()=>{
    settings.stundenansatz  = num($('#setStundenansatz').value) || DEFAULT_SETTINGS.stundenansatz;
    settings.kmPreis        = num($('#setKmPreis').value);
    settings.betriebProzent = Math.min(num($('#setBetrieb').value),100);
    settings.grammProPerson = num($('#setGramm').value) || DEFAULT_SETTINGS.grammProPerson;
    settings.kiloPreis      = num($('#setKiloPreis').value);
    settings.rundung        = num($('#setRundung').value);
    settings.company = {
      name:    $('#coName').value.trim()   || DEFAULT_COMPANY.name,
      owner:   $('#coOwner').value.trim(),
      street:  $('#coStreet').value.trim(),
      zip:     $('#coZip').value.trim(),
      city:    $('#coCity').value.trim(),
      phone:   $('#coPhone').value.trim(),
      mail:    $('#coMail').value.trim(),
      insta:   $('#coInsta').value.trim(),
      validity:num($('#coValidity').value),
      deposit: Math.min(num($('#coDeposit').value),100),
      taxNote: $('#coTaxNote').value.trim(),
      allergen:$('#coAllergen').value.trim()
    };
    await Store.set('settings', settings);
    closeModal($('#modalSettings'));
    renderAll();
    toast(t('msgSettingsSaved'));
  });

  /* Projektliste */
  $('#projectList').addEventListener('click', async e=>{
    const btn = e.target.closest('[data-act]'); if(!btn) return;
    const id = btn.closest('.project').dataset.id;
    const p  = projects.find(x=>x.id===id); if(!p) return;

    if(btn.dataset.act==='open'){
      snapshot('open');
      state = JSON.parse(JSON.stringify(p.state));
      currentProjectId = p.id;
      closeModal($('#modalProjects')); renderAll(); toastUndo(t('msgLoaded'));
    }
    if(btn.dataset.act==='copy'){
      const copy = JSON.parse(JSON.stringify(p));
      copy.id = 'p'+Date.now();
      copy.name = p.name + ' ' + t('projCopySuffix');
      copy.state.meta.kundenname = copy.name;
      projects.unshift(copy);
      await Store.set('projects', projects);
      renderProjects(); toast(t('msgDuplicated'));
    }
    if(btn.dataset.act==='del'){
      if(!confirm(t('askDelete'))) return;
      projects = projects.filter(x=>x.id!==id);
      if(currentProjectId===id) currentProjectId = null;
      await Store.set('projects', projects);
      renderProjects(); toast(t('msgDeleted'));
    }
  });

  /* Bottom-Bar */
  $('#bbToggle').addEventListener('click', ()=>{
    const open = $('#bbToggle').getAttribute('aria-expanded')==='true';
    $('#bbToggle').setAttribute('aria-expanded', String(!open));
    $('#bbDetail').classList.toggle('show', !open);
  });
}

/** Zustand des Abgleichs in den Einstellungen anzeigen. */
function renderSync(){
  const box = $('#syncBox');
  if(!box || typeof SHB_SYNC === 'undefined') return;
  const st  = SHB_SYNC.status;
  /* Angemeldet heisst: Zugangsdaten stimmen. Bereit heisst zusätzlich, dass
     die Person zu einem Konto gehört. Wer angemeldet, aber nicht
     freigeschaltet ist, soll das lesen – nicht erneut das Anmeldefeld sehen. */
  const an  = SHB_SYNC.angemeldet();
  const txt = (t('syncStatus') || {})[st] || st;

  $('#syncState').textContent = !SHB_SYNC.konfiguriert()
    ? t('syncOff')
    : (an ? tf('syncAs',{mail:SHB_SYNC.benutzer||''}) + ' · ' + txt : txt);
  $('#syncLoggedOut').hidden = !SHB_SYNC.konfiguriert() || an;
  $('#syncLoggedIn').hidden  = !an;

  const btnNow = $('#btnSyncNow');
  if(btnNow) btnNow.disabled = !SHB_SYNC.bereit();

  /* Der Punkt am Knopf in der Navigation. Grün heisst: alles abgeglichen.
     Damit sieht sie den Zustand, ohne irgendetwas zu öffnen. */
  const dot = $('#syncDot');
  if(dot){
    const ampel = SHB_SYNC.bereit()
      ? (st === 'arbeitet' ? 'arbeitet' : (st === 'bereit' ? 'gut' : 'warnung'))
      : (st === 'aus' ? 'aus' : 'warnung');
    dot.dataset.stand = ampel;
  }
  const navBtn = $('#btnSyncNav');
  if(navBtn){
    navBtn.title = !SHB_SYNC.konfiguriert() ? t('syncOff')
      : (an ? tf('syncAs',{mail:SHB_SYNC.benutzer||''}) + ' · ' + txt : t('secSync') + ' · ' + txt);
  }
}

function fillSettings(){
  $('#setStundenansatz').value = settings.stundenansatz;
  $('#setKmPreis').value       = settings.kmPreis;
  $('#setBetrieb').value       = settings.betriebProzent;
  $('#setGramm').value         = settings.grammProPerson;
  $('#setKiloPreis').value     = settings.kiloPreis;
  $('#setRundung').value       = settings.rundung;
  $('#setSprache').value       = lang;

  const co = {...DEFAULT_COMPANY, ...(settings.company||{})};
  $('#coName').value     = co.name;
  $('#coOwner').value    = co.owner;
  $('#coStreet').value   = co.street;
  $('#coZip').value      = co.zip;
  $('#coCity').value     = co.city;
  $('#coPhone').value    = co.phone;
  $('#coMail').value     = co.mail;
  $('#coInsta').value    = co.insta;
  $('#coValidity').value = co.validity;
  $('#coDeposit').value  = co.deposit;
  $('#coTaxNote').value  = co.taxNote;
  $('#coAllergen').value = co.allergen || t('pdfAllergen');
  renderSync();
}

/* ---- Beispielkalkulation (Referenz aus dem Briefing) ---------------------
 * 20 Portionen · Material CHF 58 · tatsächlich 11 h · kalkulatorisch 6 h
 * Stundenansatz CHF 40 · Nebenkosten CHF 25 · Gewinnaufschlag 20 %
 * ------------------------------------------------------------------------ */
function loadDemo(){
  state = newState();
  const d = new Date(); d.setDate(d.getDate()+14);

  state.meta = {
    kundenname:'Familie Meier', auftragsnummer:'SHB-2026-001',
    bestelldatum:new Date().toISOString().slice(0,10),
    lieferdatum:d.toISOString().slice(0,10),
    anlass:0, bemerkungen:'Schokoladenbiskuit, Mascarpone-Füllung, handgefertigte Dekoration, personalisierter Cake Topper.',
    kundenpreis:''
  };
  state.cake = { form:0, groesse:'20', groesseCustom:'', hoehe:12, etagen:1,
                 portionen:20, gewicht: 20*settings.grammProPerson/1000 };

  /* Zutaten ≈ CHF 58 */
  state.zutaten = [
    {name:'Mehl',              menge:600, einheit:'g',  pack:1000, packEinheit:'g',  preis:1.60},
    {name:'Zucker',            menge:500, einheit:'g',  pack:1000, packEinheit:'g',  preis:1.50},
    {name:'Eier',              menge:10,  einheit:'stk',pack:10,   packEinheit:'stk',preis:5.50},
    {name:'Butter',            menge:400, einheit:'g',  pack:250,  packEinheit:'g',  preis:3.50},
    {name:'Mascarpone',        menge:500, einheit:'g',  pack:500,  packEinheit:'g',  preis:4.80},
    {name:'Rahm / Sahne 35 %', menge:600, einheit:'ml', pack:500,  packEinheit:'ml', preis:3.20},
    {name:'Dunkle Schokolade', menge:400, einheit:'g',  pack:100,  packEinheit:'g',  preis:2.40},
    {name:'Kakaopulver',       menge:80,  einheit:'g',  pack:250,  packEinheit:'g',  preis:4.20},
    {name:'Fondant',           menge:600, einheit:'g',  pack:1000, packEinheit:'g',  preis:12.90},
    {name:'Puderzucker',       menge:300, einheit:'g',  pack:500,  packEinheit:'g',  preis:1.90},
    {name:'Frischkäse',        menge:400, einheit:'g',  pack:200,  packEinheit:'g',  preis:2.60},
    {name:'Beeren frisch',     menge:300, einheit:'g',  pack:250,  packEinheit:'g',  preis:4.50},
    {name:'Vanilleextrakt',    menge:15,  einheit:'ml', pack:50,   packEinheit:'ml', preis:8.50},
    {name:'Lebensmittelfarbe', menge:1,   einheit:'stk',pack:1,    packEinheit:'stk',preis:3.90}
  ];

  /* Arbeitszeit: total 11 h, davon 5 h passiv (Backen/Abkühlen) → 6 h verrechenbar */
  /* Arbeitszeit: gut 6 Stunden aktive Arbeit, das Backen läuft nebenher */
  const H = {vorbereitung:[0,45], backen:[1,30], creme:[0,30],
             zusammen:[0,30], lieferung:[0,30]};
  state.arbeit.forEach(a=>{ const v = H[a.key]; if(v){ a.h=v[0]; a.m=v[1]; } a.rate = 40; });

  /* Dekoration mit den Posten, die bei Lena wirklich anfallen */
  state.deko = [
    {cat:'ganache', desc:'Ganache-Glasur', mode:'anteil',   use:400, pack:1000, material:22,
     anzahl:1, minuten:25, einsaetze:20, rate:40},
    {cat:'krone',   desc:'Goldkrone', mode:'stueck', material:9, anzahl:1,
     use:'', pack:'', minuten:10, einsaetze:20, rate:40},
    {cat:'spezial', desc:'Zuckerstempel', mode:'werkzeug', material:38, einsaetze:50,
     anzahl:1, use:'', pack:'', minuten:10, rate:40}
  ];

  /* Nebenkosten */
  state.neben = {energie:5, sonstige:3};
  state.simple = {on:true, material:58, stunden:5};
  state.verpackung = {schachtel:4, band:1, unterlage:3, sonstiges:0};
  state.travel = {km:12, kmPreis:settings.kmPreis, minuten:40};
  state.betriebProzent = 8;
  state.rundung = 2;

  currentProjectId = null;
  renderAll();
}

/** Alles neu aus dem Speicher lesen – wird nach einem Abgleich aufgerufen,
 *  wenn vom anderen Gerät neuere Daten gekommen sind. */
async function reloadFromStore(){
  const savedSettings = await Store.get('settings');
  if(savedSettings){
    settings = {...DEFAULT_SETTINGS, ...savedSettings,
                company:{...DEFAULT_COMPANY, ...(savedSettings.company||{})}};
  }
  await loadProjects();
  const cur = await Store.get('current');
  if(cur && cur.state){
    const base = newState();
    state = {...base, ...cur.state,
      meta:{...base.meta, ...(cur.state.meta||{})},
      cake:{...base.cake, ...(cur.state.cake||{})},
      neben:{...base.neben, ...(cur.state.neben||{})},
      travel:{...base.travel, ...(cur.state.travel||{})},
      verpackung:{...base.verpackung, ...(cur.state.verpackung||{})},
      simple:{...base.simple, ...(cur.state.simple||{})}};
    currentProjectId = cur.id;
  }
  const l = await Store.get('lang');
  if(l && translations[l] && l !== lang){ lang = l; applyI18n(); }
  renderAll();
}

/* ---- Start ---- */
let initDone = false;
async function init(){
  if(initDone) return;      // doppelte Aufrufe wirkungslos machen
  initDone = true;
  const savedSettings = await Store.get('settings');
  if(savedSettings){
    settings = {...DEFAULT_SETTINGS, ...savedSettings,
                company:{...DEFAULT_COMPANY, ...(savedSettings.company||{})}};
  }

  // Sprache: gespeicherte Wahl → Einstellung → Browsersprache → Deutsch
  const savedLang = await Store.get('lang');
  if(savedLang && translations[savedLang])            lang = savedLang;
  else if(settings.sprache && translations[settings.sprache]) lang = settings.sprache;
  else if(/^(uk|ru)/.test((navigator.language||'').toLowerCase())) lang = 'ua';
  else lang = 'de';

  await loadProjects();
  history = (await Store.get('history')) || [];

  const cur = await Store.get('current');
  state = (cur && cur.state) ? cur.state : newState();
  currentProjectId = cur ? cur.id : null;

  // Zustand gegen fehlende Felder absichern (ältere Speicherstände)
  const base = newState();
  state = {...base, ...state,
    meta:{...base.meta, ...(state.meta||{})},
    cake:{...base.cake, ...(state.cake||{})},
    neben:{...base.neben, ...(state.neben||{})},
    travel:{...base.travel, ...(state.travel||{})},
    verpackung:{...base.verpackung, ...(state.verpackung||{})},
    simple:{...base.simple, ...(state.simple||{})}
  };
  if(!Array.isArray(state.zutaten) || !state.zutaten.length) state.zutaten = [blankIngredient()];
  if(!Array.isArray(state.deko)) state.deko = [];
  if(!Array.isArray(state.arbeit)  || !state.arbeit.length)  state.arbeit  = base.arbeit;

  applyI18n();
  bindEvents();
  renderAll();
  updateUndoButton();
  if(typeof SHB_SYNC !== 'undefined') SHB_SYNC.start();
}

if(typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', init);
}

/* Für Tests in Node exportieren (im Browser wirkungslos) */
if(typeof module !== 'undefined' && module.exports){
  module.exports = {calculate, roundPrice, estimatePortions, newState, translations,
                    PHASE_KEYS, NEBEN_KEYS, UNIT_INFO,
                    INGREDIENT_TEMPLATES, DECO_TEMPLATES, DEFAULT_SETTINGS};
}
