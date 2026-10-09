import { useState } from "react";

import type { ActFn, Role, RunView } from "../api/types";
import { cx, hue, ROLES, signed, vars } from "../lib/format";
import { useTeam } from "../state/catalog";
import { PlayerAvatar, PowerBox, TeamBadge } from "./Badges";
import { ChampCrest } from "./ChampCrest";
import { RoleIcon } from "./Icons";
import { RosterModal } from "./RosterModal";
import { SynergyList } from "./SynergyList";
import styles from "./TeamPanel.module.css";

/** The roster sidebar. Drag a row onto another, or click two rows, to swap roles. */
export function TeamPanel({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const team = useTeam(run.team);
  const [selected, setSelected] = useState<Role | null>(null);
  const [over, setOver] = useState<Role | null>(null);
  const [roster, setRoster] = useState(false);
  const { lineup } = run;

  const swap = (a: Role, b: Role) => {
    if (a !== b && (lineup.slots[a] || lineup.slots[b])) act({ type: "swap", a, b });
  };

  const onRowClick = (role: Role) => {
    if (busy) return;
    if (selected === null) {
      if (lineup.slots[role]) setSelected(role);
    } else {
      swap(selected, role);
      setSelected(null);
    }
  };

  return (
    <div className={cx("panel", styles.panel)}>
      <div className={styles.head}>
        <span className="eyebrow">Your team</span>
        <span className={styles.total}>
          Power <b>{lineup.total}</b>
        </span>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setRoster(true)}>
          Roster
        </button>
      </div>
      {roster && <RosterModal run={run} side="us" onClose={() => setRoster(false)} />}
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
          const unit = lineup.slots[role];
          const line = lineup.power[role];
          const player = team.players[role];
          const sig = line?.parts.find((p) => p.kind === "signature")?.value;
          return (
            <div
              key={role}
              className={cx(
                styles.row,
                unit && styles.filled,
                selected === role && styles.selected,
                over === role && styles.over,
                selected !== null && selected !== role && styles.target,
              )}
              style={unit ? vars({ "--h": hue(unit.champ) }) : undefined}
              draggable={!!unit && !busy}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", role);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(role);
              }}
              onDragLeave={() => setOver((r) => (r === role ? null : r))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                swap(e.dataTransfer.getData("text/plain") as Role, role);
              }}
              onClick={() => onRowClick(role)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick(role)}
              aria-pressed={selected === role}
            >
              <RoleIcon role={role} className={styles.role} />
              <PlayerAvatar name={player} bonus={sig} />
              <ChampCrest champ={unit?.champ ?? null} size="sm" level={unit?.level} />
              <span className={styles.names}>
                <b className={unit ? undefined : styles.emptyName}>{unit ? unit.champ : "No champion yet"}</b>
                <small>{player}</small>
              </span>
              {line && (
                <span className={styles.power}>
                  <PowerBox line={line} size="sm" />
                  {line.bonus !== 0 && (
                    <span className={line.bonus > 0 ? "pos" : "neg"}>{signed(line.bonus)}</span>
                  )}
                </span>
              )}
              {unit && (
                <span className={styles.xp} title={`${unit.xp} / 1000 XP`}>
                  <span style={{ width: `${unit.xp / 10}%` }} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <SynergyList links={lineup.synergies} />

      {lineup.warnings.length > 0 && (
        <ul className={styles.warnings}>
          {lineup.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      <p className={styles.hint}>
        {selected ? "Now click the role to swap with." : "Drag or click two rows to swap roles."}
      </p>
    </div>
  );
}
