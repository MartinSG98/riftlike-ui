# 0006. Official champion art

Date: 2026-10-09
Status: Accepted, partially supersedes [0002](0002-crests-instead-of-game-art.md) and [0004](0004-a-generated-emblem-per-champion.md), partially superseded by [0007](0007-team-logos.md)

## Context

The generated emblems from 0004 made champions distinguishable, but they still had to be learned. Players of the game already know every champion by its portrait, and the cards and the map read much faster when they can rely on that. 0002 ruled the official art out because it belongs to Riot Games and would make Riftlike look like something it is not. Riot's "Legal Jibber Jabber" policy allows fan projects to use its game assets as long as the project stays free and non-commercial, carries Riot's notice and does not present itself as official. Riftlike already meets those terms and keeps its own name and design, so the art no longer makes it pass for anything else.

The art also has a size. The Data Dragon set for one patch (square icons, loading art and splash art for 157 champions) comes to about 38 MB.

## Decision

Champions use the official art from Riot's Data Dragon, patch 16.20.1. Crests show the square icon, still ringed in the color of the champion's focus and still carrying the level badge. Card banners show the default splash. `src/lib/art.ts` turns a champion's display name into its Data Dragon id, which is usually the name without spaces and punctuation, with a short list for the names that differ, such as Wukong, whose id is MonkeyKing.

The images live in `public/champions/` but are not committed. That folder is in `.gitignore`, and the README says how to download it. Binary files of that size would stay in the history of the repo forever, and a public repo that ships Riot's files is redistributing them, while every developer can get the same files from Data Dragon directly.

The generated emblem from 0004 stays as the fallback. When an image fails to load, the crest and the banner draw the emblem and the initials exactly as before. Teams and players are unchanged from 0002: a tag on a badge in the team color and initials in a circle, with no logos or photos.

The README carries the notice in the wording Riot asks for.

## Consequences

Champions are recognisable at a glance on every screen, the map included. The project now depends on Riot's policy, so it has to stay free and non-commercial, and Riot can withdraw the permission at any time. A fresh clone shows emblems everywhere until the art is downloaded, which keeps the app working but looks like the old version. The same goes for a build made on a machine without the folder, since Vite copies only what is in `public/`. Moving to a new patch means downloading the set again, and a champion added in the backend before its art exists simply shows its emblem.
