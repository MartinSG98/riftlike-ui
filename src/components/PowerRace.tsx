import type { RunView } from "../api/types";
import { cx } from "../lib/format";
import { useTeam } from "../state/catalog";
import { TeamBadge } from "./Badges";
import styles from "./PowerRace.module.css";

/**
 * Your total against the next opponent's, across the top of the match day. More total power
 * always wins the match and a tie goes to the opponent, so this is the number the day is about.
 */
export function PowerRace({ run }: { run: RunView }) {
  const opp = run.opponent!;
  const us = useTeam(run.team);
  const them = useTeam(opp.code);
  const ours = run.lineup.total;
  const theirs = opp.lineup.total;
  const diff = ours - theirs;
  const share = ours + theirs > 0 ? ours / (ours + theirs) : 0.5;

  return (
    <section className={cx("panel", styles.race)} aria-label="Your power against the next opponent">
      <span className={styles.side}>
        <TeamBadge code={us.code} size="sm" />
        <span className={styles.label}>You</span>
        <b className={styles.us}>{ours}</b>
      </span>

      <div className={styles.middle}>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.fill} style={{ width: `${share * 100}%` }} />
          <span className={styles.line} />
        </div>
        <p className={cx(styles.verdict, diff > 0 ? styles.ahead : styles.behind)}>
          {diff > 0 ? (
            <>
              Ahead by <b>{diff}</b>. You would win the match now.
            </>
          ) : diff === 0 ? (
            <>
              Dead even, and a tie goes to them. You need <b>1</b> more.
            </>
          ) : (
            <>
              You need <b>{1 - diff}</b> more power to win the match.
            </>
          )}
        </p>
      </div>

      <span className={cx(styles.side, styles.right)}>
        <b className={styles.them}>{theirs}</b>
        <span className={styles.label}>Them</span>
        <TeamBadge code={them.code} size="sm" />
      </span>
    </section>
  );
}
