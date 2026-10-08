import type { ActFn, MapNode, RunView } from "../api/types";
import { cx, ROLE_NAMES } from "../lib/format";
import { TeamBadge } from "./Badges";
import { ChampCrest } from "./ChampCrest";
import { RoleIcon } from "./Icons";
import styles from "./MapView.module.css";

const ROW_H = 86;
const TOP = 44;

interface Point {
  x: number;
  y: number;
}

/** One match day: walk from the diamond at the top down to the match. */
export function MapView({ run, act, busy }: { run: RunView; act: ActFn; busy: boolean }) {
  const map = run.map!;
  const rows = Math.max(...map.nodes.map((n) => n.row)) + 1;
  const height = TOP + (rows + 1) * ROW_H + 52;
  const reach = new Set(run.reachable);
  const visited = new Set(map.path);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));

  const pos = (id: string): Point => {
    if (id === "start") return { x: 50, y: TOP };
    if (id === "match") return { x: 50, y: TOP + (rows + 1) * ROW_H };
    const n = byId.get(id)!;
    return { x: n.x * 100, y: TOP + (n.row + 1) * ROW_H };
  };

  const walked = new Set(map.path.slice(1).map((id, i) => `${map.path[i]}>${id}`));
  const edges: [string, string][] = [];
  for (const n of map.nodes) {
    if (n.row === 0) edges.push(["start", n.id]);
    if (n.row === rows - 1) edges.push([n.id, "match"]);
    for (const c of n.children) edges.push([n.id, c]);
  }

  const enter = (id: string) => {
    if (!busy && reach.has(id)) act({ type: "enter", node: id });
  };

  return (
    <div className={styles.map} style={{ height }}>
      <svg className={styles.edges} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([a, b]) => {
          const p = pos(a);
          const q = pos(b);
          const key = `${a}>${b}`;
          const state = walked.has(key) ? styles.walked : a === map.current && reach.has(b) ? styles.open : undefined;
          return (
            <line
              key={key}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={cx(styles.edge, state)}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      <span className={cx(styles.start, map.current === "start" && styles.here)} style={place(pos("start"))}>
        ◆
      </span>

      {map.nodes.map((n) => (
        <Node
          key={n.id}
          node={n}
          run={run}
          at={pos(n.id)}
          state={n.id === map.current ? "here" : visited.has(n.id) ? "visited" : reach.has(n.id) ? "open" : "locked"}
          onEnter={() => enter(n.id)}
        />
      ))}

      {run.opponent && (
        <button
          type="button"
          className={cx(styles.node, styles.match, reach.has("match") && styles.open)}
          style={place(pos("match"))}
          onClick={() => enter("match")}
          disabled={!reach.has("match") || busy}
          aria-label="Play the match"
        >
          <TeamBadge code={run.opponent.code} size="md" />
          <span className={cx(styles.badge, styles.enemyBadge)}>{run.opponent.lineup.total}</span>
          <span className={styles.caption}>Match</span>
        </button>
      )}
    </div>
  );
}

function place(p: Point) {
  return { left: `${p.x}%`, top: p.y };
}

function Node({
  node,
  run,
  at,
  state,
  onEnter,
}: {
  node: MapNode;
  run: RunView;
  at: Point;
  state: "here" | "visited" | "open" | "locked";
  onEnter: () => void;
}) {
  const clickable = state === "open";
  const common = {
    type: "button" as const,
    style: place(at),
    onClick: onEnter,
    disabled: !clickable,
  };

  if (node.type === "pick") {
    return (
      <button
        {...common}
        className={cx(styles.node, styles.pick, styles[state])}
        aria-label="Pick a champion"
        data-tip="Pick a champion: three offers, take one into any role or skip"
      >
        <span className={styles.plus}>+</span>
      </button>
    );
  }

  const role = node.role!;
  const enemy = node.enemy!;
  const ours = run.lineup.power[role];
  const tip = ours
    ? `${ROLE_NAMES[role]} 1v1 vs ${enemy.champ} (level ${enemy.level}, power ${node.power}). Your ${run.lineup.slots[role]!.champ}: ${ours.total}`
    : `${ROLE_NAMES[role]} 1v1 vs ${enemy.champ}. You have no ${ROLE_NAMES[role]} champion, so this is a forfeit`;
  return (
    <button {...common} className={cx(styles.node, styles.fight, styles[state])} aria-label={tip} data-tip={tip}>
      <ChampCrest champ={enemy.champ} size="md" dim={state === "locked"} className={styles.fightCrest} />
      <span className={cx(styles.badge, styles.enemyBadge)}>{node.power}</span>
      <span className={styles.caption}>
        <RoleIcon role={role} size={11} /> {ROLE_NAMES[role]} 1v1
        {!ours && <span className="neg"> ✕</span>}
      </span>
    </button>
  );
}
