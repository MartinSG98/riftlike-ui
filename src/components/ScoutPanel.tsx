import { useState } from "react";

import type { RunView } from "../api/types";
import { cx, ROLES, signed } from "../lib/format";
import { useTeam } from "../state/catalog";
import { PlayerAvatar, PowerBox, TeamBadge } from "./Badges";
import { ChampCrest } from "./ChampCrest";
import { RoleIcon } from "./Icons";
import { RosterModal } from "./RosterModal";
import styles from "./ScoutPanel.module.css";
import { SynergyList } from "./SynergyList";

/** The opponent waiting at the bottom of the map. */
export function ScoutPanel({ run }: { run: RunView }) {
  const opp = run.opponent!;
  const team = useTeam(opp.code);
  const diff = run.lineup.total - opp.lineup.total;
  const [scout, setScout] = useState(false);
  return (
    <section className={cx("panel", styles.panel)}>
      <div className={styles.head}>
        <span className="eyebrow">Next opponent</span>
        <span className={styles.level}>Level {opp.level}</span>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setScout(true)}>
          Scout
        </button>
      </div>
      {scout && <RosterModal run={run} side="them" onClose={() => setScout(false)} />}
      <div className={styles.team}>
        <TeamBadge code={team.code} size="md" />
        <span>
          <b>{team.name}</b>
          <small>
            {team.league} #{team.seed}
          </small>
        </span>
      </div>
      <div className={styles.rows}>
        {ROLES.map((role) => {
          const unit = opp.lineup.slots[role]!;
          const line = opp.lineup.power[role];
          const sig = line?.parts.find((p) => p.kind === "signature")?.value;
          return (
            <div key={role} className={styles.row}>
              <RoleIcon role={role} className={styles.role} />
              <PlayerAvatar name={team.players[role]} bonus={sig} />
              <ChampCrest champ={unit.champ} size="sm" level={unit.level} />
              <span className={styles.names}>
                <b>{unit.champ}</b>
                <small>{team.players[role]}</small>
              </span>
              <PowerBox line={line} tone="them" size="sm" />
            </div>
          );
        })}
      </div>
      <SynergyList links={opp.lineup.synergies} tone="them" />
      <div className={styles.foot}>
        <span>
          Their power <b>{opp.lineup.total}</b>
        </span>
        <span>
          Yours <b>{run.lineup.total}</b>{" "}
          <span className={diff > 0 ? "pos" : diff < 0 ? "neg" : undefined}>({signed(diff)})</span>
        </span>
      </div>
    </section>
  );
}
