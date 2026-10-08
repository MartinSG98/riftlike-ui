# Riftlike, design brief for the next visual pass

## What the app is

Riftlike is the 2026 League of Legends World Championship played as a roguelike, in the browser. The player picks one of the 19 teams at Worlds and takes it through the event. Every match day is a small branching map: walk it from top to bottom, win lane fights to level champions up, take new champions from pick nodes, then play the match against a real Worlds roster waiting at the bottom. Three Swiss wins reach the Quarterfinals, and from there one loss ends the run. Before the Semifinal and the Final there is no map, just a three-pick draft.

The audience is people who follow League esports. They know the players, the champions and the tournament format. They do not need the game explained like a tutorial, but they do want to read the numbers quickly, because every choice is a small optimisation: which node to walk to, which champion to take and into which role.

Single player, no accounts, desktop first, responsive down to a phone.

The frontend is React with Vite and TypeScript, styled with CSS modules on top of one tokens file of CSS custom properties. The design should be componentized accordingly. Every rule and number comes from the API, the client only renders.

## What to keep

The current look works and the next pass should evolve it, not replace it.

- A dark arena feel: deep navy surfaces, gold for titles and highlights, teal for anything the player can act on, red for the opponent.
- A display serif with small caps for big titles (currently Cinzel) and a compact sans for the interface (currently Barlow).
- The three-column match day: roster on the left, the map centered, the next opponent on the right.
- The playback of fights and matches: a progress bar with Skip while it plays, Continue once it is done, Space or Enter for both.

## Hard constraint: no game art

No champion splash art, icons or portraits, no team logos, no player photos, nothing taken from Riot Games or the teams, and nothing drawn to resemble their characters. Everything visual has to be original.

Champions are shown as crests. Each crest is a rounded square tinted with a hue from the champion's name, with a generated geometric emblem (a polygon, star or framed polygon with its own sides, rotation, inner mark, rays and accent color), a ring in the color of the champion's focus (early, mid or late game), a level badge in the corner and, on larger sizes, the initials. Teams are their short tag (GEN, T1, BLG, TLAW...) on a badge in the team color. Players are their initials in a circle.

The design is welcome to restyle the crest, the badges and the emblem drawing completely, as long as they stay original, abstract and generated from data. Please design crest sizes from 22px (inline lists) to about 92px (detail views), and a wide banner variant for the top of champion cards.

## What to improve

Notes from playtesting and from looking at the current screens:

- **Hierarchy.** Many screens give everything the same weight. The one number that matters at each step should stand out: on the map the power of your champion against the node's enemy, on a pick card the power in the best role and the gain for the team, in a match the two team totals.
- **The map.** It is the heart of the game and should feel like a place, not a diagram. The five node states (where you stand, visited, can step on next, further ahead, out of reach) must be readable at a glance. Lane fight nodes need the enemy champion, its power and the lane, pick nodes need to look inviting, and the match node at the bottom should feel like the destination.
- **Density in side panels.** The roster and scout panels pack a role icon, a player, a crest, a champion, a power box and a bonus into one row. They need a calmer layout that still fits five rows without scrolling on a laptop screen.
- **Cards.** Pick cards should lead with power and fit (signature bonus, duo synergy) and keep focus and roles secondary.
- **Playback.** Fights and matches have light animations now (a spark where the two powers meet, cards that flash, shake and grey out, damage numbers that float up, log lines that slide in). They could be more satisfying without getting slower. Each match playback should stay under about eight seconds.
- **Consistency.** Buttons, chips and badges grew one screen at a time. One coherent set is needed: primary, secondary, ghost, small, chip, pill, tag, badge.
- **Mobile.** Everything works on a phone today but was not designed for it. The map and the match lanes deserve a real mobile layout.

## Screens

1. **Title.** Wordmark, one line on what the game is, New run, Continue (only when a run is in progress, shows the team), How it works, a short list of recent finished runs with their result, and the fan-project disclaimer.
2. **Team select.** 19 teams in six league columns (LCK, LPL, LEC, LCS, LCP, CBLOL), each with its seed. Four teams are marked Play-In. Choosing a team starts the run at once.
3. **First pick.** Three champion cards for one player's role: one early, one mid and one late game option, each with its power now and at level 16. A card can carry a signature bonus for that player.
4. **Match day.** Top bar with the stage tracker (Play-In, Swiss with the record, Quarters, Semis, Final). Left: the roster with five role rows, total power, warnings (empty roles, all AD or all AP) and drag or click to swap roles, plus a Roster button. Center: the day label and the map with six rows of two to four nodes and a legend. Right: the next opponent with their five champions and powers, their total against yours, plus a Scout button.
5. **Pick.** Three cards and a team bar of the five roles below. Hovering a card shows where it fits best. Picking opens a role chooser in the team bar, where each slot shows the power there, the change to the team total and who would be replaced. A Skip option. The same screen is reused for the pre-match draft, three picks in a row, with a "pick 2 of 3" indicator.
6. **Lane fight.** One lane, your champion against an enemy. Power on both sides, the bonuses that applied, a bar showing the balance, the counter bonus if any, the verdict (victory, defeat, even trade or forfeit) and the XP each champion earned.
7. **Match.** Both lineups lane by lane, a log of the clashes in order (each line says who beat whom and how much power is left), the verdict, what happens next (next Swiss round, through to a stage, eliminated) and the XP.
8. **Stage change.** A short interstitial between stages. When the Swiss stage ends early, it lists the training XP for the skipped days.
9. **Ready to play.** Before the Semifinal and the Final, after the draft: the roster, the opponent and one big Play button.
10. **End of run.** World Champions, or the stage where the run ended. The final lineup and every match played with its result.
11. **Roster modal.** Tabs for your team and the opponent. The lineup on one side. The selected champion on the other: level and XP, power breakdown, the lane opponent in the next match with the matchup verdict, and two lists of champions it counters and champions that counter it, each with a +1 or +2.
12. **How it works modal.** About seven short paragraphs of rules.
13. **Offline screen.** Shown when the API is not reachable, with a retry.

## Data the design must hold

- Champion names from short to long: "Vi", "Kai'Sa", "Twisted Fate", "Nunu & Willump".
- Team names up to "Team Liquid Alienware", tags of two to four letters, player names up to "BrokenBlade" and "Hans Sama".
- Champion power roughly 15 to 90, team totals roughly 100 to 350, levels 1 to 20.
- Bonuses: signature +1 to +5, duo synergy -3 to +6, off-role -6, all AD or all AP -3, lane counter +1 or +2.
- Counter lists of up to about 25 champions each.
- A match log of five to ten lines.

## Interaction and motion

- Hover previews on pick cards and power boxes (the power box shows a breakdown on hover or focus).
- Drag and drop between roster rows, with a click-click fallback.
- Keyboard: Space or Enter skips playback and then continues. Escape closes dialogs.
- Every animation must respect reduced motion, which shows the end state at once.
- Visible focus states everywhere, and text contrast at WCAG AA or better on the dark surfaces.

## What to deliver

The same shape as the last project: an HTML mockup with every screen above as a frame at desktop width, the match day, a fight, a match and the roster modal also at phone width, plus handoff notes listing the tokens (colors, type scale, spacing, radii, shadows), every component with its states, and the animation timings.
