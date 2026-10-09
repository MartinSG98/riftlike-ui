/** Champions whose art id is not just the display name with punctuation and spaces removed. */
const ID_OVERRIDES: Record<string, string> = {
  "Bel'Veth": "Belveth",
  "Cho'Gath": "Chogath",
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  LeBlanc: "Leblanc",
  "Nunu & Willump": "Nunu",
  "Renata Glasc": "Renata",
  "Vel'Koz": "Velkoz",
  Wukong: "MonkeyKing",
};

const BASE = `${import.meta.env.BASE_URL}champions`;

/** The file id a champion's art is stored under in public/champions, e.g. "Kai'Sa" -> "Kaisa". */
export function artId(name: string): string {
  return ID_OVERRIDES[name] ?? name.replace(/[^A-Za-z0-9]/g, "");
}

/** Square 128px portrait. */
export function iconUrl(name: string): string {
  return `${BASE}/icons/${artId(name)}.png`;
}

/** A team's logo in public/teams, named after its tag, e.g. "GEN" -> teams/GEN.png. */
export function logoUrl(code: string): string {
  return `${import.meta.env.BASE_URL}teams/${code}.png`;
}

/** Wide default splash. */
export function splashUrl(name: string): string {
  return `${BASE}/splash/${artId(name)}_0.jpg`;
}
