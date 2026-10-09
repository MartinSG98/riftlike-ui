import type { Focus, PowerLine } from "../api/types";
import { capitalize, cx, signed, vars } from "../lib/format";
import { useTeam } from "../state/catalog";
import styles from "./Badges.module.css";

export function TeamBadge({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const team = useTeam(code);
  return (
    <span
      className={cx(styles.team, styles[size], code.length > 3 && styles.long)}
      style={vars({ "--tc": team.color })}
      title={team.name}
    >
      {code}
    </span>
  );
}

export function FocusChip({ focus }: { focus: Focus }) {
  return <span className={cx(styles.focus, styles[focus])}>{capitalize(focus)} game</span>;
}

/**
 * A power number. With a line it explains itself on hover or focus, and with `showBonus` it
 * carries the sum of its bonuses under the total.
 */
export function PowerBox({
  line,
  value,
  tone = "us",
  size = "md",
  showBonus,
}: {
  line?: PowerLine | null;
  value?: number;
  tone?: "us" | "them" | "plain";
  size?: "sm" | "md" | "lg";
  showBonus?: boolean;
}) {
  const total = value ?? line?.total ?? 0;
  const bonus = showBonus && line && line.bonus !== 0 ? line.bonus : null;
  return (
    <span
      className={cx(styles.power, styles[tone], styles[size], bonus !== null && styles.withBonus)}
      tabIndex={line ? 0 : undefined}
    >
      {total}
      {bonus !== null && <small className={bonus > 0 ? styles.bonusUp : styles.bonusDown}>{signed(bonus)}</small>}
      {line && (
        <span className={styles.tip} role="tooltip">
          {line.parts.map((part, i) => (
            <span key={i} className={styles.tipRow}>
              <span>{part.label}</span>
              <b className={part.kind === "level" ? undefined : part.value >= 0 ? "pos" : "neg"}>
                {part.kind === "level" ? part.value : signed(part.value)}
              </b>
            </span>
          ))}
          <span className={cx(styles.tipRow, styles.tipTotal)}>
            <span>Power</span>
            <b>{line.total}</b>
          </span>
        </span>
      )}
    </span>
  );
}
