import { useState } from "react";

import type { ActFn, PendingFight, PowerPart, RunView } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { ChampCrest } from "../components/ChampCrest";
import { RoleIcon } from "../components/Icons";
import { XpList } from "../components/XpList";
import { cx, ROLE_NAMES, signed, vars } from "../lib/format";
import { useTeam } from "../state/catalog";
import styles from "./Fight.module.css";

const VERDICT = { win: "Victory", loss: "Defeat", draw: "Even trade", forfeit: "Forfeit" };

export function FightScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const r = (run.pending as PendingFight).result;
  const team = useTeam(run.team);
  const [instant, setInstant] = useState(false);
  const share = r.ours + r.theirs > 0 ? r.ours / (r.ours + r.theirs) : 0;
  const bonuses = r.ours_parts.filter((p) => p.kind !== "level" && p.kind !== "focus");

  let margin: string;
  if (r.outcome === "forfeit") margin = `No ${ROLE_NAMES[r.role]} champion on your team`;
  else if (r.outcome === "draw") margin = "Dead even";
  else if (r.outcome === "win") margin = `${r.champ} wins by ${r.ours - r.theirs}`;
  else margin = `${r.enemy.champ} wins by ${r.theirs - r.ours}`;

  const counter =
    r.matchup > 0 ? `${r.champ} counters +${r.matchup}` : r.matchup < 0 ? `${r.enemy.champ} counters +${-r.matchup}` : null;

  return (
    <main className={cx("page", styles.screen, instant && "instant")}>
      <div className={cx("panel", styles.panel)}>
        <p className="eyebrow center">{ROLE_NAMES[r.role]} 1v1</p>
        <div className={styles.vs}>
          <span className={styles.vsUs}>
            <TeamBadge code={team.code} size="sm" /> {team.name}
          </span>
          <span className={styles.vsText}>VS</span>
          <span className={styles.vsThem}>{r.enemy.champ}</span>
        </div>
        <p className={styles.explain}>Higher power wins the lane. Lane winners earn the most XP, the rest of the team learns from it too.</p>

        <div className={styles.arena}>
          <Fighter
            side="us"
            champ={r.champ}
            level={r.level}
            sub={team.players[r.role]}
            power={r.ours}
            bonuses={bonuses}
            lost={r.outcome === "loss" || r.outcome === "forfeit"}
          />
          <div className={styles.center}>
            <span className={styles.roleTag}>
              <RoleIcon role={r.role} size={12} /> {ROLE_NAMES[r.role]}
            </span>
            <div className={styles.bar}>
              <span className={styles.barUs} style={vars({ "--share": share })} data-timed />
            </div>
            {counter && (
              <span
                className={cx(styles.counter, r.matchup > 0 && styles.counterUs, "reveal")}
                style={vars({ "--d": "0.9s" })}
              >
                {counter}
              </span>
            )}
            <span className={cx(styles.margin, "reveal")} style={vars({ "--d": "1.3s" })}>
              {margin}
            </span>
          </div>
          <Fighter
            side="them"
            champ={r.enemy.champ}
            level={r.enemy.level}
            sub={`Level ${r.enemy.level}`}
            power={r.theirs}
            lost={r.outcome === "win"}
          />
        </div>

        <div className={cx(styles.verdict, styles[r.outcome], "reveal")} style={vars({ "--d": "1.7s" })}>
          {VERDICT[r.outcome]}
        </div>
        <div className="reveal" style={vars({ "--d": "2s" })}>
          <XpList gains={r.xp} />
        </div>
        <div className={styles.actions}>
          {!instant && (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setInstant(true)}>
              Skip
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary reveal"
            style={vars({ "--d": "2.1s" })}
            disabled={busy}
            onClick={() => act({ type: "continue" })}
          >
            Continue
          </button>
        </div>
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
  lost,
}: {
  side: "us" | "them";
  champ: string | null;
  level: number | null;
  sub: string;
  power: number;
  bonuses?: PowerPart[];
  lost: boolean;
}) {
  return (
    <div className={cx(styles.fighter, styles[side], lost && styles.lost)} data-timed>
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
      <span className={styles.fighterPower}>{power}</span>
    </div>
  );
}
