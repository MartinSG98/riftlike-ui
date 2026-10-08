// Turns a match result into a sequence of beats the match screen plays one at a time:
// every lane builds its power (base, then bonuses, then the matchup), then the clashes
// run in order. Pure functions, so what is on screen at any beat is easy to derive.

import type { LaneSide, MatchResult, PowerPart } from "../api/types";

export type Side = "us" | "them";

export type MatchBeat =
  | { kind: "intro"; ms: number }
  | { kind: "base"; lane: number; ms: number }
  | { kind: "bonus"; lane: number; side: Side; ms: number }
  | { kind: "counter"; lane: number; side: Side; ms: number }
  | { kind: "clash"; step: number; ms: number }
  | { kind: "result"; ms: number };

const MS = { intro: 1600, base: 1100, bonus: 1000, counter: 1000, clash: 1700, result: 800 };

export const isBase = (p: PowerPart) => p.kind === "level" || p.kind === "focus";

export function baseOf(lane: LaneSide): number {
  if (!lane.champ) return 0;
  // Results saved before breakdowns existed have no parts, show their power as the base.
  if (!lane.parts?.length) return lane.power - lane.counter;
  return lane.parts.filter(isBase).reduce((sum, p) => sum + p.value, 0);
}

export function bonusesOf(lane: LaneSide): PowerPart[] {
  return lane.champ ? (lane.parts ?? []).filter((p) => !isBase(p)) : [];
}

export function matchBeats(r: MatchResult): MatchBeat[] {
  const beats: MatchBeat[] = [{ kind: "intro", ms: MS.intro }];
  for (let lane = 0; lane < r.ours.length; lane++) {
    beats.push({ kind: "base", lane, ms: MS.base });
    if (bonusesOf(r.ours[lane]).length) beats.push({ kind: "bonus", lane, side: "us", ms: MS.bonus });
    if (bonusesOf(r.theirs[lane]).length) beats.push({ kind: "bonus", lane, side: "them", ms: MS.bonus });
    if (r.ours[lane].counter) beats.push({ kind: "counter", lane, side: "us", ms: MS.counter });
    if (r.theirs[lane].counter) beats.push({ kind: "counter", lane, side: "them", ms: MS.counter });
  }
  r.steps.forEach((_, step) => beats.push({ kind: "clash", step, ms: MS.clash }));
  beats.push({ kind: "result", ms: MS.result });
  return beats;
}

export interface LaneState {
  value: number | null; // power built so far, null before its base is shown
  chips: PowerPart[]; // bonuses shown so far
  counter: number; // matchup bonus, once shown
  remaining: number | null; // power left during the clashes
  fallen: boolean;
}

/** What every lane card shows once the beats up to `index` have played. */
export function laneStates(r: MatchResult, beats: MatchBeat[], index: number): Record<Side, LaneState[]> {
  const make = (lanes: LaneSide[]): LaneState[] =>
    lanes.map(() => ({ value: null, chips: [], counter: 0, remaining: null, fallen: false }));
  const out: Record<Side, LaneState[]> = { us: make(r.ours), them: make(r.theirs) };
  const lanesOf = (side: Side) => (side === "us" ? r.ours : r.theirs);

  for (let i = 0; i <= index && i < beats.length; i++) {
    const beat = beats[i];
    if (beat.kind === "base") {
      for (const side of ["us", "them"] as Side[]) out[side][beat.lane].value = baseOf(lanesOf(side)[beat.lane]);
    } else if (beat.kind === "bonus") {
      const state = out[beat.side][beat.lane];
      state.chips = bonusesOf(lanesOf(beat.side)[beat.lane]);
      state.value = (state.value ?? 0) + state.chips.reduce((sum, p) => sum + p.value, 0);
    } else if (beat.kind === "counter") {
      const state = out[beat.side][beat.lane];
      state.counter = lanesOf(beat.side)[beat.lane].counter;
      state.value = (state.value ?? 0) + state.counter;
    } else if (beat.kind === "clash") {
      const s = r.steps[beat.step];
      const ours = out.us[s.ours];
      const theirs = out.them[s.theirs];
      ours.remaining = s.winner === "us" ? s.left : 0;
      theirs.remaining = s.winner === "them" ? s.left : 0;
      ours.fallen = ours.remaining === 0;
      theirs.fallen = theirs.remaining === 0;
    } else if (beat.kind === "result") {
      // Lanes that never had to fight keep their full power.
      for (const side of ["us", "them"] as Side[]) {
        out[side].forEach((state, lane) => {
          if (state.value === null) state.value = lanesOf(side)[lane].power;
        });
      }
    }
  }
  return out;
}
