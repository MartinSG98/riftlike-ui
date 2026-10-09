import type { OfferView, Role } from "../api/types";
import { cx, ROLE_NAMES, signed } from "../lib/format";
import { useCatalog } from "../state/catalog";
import { FocusChip } from "./Badges";
import styles from "./ChampCard.module.css";
import { ChampBanner } from "./ChampCrest";
import { RoleIcon } from "./Icons";

/**
 * An offered champion. It leads with the number that decides the pick: the power in its best
 * role and what it adds to the team ("first" shows the opening role and level 16 instead).
 * Bonuses come next as chips, focus and roles last.
 */
export function ChampCard({
  offer,
  mode,
  role,
  actionLabel,
  onAction,
  onHover,
  active,
  disabled,
}: {
  offer: OfferView;
  mode: "first" | "pick";
  role?: Role;
  actionLabel: string;
  onAction: () => void;
  onHover?: (champ: string | null) => void;
  active?: boolean;
  disabled?: boolean;
}) {
  const info = useCatalog().champions[offer.champ];
  const shown = mode === "first" && role ? role : offer.best_role;
  const proj = offer.projections[shown];
  const synergies = mode === "pick" ? offer.synergies : [];
  const bonuses = offer.signatures.length + synergies.length;

  return (
    <article
      className={cx(styles.card, active && styles.active)}
      onMouseEnter={() => onHover?.(offer.champ)}
      onMouseLeave={() => onHover?.(null)}
    >
      <ChampBanner champ={offer.champ}>
        <span className={styles.level}>Level {offer.level}</span>
        <div className={styles.bannerFoot}>
          <div className={styles.title}>
            <h3 className={styles.name}>{offer.champ}</h3>
            <span className={styles.cls}>
              {info.cls} · {info.dmg === "MX" ? "mixed damage" : info.dmg}
            </span>
          </div>
          <div className={styles.headline}>
            <span className={styles.bigPower}>{proj.power}</span>
            <span className={styles.headCaption}>
              as <RoleIcon role={shown} size={11} /> {ROLE_NAMES[shown]}
            </span>
          </div>
        </div>
      </ChampBanner>

      <div className={styles.gainRow}>
        {mode === "pick" ? (
          <>
            <span>Team power</span>
            <b className={proj.delta > 0 ? styles.gain : proj.delta < 0 ? styles.loss : styles.flat}>
              {signed(proj.delta)}
            </b>
          </>
        ) : (
          <>
            <span>At level 16</span>
            <b className={styles.flat}>{offer.power_16}</b>
          </>
        )}
      </div>

      {(bonuses > 0 || mode === "pick") && (
        <div className={styles.chips}>
          {offer.signatures.map((s) => (
            <span
              key={s.role}
              className={cx(styles.chip, styles.chipGain)}
              title={`${s.player}'s signature champion. Counts only as ${ROLE_NAMES[s.role]}.`}
            >
              <RoleIcon role={s.role} size={11} /> Signature, {s.player} <b>+{s.bonus}</b>
            </span>
          ))}
          {synergies.map((s) => (
            <span
              key={s.role}
              className={cx(styles.chip, s.value > 0 ? styles.chipGain : styles.chipLoss)}
              title={`With your ${ROLE_NAMES[s.role]}, both ${s.value > 0 ? "get" : "lose"} ${Math.abs(s.value)}.`}
            >
              <RoleIcon role={s.role} size={11} /> {s.label} <b>{signed(s.value)}</b>
            </span>
          ))}
          {bonuses === 0 && <span className={styles.noBonus}>No signature or synergy</span>}
        </div>
      )}

      <div className={styles.meta}>
        <FocusChip focus={info.focus} />
        <span className={styles.roles}>
          {info.roles.map((r) => (
            <span key={r}>
              <RoleIcon role={r} size={12} /> {ROLE_NAMES[r]}
            </span>
          ))}
        </span>
      </div>

      <div className={styles.action}>
        <button type="button" className="btn btn-primary btn-block" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
