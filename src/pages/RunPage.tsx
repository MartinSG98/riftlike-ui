import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, ApiError } from "../api/client";
import type { Action, RunView } from "../api/types";
import { TopBar } from "../components/TopBar";
import { clearSavedRunId, saveRunId } from "../lib/savedRun";
import { FirstPickScreen } from "../screens/FirstPickScreen";
import { MapScreen } from "../screens/MapScreen";
import styles from "./Pages.module.css";

export function RunPage() {
  const { id = "" } = useParams();
  const [run, setRun] = useState<RunView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getRun(id)
      .then(setRun)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          clearSavedRunId();
          setMissing(true);
        } else setError(e instanceof Error ? e.message : "could not load the run");
      });
  }, [id]);

  useEffect(() => {
    if (!run) return;
    if (run.result) clearSavedRunId();
    else saveRunId(run.id);
  }, [run]);

  const act = useCallback(
    async (action: Action) => {
      setBusy(true);
      try {
        setRun(await api.act(id, action));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "that did not work");
      } finally {
        setBusy(false);
      }
    },
    [id],
  );

  const screen = run ? (run.result ? "end" : (run.pending?.kind ?? "map")) : null;
  // A new key per step remounts the screen, which restarts its animations and clears local state.
  const stepKey = run
    ? `${screen}-${run.day}-${run.map?.current ?? ""}-${run.pending?.kind === "pick" ? run.pending.draft_left + run.pending.offers.map((o) => o.champ).join() : ""}`
    : "";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, run?.day]);

  if (missing) {
    return (
      <>
        <TopBar />
        <main className="page center">
          <h1 className="display">Run not found</h1>
          <p className="lead">It may have been deleted with the local database.</p>
          <p>
            <Link to="/teams" className="btn btn-primary">
              Start a new run
            </Link>
          </p>
        </main>
      </>
    );
  }

  if (!run) return <TopBar />;

  const props = { run, act, busy };
  return (
    <>
      <TopBar run={run} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div key={stepKey}>
        {screen === "first" && <FirstPickScreen {...props} />}
        {screen === "map" && <MapScreen {...props} />}
      </div>
    </>
  );
}
