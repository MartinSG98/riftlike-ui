# 0004. A generated emblem per champion

Date: 2026-10-08
Status: Accepted, partially supersedes [0002](0002-crests-instead-of-game-art.md)

## Context

After the first playtest the crests from 0002 were the weak spot. A tinted square with two initials and a faint class mark made champions hard to tell apart, especially on the map, where many crests sit next to each other with no names. Two ways out came up: the official champion art, or completely original champions with their own names and portraits. The official art is ruled out by 0002. Renaming every champion would cut the link to the real players, whose signature champions are a large part of the game.

## Decision

Keep the real names and give every champion its own generated emblem. The emblem is drawn in SVG from a hash of the champion's name: a polygon, a star or a framed polygon with three to eight sides and a rotation, an optional inner dot, ring or core, optional rays and small satellite dots, all in an accent color picked against the champion's background hue. The same name always produces the same emblem. Initials remain as a small label on medium and large crests and are dropped on small ones, where the name always sits beside the crest. The class emblem from 0002 is gone, the class is still shown in words on cards and in the roster.

## Consequences

Champions are now distinguishable at a glance, also on the map, and everything on screen remains original. The emblems carry no meaning of their own, they are recognisable rather than descriptive, so a new player still reads names and tooltips. Changing the hash or the shape rules changes every emblem at once, which is fine while nothing outside this app depends on them. Swapping in other art later still means touching only `ChampCrest` and `ChampBanner`.
