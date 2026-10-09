import type { ActFn, MapNode, OpponentView, Role, RunView } from "../api/types";
import { cx, ROLE_NAMES, ROLES } from "../lib/format";
import { useTeam } from "../state/catalog";
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
  const height = TOP + (rows + 1) * ROW_H + 66;
  const reach = new Set(run.reachable);
  const visited = new Set(map.path);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));

  const pos = (id: string): Point => {
    if (id === "start") return { x: 50, y: TOP };
    if (id === "match") return { x: 50, y: TOP + (rows + 1) * ROW_H };
    const n = byId.get(id)!;
    return { x: n.x * 100, y: TOP + (n.row + 1) * ROW_H };
  };

  // Everything still reachable later: the open nodes and whatever lies below them. While a pick
  // is waiting nothing is open yet, so plan from the nodes below the one you stand on.
  const next = run.reachable.length ? run.reachable : (byId.get(map.current)?.children ?? []);
  const ahead = new Set<string>();
  const queue = [...next];
  while (queue.length) {
    const id = queue.shift()!;
    if (ahead.has(id) || id === "match") continue;
    ahead.add(id);
    queue.push(...(byId.get(id)?.children ?? []));
  }

  const stateOf = (id: string): NodeState =>
    id === map.current
      ? "here"
      : visited.has(id)
        ? "visited"
        : reach.has(id)
          ? "open"
          : ahead.has(id)
            ? "ahead"
            : "gone";

  const walked = new Set(map.path.slice(1).map((id, i) => `${map.path[i]}>${id}`));
  const edges: [string, string][] = [];
  for (const n of map.nodes) {
    if (n.row === 0) edges.push(["start", n.id]);
    if (n.row === rows - 1) edges.push([n.id, "match"]);
    for (const c of n.children) edges.push([n.id, c]);
  }

  const edgeState = (a: string, b: string) => {
    if (walked.has(`${a}>${b}`)) return styles.walked;
    if (a === map.current && reach.has(b)) return styles.open;
    if (ahead.has(a) && (ahead.has(b) || b === "match")) return styles.ahead;
    return undefined;
  };

  const empty = ROLES.filter((r) => !run.lineup.slots[r]);

  const enter = (id: string) => {
    if (!busy && reach.has(id)) act({ type: "enter", node: id });
  };

  return (
    <>
    <div className={styles.map} style={{ height }}>
      <svg className={styles.edges} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {edges.map(([a, b]) => {
          const p = pos(a);
          const q = pos(b);
          const key = `${a}>${b}`;
          const state = edgeState(a, b);
          const line = (className: string | undefined) => (
            <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={className} vectorEffect="non-scaling-stroke" />
          );
          return (
            <g key={key}>
              {state === styles.walked && line(styles.glow)}
              {line(cx(styles.edge, state))}
            </g>
          );
        })}
      </svg>

      <span
        className={cx(styles.start, map.current === "start" ? styles.startHere : styles.startDone)}
        style={place(pos("start"))}
      >
        ◆{map.current === "start" && <span className={styles.youTag}>You</span>}
      </span>

      {map.nodes.map((n) => (
        <Node
          key={n.id}
          node={n}
          run={run}
          empty={empty}
          at={pos(n.id)}
          state={stateOf(n.id)}
          onEnter={() => enter(n.id)}
        />
      ))}

      {run.opponent && <span className={styles.arena} style={place(pos("match"))} aria-hidden="true" />}
      {run.opponent && (
        <MatchNode
          opponent={run.opponent}
          at={pos("match")}
          open={reach.has("match")}
          busy={busy}
          onEnter={() => enter("match")}
        />
      )}
    </div>
    <ul className={styles.legend} aria-label="Map legend">
      <li><span className={cx(styles.swatch, styles.swHere)} /> You are here</li>
      <li><span className={cx(styles.swatch, styles.swOpen)} /> Can step on next</li>
      <li><span className={cx(styles.swatch, styles.swVisited)} /> Visited</li>
      <li><span className={cx(styles.swatch, styles.swAhead)} /> Further ahead</li>
      <li><span className={cx(styles.swatch, styles.swGone)} /> Out of reach</li>
    </ul>
    </>
  );
}

