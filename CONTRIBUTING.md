# Ako prispieť

Kaskáda je otvorený projektový návrh. Vítame pripomienky od teplárenských podnikov, samospráv, ministerstiev, akademikov aj verejnosti.

## Chceš sa zapojiť do tímu

Otvorené role, čo ponúkame a ako konzorcium funguje: https://pupno.github.io/kaskada/tim/. Ozvi sa cez issue **„Chcem sa zapojiť“** (Issues → New issue → vyber šablónu). Nepotrebuješ vedieť programovať.

## Čo je najužitočnejšie

1. **Opravy faktov.** Ak máš presnejšie údaje o konkrétnej sústave CZT (inštalovaný výkon, palivový mix, plán odstavenia, letný odber), použi šablónu **„Nová lokalita alebo oprava údajov o meste“**. Dáta sú v `data/locations.json`.
2. **Predpoklady modelu.** Všetky vstupy ekonomického a emisného modelu sú v `data/assumptions.json`, ročný model v `assets/js/model.js`. Nesúhlasíš s hodnotou? Šablóna **„Oprava faktu alebo čísla“**, s uvedením zdroja.
3. **Financovanie.** Zmeny vo výzvach a intenzitách pomoci: `data/funding.json` a `financovanie/index.html`.
4. **Preklady a jazyk.** Anglická verzia je v `en/`.

## Postup

- Issue s popisom, alebo priamo pull request; každý PR sa automaticky priradí zakladateľovi (CODEOWNERS).
- Pri číslach vždy uveď zdroj (URL, dokument, dátum). Bez zdroja čísla nemeníme.
- Číslo v texte a v `data/*.json` musí sedieť; ak meníš jedno, zmeň aj druhé.
- Stránka nemá build krok: uprav HTML/CSS/JS a otvor `index.html` v prehliadači. Kalkulačka a model fungujú aj z disku; mapa lokalít načítava JSON, preto potrebuje HTTP server (napr. `python -m http.server`).

## Kódex

Vecne, s úctou, s odkazmi na zdroje. Tento projekt má za cieľ dostať teplo z dátových centier do slovenských miest, nie vyhrať hádku. Prijatý príspevok je spoluautorstvo pod CC BY 4.0 (obsah) a MIT (kód).
