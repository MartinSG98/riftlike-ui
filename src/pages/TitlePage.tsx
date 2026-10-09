import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import type { RunSummary } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { HowToPlay } from "../components/HowToPlay";
import { TrophyIcon } from "../components/Icons";
import { Wordmark } from "../components/Wordmark";
import { cx, STAGE_NAMES, STAGES } from "../lib/format";
import { clearSavedRunId, getSavedRunId } from "../lib/savedRun";
import { useCatalog } from "../state/catalog";
import styles from "./Pages.module.css";

export function TitlePage() {
  const navigate = useNavigate();
  const { teams } = useCatalog();
  const [help, setHelp] = useState(false);
  const [saved, setSaved] = useState<{ id: string; team: string } | null>(null);
  const [recent, setRecent] = useState<RunSummary[]>([]);

  useEffect(() => {
    const id = getSavedRunId();
    if (id) {
      api
        .getRun(id)
        .then((run) => (run.result ? clearSavedRunId() : setSaved({ id, team: run.team })))
        .catch(clearSavedRunId);
    }
    api
      .recentRuns(8)
      .then((runs) => setRecent(runs.filter((r) => r.result).slice(0, 5)))
      .catch(() => setRecent([]));
  }, []);

  const teamName = (code: string) => teams.find((t) => t.code === code)?.name ?? code;

  return (
    <main className={styles.title}>
      <div className={styles.titleGlow} aria-hidden="true" />
      <div className={styles.titleInner}>
        <p className={cx("eyebrow", styles.titleEyebrow)}>
          <TrophyIcon size={16} /> World Championship 2026
        </p>
        <h1 className={styles.titleMark}>
          <Wordmark size="xl" />
        </h1>
        <p className={styles.tagline}>The 2026 World Championship, played as a roguelike.</p>
        <p className={styles.question}>How far can you take them?</p>

        <div className={styles.titleActions}>
          {saved && (
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/run/${saved.id}`)}>
              Continue · {teamName(saved.team)}
            </button>
          )}
          <Link to="/teams" className={cx("btn", saved ? "btn-gold" : "btn-primary")}>
            New run
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => setHelp(true)}>
            How it works
          </button>
        </div>

        {recent.length > 0 && (
          <section className={styles.recent}>
            <p className="eyebrow">Recent runs</p>
            <ul className={styles.runCards}>
              {recent.map((r) => (
                <RecentRun key={r.id} run={r} name={teamName(r.team)} />
              ))}
            </ul>
          </section>
        )}

        <p className={styles.fine}>
          A fan project. Not affiliated with or endorsed by Riot Games. League of Legends and all related names are
          trademarks of Riot Games.
        </p>
      </div>
      {help && <HowToPlay onClose={() => setHelp(false)} />}
    </main>
  );
}

/** A finished run as a small card, with a track of the stages it got through. */
function RecentRun({ run, name }: { run: RunSummary; name: string }) {
  const { teams } = useCatalog();
  const playIn = teams.find((t) => t.code === run.team)?.play_in ?? false;
  const champion = run.result === "champion";
  const reached = STAGES.indexOf(run.stage);
  return (
    <li className={cx(styles.runCard, champion && styles.runChampion)}>
      <span className={styles.runHead}>
        <TeamBadge code={run.team} size="sm" />
        <b>{name}</b>
      </span>
      <ol className={styles.runTrack} aria-hidden="true">
        {STAGES.map((stage, i) => (
          <li
            key={stage}
            title={STAGE_NAMES[stage]}
            className={cx(
              styles.pip,
              stage === "playin" && !playIn
                ? styles.pipSkip
                : i < reached
                  ? styles.pipDone
                  : i === reached && (champion ? styles.pipWon : styles.pipOut),
            )}
          />
        ))}
      </ol>
      <span className={styles.runLabel}>{run.label}</span>
    </li>
  );
}
