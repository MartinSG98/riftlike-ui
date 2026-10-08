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

export function PlayerAvatar({ name, bonus }: { name: string; bonus?: number }) {
  return (
    <span className={styles.player} title={name}>
      {name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}
      {bonus ? <span className={styles.sigBonus}>+{bonus}</span> : null}
    </span>
  );
}

export function FocusChip({ focus }: { focus: Focus }) {
  return <span className={cx(styles.focus, styles[focus])}>{capitalize(focus)} game</span>;
}

/** A power number. With a line it explains itself on hover or focus. */
export function PowerBox({
  line,
  value,
  tone = "us",
  size = "md",
}: {
  line?: PowerLine | null;
  value?: number;
  tone?: "us" | "them" | "plain";
  size?: "sm" | "md" | "lg";
}) {
  const total = value ?? line?.total ?? 0;
  return (
    <span className={cx(styles.power, styles[tone], styles[size])} tabIndex={line ? 0 : undefined}>
      {total}
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
