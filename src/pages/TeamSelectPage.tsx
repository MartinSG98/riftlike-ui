import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { TeamBadge } from "../components/Badges";
import { TopBar } from "../components/TopBar";
import { cx, vars } from "../lib/format";
import { saveRunId } from "../lib/savedRun";
import { useCatalog } from "../state/catalog";
import styles from "./Pages.module.css";

const ROAD: [string, string][] = [
  ["Play-In", "Four teams, double elimination. Only the winner joins the Swiss stage."],
  ["Swiss stage", "Three wins reach the Quarterfinals. Three losses end the run."],
  ["Quarterfinals", "One more match day on a map. From here one loss and you are out."],
  ["Semifinal", "No map. Three picks in a row, then the match."],
  ["Final", "The same again, for the trophy."],
];

const ordinal = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

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
                    <span className={styles.seedMark} aria-hidden="true">
                      {t.seed}
                    </span>
                    {t.play_in && <span className={styles.playIn}>Play-In</span>}
                    <TeamBadge code={t.code} size="lg" />
                    <span className={styles.teamName}>{t.name}</span>
                    <span className={styles.teamSeed}>
                      {league.code} {ordinal(t.seed)} seed
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>

        <section className={styles.road} aria-labelledby="road-title">
          <p id="road-title" className="eyebrow center">
            The road to the trophy
          </p>
          <ol>
            {ROAD.map(([stage, text]) => (
              <li key={stage}>
                <b>{stage}</b>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
