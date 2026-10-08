import { useCatalog } from "../state/catalog";
import { cx, hue, initials, vars } from "../lib/format";
import styles from "./ChampCrest.module.css";
import { ClassSigil } from "./Icons";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

/** A champion's emblem: tinted per champion, ringed by its focus, marked with its class. */
export function ChampCrest({
  champ,
  size = "md",
  level,
  dim,
  className,
}: {
  champ: string | null;
  size?: Size;
  level?: number | null;
  dim?: boolean;
  className?: string;
}) {
  const { champions } = useCatalog();
  if (!champ) return <span className={cx(styles.crest, styles[size], styles.empty, className)} />;
  const info = champions[champ];
  return (
    <span
      className={cx(styles.crest, styles[size], styles[info.focus], dim && styles.dim, className)}
      style={vars({ "--h": hue(champ) })}
      title={champ}
    >
      <ClassSigil cls={info.cls} className={styles.sigil} />
      <span className={styles.letters}>{initials(champ)}</span>
      {level != null && <span className={styles.level}>{level}</span>}
    </span>
  );
}

/** The tall header on champion cards. */
export function ChampBanner({ champ, children }: { champ: string; children?: React.ReactNode }) {
  const { champions } = useCatalog();
  const info = champions[champ];
  return (
    <div className={cx(styles.banner, styles[info.focus])} style={vars({ "--h": hue(champ) })}>
      <ClassSigil cls={info.cls} className={styles.bannerSigil} />
      <span className={styles.ghost}>{initials(champ)}</span>
      <div className={styles.bannerContent}>{children}</div>
    </div>
  );
}
