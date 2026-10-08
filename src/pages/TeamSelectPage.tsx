import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { TeamBadge } from "../components/Badges";
import { TopBar } from "../components/TopBar";
import { cx, vars } from "../lib/format";
import { saveRunId } from "../lib/savedRun";
import { useCatalog } from "../state/catalog";
import styles from "./Pages.module.css";

export function TeamSelectPage() {
  const { teams, leagues } = useCatalog();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (code: string) => {
    setBusy(code);
    setError(null);
    try {
      const run = await api.createRun(code);
      saveRunId(run.id);
      navigate(`/run/${run.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not start the run");
      setBusy(null);
    }
  };

  return (
    <>
      <TopBar />
      <main className="page">
        <p className="eyebrow center">World Championship 2026</p>
        <h1 className="display center">Choose your team</h1>
        <p className="lead center">
          Main-stage teams open in the Swiss stage with their first champion at level 4. Play-In teams start at level 1
          in a four-team bracket, and only its winner joins the Swiss stage.
        </p>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.leagues}>
          {leagues.map((league) => (
            <div key={league.code} className={styles.league}>
              <div className={styles.leagueHead}>
                <b>{league.code}</b>
                <span>{league.region}</span>
              </div>
              {teams
                .filter((t) => t.league === league.code)
                .sort((a, b) => a.seed - b.seed)
                .map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    className={cx(styles.teamCard, busy === t.code && styles.teamBusy)}
                    style={vars({ "--tc": t.color })}
                    disabled={busy !== null}
                    onClick={() => start(t.code)}
                  >
                    {t.play_in && <span className={styles.playIn}>Play-In</span>}
                    <TeamBadge code={t.code} size="lg" />
                    <span className={styles.teamName}>{t.name}</span>
                    <span className={styles.teamSeed}>
                      {league.code} #{t.seed}
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
