"use client";

/**
 * Fetches the one model-written sentence and drops it into the proof card.
 *
 * The numbers are already on screen from the server render, so this never
 * blocks them. If the call fails, times out, or there is no API key, the
 * component renders nothing at all - no error text, no apology, no retry
 * prompt. The card is complete without it.
 */

import { useEffect, useState } from "react";

type State = { status: "loading" } | { status: "done"; text: string | null };

export function ComplaintLine({ sku, store }: { sku: string; store: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/summary?sku=${encodeURIComponent(sku)}&store=${encodeURIComponent(store)}`)
      .then((res) => (res.ok ? res.json() : { summary: null }))
      .then((data) => {
        if (cancelled) return;
        const text = typeof data?.summary === "string" && data.summary.trim() ? data.summary : null;
        setState({ status: "done", text });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "done", text: null });
      });

    return () => {
      cancelled = true;
    };
  }, [sku, store]);

  if (state.status === "loading") {
    return (
      <div className="proof-skeleton" aria-hidden>
        <span />
        <span />
      </div>
    );
  }

  if (!state.text) return null;

  return <p className="proof-complaint">{state.text}</p>;
}
