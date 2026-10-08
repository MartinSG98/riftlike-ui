import type { ActFn, RunView } from "../api/types";
import { MapView } from "../components/MapView";
import { ScoutPanel } from "../components/ScoutPanel";
import { TeamPanel } from "../components/TeamPanel";
import { cx } from "../lib/format";
import styles from "./Screens.module.css";

export function MapScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  return (
    <main className={styles.layout}>
      <aside className={styles.side}>
        <TeamPanel run={run} act={act} busy={busy} />
      </aside>
      <section className={styles.main}>
        <div className={styles.dayLabel}>{run.day_label}</div>
        {run.map ? (
          <div className={cx("panel", styles.mapPanel)}>
            <MapView run={run} act={act} busy={busy} />
          </div>
        ) : (
          <div className={cx("panel", styles.ready)}>
            <p className="eyebrow">No lane fights before the {run.stage === "final" ? "Final" : "Semifinal"}</p>
            <h2 className="display">Draft locked in</h2>
            <p className="lead">
              Your champions are at level {run.opponent?.level}. Swap roles in the roster if you need to, check the
              opponent below, then play.
            </p>
            <button
              type="button"
              className="btn btn-gold"
              disabled={busy}
              onClick={() => act({ type: "start_match" })}
            >
              Play the {run.stage === "final" ? "Final" : "Semifinal"}
            </button>
          </div>
        )}
      </section>
      {run.opponent && (
        <aside className={styles.scout}>
          <ScoutPanel run={run} />
        </aside>
      )}
    </main>
  );
}
