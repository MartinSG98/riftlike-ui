import { Wordmark } from "./Wordmark";

export function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="page center" style={{ paddingTop: "18vh" }}>
      <Wordmark />
      <p className="lead">
        The game server is not answering. Start riftlike-backend on port 8010 and try again.
      </p>
      <p style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      </p>
    </main>
  );
}
