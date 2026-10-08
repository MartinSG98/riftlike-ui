import type { ActFn, PendingStage, RunView } from "../api/types";
import { XpList } from "../components/XpList";
import { cx } from "../lib/format";
import styles from "./Screens.module.css";

const HEADLINE = {
  playin: "Play-In",
  swiss: "Swiss stage",
  qf: "Quarterfinals",
  sf: "Semifinals",
  final: "The Final",
};

export function StageScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const p = run.pending as PendingStage;
  const { w, l } = run.swiss;

  let text: string;
  switch (p.to_stage) {
    case "swiss":
      text =
        "You came through the Play-In. Sixteen teams now, and every match counts: three wins to advance, three losses to go home.";
      break;
    case "qf":
      text =
        p.skipped > 0
          ? `You finished the Swiss stage ${w}–${l} and skipped ${p.skipped} match day${p.skipped > 1 ? "s" : ""}. Your champions trained through them. From here one loss ends the run.`
          : `You made it out of the Swiss stage at ${w}–${l}. From here one loss ends the run.`;
      break;
    case "sf":
      text =
        "No lane fights before the Semifinal. Every champion is raised to level 17 and you get three picks in a row, against a level 17 team.";
      break;
    default:
      text = "One match for the trophy. Level 18 on both sides, and three more picks before it starts.";
  }

  return (
    <main className={cx("page", styles.stage)}>
      <p className="eyebrow center">{p.to_stage === "swiss" ? "Qualified" : "Advanced"}</p>
      <h1 className={cx("display center", styles.stageTitle)}>{HEADLINE[p.to_stage]}</h1>
      <p className="lead center">{text}</p>
      {p.xp.length > 0 && (
        <div className={styles.stageXp}>
          <p className="eyebrow">Training on the days you skipped</p>
          <XpList gains={p.xp} />
        </div>
      )}
      <p className="center" style={{ marginTop: 28 }}>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => act({ type: "continue" })}>
          {p.to_stage === "sf" || p.to_stage === "final" ? "Start the draft" : "Start the match day"}
        </button>
      </p>
    </main>
  );
}
