import styles from "./HowToPlay.module.css";
import { Modal } from "./Modal";

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Modal labelledBy="how-title" onClose={onClose}>
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 id="how-title" className="display">
            How it works
          </h2>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose} autoFocus>
            Got it
          </button>
        </div>

        <p>
          <b>The tournament.</b> Take one of the 19 teams at Worlds 2026 through the event. Main-stage teams open in
          the Swiss stage, where three wins send you to the Quarterfinals and three losses end the run. Play-In teams
          first fight through a four-team double elimination bracket, and only its winner joins the Swiss stage. Finish
          the Swiss at 3–0 or 3–1 and every champion gets about two levels for each match day you skipped, with the
          ones furthest behind catching up the most. From the Quarterfinals on, one loss and you are out.
        </p>
        <p>
          <b>Match days.</b> Each Play-In, Swiss and Quarterfinal day is a map. Walk from the top down to the match at
          the bottom. A lane fight puts your champion in that role against an enemy, and only that champion earns the
          XP. Matches level the whole team. A pick offers three
          champions: take one into any role, or skip. The Semifinal and Final have no map. Everyone is raised to level
          17 (Final: 18) and you get three picks in a row.
        </p>
        <p>
          <b>Power.</b> Every champion is one number. It starts at 20 and grows by 2 per level, up to level 18 (top
          laners 20). Early game champions start up to 6 ahead and slide to 6 behind by the end. Late game champions
          start 4 behind and finish up to 11 ahead. Mid game champions peak in between. Outside its own roles a
          champion loses 6. Drag a roster row onto another, or click two rows, to swap roles.
        </p>
        <p>
          <b>Signatures.</b> Each player's signature champions are the ten they have played most in their pro career,
          in their role. The most played is worth +5, then +4, +3, +3, +2, +2 and +1 for the last four, when that
          player plays it in their own role. Opponents get theirs too.
        </p>
        <p>
          <b>Synergy.</b> Some duos give each other power: triple for the bot lane pair, double for jungle and mid,
          single anywhere else. Known duos like Xayah and Rakan count the most. Types that work together count too,
          for example a late marksman with an enchanter, an early marksman with an engage support, or a jungle tank
          with a mid mage. Your active synergies are listed under the roster. A team that is all AD or all AP loses 3
          on every champion.
        </p>
        <p>
          <b>Matches.</b> Lanes clash from top to bottom, and a champion that counters its lane opponent gets up to
          +5 on top of its bonuses: early champions beat late ones in lane, fighters beat tanks, assassins beat mages,
          and ranged beats melee. The stronger side wins the clash and carries what it has left into the next enemy. Whoever has power
          left at the end wins, so the sum of your five champions is what counts. An empty role is worth nothing. The
          Roster and Scout buttons show every champion's counters and who counters them.
        </p>
        <p>
          <b>Opponents.</b> Every opponent fields its Worlds 2026 roster. Early on they play what they like. Deeper in
          the run they draft properly for the level they are at.
        </p>
        <p className={styles.note}>
          Signature lists, duo synergies and lane matchups are hand-tuned approximations, not live statistics.
        </p>
      </div>
    </Modal>
  );
}
