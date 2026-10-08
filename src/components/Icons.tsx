import type { Role } from "../api/types";
import { ROLE_NAMES } from "../lib/format";

const ROLE_PATHS: Record<Role, string> = {
  TOP: "M2.5 12.8 8 3.4l5.5 9.4h-2.8L8 8.2l-2.7 4.6z",
  JGL: "M8 1.4c3 2.7 4.4 5.3 4.4 7.7a4.4 4.4 0 0 1-8.8 0c0-2.4 1.4-5 4.4-7.7zm0 4.7c-1 1.3-1.6 2.3-1.6 3.1a1.6 1.6 0 0 0 3.2 0c0-.8-.6-1.8-1.6-3.1z",
  MID: "M8 1.4 14.6 8 8 14.6 1.4 8zm0 3.4L4.8 8 8 11.2 11.2 8z",
  BOT: "M2.5 3.2 8 12.6l5.5-9.4h-2.8L8 7.8 5.3 3.2z",
  SUP: "M8 1.4l5.6 2.3v4.1c0 3.3-2.3 5.7-5.6 6.8-3.3-1.1-5.6-3.5-5.6-6.8V3.7zm0 2.4L4.6 5.2v2.6c0 2 1.3 3.6 3.4 4.4 2.1-.8 3.4-2.4 3.4-4.4V5.2z",
};

export function RoleIcon({ role, size = 14, className }: { role: Role; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className={className} role="img" aria-label={ROLE_NAMES[role]}>
      <path d={ROLE_PATHS[role]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** A simple emblem per champion class, drawn behind crests and card banners. */
export function ClassSigil({ cls, className }: { cls: string; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const };
  let shape;
  switch (cls) {
    case "Fighter":
      shape = <path d="M5 5l14 14M19 5 5 19M7.5 15.5l1 1M16.5 15.5l-1 1" {...stroke} />;
      break;
    case "Mage":
      shape = <path d="M12 2l2.3 7.7L22 12l-7.7 2.3L12 22l-2.3-7.7L2 12l7.7-2.3z" fill="currentColor" />;
      break;
    case "Assassin":
      shape = <path d="M12 2l2.6 12.5H9.4zM7 15.5h10v2H7zm4 2h2V22h-2z" fill="currentColor" />;
      break;
    case "Tank":
      shape = <path d="M12 2l8.5 3.2v6.4c0 5-3.6 8.8-8.5 10.4-4.9-1.6-8.5-5.4-8.5-10.4V5.2z" fill="currentColor" />;
      break;
    case "Marksman":
      shape = (
        <g {...stroke}>
          <circle cx="12" cy="12" r="6.5" />
          <path d="M12 2v5M12 17v5M2 12h5M17 12h5" />
        </g>
      );
      break;
    default:
      shape = <path d="M12 2c4.2 4.8 7 8.6 7 12.2a7 7 0 0 1-14 0C5 10.6 7.8 6.8 12 2z" fill="currentColor" />;
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {shape}
    </svg>
  );
}

export function TrophyIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path
        d="M7 3h10v2h3v2.5A4.5 4.5 0 0 1 16.2 12 5 5 0 0 1 13 14.8V18h3v3H8v-3h3v-3.2A5 5 0 0 1 7.8 12 4.5 4.5 0 0 1 4 7.5V5h3zm0 4H6v.5c0 1 .5 1.9 1.3 2.4A7 7 0 0 1 7 8zm10 0v1c0 .7-.1 1.3-.3 1.9.8-.5 1.3-1.4 1.3-2.4V7z"
        fill="currentColor"
      />
    </svg>
  );
}
