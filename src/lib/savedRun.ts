// Remembers the run in progress so the title screen can offer "Continue".
// Storage can be unavailable (private mode, blocked site data), so every access is guarded.

const KEY = "riftlike.runId";

export function getSavedRunId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveRunId(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // not fatal, the run is still on the server
  }
}

export function clearSavedRunId(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
