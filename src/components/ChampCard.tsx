import type { OfferView, Role } from "../api/types";
import { cx, ROLE_NAMES, signed } from "../lib/format";
import { useCatalog } from "../state/catalog";
import { FocusChip, PlayerAvatar, PowerBox } from "./Badges";
import styles from "./ChampCard.module.css";
import { ChampBanner } from "./ChampCrest";
import { RoleIcon } from "./Icons";

/** An offered champion. "first" shows the power curve for the opening role, "pick" shows team fit. */
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
  const teamDelta = offer.projections[offer.best_role].delta;
  return (
    <article
      className={cx(styles.card, active && styles.active)}
      onMouseEnter={() => onHover?.(offer.champ)}
      onMouseLeave={() => onHover?.(null)}
    >
      <ChampBanner champ={offer.champ}>
        <span className={styles.level}>Level {offer.level}</span>
        <h3 className={styles.name}>{offer.champ}</h3>
        <span className={styles.cls}>
          {info.cls} · {info.dmg === "MX" ? "mixed damage" : info.dmg}
        </span>
      </ChampBanner>

      <dl className={styles.stats}>
        <div>
          <dt>Focus</dt>
          <dd>
            <FocusChip focus={info.focus} />
          </dd>
        </div>
        <div>
          <dt>Plays</dt>
          <dd className={styles.roles}>
            {info.roles.map((r) => (
              <span key={r}>
                <RoleIcon role={r} size={12} /> {ROLE_NAMES[r]}
              </span>
            ))}
          </dd>
        </div>
        {mode === "pick" && (
          <>
            <div>
              <dt>
                Power as {ROLE_NAMES[offer.best_role]}, level {offer.level}
              </dt>
              <dd>
                <PowerBox value={offer.projections[offer.best_role].power} />
              </dd>
            </div>
            <div>
              <dt>Team power</dt>
              <dd className={teamDelta > 0 ? "pos" : teamDelta < 0 ? "neg" : "muted"}>{signed(teamDelta)}</dd>
            </div>
          </>
        )}
        {mode === "first" && role && (
          <>
            <div>
              <dt>Power at level {offer.level}</dt>
              <dd>
                <PowerBox value={offer.projections[role].power} />
              </dd>
            </div>
            <div>
              <dt>At level 16</dt>
              <dd className="muted">{offer.power_16}</dd>
            </div>
          </>
        )}
      </dl>

      {offer.signatures.length > 0 && (
        <div className={styles.block}>
          <span className={styles.blockTitle}>Signature champion</span>
          {offer.signatures.map((s) => (
            <div key={s.role} className={styles.line}>
              <PlayerAvatar name={s.player} />
              <span className={styles.lineText}>
                <b>{s.player}</b>
                <small>{ROLE_NAMES[s.role]} only</small>
              </span>
              <b className={styles.gold}>+{s.bonus}</b>
            </div>
          ))}
        </div>
      )}

      {mode === "pick" && (
        <div className={styles.block}>
          <span className={styles.blockTitle}>
            {offer.synergies.length ? "Synergy with your team" : "No synergy with your current team"}
          </span>
          {offer.synergies.map((s) => (
            <div key={s.role} className={cx(styles.line, s.value > 0 && styles.synergyLine)}>
              <RoleIcon role={s.role} size={14} className={styles.lineRole} />
              <span className={styles.lineText}>
                <b>{s.label}</b>
                <small>
                  {ROLE_NAMES[s.role]}, {s.value > 0 ? "both get" : "both lose"} {Math.abs(s.value)}
                </small>
              </span>
              <b className={s.value > 0 ? "pos" : "neg"}>{signed(s.value)}</b>
            </div>
          ))}
        </div>
      )}

      <div className={styles.action}>
        <button type="button" className="btn btn-primary btn-block" onClick={onAction} disabled={disabled}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
