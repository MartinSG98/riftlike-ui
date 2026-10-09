import { useMemo, useState, type ReactNode } from "react";

import type { ActFn, FightResult, PendingFight, PowerPart, RunView } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { ChampCrest } from "../components/ChampCrest";
import { RoleIcon } from "../components/Icons";
import { PlaybackBar } from "../components/PlaybackBar";
import { XpList } from "../components/XpList";
import { cx, ROLE_NAMES, signed } from "../lib/format";
import { isBase } from "../lib/playback";
import { readSpeed, useTimeline, writeSpeed } from "../lib/useTimeline";
import { useTeam } from "../state/catalog";
import styles from "./Fight.module.css";

const VERDICT = { win: "Victory", loss: "Defeat", draw: "Even trade", forfeit: "Forfeit" };

type Beat = { kind: "intro" | "baseUs" | "baseThem" | "bonus" | "counter" | "clash" | "result"; ms: number };

function fightBeats(r: FightResult): Beat[] {
  const beats: Beat[] = [
    { kind: "intro", ms: 1000 },
    { kind: "baseUs", ms: 1100 },
    { kind: "baseThem", ms: 1100 },
  ];
  if (r.ours_parts.some((p) => !isBase(p))) beats.push({ kind: "bonus", ms: 1100 });
  if (r.matchup !== 0) beats.push({ kind: "counter", ms: 1100 });
  beats.push({ kind: "clash", ms: 1900 }, { kind: "result", ms: 800 });
  return beats;
}

const sum = (parts: PowerPart[]) => parts.reduce((total, p) => total + p.value, 0);

export function FightScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const r = (run.pending as PendingFight).result;
  const team = useTeam(run.team);
  const [speed, setSpeed] = useState(readSpeed);
  const beats = useMemo(() => fightBeats(r), [r]);
  const { index, done, progress, skip } = useTimeline(beats, speed);
  const at = done ? beats.length - 1 : index;
  const reached = (kind: Beat["kind"]) => beats.findIndex((b) => b.kind === kind) <= at && beats.some((b) => b.kind === kind);

  const ourBase = sum(r.ours_parts.filter(isBase));
  const ourBonuses = r.ours_parts.filter((p) => !isBase(p));
  // Results saved before breakdowns existed: fall back to the final numbers.
  const theirBase = r.theirs_parts?.length ? sum(r.theirs_parts) : r.theirs - Math.max(0, -r.matchup);

  let ours: number | null = reached("baseUs") ? (r.champ ? ourBase || r.ours - Math.max(0, r.matchup) : 0) : null;
  if (ours !== null && reached("bonus")) ours += sum(ourBonuses);
  if (ours !== null && reached("counter")) ours += Math.max(0, r.matchup);
  let theirs: number | null = reached("baseThem") ? theirBase : null;
  if (theirs !== null && reached("counter")) theirs += Math.max(0, -r.matchup);

  const clashed = reached("clash");
  const showResult = reached("result");
  const share = r.ours + r.theirs > 0 ? r.ours / (r.ours + r.theirs) : 0;
  const counter = reached("counter")
    ? r.matchup > 0
      ? `${r.champ} counters +${r.matchup}`
      : `${r.enemy.champ} counters +${-r.matchup}`
    : null;

  let margin = "";
  if (r.outcome === "forfeit") margin = `No ${ROLE_NAMES[r.role]} champion on your team`;
  else if (r.outcome === "draw") margin = "Dead even";
  else if (r.outcome === "win") margin = `${r.champ} wins by ${r.ours - r.theirs}`;
  else margin = `${r.enemy.champ} wins by ${r.theirs - r.ours}`;

  const lines = beats.slice(0, at + 1).map((b) => commentary(r, b, ourBase, theirBase, team.players[r.role]));

  const changeSpeed = (next: number) => {
    setSpeed(next);
    writeSpeed(next);
  };

  return (
    <main className={cx("page", styles.screen)}>
      <div className={cx("panel", styles.panel)}>
        <p className="eyebrow center">{ROLE_NAMES[r.role]} 1v1</p>
        <div className={styles.vs}>
          <span className={styles.vsUs}>
            <TeamBadge code={team.code} size="sm" /> {team.name}
          </span>
          <span className={styles.vsText}>VS</span>
          <span className={styles.vsThem}>{r.enemy.champ}</span>
        </div>

        <div className={styles.arena}>
          <Fighter
            side="us"
            champ={r.champ}
            level={r.level}
            sub={team.players[r.role]}
            power={ours}
            bonuses={reached("bonus") ? ourBonuses : []}
            focus={!done && (beats[at].kind === "baseUs" || beats[at].kind === "bonus" || (beats[at].kind === "counter" && r.matchup > 0))}
            hit={clashed && !done && beats[at].kind === "clash" && r.outcome !== "win"}
            lost={clashed && (r.outcome === "loss" || r.outcome === "forfeit")}
          />
          <div className={styles.center}>
            <span className={styles.roleTag}>
              <RoleIcon role={r.role} size={12} /> {ROLE_NAMES[r.role]}
            </span>
            <div className={styles.bar}>
              <span className={styles.barUs} style={{ width: clashed ? `${share * 100}%` : "50%" }} />
              {clashed && <span className={styles.spark} style={{ left: `${share * 100}%` }} />}
            </div>
            {counter && <span className={cx(styles.counter, r.matchup > 0 && styles.counterUs)}>{counter}</span>}
            {clashed && <span className={styles.margin}>{margin}</span>}
          </div>
          <Fighter
            side="them"
            champ={r.enemy.champ}
            level={r.enemy.level}
            sub={`Level ${r.enemy.level}`}
            power={theirs}
            focus={!done && (beats[at].kind === "baseThem" || (beats[at].kind === "counter" && r.matchup < 0))}
            hit={clashed && !done && beats[at].kind === "clash" && r.outcome !== "loss" && r.outcome !== "forfeit"}
            lost={clashed && r.outcome === "win"}
          />
        </div>

        <ol className={styles.commentary} aria-live="polite">
          {lines.map((line, i) =>
            line ? (
              <li key={i} className={cx(i === lines.length - 1 && styles.lineNow)}>
                {line}
              </li>
            ) : null,
          )}
        </ol>

        {showResult && (
          <div className={styles.result}>
            <div className={cx(styles.verdict, styles[r.outcome])}>{VERDICT[r.outcome]}</div>
            <XpList gains={r.xp} />
          </div>
        )}

        <PlaybackBar
          progress={progress}
          done={done}
          onSkip={skip}
          speed={speed}
          onSpeed={changeSpeed}
          continueLabel="Continue"
          onContinue={() => act({ type: "continue" })}
          disabled={busy}
        />
      </div>
    </main>
  );
}

