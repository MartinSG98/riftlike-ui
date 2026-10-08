import type { Action, Catalog, Matchups, Role, RunSummary, RunView } from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8010";

export class ApiError extends Error {
  constructor(
    public status: number,
    detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init);
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // body was not JSON, keep the status text
    }
    throw new ApiError(response.status, detail);
  }
  return response.json() as Promise<T>;
}

function json(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const api = {
  catalog: () => request<Catalog>("/api/catalog"),

  matchups: (champ: string, role: Role) =>
    request<Matchups>(`/api/matchups/${encodeURIComponent(champ)}?role=${role}`),

  recentRuns: (limit = 6) => request<RunSummary[]>(`/api/runs?limit=${limit}`),

  createRun: (team: string) => request<RunView>("/api/runs", json("POST", { team })),

  getRun: (id: string) => request<RunView>(`/api/runs/${id}`),

  act: (id: string, action: Action) => request<RunView>(`/api/runs/${id}/actions`, json("POST", action)),
};
