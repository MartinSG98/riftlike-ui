import type { SynergyLink } from "../api/types";
import { cx, signed } from "../lib/format";
import { RoleIcon } from "./Icons";
import styles from "./SynergyList.module.css";

/** The duos in a lineup that give each other power, with what each of them gets. */
export function SynergyList({ links, tone = "us" }: { links: SynergyLink[]; tone?: "us" | "them" }) {
  return (
    <div className={cx(styles.box, styles[tone])}>
      <span className={styles.title}>
        Synergies <span className={styles.count}>{links.length}</span>
      </span>
      {links.length === 0 ? (
        <p className={styles.none}>
          {tone === "us"
            ? "None yet. A late marksman with an enchanter, or a jungle tank with a mid mage, adds power to both."
            : "None in this lineup."}
        </p>
      ) : (
        <ul className={styles.list}>
          {links.map((link) => (
            <li key={link.roles.join("-")} className={cx(styles.link, link.value < 0 && styles.bad)}>
              <span className={styles.pair}>
                <RoleIcon role={link.roles[0]} size={11} />
                <b>{link.champs[0]}</b>
                <span className={styles.plus}>+</span>
                <RoleIcon role={link.roles[1]} size={11} />
                <b>{link.champs[1]}</b>
              </span>
              <span className={styles.name}>{link.archetype ?? (link.value < 0 ? "Bad duo" : "Known duo")}</span>
              <span className={cx(styles.value, link.value > 0 ? "gain" : "loss")}>{signed(link.value)} each</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
