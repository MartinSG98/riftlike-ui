// Mirrors app/game/state.py and app/game/views.py in riftlike-backend.

export type Role = "TOP" | "JGL" | "MID" | "BOT" | "SUP";
export type Stage = "playin" | "swiss" | "qf" | "sf" | "final";
export type Focus = "early" | "mid" | "late";

export interface ChampionInfo {
  roles: Role[];
  focus: Focus;
  dmg: "AD" | "AP" | "MX";
  cls: string;
}

export interface TeamInfo {
  code: string;
  name: string;
  league: string;
  seed: number;
  play_in: boolean;
  color: string;
  players: Record<Role, string>;
}

export interface LeagueInfo {
  code: string;
  region: string;
}

export interface Catalog {
  champions: Record<string, ChampionInfo>;
  teams: TeamInfo[];
  leagues: LeagueInfo[];
}

export interface MatchupEntry {
  champ: string;
  value: number;
}

export interface Matchups {
  champ: string;
  role: Role;
  counters: MatchupEntry[];
  countered_by: MatchupEntry[];
}

export interface Unit {
  champ: string;
  level: number;
  xp: number;
}

export interface PowerPart {
  label: string;
  value: number;
  kind: "level" | "focus" | "offrole" | "signature" | "synergy" | "comp";
}

export interface PowerLine {
  total: number;
  base: number;
  bonus: number;
  parts: PowerPart[];
}

export interface Lineup {
  slots: Record<Role, Unit | null>;
  power: Record<Role, PowerLine | null>;
  total: number;
  warnings: string[];
}

export interface MapNode {
  id: string;
  row: number;
  col: number;
  x: number;
  type: "fight" | "pick";
  children: string[];
  role: Role | null;
  enemy: Unit | null;
  power: number | null;
  level: number | null;
}

export interface MapState {
  nodes: MapNode[];
  current: string;
  path: string[];
}

export interface OpponentView {
  code: string;
  level: number;
  lineup: Lineup;
}

export interface XpGain {
  role: Role;
  champ: string;
  before: number;
  after: number;
  gained: number;
}

export interface Offer {
  champ: string;
  level: number;
}

export interface FightResult {
  role: Role;
  champ: string | null;
  level: number | null;
  enemy: Unit;
  ours: number;
  theirs: number;
  ours_parts: PowerPart[];
  theirs_parts: PowerPart[];
  matchup: number;
  outcome: "win" | "loss" | "draw" | "forfeit";
  xp: XpGain[];
}

export interface LaneSide {
  role: Role;
  champ: string | null;
  level: number | null;
  player: string;
  power: number;
  counter: number;
  parts: PowerPart[];
}

export interface ClashStep {
  ours: number;
  theirs: number;
  ours_power: number;
  theirs_power: number;
  winner: "us" | "them" | "tie";
  left: number;
}

export interface NextStep {
  kind: "day" | "stage" | "out" | "champion";
  stage: Stage | null;
  skipped: number;
  label: string;
}

export interface MatchResult {
  opponent: string;
  label: string;
  ours: LaneSide[];
  theirs: LaneSide[];
  steps: ClashStep[];
  win: boolean;
  left: number;
  xp: XpGain[];
  next: NextStep;
}

export interface PendingFirst {
  kind: "first";
  role: Role;
  level: number;
  offers: Offer[];
}

export interface PendingPick {
  kind: "pick";
  node: string | null;
  level: number;
  offers: Offer[];
  draft_left: number;
}

export interface PendingFight {
  kind: "fight";
  node: string;
  result: FightResult;
}

export interface PendingMatch {
  kind: "match";
  result: MatchResult;
}

export interface PendingStage {
  kind: "stage";
  from_stage: Stage;
  to_stage: Stage;
  skipped: number;
  xp: XpGain[];
}

export type Pending = PendingFirst | PendingPick | PendingFight | PendingMatch | PendingStage;

export interface Projection {
  power: number;
  delta: number;
  replaces: string | null;
}

export interface OfferView {
  champ: string;
  level: number;
  power: number;
  power_16: number;
  signatures: { role: Role; player: string; bonus: number }[];
  synergies: { champ: string; role: Role; value: number }[];
  projections: Record<Role, Projection>;
  best_role: Role;
}

export interface MatchRecord {
  stage: Stage;
  label: string;
  opponent: string;
  win: boolean;
}

export interface RunView {
  id: string;
  team: string;
  stage: Stage;
  day: number;
  day_label: string;
  swiss: { w: number; l: number };
  playin_node: string;
  lineup: Lineup;
  map: MapState | null;
  reachable: string[];
  opponent: OpponentView | null;
  pending: Pending | null;
  offers: OfferView[];
  history: MatchRecord[];
  result: "champion" | "eliminated" | null;
}

export interface RunSummary {
  id: string;
  team: string;
  stage: Stage;
  result: "champion" | "eliminated" | null;
  label: string;
  updated_at: string;
}

export type Action =
  | { type: "choose_first"; champ: string }
  | { type: "enter"; node: string }
  | { type: "pick"; champ: string; role: Role }
  | { type: "skip" }
  | { type: "swap"; a: Role; b: Role }
  | { type: "continue" }
  | { type: "start_match" };

export type ActFn = (action: Action) => void;
