import { useEffect } from "react";

import { cx, vars } from "../lib/format";
import styles from "./PlaybackBar.module.css";

/**
 * The control under a fight or match playback. While it plays: a progress bar and a
 * Skip button. Once it is over: the Continue button. Space or Enter does whichever is
 * showing.
 */
export function PlaybackBar({
  duration,
  done,
  onSkip,
  onDone,
  continueLabel,
  onContinue,
  disabled,
  subdued,
}: {
  duration: number;
  done: boolean;
  onSkip: () => void;
  onDone: () => void;
  continueLabel: string;
  onContinue: () => void;
  disabled?: boolean;
  subdued?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "A") return;
      e.preventDefault();
      if (!done) onSkip();
      else if (!disabled) onContinue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, disabled, onSkip, onContinue]);

  if (done) {
    return (
      <div className={styles.actions}>
        <button
          type="button"
          className={cx("btn", subdued ? "btn-ghost" : "btn-primary", styles.continue)}
          disabled={disabled}
          onClick={onContinue}
          autoFocus
        >
          {continueLabel}
          <kbd className={styles.kbd}>Space</kbd>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bar} role="group" aria-label="Playback">
      <span className={styles.label}>Playing</span>
      <span className={styles.track}>
        <span className={styles.fill} style={vars({ "--dur": `${duration}s` })} onAnimationEnd={onDone} data-timed />
      </span>
      <button type="button" className={styles.skip} onClick={onSkip}>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M2 3l6 5-6 5zM8 3l6 5-6 5z" fill="currentColor" />
        </svg>
        Skip
        <kbd className={styles.kbd}>Space</kbd>
      </button>
    </div>
  );
}
