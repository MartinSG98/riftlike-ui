import { Link } from "react-router-dom";

import type { RunView } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { ChampCrest } from "../components/ChampCrest";
import { TrophyIcon } from "../components/Icons";
import { cx, ROLES, STAGE_NAMES } from "../lib/format";
import { useTeam } from "../state/catalog";
import styles from "./Screens.module.css";

export function EndScreen({ run }: { run: RunView }) {
  const team = useTeam(run.team);
  const champion = run.result === "champion";
  const wins = run.history.filter((m) => m.win).length;
  const outcome = champion
    ? "World Champions"
    : run.stage === "swiss"
      ? `Out in the Swiss stage at ${run.swiss.w}–${run.swiss.l}`
      : `Out in the ${STAGE_NAMES[run.stage]}`;

  return (
    <main className={cx("page", styles.end)}>
      {champion && <TrophyIcon size={72} className={styles.trophy} />}
      <p className="eyebrow center">{team.name} · Worlds 2026</p>
      <h1 className={cx("display center", styles.endTitle, champion && styles.gold)}>
        {champion ? "World Champions" : "Run over"}
      </h1>
      {!champion && <p className="lead center">{outcome}</p>}

      <div className={styles.lineup}>
        {ROLES.map((role) => {
          const unit = run.lineup.slots[role];
          return (
            <span key={role} className={styles.lineupItem}>
              <ChampCrest champ={unit?.champ ?? null} size="lg" level={unit?.level} />
              <b>{unit?.champ ?? "Empty"}</b>
              <small>{team.players[role]}</small>
            </span>
          );
        })}
      </div>

      <section className={cx("panel", styles.history)}>
        <div className={styles.historyHead}>
          <span className="eyebrow">Matches</span>
          <span className="muted">
            {wins} won, {run.history.length - wins} lost
          </span>
        </div>
        <ol>
          {run.history.map((m, i) => (
            <li key={i}>
              <span className={styles.historyLabel}>{m.label}</span>
              <span className={styles.historyOpp}>
                <TeamBadge code={m.opponent} size="sm" /> {m.opponent}
              </span>
              <b className={m.win ? "gain" : "loss"}>{m.win ? "Win" : "Loss"}</b>
            </li>
          ))}
        </ol>
      </section>

      <p className="center" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/teams" className="btn btn-primary">
          New run
        </Link>
        <Link to="/" className="btn btn-ghost">
          Title screen
        </Link>
      </p>
    </main>
  );
}
