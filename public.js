(() => {
  'use strict';
  const panels = [...document.querySelectorAll('.step-panel')];
  const steps = [...document.querySelectorAll('.step-list li')];
  const nextButton = document.querySelector('#next-button');
  const backButton = document.querySelector('#back-button');
  const range = document.querySelector('#guest-range');
  const output = document.querySelector('#guest-output');
  const decorationPrices = { minimal: 25, fruit: 30, flowers: 55, gold: 65 };
  const state = { step: 1, occasion: 'wedding', shape: 'round', guests: 24, filling: 'vanilla-raspberry', fillingExtra: 0, decoration: 'flowers', decorationPrice: decorationPrices.flowers, color: 'neutral' };
  const copy = {
    de: {
      'meta-title':'Sweet Home Bakery · Torte Grenchen & Solothurn','meta-description':'Handgemachte Torten in Grenchen: individuelle Geburtstags-, Hochzeits- und Motivtorten sowie Fruchtleder ohne Zuckerzusatz. Persönliche Beratung auf Deutsch, Українська und Русский.',
      'aria-home':'Sweet Home Bakery Startseite','aria-nav':'Hauptnavigation','aria-language':'Sprache','aria-menu':'Menü öffnen','aria-marquee':'Unser Versprechen',
      'nav-collection':'Kollektion','nav-manufactory':'Geschichte','nav-config':'Wunschstück','nav-cta':'Torte gestalten','nav-admin':'Kalkulator','aria-admin':'Admin-Bereich: Kalkulator',
      'hero-eyebrow':'Handgemachte Torten · Grenchen & Solothurn','hero-title':'Ein Anlass.|Ein Unikat.','hero-intro':'Handgemachte Torten und Süsswaren in Premium-Qualität – individuell für Ihren Anlass. Aus meiner Küche für Ihren schönsten Moment, mit persönlicher Beratung auf Deutsch, Українська und Русский.','hero-button':'Wunschstück gestalten','hero-link':'Kollektion entdecken','hero-note':'Für Hochzeiten, Geburtstage|und die kleinen grossen Momente.',
      'hero-stamp-1':'handgemacht','hero-stamp-2':'mit Liebe','hero-stamp-3':'in Grenchen','hero-pill':'Mehr entdecken','hero-fallback-alt':'Schwarze Torte mit Kristallkrone und "Happy Birthday" Schriftzug',
      'moment2-eyebrow':'Schicht für Schicht','moment2-title':'Von Hand|geschichtet.','moment2-copy':'Jede Schicht einzeln gebacken, gefüllt und veredelt – bevor sie zu Ihrem Unikat wird.',
      'moment3-caption':'Aus meiner Küche in Grenchen','moment3-title':'Jede Torte|erzählt etwas.','moment3-alt':'Frisch gespritzte rosa Marshmallows',
      'moment4-eyebrow':'Bereit für Ihren Anlass?','moment4-title':'Lassen Sie uns|gestalten.','moment4-copy':'Scrollen Sie weiter – oder springen Sie direkt zu Ihrem Wunschstück.',
      'marquee':'HANDWERK <i>·</i> EHRLICHKEIT <i>·</i> IHRE GESCHICHTE <i>·</i> HANDWERK <i>·</i> EHRLICHKEIT <i>·</i> IHRE GESCHICHTE <i>·</i>',
      'collection-eyebrow':'Aus meiner Küche','collection-title':'Die Kollektion','collection-intro':'Eine Auswahl meiner liebsten Formen. Jedes Stück lässt sich auf Ihren Anlass, Ihre Farben und Ihre Geschichte abstimmen.',
      'collection1-tag':'01 · Hochzeit','collection2-tag':'02 · Geburtstag','collection3-tag':'03 · Trendtorte','collection1-cta':'Anpassen','collection2-cta':'Anpassen','collection3-cta':'Anpassen','collection1-alt':'Minimalistische weisse Torte mit rotem Herz','collection2-alt':'Torte mit Blumendekor und Hasenfigur für Alicia','collection3-alt':'Schwarze King- und Queen-Torten mit Kronen',
      'values-eyebrow':'Wofür ich stehe','values-title':'Mein Markenkern','values-intro':'Der rote Faden hinter jedem Foto, jedem Text und jeder Antwort auf Ihre Nachricht.',
      'value1-title':'Handwerk auf Trendniveau','value1-text':'Individuelle Designs auf internationalem Trendniveau, fair kalkuliert für die Region.',
      'value2-title':'Ehrlich & gesund','value2-text':'Ich biete nur an, was ich wirklich kann – und bald auch mein Fruchtleder ganz ohne Zuckerzusatz.',
      'value3-title':'Mehrsprachig beraten','value3-text':'Persönliche Beratung auf Deutsch, Українська und Русский.',
      'value4-title':'Vollständig gemeldet','value4-text':'Registrierter, hygienisch dokumentierter Betrieb mit Allergendeklaration zu jeder Bestellung.',
      'sortiment-eyebrow':'Auch im Angebot','sortiment-title':'Kleine Köstlichkeiten','sortiment-intro':'Nicht jeder Anlass braucht eine ganze Torte.',
      'sortiment1-text':'Buttercreme-Rose, frische Beeren, feine Dekoration.','sortiment1-price':'CHF 5–7 / Stück',
      'sortiment2-title':'Marshmallows','sortiment2-text':'Handgemacht, farbig, in dekorativer Geschenkbox.','sortiment2-price':'ab CHF 18 / Box',
      'sortiment3-title':'Trifles','sortiment3-text':'Schichtdessert im Glas, z. B. Red Velvet mit Frischkäsecreme.','sortiment3-price':'CHF 8–10 / Stück',
      'fruit-eyebrow':'Für die gesunden Momente · in Vorbereitung','fruit-title':'Fruchtleder|ganz ohne Zuckerzusatz.','fruit-copy':'100 % Frucht, sonst nichts – der ehrliche Snack für die Znünibox und für alle, die es natürlich mögen. Bald verfügbar.','fruit-link':'Auf Instagram folgen, um es nicht zu verpassen',
      'manufactory-eyebrow':'Meine Geschichte','manufactory-title':'Von Herzen|handgemacht.','manufactory-copy':'Ich bin Olena. Vor einiger Zeit kam ich aus der Ukraine in die Schweiz – mit meinem Backhandwerk im Gepäck. Heute darf ich in meiner Küche in Grenchen für Ihre schönsten Momente backen: Böden, die am selben Tag entstehen, Füllungen nach Saison und Details, die nicht laut sein müssen, um in Erinnerung zu bleiben. Ich biete nur an, was ich wirklich kann – Schritt für Schritt, mit Herz.','manufactory-link':'Mehr über Sweet Home Bakery',
      'config-eyebrow':'Ihr persönliches Wunschstück','config-title':'Gestalten Sie Ihre Torte','config-intro':'In wenigen Schritten zu einer ersten Einschätzung. Ich melde mich persönlich, um alle Details mit Ihnen zu verfeinern.','config-kicker':'Konfigurator','step1-title':'Was dürfen wir feiern?','step1-desc':'Der Anlass gibt Ihrer Torte ihren ersten Charakter.','step2-title':'Wie soll sie wirken?','step2-desc':'Wählen Sie die Silhouette, die zu Ihrem Anlass passt.','step3-title':'Welche Füllung spricht Sie an?','step3-desc':'Unsere Kompositionen sind saisonal und werden frisch für Sie zubereitet.','step4-title':'Was macht sie zu Ihrer?','step4-desc':'Farben, Dekoration und ein Bild als kleine Skizze Ihrer Idee.','step5-title':'Wie dürfen wir Sie erreichen?','step5-desc':'Ich prüfe Ihre Wünsche und melde mich innerhalb von 48 Stunden mit einer persönlichen Einschätzung. Bitte planen Sie mindestens 5–7 Tage Vorlaufzeit ein.','next':'Weiter','summary':'Zusammenfassung','back':'Zurück','submit':'Anfrage senden',
      'sidebar1-label':'Der Anlass','sidebar1-sub':'Wofür feiern wir?','sidebar2-label':'Die Form','sidebar2-sub':'Grösse & Charakter','sidebar3-label':'Die Füllung','sidebar3-sub':'Unser Geschmack','sidebar4-label':'Die Details','sidebar4-sub':'Ihre Handschrift','sidebar5-label':'Ihre Anfrage','sidebar5-sub':'Fast geschafft','sidebar-foot-location':'GRENCHEN · SCHWEIZ',
      'step-count-label':'Schritt',
      'occasion-wedding':'Hochzeit','occasion-birthday':'Geburtstag','occasion-baptism':'Taufe','occasion-anniversary':'Jubiläum','occasion-corporate':'Business Event','occasion-other':'Etwas anderes',
      'shape-round':'Rund','shape-tiered':'Mehrstöckig','shape-heart':'Herzform','shape-custom':'Individuell',
      'guests-label':'Für wie viele Personen?','guests-unit':'Personen',
      'filling-vanilla-name':'Vanille & Himbeere','filling-vanilla-desc':'Madagaskar-Vanille · säuerliche Beeren',
      'filling-chocolate-name':'Schokolade & Salzkaramell','filling-chocolate-desc':'70 % Cacao · weiches Karamell',
      'filling-lemon-name':'Zitrone & Holunder','filling-lemon-desc':'Crème fraîche · Holunderblüte',
      'filling-pistachio-name':'Pistazie & Rose','filling-pistachio-desc':'Geröstete Pistazie · Damaszener Rose',
      'label-color':'Farbwelt','label-decoration':'Dekoration',
      'color-neutral':'Neutrale Töne','color-blush':'Puderrosa & Rot','color-sage':'Salbei & Creme','color-blue':'Tiefes Blau',
      'decoration-flowers':'Frische Blüten','decoration-minimal':'Minimalistisch','decoration-fruit':'Früchte der Saison','decoration-gold':'Goldene Details',
      'upload-title':'Referenzbild hinzufügen','upload-hint':'Ein Bild sagt manchmal mehr als tausend Worte · optional','upload-alt':'Vorschau Ihres Referenzbilds',
      'message-label':'Ihre Idee, Allergien oder besondere Wünsche','message-placeholder':'Erzählen Sie uns von Ihrer Vision – und von Allergien oder Unverträglichkeiten ...','field-note':'Zu jeder Bestellung erhalten Sie eine schriftliche Zutaten- und Allergendeklaration.',
      'summary-occasion-label':'Anlass','summary-shape-label':'Ausführung','summary-filling-label':'Füllung','summary-price-label':'Ab','price-note':'Berechnet nach Grundpreis CHF 55.–/kg zzgl. Dekoration – transparent und fair.',
      'label-name':'Vorname & Name','placeholder-name':'Ihr Name','label-email':'E-Mail-Adresse','label-date':'Wunschtermin','label-phone':'Telefon (optional)','consent':'Ich stimme zu, dass Sweet Home Bakery meine Angaben zur Bearbeitung der Anfrage verwenden darf.',
      'footer-copy':'Handgemachte Torten|und Fruchtleder|aus Grenchen.','footer-social-label':'Folgen & Finden','footer-contact':'Kontakt','footer-google':'Auf Google finden','footer-admin':'Admin-Zugang','contact-error':'Bitte ergänzen Sie Name, E-Mail und Ihre Zustimmung.','contact-success':'Vielen Dank. Ihre Anfrage ist angekommen. Ich melde mich persönlich bei Ihnen.'
    },
    ua: {
      'meta-title':'Sweet Home Bakery · Торти Гренхен і Золотурн','meta-description':'Домашні торти в Гренхені: індивідуальні торти на день народження, весілля та тематичні торти, а також фруктова пастила без доданого цукру. Особиста консультація німецькою, українською та російською.',
      'aria-home':'Sweet Home Bakery — головна сторінка','aria-nav':'Головна навігація','aria-language':'Мова','aria-menu':'Відкрити меню','aria-marquee':'Наша обіцянка',
      'nav-collection':'Колекція','nav-manufactory':'Історія','nav-config':'Ваш торт','nav-cta':'Створити торт','nav-admin':'Калькулятор','aria-admin':'Адмін-зона: Калькулятор',
      'hero-eyebrow':'Домашні торти · Гренхен і Золотурн','hero-title':'Одна подія.|Один шедевр.','hero-intro':'Домашні торти й солодощі преміальної якості — індивідуально для вашої події. З моєї кухні для вашого найкращого моменту, з особистою консультацією німецькою, українською та російською.','hero-button':'Створити свій торт','hero-link':'Відкрити колекцію','hero-note':'Для весіль, днів народження|і маленьких великих моментів.',
      'hero-stamp-1':'ручна робота','hero-stamp-2':'з любов’ю','hero-stamp-3':'у Гренхені','hero-pill':'Дізнатися більше','hero-fallback-alt':'Чорний торт із кришталевою короною та написом "Happy Birthday"',
      'moment2-eyebrow':'Шар за шаром','moment2-title':'Складено|вручну.','moment2-copy':'Кожен шар випікається, наповнюється й оздоблюється окремо — перш ніж стати вашим унікальним тортом.',
      'moment3-caption':'З моєї кухні в Гренхені','moment3-title':'Кожен торт|щось розповідає.','moment3-alt':'Свіжо відсаджений рожевий зефір',
      'moment4-eyebrow':'Готові до вашої події?','moment4-title':'Створімо|разом.','moment4-copy':'Прокручуйте далі — або перейдіть одразу до створення торта.',
      'marquee':'МАЙСТЕРНІСТЬ <i>·</i> ЧЕСНІСТЬ <i>·</i> ВАША ІСТОРІЯ <i>·</i> МАЙСТЕРНІСТЬ <i>·</i> ЧЕСНІСТЬ <i>·</i> ВАША ІСТОРІЯ <i>·</i>',
      'collection-eyebrow':'З моєї кухні','collection-title':'Колекція','collection-intro':'Добірка моїх улюблених форм. Кожен виріб можна налаштувати під вашу подію, кольори та історію.',
      'collection1-tag':'01 · Весілля','collection2-tag':'02 · День народження','collection3-tag':'03 · Трендовий торт','collection1-cta':'Налаштувати','collection2-cta':'Налаштувати','collection3-cta':'Налаштувати','collection1-alt':'Мінімалістичний білий торт із червоним серцем','collection2-alt':'Торт із квітковим декором і фігуркою зайчика для Алісії','collection3-alt':'Чорні торти King і Queen з коронами',
      'values-eyebrow':'За що я відповідаю','values-title':'Основа моєї марки','values-intro':'Червона нитка, що проходить крізь кожне фото, кожен текст і кожну відповідь на ваше повідомлення.',
      'value1-title':'Майстерність на рівні трендів','value1-text':'Індивідуальний дизайн на рівні міжнародних трендів, чесно розраховано для регіону.',
      'value2-title':'Чесно й корисно','value2-text':'Я пропоную лише те, що вмію по-справжньому — а скоро й мою фруктову пастилу зовсім без доданого цукру.',
      'value3-title':'Консультація кількома мовами','value3-text':'Особиста консультація німецькою, українською та російською.',
      'value4-title':'Повністю зареєстровано','value4-text':'Зареєстроване, гігієнічно задокументоване виробництво з декларацією алергенів до кожного замовлення.',
      'sortiment-eyebrow':'Також в асортименті','sortiment-title':'Маленькі смаколики','sortiment-intro':'Не кожна подія потребує цілого торта.',
      'sortiment1-text':'Троянда з масляного крему, свіжі ягоди, витончений декор.','sortiment1-price':'CHF 5–7 / шт.',
      'sortiment2-title':'Маршмелоу','sortiment2-text':'Ручної роботи, кольорові, у декоративній подарунковій коробці.','sortiment2-price':'від CHF 18 / коробка',
      'sortiment3-title':'Трайфли','sortiment3-text':'Шаровий десерт у склянці, напр. Red Velvet з кремом на основі вершкового сиру.','sortiment3-price':'CHF 8–10 / шт.',
      'fruit-eyebrow':'Для здорових моментів · у підготовці','fruit-title':'Фруктова пастила|зовсім без доданого цукру.','fruit-copy':'100 % фруктів, більше нічого — чесний перекус для дитячого «знюні» та для всіх, хто любить натуральне. Скоро в продажу.','fruit-link':'Підписатися в Instagram, щоб не пропустити',
      'manufactory-eyebrow':'Моя історія','manufactory-title':'Зроблено|з душі.','manufactory-copy':'Я Олена. Певний час тому я переїхала з України до Швейцарії — з кондитерським ремеслом у багажі. Сьогодні я маю можливість пекти у своїй кухні в Гренхені для ваших найкращих моментів: бісквіти, що готуються того ж дня, сезонні начинки та деталі, яким не потрібно бути гучними, щоб залишитися в пам’яті. Я пропоную лише те, що вмію по-справжньому — крок за кроком, з душею.','manufactory-link':'Більше про Sweet Home Bakery',
      'config-eyebrow':'Ваш особливий торт','config-title':'Створіть свій торт','config-intro':'Кілька кроків до першої оцінки. Я особисто зв’яжуся з вами, щоб уточнити всі деталі.','config-kicker':'Конфігуратор','step1-title':'Що святкуємо?','step1-desc':'Подія задає перший характер вашого торта.','step2-title':'Яким він має бути?','step2-desc':'Оберіть силует, що пасує до вашої події.','step3-title':'Яка начинка вам до смаку?','step3-desc':'Мої композиції сезонні та готуються свіжими спеціально для вас.','step4-title':'Що зробить його вашим?','step4-desc':'Кольори, декор і зображення як ескіз вашої ідеї.','step5-title':'Як з вами зв’язатися?','step5-desc':'Я перевірю ваші побажання та особисто відповім протягом 48 годин. Будь ласка, плануйте щонайменше 5–7 днів на підготовку.','next':'Далі','summary':'Підсумок','back':'Назад','submit':'Надіслати запит',
      'sidebar1-label':'Привід','sidebar1-sub':'Що святкуємо?','sidebar2-label':'Форма','sidebar2-sub':'Розмір і характер','sidebar3-label':'Начинка','sidebar3-sub':'Наш смак','sidebar4-label':'Деталі','sidebar4-sub':'Ваш почерк','sidebar5-label':'Ваш запит','sidebar5-sub':'Майже готово','sidebar-foot-location':'ГРЕНХЕН · ШВЕЙЦАРІЯ',
      'step-count-label':'Крок',
      'occasion-wedding':'Весілля','occasion-birthday':'День народження','occasion-baptism':'Хрестини','occasion-anniversary':'Ювілей','occasion-corporate':'Бізнес-подія','occasion-other':'Щось інше',
      'shape-round':'Круглий','shape-tiered':'Багатоярусний','shape-heart':'У формі серця','shape-custom':'Індивідуальний',
      'guests-label':'На скільки осіб?','guests-unit':'осіб',
      'filling-vanilla-name':'Ваніль і малина','filling-vanilla-desc':'Мадагаскарська ваніль · кислуваті ягоди',
      'filling-chocolate-name':'Шоколад і солона карамель','filling-chocolate-desc':'70 % какао · м’яка карамель',
      'filling-lemon-name':'Лимон і бузина','filling-lemon-desc':'Крем-фреш · квіти бузини',
      'filling-pistachio-name':'Фісташка і троянда','filling-pistachio-desc':'Смажена фісташка · дамаська троянда',
      'label-color':'Колірна гама','label-decoration':'Декор',
      'color-neutral':'Нейтральні тони','color-blush':'Пудрово-рожевий і червоний','color-sage':'Шавлія і крем','color-blue':'Глибокий синій',
      'decoration-flowers':'Свіжі квіти','decoration-minimal':'Мінімалістично','decoration-fruit':'Сезонні фрукти','decoration-gold':'Золоті деталі',
      'upload-title':'Додати референс-зображення','upload-hint':'Іноді зображення каже більше за тисячу слів · необов’язково','upload-alt':'Попередній перегляд вашого зображення',
      'message-label':'Ваша ідея, алергії або особливі побажання','message-placeholder':'Розкажіть нам про вашу ідею — а також про алергії чи непереносимість ...','field-note':'До кожного замовлення ви отримаєте письмову декларацію інгредієнтів та алергенів.',
      'summary-occasion-label':'Привід','summary-shape-label':'Виконання','summary-filling-label':'Начинка','summary-price-label':'Від','price-note':'Розраховано за базовою ціною CHF 55.–/кг плюс декор — прозоро та чесно.',
      'label-name':'Ім’я та прізвище','placeholder-name':'Ваше ім’я','label-email':'Електронна пошта','label-date':'Бажана дата','label-phone':'Телефон (необов’язково)','consent':'Я погоджуюсь, що Sweet Home Bakery може використовувати мої дані для обробки запиту.',
      'footer-copy':'Домашні торти|та фруктова пастила|з Гренхена.','footer-social-label':'Стежте та знаходьте','footer-contact':'Контакт','footer-google':'Знайти в Google','footer-admin':'Вхід для адміністратора','contact-error':'Будь ласка, вкажіть ім’я, e-mail і підтвердьте згоду.','contact-success':'Дякуємо. Ваш запит отримано. Я особисто з вами зв’яжуся.'
    },
    ru: {
      'meta-title':'Sweet Home Bakery · Торты Гренхен и Золотурн','meta-description':'Домашние торты в Гренхене: индивидуальные торты на день рождения, свадьбу и тематические торты, а также фруктовая пастила без добавленного сахара. Личная консультация на немецком, украинском и русском.',
      'aria-home':'Sweet Home Bakery — главная страница','aria-nav':'Главная навигация','aria-language':'Язык','aria-menu':'Открыть меню','aria-marquee':'Наше обещание',
      'nav-collection':'Коллекция','nav-manufactory':'История','nav-config':'Ваш торт','nav-cta':'Создать торт','nav-admin':'Калькулятор','aria-admin':'Админ-зона: Калькулятор',
      'hero-eyebrow':'Домашние торты · Гренхен и Золотурн','hero-title':'Один повод.|Один шедевр.','hero-intro':'Домашние торты и сладости премиального качества — индивидуально для вашего события. Из моей кухни для вашего самого прекрасного момента, с личной консультацией на немецком, украинском и русском языках.','hero-button':'Создать свой торт','hero-link':'Смотреть коллекцию','hero-note':'Для свадеб, дней рождения|и маленьких больших моментов.',
      'hero-stamp-1':'ручная работа','hero-stamp-2':'с любовью','hero-stamp-3':'в Гренхене','hero-pill':'Узнать больше','hero-fallback-alt':'Чёрный торт с хрустальной короной и надписью "Happy Birthday"',
      'moment2-eyebrow':'Слой за слоем','moment2-title':'Собрано|вручную.','moment2-copy':'Каждый слой выпекается, наполняется и украшается отдельно — прежде чем стать вашим уникальным тортом.',
      'moment3-caption':'Из моей кухни в Гренхене','moment3-title':'Каждый торт|что-то рассказывает.','moment3-alt':'Свежеотсаженный розовый зефир',
      'moment4-eyebrow':'Готовы к вашему событию?','moment4-title':'Создадим|вместе.','moment4-copy':'Прокручивайте дальше — или перейдите сразу к созданию торта.',
      'marquee':'МАСТЕРСТВО <i>·</i> ЧЕСТНОСТЬ <i>·</i> ВАША ИСТОРИЯ <i>·</i> МАСТЕРСТВО <i>·</i> ЧЕСТНОСТЬ <i>·</i> ВАША ИСТОРИЯ <i>·</i>',
      'collection-eyebrow':'Из моей кухни','collection-title':'Коллекция','collection-intro':'Подборка моих любимых форм. Каждое изделие можно адаптировать под ваше событие, цвета и историю.',
      'collection1-tag':'01 · Свадьба','collection2-tag':'02 · День рождения','collection3-tag':'03 · Трендовый торт','collection1-cta':'Настроить','collection2-cta':'Настроить','collection3-cta':'Настроить','collection1-alt':'Минималистичный белый торт с красным сердцем','collection2-alt':'Торт с цветочным декором и фигуркой зайчика для Алисии','collection3-alt':'Чёрные торты King и Queen с коронами',
      'values-eyebrow':'За что я отвечаю','values-title':'Ядро моего бренда','values-intro':'Красная нить, которая проходит через каждое фото, каждый текст и каждый ответ на ваше сообщение.',
      'value1-title':'Мастерство на уровне трендов','value1-text':'Индивидуальный дизайн на уровне международных трендов, честно рассчитано для региона.',
      'value2-title':'Честно и полезно','value2-text':'Я предлагаю только то, что действительно умею — а скоро и мою фруктовую пастилу совсем без добавленного сахара.',
      'value3-title':'Консультация на нескольких языках','value3-text':'Личная консультация на немецком, украинском и русском.',
      'value4-title':'Полностью зарегистрировано','value4-text':'Зарегистрированное, гигиенически задокументированное производство с декларацией аллергенов к каждому заказу.',
      'sortiment-eyebrow':'Также в ассортименте','sortiment-title':'Маленькие лакомства','sortiment-intro':'Не каждому поводу нужен целый торт.',
      'sortiment1-text':'Роза из масляного крема, свежие ягоды, изысканный декор.','sortiment1-price':'CHF 5–7 / шт.',
      'sortiment2-title':'Маршмеллоу','sortiment2-text':'Ручной работы, цветные, в декоративной подарочной коробке.','sortiment2-price':'от CHF 18 / коробка',
      'sortiment3-title':'Трайфлы','sortiment3-text':'Слоёный десерт в стакане, напр. Red Velvet с кремом на основе сливочного сыра.','sortiment3-price':'CHF 8–10 / шт.',
      'fruit-eyebrow':'Для полезных моментов · в разработке','fruit-title':'Фруктовая пастила|совсем без добавленного сахара.','fruit-copy':'100 % фруктов и больше ничего — честный перекус для детского «знюни» и для всех, кто любит натуральное. Скоро в продаже.','fruit-link':'Подписаться в Instagram, чтобы не пропустить',
      'manufactory-eyebrow':'Моя история','manufactory-title':'Сделано|от души.','manufactory-copy':'Я Олена. Некоторое время назад я переехала из Украины в Швейцарию — с кондитерским мастерством в багаже. Сегодня я пеку в своей кухне в Гренхене для ваших самых прекрасных моментов: коржи, испечённые в тот же день, сезонные начинки и детали, которым не нужно быть громкими, чтобы запомниться. Я предлагаю только то, что действительно умею — шаг за шагом, с душой.','manufactory-link':'Больше о Sweet Home Bakery',
      'config-eyebrow':'Ваш особенный торт','config-title':'Создайте свой торт','config-intro':'Несколько шагов до первой оценки. Я лично свяжусь с вами, чтобы уточнить все детали.','config-kicker':'Конфигуратор','step1-title':'Что празднуем?','step1-desc':'Повод задаёт первый характер вашего торта.','step2-title':'Каким он должен быть?','step2-desc':'Выберите силуэт, подходящий к вашему событию.','step3-title':'Какая начинка вам по вкусу?','step3-desc':'Мои композиции сезонные и готовятся свежими специально для вас.','step4-title':'Что сделает его вашим?','step4-desc':'Цвета, декор и изображение как набросок вашей идеи.','step5-title':'Как с вами связаться?','step5-desc':'Я проверю ваши пожелания и лично отвечу в течение 48 часов. Пожалуйста, планируйте минимум 5–7 дней на подготовку.','next':'Далее','summary':'Итог','back':'Назад','submit':'Отправить запрос',
      'sidebar1-label':'Повод','sidebar1-sub':'Что празднуем?','sidebar2-label':'Форма','sidebar2-sub':'Размер и характер','sidebar3-label':'Начинка','sidebar3-sub':'Наш вкус','sidebar4-label':'Детали','sidebar4-sub':'Ваш почерк','sidebar5-label':'Ваш запрос','sidebar5-sub':'Почти готово','sidebar-foot-location':'ГРЕНХЕН · ШВЕЙЦАРИЯ',
      'step-count-label':'Шаг',
      'occasion-wedding':'Свадьба','occasion-birthday':'День рождения','occasion-baptism':'Крестины','occasion-anniversary':'Юбилей','occasion-corporate':'Бизнес-мероприятие','occasion-other':'Что-то другое',
      'shape-round':'Круглый','shape-tiered':'Многоярусный','shape-heart':'В форме сердца','shape-custom':'Индивидуальный',
      'guests-label':'На сколько человек?','guests-unit':'человек',
      'filling-vanilla-name':'Ваниль и малина','filling-vanilla-desc':'Мадагаскарская ваниль · кисловатые ягоды',
      'filling-chocolate-name':'Шоколад и солёная карамель','filling-chocolate-desc':'70 % какао · мягкая карамель',
      'filling-lemon-name':'Лимон и бузина','filling-lemon-desc':'Крем-фреш · цветы бузины',
      'filling-pistachio-name':'Фисташка и роза','filling-pistachio-desc':'Жареная фисташка · дамасская роза',
      'label-color':'Цветовая гамма','label-decoration':'Декор',
      'color-neutral':'Нейтральные тона','color-blush':'Пудрово-розовый и красный','color-sage':'Шалфей и крем','color-blue':'Глубокий синий',
      'decoration-flowers':'Свежие цветы','decoration-minimal':'Минималистично','decoration-fruit':'Сезонные фрукты','decoration-gold':'Золотые детали',
      'upload-title':'Добавить референс-изображение','upload-hint':'Иногда изображение говорит больше тысячи слов · необязательно','upload-alt':'Предпросмотр вашего изображения',
      'message-label':'Ваша идея, аллергии или особые пожелания','message-placeholder':'Расскажите нам о вашей идее — а также об аллергиях или непереносимости ...','field-note':'К каждому заказу вы получите письменную декларацию ингредиентов и аллергенов.',
      'summary-occasion-label':'Повод','summary-shape-label':'Исполнение','summary-filling-label':'Начинка','summary-price-label':'От','price-note':'Рассчитано по базовой цене CHF 55.–/кг плюс декор — прозрачно и честно.',
      'label-name':'Имя и фамилия','placeholder-name':'Ваше имя','label-email':'Электронная почта','label-date':'Желаемая дата','label-phone':'Телефон (необязательно)','consent':'Я соглашаюсь, что Sweet Home Bakery может использовать мои данные для обработки запроса.',
      'footer-copy':'Домашние торты|и фруктовая пастила|из Гренхена.','footer-social-label':'Следите и находите','footer-contact':'Контакт','footer-google':'Найти в Google','footer-admin':'Вход для администратора','contact-error':'Пожалуйста, укажите имя, e-mail и подтвердите согласие.','contact-success':'Спасибо. Ваш запрос получен. Я лично с вами свяжусь.'
    }
  };
  let language = 'de';
  const translate = key => (copy[language][key] || copy.de[key] || '').split('|').join('<br>');
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = next === 'ua' ? 'uk' : (next === 'ru' ? 'ru' : 'de');
    document.querySelectorAll('.language-button').forEach(button => button.classList.toggle('is-active', button.dataset.language === next));
    const selectors = {
      'nav-collection':'#nav-collection','nav-manufactory':'#nav-manufactory','nav-config':'#nav-config','nav-cta':'.nav-cta-label','nav-admin':'#nav-admin-label',
      'hero-eyebrow':'.hero .eyebrow','hero-title':'.hero h1','hero-intro':'.hero-intro','hero-button':'.hero-button-label','hero-link':'.hero-link-label','hero-note':'.hero-note-copy',
      'hero-stamp-1':'#hero-stamp-1','hero-stamp-2':'#hero-stamp-2','hero-stamp-3':'#hero-stamp-3','hero-pill':'.hero-pill-label',
      'moment2-eyebrow':'#hero-moment-2 .eyebrow','moment2-title':'#hero-moment-2 h2','moment2-copy':'#hero-moment-2 .hero-moment-copy',
      'moment3-caption':'#hero-moment-3 figcaption','moment3-title':'#hero-moment-3 h2',
      'moment4-eyebrow':'#hero-moment-4 .eyebrow','moment4-title':'#hero-moment-4 h2','moment4-copy':'#hero-moment-4 .hero-moment-copy',
      'marquee':'#marquee-text',
      'collection-eyebrow':'#collection-eyebrow','collection-title':'#collection-title','collection-intro':'#collection-intro',
      'collection1-tag':'#collection1-tag','collection2-tag':'#collection2-tag','collection3-tag':'#collection3-tag',
      'collection1-cta':'#collection1-cta','collection2-cta':'#collection2-cta','collection3-cta':'#collection3-cta',
      'values-eyebrow':'#values-eyebrow','values-title':'#values-title','values-intro':'#values-intro',
      'value1-title':'#value1-title','value1-text':'#value1-text','value2-title':'#value2-title','value2-text':'#value2-text','value3-title':'#value3-title','value3-text':'#value3-text','value4-title':'#value4-title','value4-text':'#value4-text',
      'sortiment-eyebrow':'#sortiment-eyebrow','sortiment-title':'#sortiment-title','sortiment-intro':'#sortiment-intro',
      'sortiment1-text':'#sortiment1-text','sortiment1-price':'#sortiment1-price','sortiment2-title':'#sortiment2-title','sortiment2-text':'#sortiment2-text','sortiment2-price':'#sortiment2-price','sortiment3-title':'#sortiment3-title','sortiment3-text':'#sortiment3-text','sortiment3-price':'#sortiment3-price',
      'fruit-eyebrow':'#fruit-eyebrow','fruit-title':'#fruit-title','fruit-copy':'#fruit-copy','fruit-link':'#fruit-link',
      'manufactory-eyebrow':'#manufactory-eyebrow','manufactory-title':'#manufactory-title','manufactory-copy':'#manufactory-copy','manufactory-link':'#manufactory-link',
      'config-eyebrow':'#config-eyebrow','config-title':'#config-title','config-intro':'#config-intro','config-kicker':'.config-kicker',
      'step1-title':'[data-step="1"] h3','step1-desc':'[data-step="1"] .step-description','step2-title':'[data-step="2"] h3','step2-desc':'[data-step="2"] .step-description','step3-title':'[data-step="3"] h3','step3-desc':'[data-step="3"] .step-description','step4-title':'[data-step="4"] h3','step4-desc':'[data-step="4"] .step-description','step5-title':'[data-step="5"] h3','step5-desc':'[data-step="5"] .step-description',
      'sidebar1-label':'#sidebar1-label','sidebar1-sub':'#sidebar1-sub','sidebar2-label':'#sidebar2-label','sidebar2-sub':'#sidebar2-sub','sidebar3-label':'#sidebar3-label','sidebar3-sub':'#sidebar3-sub','sidebar4-label':'#sidebar4-label','sidebar4-sub':'#sidebar4-sub','sidebar5-label':'#sidebar5-label','sidebar5-sub':'#sidebar5-sub','sidebar-foot-location':'#sidebar-foot-location',
      'occasion-wedding':'.choice-grid-occasion [data-value="wedding"] .choice-label','occasion-birthday':'.choice-grid-occasion [data-value="birthday"] .choice-label','occasion-baptism':'.choice-grid-occasion [data-value="baptism"] .choice-label','occasion-anniversary':'.choice-grid-occasion [data-value="anniversary"] .choice-label','occasion-corporate':'.choice-grid-occasion [data-value="corporate"] .choice-label','occasion-other':'.choice-grid-occasion [data-value="other"] .choice-label',
      'shape-round':'.shape-grid [data-value="round"] .choice-label','shape-tiered':'.shape-grid [data-value="tiered"] .choice-label','shape-heart':'.shape-grid [data-value="heart"] .choice-label','shape-custom':'.shape-grid [data-value="custom"] .choice-label',
      'guests-label':'#guests-label',
      'filling-vanilla-name':'.filling[data-value="vanilla-raspberry"] strong','filling-vanilla-desc':'.filling[data-value="vanilla-raspberry"] small',
      'filling-chocolate-name':'.filling[data-value="chocolate-caramel"] strong','filling-chocolate-desc':'.filling[data-value="chocolate-caramel"] small',
      'filling-lemon-name':'.filling[data-value="lemon-elderflower"] strong','filling-lemon-desc':'.filling[data-value="lemon-elderflower"] small',
      'filling-pistachio-name':'.filling[data-value="pistachio-rose"] strong','filling-pistachio-desc':'.filling[data-value="pistachio-rose"] small',
      'label-color':'#label-color','label-decoration':'#label-decoration',
      'color-neutral':'#color-opt-neutral','color-blush':'#color-opt-blush','color-sage':'#color-opt-sage','color-blue':'#color-opt-blue',
      'decoration-flowers':'#decoration-opt-flowers','decoration-minimal':'#decoration-opt-minimal','decoration-fruit':'#decoration-opt-fruit','decoration-gold':'#decoration-opt-gold',
      'upload-title':'#upload-title','upload-hint':'#upload-hint',
      'message-label':'#message-label-text','field-note':'#field-note',
      'summary-occasion-label':'#summary-occasion-label','summary-shape-label':'#summary-shape-label','summary-filling-label':'#summary-filling-label','summary-price-label':'#summary-price-label','price-note':'#price-note',
      'label-name':'#label-name','label-email':'#label-email','label-date':'#label-date','label-phone':'#label-phone','consent':'#consent-text',
      'footer-copy':'.footer-top>p','footer-social-label':'#footer-social-label','footer-contact':'#footer-link-contact','footer-google':'#footer-google','footer-admin':'#footer-admin'
    };
    Object.entries(selectors).forEach(([key, selector]) => { const element = document.querySelector(selector); if (element) element.innerHTML = translate(key); });
    document.querySelector('#footer-link-config').textContent = translate('nav-config');
    document.querySelector('#footer-link-collection').textContent = translate('nav-collection');
    document.title = translate('meta-title');
    const metaDescription = document.querySelector('#meta-description'); if (metaDescription) metaDescription.setAttribute('content', translate('meta-description'));
    document.querySelector('.wordmark').setAttribute('aria-label', translate('aria-home'));
    document.querySelector('.main-nav').setAttribute('aria-label', translate('aria-nav'));
    document.querySelector('.language-switch').setAttribute('aria-label', translate('aria-language'));
    document.querySelector('.menu-toggle').setAttribute('aria-label', translate('aria-menu'));
    document.querySelector('.nav-admin').setAttribute('aria-label', translate('aria-admin'));
    document.querySelector('.marquee').setAttribute('aria-label', translate('aria-marquee'));
    document.querySelector('#hero-fallback-img').alt = translate('hero-fallback-alt');
    document.querySelector('#hero-moment-3 img').alt = translate('moment3-alt');
    document.querySelector('#collection1-img').alt = translate('collection1-alt');
    document.querySelector('#collection2-img').alt = translate('collection2-alt');
    document.querySelector('#collection3-img').alt = translate('collection3-alt');
    document.querySelector('#image-preview').alt = translate('upload-alt');
    document.querySelector('#wish-message').placeholder = translate('message-placeholder');
    document.querySelector('#contact-name').placeholder = translate('placeholder-name');
    panels.forEach(panel => { const n = panel.dataset.step; const countEl = panel.querySelector('.step-count'); if (countEl) countEl.textContent = `${translate('step-count-label')} 0${n} / 05`; });
    updateSummary();
    document.querySelector('.next-button').innerHTML = state.step === 4 ? `${translate('summary')} <span>→</span>` : `${translate('next')} <span>→</span>`;
    document.querySelector('.back-button').innerHTML = `← ${translate('back')}`;
    document.querySelector('.submit-button').innerHTML = `${translate('submit')} <span>↗</span>`;
    document.querySelector('#form-status').textContent = '';
  }
  document.querySelectorAll('.language-button').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));

  function formatPrice() { return Math.ceil(state.guests * 5.5 + state.decorationPrice + state.fillingExtra); }
  function updateSummary() {
    const set = (id, value) => { const el = document.querySelector(id); if (el) el.textContent = value; };
    set('#summary-occasion', translate(`occasion-${state.occasion}`));
    set('#summary-shape', `${translate(`shape-${state.shape}`)} · ${state.guests} ${translate('guests-unit')}`);
    set('#summary-filling', translate(`filling-${state.filling.split('-')[0]}-name`));
    set('#summary-price', `CHF ${formatPrice()}`);
    if (output) output.textContent = `${state.guests} ${translate('guests-unit')}`;
  }
  function renderStep() {
    panels.forEach(panel => panel.classList.toggle('is-visible', Number(panel.dataset.step) === state.step));
    steps.forEach((item, index) => {
      item.classList.toggle('is-active', index + 1 === state.step);
      item.classList.toggle('is-done', index + 1 < state.step);
    });
    document.querySelector('.progress-fill').style.height = `${((state.step - 1) / 4) * 100}%`;
    backButton.hidden = state.step === 1;
    nextButton.hidden = state.step === 5;
    nextButton.innerHTML = state.step === 4 ? `${translate('summary')} <span>→</span>` : `${translate('next')} <span>→</span>`;
    if (state.step === 5) updateSummary();
    setLanguage(language);
    document.querySelector('#konfigurator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => {
    button.closest('.choice-grid').querySelectorAll('.choice').forEach(item => item.classList.remove('is-selected'));
    button.classList.add('is-selected');
    if (button.closest('.choice-grid-occasion')) state.occasion = button.dataset.value;
    if (button.closest('.shape-grid')) state.shape = button.dataset.value;
    updateSummary();
  }));
  document.querySelectorAll('.filling').forEach(item => item.addEventListener('click', () => {
    document.querySelectorAll('.filling').forEach(choice => choice.classList.remove('is-selected'));
    item.classList.add('is-selected');
    const radio = item.querySelector('input');
    radio.checked = true;
    state.filling = radio.value;
    state.fillingExtra = Number(item.querySelector('b').textContent.replace(/[^0-9]/g, '')) || 0;
    updateSummary();
  }));
  range.addEventListener('input', () => { state.guests = Number(range.value); updateSummary(); });
  document.querySelector('#decoration-select').addEventListener('change', event => { state.decoration = event.target.value; state.decorationPrice = decorationPrices[event.target.value] || 0; updateSummary(); });
  document.querySelector('#color-select').addEventListener('change', event => { state.color = event.target.value; });
  nextButton.addEventListener('click', () => { if (state.step < 5) { state.step += 1; renderStep(); } });
  backButton.addEventListener('click', () => { if (state.step > 1) { state.step -= 1; renderStep(); } });
  document.querySelectorAll('.step-list li').forEach((item, index) => item.addEventListener('click', () => { if (index + 1 <= state.step) { state.step = index + 1; renderStep(); } }));
  document.querySelector('#reference-image').addEventListener('change', event => {
    const file = event.target.files[0]; if (!file) return;
    const preview = document.querySelector('#image-preview');
    preview.src = URL.createObjectURL(file); preview.classList.add('is-visible');
    document.querySelector('.upload-zone').classList.add('has-image');
  });
  document.querySelector('#submit-request').addEventListener('click', () => {
    const name = document.querySelector('#contact-name').value.trim();
    const email = document.querySelector('#contact-email').value.trim();
    const consent = document.querySelector('#consent').checked;
    const status = document.querySelector('#form-status');
    if (!name || !email || !consent) { status.textContent = translate('contact-error').replace('<br>',' '); status.className = 'form-status is-error'; return; }
    status.textContent = translate('contact-success').replace('<br>',' ');
    status.className = 'form-status is-success';
    document.querySelector('#submit-request').disabled = true;
  });
  const menuButton = document.querySelector('.menu-toggle');
  menuButton.addEventListener('click', () => { const nav = document.querySelector('.main-nav'); const open = nav.classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.main-nav').classList.remove('is-open')));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  updateSummary();

  // hero scroll moments — fade + rise into view as they near the centre
  // of the viewport while scrolling through the pinned video, fade back
  // out as they pass, for a layered "crossfade" feel over the 3D scene
  const heroMoments = [...document.querySelectorAll('.hero-moment')];
  if (heroMoments.length) {
    let momentsTicking = false;
    function updateMoments() {
      momentsTicking = false;
      const vh = window.innerHeight;
      heroMoments.forEach(el => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - vh / 2);
        const range = vh * 0.85;
        const t = Math.max(0, Math.min(1, 1 - dist / range));
        const eased = t * t * (3 - 2 * t);
        el.style.opacity = eased;
        el.style.transform = `translateY(${(1 - eased) * 26}px) scale(${0.95 + eased * 0.05})`;
      });
    }
    window.addEventListener('scroll', () => { if (!momentsTicking) { momentsTicking = true; requestAnimationFrame(updateMoments); } }, { passive: true });
    window.addEventListener('resize', updateMoments);
    updateMoments();
  }
})();