import { useState } from "react";
import { Link } from "react-router-dom";

import type { RunView } from "../api/types";
import { cx, STAGES } from "../lib/format";
import { useTeam } from "../state/catalog";
import { TeamBadge } from "./Badges";
import { HowToPlay } from "./HowToPlay";
import styles from "./TopBar.module.css";
import { Wordmark } from "./Wordmark";

export function TopBar({ run }: { run?: RunView | null }) {
  const [help, setHelp] = useState(false);
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.home} aria-label="Title screen">
        <Wordmark size="sm" />
      </Link>
      {run && (
        <span className={styles.team}>
          <TeamBadge code={run.team} size="sm" />
          <b>{run.team}</b>
        </span>
      )}
      {run && <StageTracker run={run} />}
      <span className={styles.spacer} />
      <button type="button" className={styles.help} onClick={() => setHelp(true)} aria-label="How it works">
        ?
      </button>
      {help && <HowToPlay onClose={() => setHelp(false)} />}
    </header>
  );
}

function StageTracker({ run }: { run: RunView }) {
  const team = useTeam(run.team);
  let { w, l } = run.swiss;
  // The record already counts the match being played back, so hold it back until the player moves on.
  if (run.pending?.kind === "match" && run.stage === "swiss") {
    if (run.pending.result.win) w -= 1;
    else l -= 1;
  }
  const labels = {
    playin: "Play-In",
    swiss: `Swiss ${w}–${l}`,
    qf: "Quarters",
    sf: "Semis",
    final: "Final",
  };
  const current = run.result === "champion" ? STAGES.length : STAGES.indexOf(run.stage);
  return (
    <nav className={styles.tracker} aria-label="Tournament progress">
      {STAGES.map((stage, i) => {
        const skipped = stage === "playin" && !team.play_in;
        const state = skipped ? styles.skipped : i < current ? styles.done : i === current ? styles.active : undefined;
        return (
          <span key={stage} className={styles.step}>
            {i > 0 && <span className={styles.sep}>›</span>}
            <span className={cx(styles.label, state)}>{labels[stage]}</span>
          </span>
        );
      })}
    </nav>
  );
}
