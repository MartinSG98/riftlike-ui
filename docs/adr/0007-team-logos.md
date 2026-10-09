# 0007. Team logos

Date: 2026-10-09
Status: Accepted, partially supersedes [0006](0006-official-champion-art.md)

## Context

Since 0006 the champions show their official art, but the teams were still a tag on a colored badge. Players who follow the scene know the teams by their logos at least as well as by their tags, and the badge shows up on almost every screen: the top bar, both side panels, the fan vote, the match node, team select and the recent runs. The logos belong to the teams, not to Riot Games, so Riot's fan policy does not cover them the way it covers the champion art.

## Decision

Badges show a team's logo when there is a file for it, and the tag otherwise. The files go into `public/teams/`, one PNG per team named after its tag, such as `GEN.png`. `logoUrl` in `src/lib/art.ts` builds the path, and the badge falls back to the tag when the image fails to load, the same way the champion crest falls back to its emblem.

The folder is in `.gitignore`, for the same reason as the champion art. A public repo that ships the logos is redistributing them, and anyone running the project can add their own. The badge keeps its shape and the team color around the logo, so a set with only some logos still looks like one design.

## Consequences

Teams are recognisable at a glance wherever a badge appears. A fresh clone shows tags everywhere until logos are added, and the browser logs a missing file for each team without one. Logos made for light backgrounds can disappear on the dark badge, so the README asks for dark background versions.
