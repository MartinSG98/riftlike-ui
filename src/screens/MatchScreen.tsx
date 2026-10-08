import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { ActFn, LaneSide, MatchResult, PendingMatch, PowerPart, RunView } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { ChampCrest } from "../components/ChampCrest";
import { RoleIcon } from "../components/Icons";
import { PlaybackBar } from "../components/PlaybackBar";
import { XpList } from "../components/XpList";
import { cx, ROLE_NAMES, ROLES, signed } from "../lib/format";
import { baseOf, bonusesOf, laneStates, matchBeats, type LaneState, type MatchBeat, type Side } from "../lib/playback";
import { readSpeed, useTimeline, writeSpeed } from "../lib/useTimeline";
import { useTeam } from "../state/catalog";
import styles from "./Fight.module.css";

export function MatchScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const r = (run.pending as PendingMatch).result;
  const us = useTeam(run.team);
  const them = useTeam(r.opponent);
  const [speed, setSpeed] = useState(readSpeed);
  const beats = useMemo(() => matchBeats(r), [r]);
  const { index, done, progress, skip } = useTimeline(beats, speed);
  const states = laneStates(r, beats, done ? beats.length - 1 : index);
  const beat = beats[index];
  const showResult = done || beat.kind === "result";

  const changeSpeed = (next: number) => {
    setSpeed(next);
    writeSpeed(next);
  };

  // Which lane cards are in focus on this beat.
  const focus = (side: Side, lane: number): boolean => {
    if (done) return false;
    if (beat.kind === "base") return beat.lane === lane;
    if (beat.kind === "bonus" || beat.kind === "counter") return beat.lane === lane && beat.side === side;
    if (beat.kind === "clash") {
      const s = r.steps[beat.step];
      return side === "us" ? s.ours === lane : s.theirs === lane;
    }
    return false;
  };
  const clashHit = (side: Side, lane: number): number | null => {
    if (done || beat.kind !== "clash") return null;
    const s = r.steps[beat.step];
    if ((side === "us" ? s.ours : s.theirs) !== lane) return null;
    return Math.min(s.ours_power, s.theirs_power);
  };

  const lines = beats.slice(0, (done ? beats.length - 1 : index) + 1).map((b) => commentary(r, b));
  const continueLabel =
    r.next.kind === "day" ? "Next match day" : r.next.kind === "stage" ? "Continue" : "See how the run went";

  return (
    <main className={cx("page", styles.screen)}>
      <div className={cx("panel", styles.panel)}>
        <p className="eyebrow center">{r.label}</p>
        <div className={styles.vs}>
          <span className={styles.vsUs}>
            <TeamBadge code={us.code} size="md" /> {us.name}
          </span>
          <span className={styles.vsText}>VS</span>
          <span className={styles.vsThem}>
            {them.name} <TeamBadge code={them.code} size="md" />
          </span>
        </div>

        <div className={styles.lanes}>
          {ROLES.map((role, i) => (
            <div key={role} className={cx(styles.lane, (focus("us", i) || focus("them", i)) && styles.laneFocus)}>
              <SideCard lane={r.ours[i]} side="us" state={states.us[i]} focus={focus("us", i)} hit={clashHit("us", i)} beat={index} />
              <span className={styles.laneRole} title={ROLE_NAMES[role]}>
                <RoleIcon role={role} size={16} />
              </span>
              <SideCard lane={r.theirs[i]} side="them" state={states.them[i]} focus={focus("them", i)} hit={clashHit("them", i)} beat={index} />
            </div>
          ))}
        </div>

        <Commentary lines={lines} />

        {showResult && (
          <div className={styles.result}>
            <div className={cx(styles.verdict, !r.win && styles.loss)}>{r.win ? "Victory" : "Defeat"}</div>
            <p className={styles.sub}>
              {r.win ? `Won with ${r.left} power to spare.` : `${them.name} won with ${r.left} power to spare.`}{" "}
              <b>{r.next.label}</b>
            </p>
            <XpList gains={r.xp} />
          </div>
        )}

        <PlaybackBar
          progress={progress}
          done={done}
          onSkip={skip}
          speed={speed}
          onSpeed={changeSpeed}
          continueLabel={continueLabel}
          onContinue={() => act({ type: "continue" })}
          disabled={busy}
          subdued={r.next.kind === "out"}
        />
      </div>
    </main>
  );
}

