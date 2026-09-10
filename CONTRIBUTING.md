# Ako prispieť

Kaskáda je otvorený projektový návrh. Vítame pripomienky od teplárenských podnikov, samospráv, ministerstiev, akademikov aj verejnosti.

## Čo je najužitočnejšie

1. **Opravy faktov.** Ak máte presnejšie údaje o konkrétnej sústave CZT (inštalovaný výkon, palivový mix, plán odstavenia), otvorte issue s odkazom na zdroj. Dáta sú v `data/locations.json`.
2. **Predpoklady modelu.** Všetky vstupy ekonomického a emisného modelu sú v `data/assumptions.json`. Nesúhlasíte s hodnotou? Navrhnite inú a uveďte prečo.
3. **Financovanie.** Zmeny vo výzvach a intenzitách pomoci: `data/funding.json`.
4. **Preklady a jazyk.** Anglická verzia je v `en/`.

## Postup

- Otvorte issue s popisom, alebo priamo pull request.
- Pri číslach vždy uveďte zdroj (URL, dokument, dátum).
- Stránka nemá build krok: upravte HTML/CSS/JS a otvorte `index.html` v prehliadači. Kalkulačka potrebuje HTTP server (napr. `python -m http.server`), pretože načítava JSON.

## Kódex

Vecne, s úctou, s odkazmi na zdroje. Tento projekt má za cieľ dostať teplo z dátových centier do slovenských miest, nie vyhrať hádku.
