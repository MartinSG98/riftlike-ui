import { useCallback, useState } from "react";

import type { ActFn, ClashStep, LaneSide, MatchResult, PendingMatch, RunView } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { ChampCrest } from "../components/ChampCrest";
import { RoleIcon } from "../components/Icons";
import { PlaybackBar } from "../components/PlaybackBar";
import { XpList } from "../components/XpList";
import { cx, ROLE_NAMES, ROLES, vars } from "../lib/format";
import { useTeam } from "../state/catalog";
import styles from "./Fight.module.css";

const START = 0.6; // seconds before the first clash
const STEP = 0.75; // seconds between clashes

export function MatchScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const r = (run.pending as PendingMatch).result;
  const us = useTeam(run.team);
  const them = useTeam(r.opponent);
  const [instant, setInstant] = useState(false);
  const [done, setDone] = useState(false);
  const skip = useCallback(() => {
    setInstant(true);
    setDone(true);
  }, []);

  // Every clash hits both lane cards at its moment in the playback, and the loser goes down
  // a beat later, so the cards react in time with the log.
  const fellOurs = new Map<number, number>();
  const fellTheirs = new Map<number, number>();
  const hitsOurs = new Map<number, Hit[]>();
  const hitsTheirs = new Map<number, Hit[]>();
  const addHit = (hits: Map<number, Hit[]>, lane: number, hit: Hit) => hits.set(lane, [...(hits.get(lane) ?? []), hit]);
  r.steps.forEach((s, k) => {
    const at = START + k * STEP;
    const amount = Math.min(s.ours_power, s.theirs_power);
    addHit(hitsOurs, s.ours, { at, amount });
    addHit(hitsTheirs, s.theirs, { at, amount });
    if (s.winner !== "us") fellOurs.set(s.ours, at + 0.3);
    if (s.winner !== "them") fellTheirs.set(s.theirs, at + 0.3);
  });
  const resultAt = START + r.steps.length * STEP + 0.2;

  const continueLabel =
    r.next.kind === "day" ? "Next match day" : r.next.kind === "stage" ? "Continue" : "See how the run went";

  return (
    <main className={cx("page", styles.screen, instant && "instant")}>
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
        <p className={styles.explain}>
          Lanes clash from top to bottom. The stronger side wins and carries what it has left into the next enemy.
          Whoever has power left at the end takes the match.
        </p>

        <div className={styles.lanes}>
          {ROLES.map((role, i) => (
            <div key={role} className={styles.lane}>
              <Side lane={r.ours[i]} side="us" fellAt={fellOurs.get(i)} hits={hitsOurs.get(i)} />
              <span className={styles.laneRole} title={ROLE_NAMES[role]}>
                <RoleIcon role={role} size={16} />
              </span>
              <Side lane={r.theirs[i]} side="them" fellAt={fellTheirs.get(i)} hits={hitsTheirs.get(i)} />
            </div>
          ))}
        </div>

        <ol className={styles.steps}>
          {r.steps.map((s, k) => (
            <li
              key={k}
              className={cx(styles.step, s.winner === "us" ? styles.stepUs : s.winner === "them" ? styles.stepThem : undefined)}
              style={vars({ "--d": `${START + k * STEP}s` })}
              data-timed
            >
              {describe(r, s)}
            </li>
          ))}
        </ol>

        <div className={cx(styles.verdict, !r.win && styles.loss, "reveal")} style={vars({ "--d": `${resultAt}s` })}>
          {r.win ? "Victory" : "Defeat"}
        </div>
        <p className={cx(styles.sub, "reveal")} style={vars({ "--d": `${resultAt + 0.2}s` })}>
          {r.win ? `Won with ${r.left} power to spare.` : `${them.name} won with ${r.left} power to spare.`}{" "}
          <b>{r.next.label}</b>
        </p>
        <div className="reveal" style={vars({ "--d": `${resultAt + 0.4}s` })}>
          <XpList gains={r.xp} />
        </div>
        <PlaybackBar
          duration={resultAt + 0.7}
          done={done}
          onSkip={skip}
          onDone={() => setDone(true)}
          continueLabel={continueLabel}
          onContinue={() => act({ type: "continue" })}
          disabled={busy}
          subdued={r.next.kind === "out"}
        />
      </div>
    </main>
  );
}

interface Hit {
  at: number;
  amount: number;
}

function Side({
  lane,
  side,
  fellAt,
  hits = [],
}: {
  lane: LaneSide;
  side: "us" | "them";
  fellAt?: number;
  hits?: Hit[];
}) {
  return (
    <div
      className={cx(styles.side, styles[side], fellAt !== undefined && styles.fallen)}
      style={fellAt !== undefined ? vars({ "--d": `${fellAt}s` }) : undefined}
      data-timed
    >
      <ChampCrest champ={lane.champ} size="sm" level={lane.level} />
      <span className={styles.sideText}>
        <b>{lane.champ ?? `No ${ROLE_NAMES[lane.role]}`}</b>
        <small>{lane.player}</small>
      </span>
      <span className={styles.sidePower}>
        {lane.power}
        {lane.counter > 0 && <small>counter +{lane.counter}</small>}
      </span>
      {hits.map((hit, i) => (
        <span key={i} aria-hidden="true">
          <span className={styles.flash} style={vars({ "--d": `${hit.at}s` })} data-timed />
          {hit.amount > 0 && (
            <span className={styles.hit} style={vars({ "--d": `${hit.at}s` })} data-timed>
              −{hit.amount}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function name(lane: LaneSide): string {
  return lane.champ ?? `empty ${ROLE_NAMES[lane.role]}`;
}

function describe(r: MatchResult, s: ClashStep) {
  const ours = name(r.ours[s.ours]);
  const theirs = name(r.theirs[s.theirs]);
  if (s.winner === "us") {
    return (
      <>
        <b>{ours}</b> ({s.ours_power}) beats {theirs} ({s.theirs_power}), <b>{s.left}</b> left
      </>
    );
  }
  if (s.winner === "them") {
    return (
      <>
        <b>{theirs}</b> ({s.theirs_power}) beats {ours} ({s.ours_power}), <b>{s.left}</b> left
      </>
    );
  }
  return (
    <>
      {ours} and {theirs} trade evenly at {s.ours_power}
    </>
  );
}