function SideCard({
  lane,
  side,
  state,
  focus,
  hit,
  beat,
}: {
  lane: LaneSide;
  side: Side;
  state: LaneState;
  focus: boolean;
  hit: number | null;
  beat: number;
}) {
  const shown = state.remaining ?? state.value;
  return (
    <div className={cx(styles.side, styles[side], focus && styles.sideFocus, state.fallen && styles.fallen)}>
      <ChampCrest champ={lane.champ} size="sm" level={lane.level} />
      <span className={styles.sideText}>
        <b>{lane.champ ?? `No ${ROLE_NAMES[lane.role]}`}</b>
        <small>{lane.player}</small>
        {(state.chips.length > 0 || state.counter > 0) && (
          <span className={styles.chips}>
            {state.chips.map((p, i) => (
              <Chip key={i} part={p} />
            ))}
            {state.counter > 0 && <span className={cx(styles.chip, styles.chipCounter)}>Counter +{state.counter}</span>}
          </span>
        )}
      </span>
      <span className={styles.sidePower}>
        {/* Keyed on the value so every change replays the bump. */}
        <span key={`${shown}-${state.remaining !== null}`} className={cx(styles.number, shown !== null && styles.bump)}>
          {shown ?? "–"}
        </span>
        {state.remaining !== null && !state.fallen && <small>left</small>}
      </span>
      {hit !== null && (
        <span key={beat} aria-hidden="true">
          <span className={styles.flashNow} />
          {hit > 0 && <span className={styles.hitNow}>−{hit}</span>}
        </span>
      )}
    </div>
  );
}

function Chip({ part }: { part: PowerPart }) {
  return (
    <span className={cx(styles.chip, part.value < 0 && styles.chipNeg)}>
      {part.label} {signed(part.value)}
    </span>
  );
}

function Commentary({ lines }: { lines: ReactNode[] }) {
  const box = useRef<HTMLOListElement>(null);
  // Jump, not smooth scroll: a new line can arrive before a smooth scroll finishes and cut it short.
  useLayoutEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [lines.length]);
  return (
    <ol className={styles.commentary} ref={box} aria-live="polite">
      {lines.map((line, i) =>
        line ? (
          <li key={i} className={cx(i === lines.length - 1 && styles.lineNow)}>
            {line}
          </li>
        ) : null,
      )}
    </ol>
  );
}

function name(lane: LaneSide): string {
  return lane.champ ?? `empty ${ROLE_NAMES[lane.role]}`;
}

/** One line of play-by-play for a beat. */
function commentary(r: MatchResult, beat: MatchBeat): ReactNode {
  switch (beat.kind) {
    case "intro":
      return (
        <>
          Every lane builds its power first: <b>base</b>, then <b>bonuses</b>, then the <b>lane matchup</b>. Then the
          lanes clash from top to bottom, and each winner carries what it has left into the next enemy.
        </>
      );
    case "base": {
      const a = r.ours[beat.lane];
      const b = r.theirs[beat.lane];
      return (
        <>
          <span className={styles.tag}>{ROLE_NAMES[a.role]}</span>
          <b className="pos">{name(a)}</b> starts at <b>{baseOf(a)}</b>
          {a.level ? ` (level ${a.level})` : ""}, <b className="neg">{name(b)}</b> at <b>{baseOf(b)}</b>
          {b.level ? ` (level ${b.level})` : ""}.
        </>
      );
    }
    case "bonus": {
      const lane = beat.side === "us" ? r.ours[beat.lane] : r.theirs[beat.lane];
      const bonuses = bonusesOf(lane);
      const total = baseOf(lane) + bonuses.reduce((sum, p) => sum + p.value, 0);
      return (
        <>
          <b className={beat.side === "us" ? "pos" : "neg"}>{name(lane)}</b>:{" "}
          {bonuses.map((p) => `${p.label} ${signed(p.value)}`).join(", ")}, now <b>{total}</b>.
        </>
      );
    }
    case "counter": {
      const lane = beat.side === "us" ? r.ours[beat.lane] : r.theirs[beat.lane];
      const other = beat.side === "us" ? r.theirs[beat.lane] : r.ours[beat.lane];
      return (
        <>
          <b className={beat.side === "us" ? "pos" : "neg"}>{name(lane)}</b> counters {name(other)} in lane
          {lane.counter_note ? ` (${lane.counter_note})` : ""}: <b>+{lane.counter}</b>, now <b>{lane.power}</b>.
        </>
      );
    }
    case "clash": {
      const s = r.steps[beat.step];
      const a = name(r.ours[s.ours]);
      const b = name(r.theirs[s.theirs]);
      const next = r.steps[beat.step + 1];
      let onward = "";
      if (next && s.winner === "us") onward = `, and moves on to ${name(r.theirs[next.theirs])}`;
      if (next && s.winner === "them") onward = `, and moves on to ${name(r.ours[next.ours])}`;
      return (
        <>
          <span className={styles.tag}>Clash</span>
          <b className="pos">{a}</b> {s.ours_power} vs {s.theirs_power} <b className="neg">{b}</b>:{" "}
          {s.winner === "tie" ? (
            "dead even, both are out."
          ) : (
            <>
              <b className={s.winner === "us" ? "pos" : "neg"}>{s.winner === "us" ? a : b}</b> wins with{" "}
              <b>{s.left}</b> left{onward}.
            </>
          )}
        </>
      );
    }
    default:
      return null;
  }
}
