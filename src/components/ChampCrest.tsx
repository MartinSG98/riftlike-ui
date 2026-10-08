import { useState } from "react";

import { iconUrl, splashUrl } from "../lib/art";
import { emblemFor, polygonPoints } from "../lib/emblem";
import { cx, initials, vars } from "../lib/format";
import { useCatalog } from "../state/catalog";
import styles from "./ChampCrest.module.css";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * A champion's crest: its portrait, ringed in the color of its focus. Falls back to the
 * generated emblem if the portrait is missing.
 */
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
  const [broken, setBroken] = useState<string | null>(null);
  if (!champ) return <span className={cx(styles.crest, styles[size], styles.empty, className)} />;
  const info = champions[champ];
  return (
    <span
      className={cx(styles.crest, styles[size], styles[info.focus], dim && styles.dim, className)}
      style={vars({ "--h": emblemFor(champ).hue })}
      title={champ}
    >
      {broken === champ ? (
        <>
          <Emblem champ={champ} className={styles.emblem} />
          <span className={styles.letters}>{initials(champ)}</span>
        </>
      ) : (
        <span className={styles.portrait}>
          <img src={iconUrl(champ)} alt="" loading="lazy" onError={() => setBroken(champ)} />
        </span>
      )}
      {level != null && <span className={styles.level}>{level}</span>}
    </span>
  );
}

/** The tall header on champion cards, showing the champion's splash art. */
export function ChampBanner({ champ, children }: { champ: string; children?: React.ReactNode }) {
  const { champions } = useCatalog();
  const [broken, setBroken] = useState<string | null>(null);
  const info = champions[champ];
  return (
    <div className={cx(styles.banner, styles[info.focus])} style={vars({ "--h": emblemFor(champ).hue })}>
      {broken === champ ? (
        <>
          <Emblem champ={champ} className={styles.bannerEmblem} />
          <span className={styles.ghost}>{initials(champ)}</span>
        </>
      ) : (
        <img className={styles.splash} src={splashUrl(champ)} alt="" onError={() => setBroken(champ)} />
      )}
      <div className={styles.bannerContent}>{children}</div>
    </div>
  );
}

function Emblem({ champ, className }: { champ: string; className?: string }) {
  const e = emblemFor(champ);
  const line = `hsl(${e.accent} 85% 72%)`;
  const fill = `hsl(${e.accent} 70% 55% / 0.32)`;
  const light = `hsl(${e.accent} 90% 84%)`;
  const at = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  };

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: e.rays }, (_, i) => {
        const deg = e.rotation + (i * 360) / e.rays;
        const p = at(deg, 37);
        const q = at(deg, 47);
        return (
          <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={line} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
        );
      })}

      {e.shape === "star" && (
        <polygon
          points={polygonPoints(e.sides, 34, e.rotation, 16)}
          fill={fill}
          stroke={line}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      {e.shape === "polygon" && (
        <polygon points={polygonPoints(e.sides, 31, e.rotation)} fill={fill} stroke={line} strokeWidth={2.5} strokeLinejoin="round" />
      )}
      {e.shape === "frame" && (
        <>
          <polygon points={polygonPoints(e.sides, 33, e.rotation)} fill="none" stroke={line} strokeWidth={3} strokeLinejoin="round" />
          <polygon
            points={polygonPoints(e.sides, 22, e.rotation + 180 / e.sides)}
            fill={fill}
            stroke={line}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </>
      )}

      {e.inner === "dot" && <circle cx={50} cy={50} r={6} fill={light} />}
      {e.inner === "ring" && <circle cx={50} cy={50} r={10} fill="none" stroke={light} strokeWidth={2.5} />}
      {e.inner === "core" && <polygon points={polygonPoints(e.sides, 9, e.rotation + 180 / e.sides)} fill={light} />}

      {Array.from({ length: e.moons }, (_, i) => {
        const p = at(e.rotation + 45 + i * 180, 42);
        return <circle key={i} cx={p.x} cy={p.y} r={3.2} fill={light} />;
      })}
    </svg>
  );
}
