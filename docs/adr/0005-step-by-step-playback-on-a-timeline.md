# 0005. Step by step playback on a timeline

Date: 2026-10-08
Status: Accepted, supersedes [0003](0003-css-only-playback-animations.md)

## Context

The playtest showed that fights and matches went by too fast to follow. A match showed both final lineups at once and then a quick list of clashes, so it was hard to see why a lane was worth what it was worth, or why the match went the way it did. The ask was to slow it down and explain it, the way the game this is modelled on does: for each lane the base power, then the bonuses, then the lane matchup, and only then the clashes. That needs live numbers that change step by step and a line of commentary per step, which CSS delays from 0003 cannot drive.

## Decision

Playback runs on a small timeline. The result is turned into a list of beats by pure functions in `src/lib/playback.ts`: an intro, then for every lane its base, each side's bonuses and the matchup, then one beat per clash, then the result. A `useTimeline` hook advances through the beats on timers, each beat with its own duration. Everything on screen, the numbers, the bonus chips, which card is in focus, the power left after each clash and the commentary, is derived from the current beat index. Effects such as a flash or a floating number are mounted on their beat and play a short CSS animation once. The backend sends the power breakdown of every lane with the result, since the lineup has already changed by the time it is shown.

The playback bar offers Skip, which jumps to the last beat, and a 2x speed that is remembered in local storage.

## Consequences

Matches now take about twenty seconds at normal speed and read like a short play-by-play, which is the point. Players who already know the rules can double the speed or skip. The timing lives in one table of durations instead of inline delays, and the beat functions can be tested without rendering anything. The cost is a few timers per screen, which the hook clears on every step and on unmount, and a little more code than the CSS approach it replaces.
