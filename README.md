# Kaskáda: dátové centrum ako mestská tepláreň

**Otvorený investičný a politický návrh pre Slovensko.** Modulárne dátové centrum s kvapalinovým chladením, ktorého odpadové teplo je cez CO₂ tepelné čerpadlá dodávané do siete centrálneho zásobovania teplom (CZT). Navrhnuté tak, aby kvalifikovalo na fondy EÚ a aby ho štát mohol prijať ako národný program.

**Stránka:** https://pupno.github.io/kaskada/ · **Repozitár:** https://github.com/Pupno/kaskada

| Fáza 1 (Žilina) | |
|---|---|
| IT výkon | 10 MW, rozšíriteľné na 30 MW |
| Teplo do CZT | 48 GWh/rok, ~5 000 domácností, 8 760 h/rok |
| Vyhnuté emisie | 26,8 kt CO₂e/rok, 670 kt za 25 rokov |
| Investícia | 95 mil. €, grant 40 % (Modernizačný fond, Innovation Fund, Program Slovensko), EIB 44 %, equity 16 % |
| Návratnosť | IRR 13,8 % s grantom, 7,8 % bez grantu |
| Parametre | PUE 1,15 · ERF 0,65 · WUE 0,05 l/kWh · COP 3,4 · 100 % OZE |

## Čo je na stránke

| Stránka | Obsah |
|---|---|
| [Návrh](./index.html) | Investičný prospekt: súhrn, kontext, technický koncept s diagramom tepelnej kaskády, KPI, lokalita, environmentálny dopad, financovanie, ekonomika, harmonogram, riziká, merateľnosť |
| [Kalkulačka](./kalkulacka/) | Interaktívny model: IT výkon → elektrina → rekuperované teplo → tepelné čerpadlo → teplo do CZT → emisie, ekonomika, národný rozsah. Štyri presety vrátane pesimistického bez grantu |
| [Lokality](./lokality/) | Osem slovenských miest hodnotených šiestimi váženými kritériami, interaktívna mapa |
| [Financovanie](./financovanie/) | Sedem zdrojov EÚ a SR, intenzity, harmonogram žiadostí, pravidlá kumulácie a štátnej pomoci |
| [Pre štát](./pre-stat/) | Politický návrh: čo štát získa, osem opatrení s gestorom a nástrojom, národný program do 2035, čo nežiadame, odpovede na námietky |
| [Metodika](./metodika/) | Vzorce, predpoklady, zdroje (EED 2023/1791, taxonómia 2021/2139, ISO/IEC 30134), obmedzenia modelu |
| [EN](./en/) | Anglický súhrn pre Innovation Fund a EIB |

Otvorené dáta: [`data/assumptions.json`](./data/assumptions.json), [`data/locations.json`](./data/locations.json), [`data/funding.json`](./data/funding.json).

## Prečo je to otvorený projekt

Cieľom nie je jeden projekt, ale replikovateľný model. Ktorákoľvek tepláreň, mesto alebo ministerstvo si môže návrh vziať, upraviť predpoklady a použiť pre vlastnú lokalitu. Pripomienky a opravy: issues alebo pull request, pozri [CONTRIBUTING.md](./CONTRIBUTING.md).

## Lokálne spustenie

Stránka nemá build krok. Kalkulačka funguje aj z disku; mapa lokalít načítava JSON, preto potrebuje HTTP:

```bash
python -m http.server 8000
```

a otvorte `http://localhost:8000/`.

## Nasadenie

GitHub Pages cez Actions (`.github/workflows/pages.yml`). V nastaveniach repozitára: Pages → Source → GitHub Actions.

## Licencia a citovanie

Obsah CC BY 4.0, kód MIT ([LICENSE](./LICENSE)). Citácia: [CITATION.cff](./CITATION.cff).

---

# Kaskáda: a data centre as a municipal heating plant

**An open investment and policy proposal for Slovakia.** A modular, liquid-cooled data centre whose waste heat is lifted by CO₂ heat pumps into the district heating network. Structured for EU funding (Modernisation Fund, Innovation Fund, Programme Slovakia, EIB) and designed to be adopted by the state as a national programme: eight cities, ~80 MW IT, ~300 GWh/yr of heat, ~150 kt CO₂e/yr avoided by 2035.

English summary: [`en/`](./en/). Everything else is in Slovak; the data files and the calculator are language-neutral.
