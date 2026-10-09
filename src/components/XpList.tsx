import type { XpGain } from "../api/types";
import { ChampCrest } from "./ChampCrest";
import styles from "./XpList.module.css";

export function XpList({ gains }: { gains: XpGain[] }) {
  if (!gains.length) return null;
  return (
    <ul className={styles.list}>
      {gains.map((g) => (
        <li key={g.role} className={styles.row}>
          <ChampCrest champ={g.champ} size="sm" level={g.after} />
          <span className={styles.name}>
            <b>{g.champ}</b>
            <small>
              Level {g.before}
              {g.after > g.before ? <span className="gain"> → {g.after}</span> : null}
            </small>
          </span>
          <span className={styles.xp}>+{g.gained} XP</span>
        </li>
      ))}
    </ul>
  );
}