function Fighter({
  side,
  champ,
  level,
  sub,
  power,
  bonuses = [],
  focus,
  hit,
  lost,
}: {
  side: "us" | "them";
  champ: string | null;
  level: number | null;
  sub: string;
  power: number | null;
  bonuses?: PowerPart[];
  focus: boolean;
  hit: boolean;
  lost: boolean;
}) {
  return (
    <div className={cx(styles.fighter, styles[side], focus && styles.sideFocus, hit && styles.shake, lost && styles.fallen)}>
      <ChampCrest champ={champ} size="lg" level={level} />
      <span className={styles.fighterText}>
        <b>{champ ?? "Nobody"}</b>
        <small>{sub}</small>
        {bonuses.length > 0 && (
          <span className={styles.chips}>
            {bonuses.map((b, i) => (
              <span key={i} className={cx(styles.chip, b.value < 0 && styles.chipNeg)}>
                {b.label} {signed(b.value)}
              </span>
            ))}
          </span>
        )}
      </span>
      <span key={power ?? "none"} className={cx(styles.fighterPower, power !== null && styles.bump)}>
        {power ?? "–"}
      </span>
    </div>
  );
}

function commentary(r: FightResult, beat: Beat, ourBase: number, theirBase: number, player: string): ReactNode {
  const ours = r.champ ?? `No ${ROLE_NAMES[r.role]} champion`;
  switch (beat.kind) {
    case "intro":
      return (
        <>
          A lane fight: <b>base</b> power, then <b>bonuses</b>, then the <b>lane matchup</b>. Higher power wins the
          lane. Only the champion who fights earns XP, more for a win.
        </>
      );
    case "baseUs":
      return r.champ ? (
        <>
          <b className="pos">{ours}</b> starts at <b>{ourBase}</b> (level {r.level}).
        </>
      ) : (
        <>
          You have no {ROLE_NAMES[r.role]} champion, so <b>{player}</b> forfeits the lane.
        </>
      );
    case "baseThem":
      return (
        <>
          <b className="neg">{r.enemy.champ}</b> starts at <b>{theirBase}</b> (level {r.enemy.level}).
        </>
      );
    case "bonus":
      return (
        <>
          <b className="pos">{ours}</b>:{" "}
          {r.ours_parts
            .filter((p) => !isBase(p))
            .map((p) => `${p.label} ${signed(p.value)}`)
            .join(", ")}
          , now <b>{r.ours - Math.max(0, r.matchup)}</b>.
        </>
      );
    case "counter":
      return r.matchup > 0 ? (
        <>
          <b className="pos">{ours}</b> counters {r.enemy.champ}: <b>+{r.matchup}</b>, now <b>{r.ours}</b>.
        </>
      ) : (
        <>
          <b className="neg">{r.enemy.champ}</b> counters {ours}: <b>+{-r.matchup}</b>, now <b>{r.theirs}</b>.
        </>
      );
    case "clash":
      return (
        <>
          <span className={styles.tag}>Clash</span>
          <b className="pos">{ours}</b> {r.ours} vs {r.theirs} <b className="neg">{r.enemy.champ}</b>:{" "}
          {r.outcome === "win"
            ? `${ours} wins by ${r.ours - r.theirs}.`
            : r.outcome === "draw"
              ? "dead even."
              : `${r.enemy.champ} wins by ${r.theirs - r.ours}.`}
        </>
      );
    default:
      return null;
  }
}
