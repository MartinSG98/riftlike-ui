# 0001. A thin client over the game API

Date: 2026-10-08
Status: Accepted

## Context

The game rules live in riftlike-backend, which decides every outcome and rejects moves that do not fit the current step. The client still has to show a lot of rule-dependent detail: a power breakdown on hover, which map nodes can be entered, where an offered champion fits best and how the team total would change in each role.

## Decision

The client holds no game logic. Each action is posted to the API, and the response is the complete run, including everything derived from the rules, which the client renders as it is. The run page picks a screen from the run's pending step and remounts it whenever the step changes. The only local state is presentation: which card is hovered, which roster row is selected for a swap, whether a playback was skipped.

## Consequences

There is nothing to keep in sync with the backend apart from the response types in `src/api/types.ts`. A reload restores the exact screen the player was on, because the screen comes from the saved run. Every click waits for a round trip, which is not noticeable on a local server, and buttons are disabled while a request is in flight so a double click cannot send an action twice.
