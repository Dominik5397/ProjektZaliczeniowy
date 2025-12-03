# ProjektZaliczeniowy

# Aplikacja Fiszki

Aplikacja webowa do nauki słówek w formie fiszek, napisana w TypeScript bez użycia frameworków.

**Projekt został wykonany przez:** Dominik Burda

## Wymagania

- Node.js (wersja 14 lub nowsza)
- npm lub yarn

## Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

## Uruchomienie

Aby uruchomić aplikację w trybie deweloperskim:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:1234` (domyślny port Parcel).

## Budowanie

Aby zbudować aplikację do produkcji:
```bash
npm run build
```

Zbudowane pliki znajdą się w katalogu `dist/`.

## Struktura projektu

```
projektzaliczeniowy/
├── src/
│   ├── models/          # Modele danych (Card, Deck, Session)
│   ├── storage/         # Obsługa localStorage
│   ├── logic/           # Logika aplikacji (SessionManager, Timer)
│   ├── renderers/       # Renderery widoków (StartView, CardView, SummaryView)
│   ├── data/            # Dane JSON z fiszkami
│   ├── main.ts          # Główny plik aplikacji
│   └── styles.css       # Style CSS
├── index.html
├── package.json
└── tsconfig.json
```

## Funkcjonalności

- ✅ Ekran startowy z informacjami o talii
- ✅ Widok fiszki z możliwością odsłonięcia odpowiedzi
- ✅ Ocena fiszek (Znam / Jeszcze nie)
- ✅ Nawigacja między fiszkami (Poprzednia / Następna)
- ✅ Panel statystyk w trakcie sesji
- ✅ Timer całej sesji i czasu na każdej fiszce
- ✅ Zapis wyników w localStorage
- ✅ Podsumowanie sesji z listą trudnych fiszek
- ✅ Blokady przycisków zależne od stanu aplikacji

## Dane

Fiszki są wczytywane z pliku `src/data/deck.json`. Aplikacja zawiera 25 fiszek z podstawowymi czasownikami angielskimi.

## Technologie

- TypeScript (ES2016)
- Parcel (bundler)
- DOM API (bez frameworków)
- localStorage (przechowywanie danych)

# ProjektZaliczeniowyZAS
