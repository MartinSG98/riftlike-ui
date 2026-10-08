import type { CSSProperties } from "react";

import type { Role, Stage } from "../api/types";

export const ROLES: Role[] = ["TOP", "JGL", "MID", "BOT", "SUP"];

export const ROLE_NAMES: Record<Role, string> = {
  TOP: "Top",
  JGL: "Jungle",
  MID: "Mid",
  BOT: "Bot",
  SUP: "Support",
};

export const STAGES: Stage[] = ["playin", "swiss", "qf", "sf", "final"];

export const STAGE_NAMES: Record<Stage, string> = {
  playin: "Play-In",
  swiss: "Swiss stage",
  qf: "Quarterfinal",
  sf: "Semifinal",
  final: "Final",
};

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

/** Inline style with CSS custom properties, e.g. vars({ "--d": "1.2s" }). */
export function vars(values: Record<string, string | number>): CSSProperties {
  return values as CSSProperties;
}

export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}

export function initials(name: string): string {
  const words = name.replace(/[^A-Za-z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] ?? name).slice(0, 2).toUpperCase();
}

/** Stable hue per name, used to tint champion crests. */
export function hue(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
