import { useEffect, useState } from "react";

import { api } from "../api/client";
import type { Lineup, MatchupEntry, Matchups, Role, RunView, Unit } from "../api/types";
import { cx, ROLE_NAMES, ROLES, signed } from "../lib/format";
import { useCatalog } from "../state/catalog";
import { FocusChip, PowerBox, TeamBadge } from "./Badges";
import { ChampCrest } from "./ChampCrest";
import { RoleIcon } from "./Icons";
import { Modal } from "./Modal";
import styles from "./RosterModal.module.css";

type Side = "us" | "them";

// Matchups never change, so each champion and lane is fetched once per page load.
const matchupCache = new Map<string, Promise<Matchups>>();

function loadMatchups(champ: string, role: Role): Promise<Matchups> {
  const key = `${champ}|${role}`;
  if (!matchupCache.has(key)) {
    matchupCache.set(
      key,
      api.matchups(champ, role).catch((e) => {
        matchupCache.delete(key);
        throw e;
      }),
    );
  }
  return matchupCache.get(key)!;
}

function firstFilled(lineup: Lineup | undefined): Role {
  return ROLES.find((r) => lineup?.slots[r]) ?? "TOP";
}

/** Both lineups, one champion at a time: power, level, and who counters whom in its lane. */
export function RosterModal({ run, side: initialSide, onClose }: { run: RunView; side: Side; onClose: () => void }) {
  const { teams, champions } = useCatalog();
  const opp = run.opponent;
  const [side, setSide] = useState<Side>(opp ? initialSide : "us");
  const lineup = side === "us" ? run.lineup : opp!.lineup;
  const [role, setRole] = useState<Role>(firstFilled(lineup));

  const code = side === "us" ? run.team : opp!.code;
  const team = teams.find((t) => t.code === code)!;
  const oppTeam = opp ? teams.find((t) => t.code === opp.code) : undefined;
  const unit = lineup.slots[role];
  const line = lineup.power[role];
  const rival = (side === "us" ? opp?.lineup : run.lineup)?.slots[role] ?? null;

  const [matchups, setMatchups] = useState<Matchups | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setMatchups(null);
    setFailed(false);
    if (!unit) return;
    let live = true;
    loadMatchups(unit.champ, role)
      .then((m) => live && setMatchups(m))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [unit?.champ, role]);

  const switchSide = (next: Side) => {
    setSide(next);
    setRole(firstFilled(next === "us" ? run.lineup : opp?.lineup));
  };

  const rivalEntry = rival && matchups
    ? (matchups.counters.find((c) => c.champ === rival.champ) ?? matchups.countered_by.find((c) => c.champ === rival.champ))
    : undefined;
  const rivalNote = rivalEntry?.note ?? "";

  const vsRival =
    rival && matchups
      ? (matchups.counters.find((c) => c.champ === rival.champ)?.value ??
        -(matchups.countered_by.find((c) => c.champ === rival.champ)?.value ?? 0))
      : null;

  return (
    <Modal labelledBy="roster-title" onClose={onClose} wide>
      <div className={styles.top}>
        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={side === "us"} onClick={() => switchSide("us")}>
            Your team
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={side === "them"}
            disabled={!opp}
            onClick={() => switchSide("them")}
          >
            {oppTeam ? oppTeam.name : "Opponent"}
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-small" onClick={onClose} autoFocus>
          Close
        </button>
      </div>

      <h2 id="roster-title" className={styles.title}>
        <TeamBadge code={code} size="md" />
        <span>{team.name}</span>
        <span className={styles.total}>
          Power <b>{lineup.total}</b>
        </span>
      </h2>

      <div className={styles.body}>
        <ul className={styles.list}>
          {ROLES.map((r) => {
            const u = lineup.slots[r];
            return (
              <li key={r}>
                <button
                  type="button"
                  className={cx(styles.row, r === role && styles.selected, side === "them" && styles.enemy)}
                  onClick={() => setRole(r)}
                >
                  <RoleIcon role={r} className={styles.role} />
                  <ChampCrest champ={u?.champ ?? null} size="sm" level={u?.level} />
                  <span className={styles.names}>
                    <b>{u?.champ ?? "Empty"}</b>
                    <small>{team.players[r]}</small>
                  </span>
                  {lineup.power[r] && <PowerBox value={lineup.power[r]!.total} tone={side === "us" ? "us" : "them"} size="sm" />}
                </button>
              </li>
            );
          })}
        </ul>

        <section className={styles.detail}>
          {!unit ? (
            <p className={styles.empty}>
              No {ROLE_NAMES[role]} champion yet. Pick one on the map to fill the role.
            </p>
          ) : (
            <>
              <div className={styles.hero}>
                <ChampCrest champ={unit.champ} size="xl" level={unit.level} />
                <div className={styles.heroText}>
                  <h3>{unit.champ}</h3>
                  <span className={styles.meta}>
                    {champions[unit.champ].cls} ·{" "}
                    {champions[unit.champ].dmg === "MX" ? "mixed damage" : champions[unit.champ].dmg} ·{" "}
                    {team.players[role]}, {ROLE_NAMES[role]}
                  </span>
                  <span className={styles.chips}>
                    <FocusChip focus={champions[unit.champ].focus} />
                    {champions[unit.champ].roles.map((r) => (
                      <span key={r} className={styles.roleChip}>
                        <RoleIcon role={r} size={11} /> {ROLE_NAMES[r]}
                      </span>
                    ))}
                  </span>
                </div>
                {line && (
                  <div className={styles.heroPower}>
                    <PowerBox line={line} tone={side === "us" ? "us" : "them"} size="lg" />
                    {line.bonus !== 0 && (
                      <span className={line.bonus > 0 ? "gain" : "loss"}>{signed(line.bonus)} bonus</span>
                    )}
                  </div>
                )}
              </div>

              <Level unit={unit} side={side} />

              {line && (
                <dl className={styles.parts}>
                  {line.parts.map((p, i) => (
                    <div key={i}>
                      <dt>{p.label}</dt>
                      <dd className={p.kind === "level" ? undefined : p.value >= 0 ? "gain" : "loss"}>
                        {p.kind === "level" ? p.value : signed(p.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {rival && (
                <div className={styles.rival}>
                  <span className={styles.rivalLabel}>
                    {side === "us" ? "Next match, lane opponent" : "Against your"}
                  </span>
                  <ChampCrest champ={rival.champ} size="xs" />
                  <b>{rival.champ}</b>
                  {vsRival !== null && (
                    <span
                      className={cx(styles.verdict, vsRival > 0 ? styles.good : vsRival < 0 ? styles.bad : undefined)}
                    >
                      {vsRival > 0
                        ? `${unit.champ} counters, +${vsRival}`
                        : vsRival < 0
                          ? `${rival.champ} counters, +${-vsRival} for them`
                          : "Even lane"}
                    </span>
                  )}
                  {rivalNote && <span className={styles.rivalNote}>{rivalNote}</span>}
                </div>
              )}

              {failed && <p className={styles.empty}>Could not load the matchups. Is the backend running?</p>}
              {!failed && !matchups && <p className={styles.empty}>Loading matchups…</p>}
              {matchups && (
                <div className={styles.matchups}>
                  <MatchupList
                    title={`Counters in ${ROLE_NAMES[role]}`}
                    entries={matchups.counters}
                    tone="good"
                    highlight={rival?.champ}
                    empty="Counters nobody in this lane"
                  />
                  <MatchupList
                    title="Countered by"
                    entries={matchups.countered_by}
                    tone="bad"
                    highlight={rival?.champ}
                    empty="Nobody in this lane counters it"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}

function Level({ unit, side }: { unit: Unit; side: Side }) {
  return (
    <div className={styles.level}>
      <span>
        Level <b>{unit.level}</b>
      </span>
      {side === "us" && (
        <>
          <span className={styles.xpTrack}>
            <span style={{ width: `${unit.xp / 10}%` }} />
          </span>
          <span className="muted">{unit.xp} / 1000 XP</span>
        </>
      )}
    </div>
  );
}

function MatchupList({
  title,
  entries,
  tone,
  highlight,
  empty,
}: {
  title: string;
  entries: MatchupEntry[];
  tone: "good" | "bad";
  highlight?: string;
  empty: string;
}) {
  return (
    <div>
      <h4 className={styles.listTitle}>
        {title} <span className="muted">{entries.length}</span>
      </h4>
      {entries.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.matchupGrid}>
          {entries.map((e) => (
            <li key={e.champ} className={cx(styles.matchup, e.champ === highlight && styles.highlight)}>
              <ChampCrest champ={e.champ} size="xs" />
              <span className={styles.matchupName}>
                {e.champ}
                {e.note && <small>{e.note}</small>}
              </span>
              <b className={tone === "good" ? styles.goodValue : styles.badValue}>+{e.value}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
