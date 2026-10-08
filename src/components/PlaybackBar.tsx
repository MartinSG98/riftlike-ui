import { useEffect } from "react";

import { cx } from "../lib/format";
import styles from "./PlaybackBar.module.css";

/**
 * The control under a fight or match playback. While it plays: progress, a speed toggle
 * and Skip. Once it is over: the Continue button. Space or Enter does whichever is showing.
 */
export function PlaybackBar({
  progress,
  done,
  onSkip,
  speed,
  onSpeed,
  continueLabel,
  onContinue,
  disabled,
  subdued,
}: {
  progress: number;
  done: boolean;
  onSkip: () => void;
  speed: number;
  onSpeed: (speed: number) => void;
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
        <span className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </span>
      <button
        type="button"
        className={cx(styles.speed, speed === 2 && styles.speedOn)}
        onClick={() => onSpeed(speed === 2 ? 1 : 2)}
        aria-pressed={speed === 2}
        title="Play twice as fast"
      >
        2×
      </button>
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
