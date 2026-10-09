# Riftlike UI

React frontend for Riftlike, the 2026 League of Legends World Championship played as a roguelike. Pick a team, walk a map on every match day to level champions and draft new ones, and try to take the roster all the way to the trophy.

This repo is the interface only. The game engine and the API live in [riftlike-backend](https://github.com/MartinSG98/riftlike-backend), which has to be running for the app to do anything.

Architecture decisions are recorded in [docs/adr](docs/adr/README.md), one numbered file per decision.

## Running locally

Requires Node 18 or newer.

```bash
npm install
npm run dev
```

The app starts on http://localhost:5180 and expects the backend on http://127.0.0.1:8010. To point it elsewhere, set `VITE_API_URL` in a `.env` file:

```
VITE_API_URL=http://my-server:8010
```

`npm run build` type-checks and produces a production bundle in `dist/`.

Without a reachable backend the app shows an offline screen with a retry button. Once the catalog loads, everything works.

### Champion art

The champion images are not in the repo. They come from Riot's Data Dragon and go into `public/champions/`, which git ignores:

```
public/champions/
├── icons/<id>.png       square portraits, used in crests
└── splash/<id>_0.jpg    default splash art, used on card banners
```

`<id>` is the champion's Data Dragon id, listed in [champion.json](https://ddragon.leagueoflegends.com/cdn/16.20.1/data/en_US/champion.json). Icons are at `https://ddragon.leagueoflegends.com/cdn/16.20.1/img/champion/<id>.png` and splashes at `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/<id>_0.jpg`. The app runs without the folder too, it then draws each champion's generated emblem instead.

### Team logos

Team logos are not in the repo either. They go into `public/teams/`, which git also ignores, as one PNG per team named after its tag:

```
public/teams/
  GEN.png  HLE.png  T1.png   DK.png
  AL.png   BLG.png  TES.png  IG.png
  G2.png   MKOI.png KC.png
  TLAW.png LYON.png C9.png
  TSW.png  CFO.png  MVK.png
  LOS.png  FUR.png
```

Versions made for dark backgrounds read best, since the badge behind them is dark. A team without a file keeps its tag on the badge, so any subset works.

## What is in the app

**The title screen** starts a new run, continues the one in progress and explains the rules in a modal. The most recent finished runs show as small cards, each with a five stage track of how far it got and how it ended, and a title run glows gold. The run in progress is remembered in local storage, so closing the tab loses nothing.

**Team select** shows the 19 Worlds teams in columns by league, each with its seed in large type and the four Play-In teams marked. Choosing one starts the run straight away. Under the grid, a short road to the trophy explains the stages from the Play-In to the Final.

**The first pick** offers an early, a mid and a late game champion for one of your players. Each card leads with its power now, shows its power at level 16, and marks a signature for that player.

**A match day** is laid out in three columns: your roster on the left, the map in the middle and the next opponent on the right. On narrower screens the opponent moves under the roster, and on a phone everything stacks.

- Across the top of the map, a fan vote turns your team total and theirs into win percentages. The totals leave out the lane counters, which are only worked out in the match, so it is a guide and not a promise.
- The roster shows each champion, its player and level, and its power with the sum of its bonuses underneath and a full breakdown on hover. Drag a row onto another, or click two rows, to swap roles. Empty roles and an all AD or all AP team show as a warning above the rows.
- The map runs from a start diamond down to the match. Lane fights show the enemy champion and its power. While you have empty roles, pick nodes glow and say which role they fill, and a lane fight you cannot field looks like a forfeit. The match is a banner with the opponent and its power, in a faint arena at the bottom. Your walked path glows, and nodes have five looks, explained in a legend: where you stand, visited, open for your next step, further ahead, and out of reach.
- The opponent panel lists their lineup and total. Under both lineups a synergy box lists every duo that gives each other power, with the archetype or known duo behind it and what each of the two gets.

**The roster modal** opens from Roster on your panel or Scout on the opponent's, with a tab for each team. Select a champion to see its level and XP, its power breakdown, who it faces in the next match and whether it counters them, and every champion in its lane that it counters or that counters it.

**Picks** show three champion cards. Each leads with the power it would have in its best role and the gain for the team, then its signature and synergy bonuses as chips, then its focus and roles. The team bar below marks the role each offer fits best with its crest, and hovering a card previews it there. Picking one opens the role chooser, where every slot shows the power the champion would have there, the change to the team total and who would leave. A pick can wait while you look at the map and the roster. Before the Semifinal and the Final the same screen runs three times in a row as a draft.

**Lane fights** play back one step at a time: your champion's base power, the enemy's, your bonuses, the lane matchup, then the clash, where the power bar slides to its final share with a spark where the two powers meet. A victory or defeat banner and the XP each champion earned close it out.

**Matches** play back like a short play-by-play. First every lane builds its power from top to bottom: the base for both sides, then each side's bonuses as chips, then the lane matchup, with the numbers updating as they go and the lane in focus outlined. Then the clashes run one by one. Both cards light up and show the power they lost, the loser greys out, and the winner shows what it has left and moves on to the next enemy. A commentary box under the lanes says what happens at every step. At the end every lane shows the power it brought and what it did, such as "Beat Gnar and Maokai, then fell to Orianna", and the lanes still standing are marked. The result says why in totals, like "won by 25 power, 169 against your 144", followed by the next step and the XP. The play-by-play folds into a toggle under it.

While a fight or a match plays, a bar with its progress, a 2x speed toggle and a Skip button sits under it, and a Continue button takes its place when the playback is done. Space or Enter does whichever is showing. The speed choice is remembered.

**Stage changes** announce the next stage, and when the Swiss stage ended early they list the training XP for the skipped days. **The end of the run** shows the final lineup and every match played.

Every step of a run fades in over 220 ms, so moving from the map into a fight reads as one flow.

## Design

The palette is called Hextech: ink-blue surfaces, electric blue for anything you can act on and for your side, orange-coral for the opponent, and champagne for titles and labels. Each color means one thing. Every gain is green and every loss is in the opponent color. Power values use tabular figures, so the digits do not jitter while they count and columns line up.

The tokens live once in [src/styles/tokens.css](src/styles/tokens.css) as CSS custom properties. Every color comes from there. Components mix their tints, glows and button fills from the tokens with `color-mix()`, so a new palette is a change to that one file. The token names describe roles rather than hues, so `--teal` is still the player color even though it is blue in Hextech. Cinzel, loaded from Google Fonts, carries the display type, and Barlow carries the interface.

Champions use the official art from Data Dragon. Crests show the square portrait, ringed in the color of the champion's early, mid or late focus, and card banners show the splash. If an image is missing, the champion falls back to an abstract emblem generated from its name. [ADR 0006](docs/adr/0006-official-champion-art.md) explains the art, which replaced the art-free crests of [ADR 0002](docs/adr/0002-crests-instead-of-game-art.md) and [ADR 0004](docs/adr/0004-a-generated-emblem-per-champion.md). Teams show their logo on a badge in the team color, or their tag when the logo file is missing, see [ADR 0007](docs/adr/0007-team-logos.md).

Fight and match playback runs on a timeline of beats built from the result, see [ADR 0005](docs/adr/0005-step-by-step-playback-on-a-timeline.md). Effects are short CSS animations that play when their beat arrives, and reduced motion settings turn them off.

The brief written for the Claude Design pass that produced Hextech, with every screen, the data it has to hold and the constraints, is in [docs/design/design-brief.md](docs/design/design-brief.md).

## Structure

```
src/
├── api/          typed client and response types, mirrors the backend
├── components/   crests, badges and icons, top bar with stage tracker,
│                 modal, rules and roster modals, roster panel, map,
│                 fan vote, scout panel, synergy list, champion card,
│                 playback bar, XP list
├── screens/      one screen per step of a run: first pick, map day,
│                 pick, lane fight, match, stage change, end of run
├── pages/        title, team select and the run page
├── state/        the catalog context
├── lib/          formatting helpers, champion art and team logo paths,
│                 emblem generator, playback beats and lane stories,
│                 timeline, saved run id
└── styles/       design tokens and global styles
```

State is plain React. The catalog loads once at startup into a context, the run page holds the current run and swaps it for the response of every action, and the screen shown is picked from the run's pending step. There is no state library, the server is the source of truth.

Riftlike was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project. League of Legends and all related names are trademarks of Riot Games.
