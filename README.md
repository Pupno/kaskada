# Kaskáda: dátové centrum ako mestská tepláreň

**Otvorený investičný a politický návrh pre Slovensko.** Modulárne dátové centrum s kvapalinovým chladením, ktorého odpadové teplo je cez CO₂ tepelné čerpadlá dodávané do siete centrálneho zásobovania teplom (CZT). Navrhnuté tak, aby kvalifikovalo na fondy EÚ a aby ho štát mohol prijať ako národný program.

**Stránka:** https://pupno.github.io/kaskada/ · **Repozitár:** https://github.com/Pupno/kaskada

| Fáza 1 (Žilina) | |
|---|---|
| IT výkon | 10 MW, rozšíriteľné na 30 MW |
| Teplo do CZT | 48 GWh/rok, ~5 000 domácností, 8 760 h/rok |
| Usporené emisie | 26,8 kt CO₂e/rok, 670 kt za 25 rokov |
| Investícia | 95 mil. €, grant 40 % (Modernizačný fond, Innovation Fund, Program Slovensko), úver EIB 44 %, vlastný kapitál 16 % |
| Návratnosť | IRR projektu ~11,7 % (grant 40 %), ~8,5 % (grant 15 %, len tepelná časť), ~7,3 % bez grantu; z otvoreného 25-ročného modelu |
| Prvý krok | Fáza 0: kontajner 300 kW pri mestskej plavárni, 0,35 až 0,45 mil. €, bez licencie ÚRSO, výsledok za sezónu |
| Cena tepla | náklad ~52 €/MWh (elektrina / (COP − 1) + kapitál TČ) vs. regulovaný plyn 93,4 €/MWh (ÚRSO 2025) |
| Parametre | PUE 1,15 · ERF 0,65 · WUE 0,05 l/kWh · COP 3,4 · 100 % OZE |

## Čo je na stránke

| Stránka | Obsah |
|---|---|
| [Návrh](./index.html) | Investičný prospekt: súhrn a stav projektu, kontext so slovenskými trhovými číslami a precedensmi (Infomaniak D4, Stockholm, Deep Green), technický koncept s diagramom a riadiacim vzorcom ceny tepla, KPI, lokalita, environmentálny dopad, financovanie s dvoma scenármi grantov, regulačná mapa (657/2004, ÚRSO, pripojenie, EIA, EED), ekonomika, partneri a kapitál, harmonogram s fázou 0, riziká a kritériá ukončenia, merateľnosť |
| [Kalkulačka](./kalkulacka/) | Rýchly model: IT výkon → elektrina → rekuperované teplo → tepelné čerpadlo → teplo do CZT → emisie, náklad tepla, jednoduchá návratnosť, národný rozsah. Šesť prednastavených scenárov vrátane pilotu 300 kW |
| [Model](./model/) | Otvorený 25-ročný cash-flow model: 25 vstupov, IRR projektu aj vlastného kapitálu, NPV, návratnosť, DSCR po rokoch, príjem holdingu pôvodcu (odmena za prípravu, licenčný poplatok, nesený podiel), tri grafy so spoločným krížom, tabuľka po rokoch, export do .xlsx a .csv |
| [Lokality](./lokality/) | Jedenásť slovenských miest (šesť MHTH) hodnotených šiestimi váženými kritériami, vlastník CZT, kandidáti na fázu 0, interaktívna mapa |
| [Financovanie](./financovanie/) | Dvanásť nástrojov EÚ a SR vrátane ELENA/TARGET, EBRD/SIH a schémy pre účinné CZT; tri scenáre grantov; čo granty nefinancujú; pravidlá kumulácie a štátnej pomoci |
| [Pre štát](./pre-stat/) | Politický návrh: čo štát získa (vrátane toho, že cez MHTH už vlastní odberateľa), deväť opatrení s gestorom a nástrojom, národný program do 2035, čo nežiadame, odpovede na námietky vrátane cenového auditu ÚRSO |
| [Dokumenty](./dokumenty/) | [Materiál na rokovanie](./dokumenty/material/) (predkladacia správa, návrh uznesenia s deviatimi úlohami, doložka vybraných vplyvov s fiskálnou bilanciou: ~3,6 € verejných príjmov za 1 € grantu SR za 25 rokov) a [šablóny](./dokumenty/sablony/) memoranda o spolupráci, LOI na odber tepla, term sheetu 15-ročnej zmluvy o dodávke tepla a zakladateľskej a licenčnej dohody pôvodcu projektu (HTML aj Markdown) |
| [Tím](./tim/) | Osem otvorených rolí s prvou úlohou a ponukou, ako konzorcium funguje, ako sa zapojiť (issue šablóny) |
| [Metodika](./metodika/) | Vzorce, predpoklady, zdroje (EED 2023/1791, taxonómia 2021/2139, ISO/IEC 30134), obmedzenia modelu |
| [EN](./en/) | Anglický súhrn pre Innovation Fund a EIB |

Otvorené dáta: [`data/assumptions.json`](./data/assumptions.json), [`data/locations.json`](./data/locations.json), [`data/funding.json`](./data/funding.json).

## Prečo je to otvorený projekt

Cieľom nie je jeden projekt, ale replikovateľný model. Ktorákoľvek tepláreň, mesto alebo ministerstvo si môže návrh vziať, upraviť predpoklady a použiť pre vlastnú lokalitu. Pripomienky a opravy: issues alebo pull request, pozri [CONTRIBUTING.md](./CONTRIBUTING.md).

## Zapoj sa

Konzorcium je v zakladaní a hľadá právnika pre štátnu pomoc a reguláciu ÚRSO, teplárenského inžiniera, partnera v meste alebo teplárni, grantového konzultanta, finančníka, prevádzkovateľa dátových centier, človeka pre verejné politiky a vývojára. Čo ponúkame a ako to funguje: [tim/](./tim/). Prihlásenie: Issues → New issue → **Chcem sa zapojiť**.

## Lokálne spustenie

Stránka nemá build krok. Kalkulačka funguje aj z disku; mapa lokalít načítava JSON, preto potrebuje HTTP:

```bash
python -m http.server 8000
```

a otvorte `http://localhost:8000/`.

## Nasadenie

GitHub Pages cez Actions (`.github/workflows/pages.yml`). V nastaveniach repozitára: Pages → Source → GitHub Actions.

## Licencia, citovanie, poďakovanie

Obsah CC BY 4.0, kód MIT ([LICENSE](./LICENSE)). Citácia: [CITATION.cff](./CITATION.cff).

Trhové údaje o Slovensku (ceny tepla ÚRSO, štruktúra MHTH, veľkosť trhu dátových centier), precedens Infomaniak D4, malý pilot podľa Deep Green, regulačná mapa a časť zdrojov sú prevzaté z otvoreného výskumného materiálu [HeatCloud Slovakia](https://github.com/Mild-Solvent/heatcloud-slovakia) (Mild-Solvent, 2026). Ďakujeme.

---

# Kaskáda: a data centre as a municipal heating plant

**An open investment and policy proposal for Slovakia.** A modular, liquid-cooled data centre whose waste heat is lifted by CO₂ heat pumps into the district heating network. Structured for EU funding (Modernisation Fund, Innovation Fund, Programme Slovakia, EIB) and designed to be adopted by the state as a national programme: eight cities, ~80 MW IT, ~300 GWh/yr of heat, ~150 kt CO₂e/yr avoided by 2035.

English summary: [`en/`](./en/). Everything else is in Slovak; the data files and the calculator are language-neutral.