type NodeState = "here" | "visited" | "open" | "ahead" | "gone";

function place(p: Point) {
  return { left: `${p.x}%`, top: p.y };
}

/** The day's destination: the opponent's banner at the bottom of the map. */
function MatchNode({
  opponent,
  at,
  open,
  busy,
  onEnter,
}: {
  opponent: OpponentView;
  at: Point;
  open: boolean;
  busy: boolean;
  onEnter: () => void;
}) {
  const team = useTeam(opponent.code);
  return (
    <button
      type="button"
      className={cx(styles.node, styles.match, open ? styles.open : styles.ahead)}
      style={place(at)}
      onClick={onEnter}
      disabled={!open || busy}
      aria-label={`Play the match against ${team.name}, power ${opponent.lineup.total}`}
    >
      <TeamBadge code={opponent.code} size="md" />
      <span className={styles.matchText}>
        <span className={styles.matchEyebrow}>{open ? "Play the match" : "The match"}</span>
        <b>{team.name}</b>
        <span>
          Power <b className={styles.matchPower}>{opponent.lineup.total}</b>
        </span>
      </span>
    </button>
  );
}

function Node({
  node,
  run,
  empty,
  at,
  state,
  onEnter,
}: {
  node: MapNode;
  run: RunView;
  empty: Role[];
  at: Point;
  state: NodeState;
  onEnter: () => void;
}) {
  const upcoming = state === "open" || state === "ahead";
  const clickable = state === "open";
  const common = {
    type: "button" as const,
    style: place(at),
    onClick: onEnter,
    disabled: !clickable,
  };
  const marks = (
    <>
      {state === "here" && <span className={styles.youTag}>You</span>}
      {state === "visited" && <span className={styles.check}>✓</span>}
    </>
  );

  if (node.type === "pick") {
    // Every pick offers a champion for one of your empty roles, so these nodes matter most then.
    const fills = upcoming && empty.length > 0;
    const fillLabel = empty.length === 1 ? `Fills ${ROLE_NAMES[empty[0]]}` : "Fills a role";
    const tip = fills
      ? `Pick a champion: three offers, one of them for ${empty.length === 1 ? `your empty ${ROLE_NAMES[empty[0]]}` : "one of your empty roles"}`
      : "Pick a champion: three offers, take one into any role or skip";
    return (
      <button
        {...common}
        className={cx(styles.node, styles.pick, styles[state], fills && styles.fills)}
        aria-label={fills ? `Pick a champion, ${fillLabel.toLowerCase()}` : "Pick a champion"}
        data-tip={tip}
      >
        <span className={styles.plus}>+</span>
        {fills && <span className={cx(styles.caption, styles.fillTag)}>{fillLabel}</span>}
        {marks}
      </button>
    );
  }

  const role = node.role!;
  const enemy = node.enemy!;
  const ours = run.lineup.power[role];
  const tip = ours
    ? `${ROLE_NAMES[role]} 1v1 vs ${enemy.champ} (level ${enemy.level}, power ${node.power}). Your ${run.lineup.slots[role]!.champ}: ${ours.total}`
    : `${ROLE_NAMES[role]} 1v1 vs ${enemy.champ}. You have no ${ROLE_NAMES[role]} champion, so this is a forfeit`;
  const forfeit = !ours && upcoming;
  return (
    <button
      {...common}
      className={cx(styles.node, styles.fight, styles[state], forfeit && styles.forfeit)}
      aria-label={tip}
      data-tip={tip}
    >
      <ChampCrest champ={enemy.champ} size="md" dim={state === "gone"} className={styles.fightCrest} />
      {forfeit && (
        <span className={styles.forfeitMark} aria-hidden="true">
          ✕
        </span>
      )}
      {state !== "visited" && state !== "here" && <span className={cx(styles.badge, styles.enemyBadge)}>{node.power}</span>}
      <span className={cx(styles.caption, forfeit && styles.forfeitText)}>
        <RoleIcon role={role} size={11} /> {ROLE_NAMES[role]} {forfeit ? "forfeit" : "1v1"}
      </span>
      {marks}
    </button>
  );
}
