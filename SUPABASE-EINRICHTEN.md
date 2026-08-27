# Abgleich zwischen Handy und Computer einrichten

> **Stand 25. August 2026 — alles eingerichtet bis auf die zwei Zugänge.**
>
> Projekt: `shb` (MarcelVivo's Org, Irland)
> Adresse: `https://qzybjnkjloyksksybnrt.supabase.co`
> Gemeinsames Konto: `b2e27937-775d-446e-a85d-ea150f9065fd`
>
> Angelegt und geprüft: Tabelle `shb_daten`, Zugriffsschutz, vier Regeln,
> Zeitstempel-Auslöser, Tabelle `shb_zugang`, Funktion `shb_konto()` und der
> Auslöser, der die beiden Adressen beim Anlegen automatisch freischaltet.
> Beide öffentlichen Werte stehen in `sync-config.js`.
>
> **Offen: die zwei Benutzer anlegen** — siehe Schritt 3. Das machst du
> selbst; ein Konto mit Passwort gehört nicht in meine Hand.


Damit Olena und Marcel auf allen Geräten dieselben Zahlen sehen, braucht es
eine Datenbank. Wir nehmen Supabase — in Europa gehostet, und die App spricht
direkt mit ihr, ohne dass ein weiterer Server dazwischensteht.

**Zwei Zugänge, ein Konto.** Jeder meldet sich mit eigener Adresse und eigenem
Passwort an; die Daten hängen aber nicht an der Person, sondern an einem
gemeinsamen Konto. Wer dazugehört, steht in `shb_zugang`. Wer nicht
dazugehört, sieht nichts — das entscheidet die Datenbank, nicht die App.

---

## 1 · Konto und Projekt anlegen

1. Auf [supabase.com](https://supabase.com) gehen → **Start your project**
2. Mit GitHub anmelden (dein bestehendes Konto genügt)
3. **New project**
   - **Name:** `shb-kalkulator`
   - **Database Password:** Supabase schlägt eines vor — **kopiere es in deinen
     Passwortmanager**. Du brauchst es später kaum, aber es lässt sich nicht
     nachträglich anzeigen.
   - **Region:** `Central EU (Frankfurt)` — am nächsten an der Schweiz
   - **Plan:** Free
4. **Create new project**, dann ein bis zwei Minuten warten

---

## 2 · Tabelle anlegen

Links in der Seitenleiste auf **SQL Editor** → **New query**. Den folgenden
Block vollständig einfügen und auf **Run** klicken.

```sql
-- Ablage für alle Daten der App. Jede Zeile gehört einem Konto –
-- nicht einer Person. Mehrere Personen können auf dasselbe Konto zugreifen.
create table if not exists shb_daten (
  konto      uuid        not null,
  schluessel text        not null,
  wert       jsonb       not null,
  geaendert  timestamptz not null default now(),
  primary key (konto, schluessel)
);

-- Wer darf auf welches Konto?
create table if not exists shb_zugang (
  person uuid primary key references auth.users(id) on delete cascade,
  konto  uuid not null,
  name   text
);
alter table shb_zugang enable row level security;
create policy "eigenen zugang lesen" on shb_zugang
  for select using (auth.uid() = person);

-- Nachschlagen, zu welchem Konto die angemeldete Person gehört.
create or replace function shb_konto() returns uuid
  language sql stable security definer set search_path = public
as $fn$ select konto from shb_zugang where person = auth.uid() $fn$;

-- Zugriffsschutz einschalten: ohne Regel sieht niemand etwas.
alter table shb_daten enable row level security;

-- Gelesen und geändert wird nur, was zum eigenen Konto gehört.
create policy "kontodaten lesen"    on shb_daten
  for select using (konto = shb_konto());
create policy "kontodaten anlegen"  on shb_daten
  for insert with check (konto = shb_konto());
create policy "kontodaten aendern"  on shb_daten
  for update using (konto = shb_konto()) with check (konto = shb_konto());
create policy "kontodaten loeschen" on shb_daten
  for delete using (konto = shb_konto());

-- Zeitstempel bei jeder Änderung mitführen, damit der Abgleich weiss,
-- welche Fassung die neuere ist.
create or replace function shb_stempel() returns trigger as $st$
begin
  new.geaendert = now();
  return new;
end $st$ language plpgsql;

drop trigger if exists shb_stempel_trigger on shb_daten;
create trigger shb_stempel_trigger before update on shb_daten
  for each row execute function shb_stempel();

-- Die beiden Adressen werden beim Anlegen automatisch freigeschaltet.
create or replace function shb_zugang_setzen() returns trigger
  language plpgsql security definer set search_path = public
as $fn$
begin
  if lower(new.email) in ('elenabondarenko1806@gmail.com','kontakt@marcelspahr.ch') then
    insert into shb_zugang (person, konto, name)
    values (new.id, 'b2e27937-775d-446e-a85d-ea150f9065fd'::uuid, lower(new.email))
    on conflict (person) do update
      set konto = excluded.konto, name = excluded.name;
  end if;
  return new;
end $fn$;

drop trigger if exists shb_zugang_trigger on auth.users;
create trigger shb_zugang_trigger after insert on auth.users
  for each row execute function shb_zugang_setzen();
```

Es sollte **Success. No rows returned** erscheinen.

---

## 3 · Die zwei Zugänge anlegen

Seitenleiste → **Authentication** → **Users** → **Add user** →
**Create new user**. Zweimal, einmal je Adresse:

| Email | |
|---|---|
| `elenabondarenko1806@gmail.com` | Olena |
| `kontakt@marcelspahr.ch` | Marcel |

Dabei je ein Passwort vergeben und **Auto Confirm User** einschalten — sonst
muss erst eine Bestätigungsmail geöffnet werden. Die Passwörter lassen sich
später in Supabase ändern.

Um die Freischaltung musst du dich nicht kümmern: der Auslöser aus Schritt 2
trägt beide Adressen automatisch ins gemeinsame Konto ein. Prüfen kannst du
es mit

```sql
select name, konto from shb_zugang;
```

Es sollten zwei Zeilen mit **demselben** Konto erscheinen.

Wer sich anmeldet, ohne in `shb_zugang` zu stehen, sieht nichts und kann
nichts schreiben. Die App sagt in dem Fall «dieser Zugang ist noch nicht
freigeschaltet», statt still ein leeres Fenster zu zeigen.

Unter **Authentication → Providers → Email** kann «Confirm email» ausgeschaltet
werden, damit später keine Bestätigungsmails nötig sind.

---

## 4 · Die zwei Werte an mich

Seitenleiste → **Project Settings** (Zahnrad unten) → **API Keys**. Dort stehen:

- **Project URL** — hier `https://qzybjnkjloyksksybnrt.supabase.co`
- **Publishable key** — beginnt mit `sb_publishable_…`

Supabase hat inzwischen auf neue Schlüssel umgestellt. Der frühere
`anon`-Schlüssel (`eyJ…`) steht noch unter **Legacy anon, service_role API
keys** und funktioniert weiterhin; wir nehmen den neuen.

**Diese beiden Werte darfst du mir schicken.** Sie sind dafür gemacht, im
Browser jedes Besuchers zu stehen, und geben ohne Anmeldung keinen Zugriff auf
Daten — dafür sorgen die Regeln aus Schritt 2.

**Nicht schicken:** den `service_role` key und das Datenbank-Passwort. Diese
beiden umgehen jeden Schutz.

---

## 5 · Was danach passiert

Die zwei Werte stehen in `sync-config.js`. In den Einstellungen der App gibt
es den Abschnitt **Konto und Abgleich**. Jeder meldet sich dort einmal je
Gerät an — Olena auf ihrem Handy und am Computer, Marcel auf seinen Geräten.
Ab dann sehen alle dasselbe.

Was der Abgleich leistet:

- Änderungen wandern in beide Richtungen, meist innerhalb weniger Sekunden
- Ohne Empfang arbeitet die App normal weiter und gleicht ab, sobald wieder
  Netz da ist
- Die Daten liegen zusätzlich weiterhin im Gerät — fällt die Datenbank aus,
  ist nichts verloren
- Ändern zwei Geräte dieselbe Sache, gewinnt die neuere Änderung

Was er **nicht** leistet: es gibt keine getrennten Rechte. Beide Zugänge
dürfen alles, auch löschen. Für zwei Menschen, die zusammen einen Betrieb
führen, ist das richtig; wer nur zuschauen soll, bekommt keinen Zugang.

Ein dritter Zugang lässt sich jederzeit nachtragen:

```sql
insert into shb_zugang (person, konto, name)
select id, 'b2e27937-775d-446e-a85d-ea150f9065fd'::uuid, lower(email)
  from auth.users where lower(email) = 'neue.adresse@example.ch';
```

Was sich damit erledigt:

- Safari löscht keine Daten mehr weg, die nur lokal lagen
- Das Speicherlimit von rund fünf Megabyte fällt weg — Belegfotos und PDF
  passen bequem hinein
- Es gibt eine echte Sicherung ausserhalb ihrer Geräte

---

## Kosten und Grenzen

Der freie Tarif umfasst 500 MB Datenbank und 1 GB Dateispeicher. Ihr
Belegvolumen liegt um Grössenordnungen darunter. Supabase pausiert Projekte,
die **eine Woche lang gar nicht** benutzt werden; beim nächsten Öffnen laufen
sie von selbst wieder an, es dauert dann einige Sekunden länger. Wer täglich
bucht, merkt davon nichts.
