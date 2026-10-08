import { Link } from "react-router-dom";

import type { ActFn, PendingFirst, RunView } from "../api/types";
import { ChampCard } from "../components/ChampCard";
import { ROLE_NAMES } from "../lib/format";
import { useTeam } from "../state/catalog";
import styles from "./Screens.module.css";

export function FirstPickScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const pending = run.pending as PendingFirst;
  const player = useTeam(run.team).players[pending.role];
  return (
    <main className="page">
      <p className="eyebrow center">
        {ROLE_NAMES[pending.role]} · Level {pending.level}
      </p>
      <h1 className="display center">Choose {player}’s first champion</h1>
      <p className="lead center">One early, one mid and one late game option. The rest of the roster fills up on the map.</p>
      <div className={styles.cards}>
        {run.offers.map((offer) => (
          <ChampCard
            key={offer.champ}
            offer={offer}
            mode="first"
            role={pending.role}
            actionLabel="Lock in"
            disabled={busy}
            onAction={() => act({ type: "choose_first", champ: offer.champ })}
          />
        ))}
      </div>
      <p className="center">
        <Link to="/teams" className="btn btn-ghost">
          Change team
        </Link>
      </p>
    </main>
  );
}
