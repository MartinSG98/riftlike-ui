// A stable abstract emblem per champion, derived from its name. Same name, same emblem,
// so a champion is recognisable at a glance without any game art.

export interface EmblemSpec {
  hue: number; // background
  accent: number; // the glyph
  shape: "polygon" | "star" | "frame";
  sides: number;
  rotation: number;
  inner: "none" | "dot" | "ring" | "core";
  rays: number;
  moons: number;
}

function fnv(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function emblemFor(name: string): EmblemSpec {
  const h = fnv(name);
  // A second hash for the shape bits, so names that share a hue still differ in form.
  const g = fnv(`${name}#emblem`);
  const hue = h % 360;
  const sides = 3 + (g % 6);
  return {
    hue,
    accent: (hue + 100 + ((g >>> 4) % 160)) % 360,
    shape: (["polygon", "star", "frame"] as const)[(g >>> 8) % 3],
    sides,
    rotation: ((g >>> 11) % 6) * (360 / sides / 6),
    inner: (["none", "dot", "ring", "core"] as const)[(g >>> 14) % 4],
    rays: [0, 0, 4, 6, 8][(g >>> 17) % 5],
    moons: (g >>> 21) % 3,
  };
}

/** Points of a regular polygon, or a star when `inner` is given, centered in a 100 by 100 box. */
export function polygonPoints(sides: number, radius: number, rotation: number, inner?: number): string {
  const count = inner ? sides * 2 : sides;
  const points: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = inner && i % 2 === 1 ? inner : radius;
    const angle = ((rotation - 90) * Math.PI) / 180 + (i * 2 * Math.PI) / count;
    points.push(`${(50 + r * Math.cos(angle)).toFixed(2)},${(50 + r * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}
