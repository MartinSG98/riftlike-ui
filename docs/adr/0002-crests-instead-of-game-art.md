# 0002. Crests instead of game art

Date: 2026-10-08
Status: Accepted, partially superseded by [0004](0004-a-generated-emblem-per-champion.md)

## Context

The game this is modelled on shows champion splash art, champion icons, team logos and player photos on nearly every screen. That art belongs to Riot Games and the teams. Using it would make Riftlike look closer to the original, and also make it look like something it is not.

## Decision

No game art at all. A champion is drawn as a crest: a square tinted with a hue derived from the champion's name, the first letters of the name, a faint emblem for its class (fighter, mage, assassin, tank, marksman or enchanter) and a ring in the color of its early, mid or late focus. Card banners are the same idea at a larger size. Teams are their tag on a badge in the team's color, and players are their initials. Role icons are simple shapes drawn for this project.

## Consequences

Everything on screen is original, and the project can be shown publicly without borrowing anyone's assets. The crests carry information the art did not, since focus and class are readable at a glance, and every champion stays recognisable by name. What is lost is the instant recognition of a familiar splash. If that is ever wanted, the crest component is the single place where an image source would go.
