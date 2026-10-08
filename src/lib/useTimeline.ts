import { useCallback, useEffect, useState } from "react";

const SPEED_KEY = "riftlike.playbackSpeed";

export function readSpeed(): number {
  try {
    return localStorage.getItem(SPEED_KEY) === "2" ? 2 : 1;
  } catch {
    return 1;
  }
}

export function writeSpeed(speed: number): void {
  try {
    localStorage.setItem(SPEED_KEY, String(speed));
  } catch {
    // not fatal, the speed just resets next time
  }
}

/**
 * Steps through a list of beats, each shown for its own duration. `index` is the latest
 * beat on screen, `done` turns true once the last one has had its time.
 */
export function useTimeline(beats: { ms: number }[], speed: number) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= beats.length) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), beats[step].ms / speed);
    return () => window.clearTimeout(timer);
  }, [step, beats, speed]);

  const skip = useCallback(() => setStep(beats.length), [beats.length]);

  return {
    index: Math.min(step, beats.length - 1),
    done: step >= beats.length,
    progress: beats.length ? Math.min(1, step / beats.length) : 1,
    skip,
  };
}
