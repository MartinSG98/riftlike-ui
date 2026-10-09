import { useState } from "react";

import type { ActFn, OfferView, PendingPick, Role, RunView } from "../api/types";
import { PowerBox } from "../components/Badges";
import { ChampCard } from "../components/ChampCard";
import { ChampCrest } from "../components/ChampCrest";
import { RoleIcon } from "../components/Icons";
import { RosterModal } from "../components/RosterModal";
import { cx, ROLE_NAMES, ROLES, signed } from "../lib/format";
import { useCatalog, useTeam } from "../state/catalog";
import { MapScreen } from "./MapScreen";
import styles from "./Screens.module.css";

export function PickScreen({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const pending = run.pending as PendingPick;
  const [hover, setHover] = useState<string | null>(null);
  const [placing, setPlacing] = useState<string | null>(null);
  const { champions } = useCatalog();
  const preview = run.offers.find((o) => o.champ === (placing ?? hover)) ?? null;
  const drafting = pending.draft_left > 0;
  // Looking around keeps this screen mounted, so the offers and a half-made pick survive the trip.
  const [peek, setPeek] = useState(false);
  const [roster, setRoster] = useState(false);

  if (peek) {
    return (
      <>
        <div className={styles.pickBanner} role="status">
          <span>
            <b>Pick waiting.</b> {run.offers.length} champions on offer
            {drafting ? `, draft pick ${4 - pending.draft_left} of 3` : ""}. Roles can still be swapped here.
          </span>
          <button type="button" className="btn btn-primary btn-small" onClick={() => setPeek(false)}>
            Back to the pick
          </button>
        </div>
        <MapScreen run={run} act={act} busy={busy} waitingPick />
      </>
    );
  }

  return (
    <main className="page">
      <p className="eyebrow center">
        {drafting ? `${run.day_label} · Draft pick ${4 - pending.draft_left} of 3` : "Pick a champ"}
      </p>
      <h1 className="display center">{drafting ? "Draft for the late game" : "Pick a champion"}</h1>
      <p className="lead center">
        Hover a champion to see where it fits best. Pick one, then choose its role. Level {pending.level}.
      </p>
      <div className={styles.pickToolbar}>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setPeek(true)}>
          View map and roster
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setRoster(true)}>
          Roster and counters
        </button>
      </div>
      {roster && <RosterModal run={run} side="us" onClose={() => setRoster(false)} />}

      <div className={styles.cards}>
        {run.offers.map((offer) => (
          <ChampCard
            key={offer.champ}
            offer={offer}
            mode="pick"
            actionLabel={placing === offer.champ ? "Picked" : "Pick"}
            active={placing === offer.champ}
            disabled={busy}
            onHover={setHover}
            onAction={() => setPlacing(offer.champ)}
          />
        ))}
      </div>

      <section className={cx("panel", styles.slotsPanel, placing && styles.placing)}>
        <div className={styles.slotsHead}>
          {placing ? (
            <>
              <div>
                <h2 className={styles.slotsTitle}>Where does {placing} play?</h2>
                <p className={styles.slotsSub}>
                  {placing} plays {champions[placing].roles.map((r) => ROLE_NAMES[r]).join(", ")}. Any other role
                  costs 6. Whoever plays there now leaves the team.
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setPlacing(null)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">Your team</span>
              <span className={styles.slotsTotal}>
                Power <b>{run.lineup.total}</b>
              </span>
            </>
          )}
        </div>
        <div className={styles.slots}>
          {ROLES.map((role) => (
            <Slot
              key={role}
              run={run}
              role={role}
              preview={preview}
              placing={!!placing}
              busy={busy}
              onPlace={() => placing && act({ type: "pick", champ: placing, role })}
            />
          ))}
        </div>
      </section>

      <p className="center">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "skip" })}>
          Skip: take nobody
        </button>
      </p>
    </main>
  );
}

function Slot({
  run,
  role,
  preview,
  placing,
  busy,
  onPlace,
}: {
  run: RunView;
  role: Role;
  preview: OfferView | null;
  placing: boolean;
  busy: boolean;
  onPlace: () => void;
}) {
  const team = useTeam(run.team);
  const unit = run.lineup.slots[role];
  const line = run.lineup.power[role];
  const isBest = preview?.best_role === role;
  const showPreview = preview && (placing || isBest);
  const proj = preview?.projections[role];
  // Which offers fit best here, shown without a hover.
  const fits = run.offers.filter((o) => o.best_role === role);

  return (
    <button
      type="button"
      className={cx(styles.slot, isBest && styles.best, placing && styles.slotPlaceable)}
      disabled={!placing || busy}
      onClick={onPlace}
    >
      {isBest && <span className={styles.inTag}>Best fit</span>}
      {fits.length > 0 && !showPreview && (
        <span className={styles.fits} title={`Best fit for ${fits.map((o) => o.champ).join(" and ")}`}>
          {fits.map((o) => (
            <ChampCrest key={o.champ} champ={o.champ} size="xs" />
          ))}
        </span>
      )}
      <span className={styles.slotRole}>
        <RoleIcon role={role} size={12} /> {ROLE_NAMES[role]}
      </span>
      <ChampCrest
        champ={showPreview ? preview.champ : (unit?.champ ?? null)}
        level={showPreview ? preview.level : unit?.level}
        size="md"
      />
      <span className={styles.slotPlayer}>{team.players[role]}</span>
      {showPreview && proj ? (
        <span className={styles.slotPower}>
          <PowerBox value={proj.power} size="sm" />
          <span className={proj.delta > 0 ? "pos" : proj.delta < 0 ? "neg" : "muted"}>{signed(proj.delta)}</span>
        </span>
      ) : line ? (
        <span className={styles.slotPower}>
          <PowerBox line={line} size="sm" />
        </span>
      ) : (
        <span className={styles.slotEmpty}>Empty</span>
      )}
      {placing && proj?.replaces && <span className={styles.replaces}>replaces {proj.replaces}</span>}
    </button>
  );
}
