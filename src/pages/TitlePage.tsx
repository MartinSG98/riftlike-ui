import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import type { RunSummary } from "../api/types";
import { TeamBadge } from "../components/Badges";
import { HowToPlay } from "../components/HowToPlay";
import { TrophyIcon } from "../components/Icons";
import { Wordmark } from "../components/Wordmark";
import { cx } from "../lib/format";
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
            <ul>
              {recent.map((r) => (
                <li key={r.id}>
                  <TeamBadge code={r.team} size="sm" />
                  <span>{teamName(r.team)}</span>
                  <b className={r.result === "champion" ? styles.won : undefined}>{r.label}</b>
                </li>
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
