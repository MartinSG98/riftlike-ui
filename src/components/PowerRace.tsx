import type { RunView } from "../api/types";
import { cx } from "../lib/format";
import { useTeam } from "../state/catalog";
import { TeamBadge } from "./Badges";
import styles from "./PowerRace.module.css";

/**
 * The fans' odds from the two team totals. The totals leave out the lane counters, which are only
 * worked out when the match is played, so this is a guess and not a promise. A gap of 10 power is
 * about 45 to 55, a gap of 50 about 27 to 73, and nobody is ever written off completely.
 */
function fanVote(ours: number, theirs: number): number {
  const odds = 1 / (1 + Math.exp(-(ours - theirs) / 50));
  return Math.min(99, Math.max(1, Math.round(odds * 100)));
}

/**
 * Your total against the next opponent's, across the top of the match day, as a fan vote. Only the
 * percentages show, since the totals would read like a promise the counters can break.
 */
export function PowerRace({ run }: { run: RunView }) {
  const opp = run.opponent!;
  const us = useTeam(run.team);
  const them = useTeam(opp.code);
  const ours = run.lineup.total;
  const theirs = opp.lineup.total;
  const vote = fanVote(ours, theirs);

  const call = vote >= 60 ? "Fans back you." : vote <= 40 ? `Fans back ${them.name}.` : "Fans call it close.";

  return (
    <section className={cx("panel", styles.race)} aria-label="Fan vote for the next match">
      <span className={styles.side}>
        <TeamBadge code={us.code} size="sm" />
        <span className={styles.label}>You</span>
      </span>

      <div className={styles.middle}>
        <span className={styles.title}>Fan vote</span>
        <div className={styles.track} role="img" aria-label={`${vote}% back you, ${100 - vote}% back ${them.name}`}>
          <span className={styles.fill} style={{ width: `${vote}%` }} />
          <span className={styles.line} />
          <b className={styles.pctUs}>{vote}%</b>
          <b className={styles.pctThem}>{100 - vote}%</b>
        </div>
        <p className={styles.verdict}>{call} Lane counters can still swing it.</p>
      </div>

      <span className={cx(styles.side, styles.right)}>
        <span className={styles.label}>Them</span>
        <TeamBadge code={them.code} size="sm" />
      </span>
    </section>
  );
}
