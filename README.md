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

## What is in the app

**The title screen** starts a new run, continues the one in progress, explains the rules in a modal and lists the most recent finished runs. The run in progress is remembered in local storage, so closing the tab loses nothing.

**Team select** shows the 19 Worlds teams in columns by league, with the four Play-In teams marked. Choosing one starts the run straight away.

**The first pick** offers an early, a mid and a late game champion for one of your players, with their power now and at level 16, and marks any that are that player's signature.

**A match day** has the roster on the left and the map on the right. The roster shows each player, their champion and level, the champion's power with a breakdown on hover and the bonus on top of the base number. Drag a row onto another, or click two rows, to swap roles. The map is a set of connected nodes from a start diamond down to the match. Lane fights show the enemy champion and its power, picks show a plus, and the nodes you can step on next glow. Under the map the scout panel lists the next opponent's lineup and compares their total power with yours.

**Picks** show three champion cards with their focus, roles, signature bonuses and duo synergies with the current team. Hovering a card previews it in its best role along the team bar below. Picking one opens the role chooser, where every slot shows the power the champion would have there, the change to the team total and who would leave. Before the Semifinal and the Final the same screen runs three times in a row as a draft.

**Lane fights** play back as a power bar sliding to its final share, the matchup bonus, the margin and a victory or defeat banner, followed by the XP each champion earned.

**Matches** list both lineups lane by lane, then play the clashes one after another while beaten champions grey out, and finish with the result, the next step and the XP. Both playbacks can be skipped.

**Stage changes** announce the next stage, and when the Swiss stage ended early they list the training XP for the skipped days. **The end of the run** shows the final lineup and every match played.

## Design

Dark navy surfaces with gold for titles and highlights, teal for anything you can act on and red for the opponent. The tokens live once in [src/styles/tokens.css](src/styles/tokens.css) as CSS custom properties, and components never use raw hex values. Cinzel, loaded from Google Fonts, carries the display type, and Barlow carries the interface.

There is no game art. Champions are drawn as crests, tinted per champion, ringed in the color of their early, mid or late focus and marked with a class emblem, and teams are their tag on a badge in the team color. The reasoning is in [ADR 0002](docs/adr/0002-crests-instead-of-game-art.md).

Fight and match playback is plain CSS, with a delay per element and one class that skips to the end. Reduced motion settings get the result at once.

## Structure

```
src/
├── api/          typed client and response types, mirrors the backend
├── components/   crests, badges and icons, top bar with stage tracker,
│                 rules modal, roster panel, map, scout panel,
│                 champion card, XP list
├── screens/      one screen per step of a run: first pick, map day,
│                 pick, lane fight, match, stage change, end of run
├── pages/        title, team select and the run page
├── state/        the catalog context
├── lib/          formatting helpers and the saved run id
└── styles/       design tokens and global styles
```

State is plain React. The catalog loads once at startup into a context, the run page holds the current run and swaps it for the response of every action, and the screen shown is picked from the run's pending step. There is no state library, the server is the source of truth.

Riftlike is a fan project. It is not affiliated with or endorsed by Riot Games. League of Legends and all related names are trademarks of Riot Games.
