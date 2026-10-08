# 0003. CSS-only playback animations

Date: 2026-10-08
Status: Superseded by [0005](0005-step-by-step-playback-on-a-timeline.md)

## Context

Lane fights and matches are already decided when they reach the client, but showing the result at once takes the tension out of them. The match in particular reads better as a sequence of clashes with champions dropping out one by one. That could be driven by timers in React state or by an animation library.

## Decision

Playback is plain CSS. Every element that appears later carries its delay in a custom property, the clash steps of a match are spaced evenly, and the power bar of a lane fight grows to its final share with a keyframe animation. A Skip button adds one class to the screen that sets all delays to zero. Users who ask for reduced motion get the same instant result.

## Consequences

No timers to clean up, no extra dependency and no re-renders while a playback runs. Skipping is a single class change. The screen is remounted for each new step, which is also what restarts the animations. The trade-off is that the timing lives in a few constants and inline styles rather than in a timeline object, which is fine for two screens but would get awkward if playback grew more elaborate.
