"use client";

import * as React from "react";
import { isLegacyDemoSnapshot, parseCloudPayload, serializeAppData } from "@/lib/cloud/payload";
import { useAppStore } from "./app-store";

function waitForPersist(): Promise<void> {
  const api = useAppStore.persist;
  if (api.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = api.onFinishHydration(() => {
      unsub?.();
      resolve();
    });
    if (api.hasHydrated()) resolve();
  });
}

/**
 * After localStorage hydrates, pull Jesvitha's household snapshot from Convex
 * and debounce later edits back up. Offline or unconfigured deployments keep
 * the on-device cache.
 */
export function CloudSync({ children }: { children: React.ReactNode }) {
  const markHydrated = useAppStore((s) => s.markHydrated);

  React.useEffect(() => {
    let cancelled = false;
    let skip = false;
    let lastPushed = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsub: (() => void) | undefined;

    async function boot() {
      await waitForPersist();
      if (cancelled) return;

      const timeout = window.setTimeout(() => {
        if (!cancelled && !useAppStore.getState().hydrated) markHydrated();
      }, 5000);

      try {
        const res = await fetch("/api/sync", { credentials: "include" });
        if (res.ok) {
          const body = (await res.json()) as { cloud?: boolean; payload?: unknown };
          const cloud = parseCloudPayload(body.payload);
          if (cloud && !cancelled) {
            skip = true;
            lastPushed = JSON.stringify(serializeAppData(cloud as unknown as Record<string, unknown>));
            useAppStore.setState(cloud);
            skip = false;
          } else if (body.cloud) {
            let payload = serializeAppData(useAppStore.getState() as unknown as Record<string, unknown>);
            if (isLegacyDemoSnapshot(payload)) {
              const fresh = (await import("@/lib/demo/seed")).createInitialData();
              skip = true;
              useAppStore.setState(fresh);
              skip = false;
              payload = serializeAppData(fresh as unknown as Record<string, unknown>);
            }
            lastPushed = JSON.stringify(payload);
            await fetch("/api/sync", {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ payload }),
            });
          }
        }
      } catch {
        // Offline: keep the local cache and continue.
      } finally {
        window.clearTimeout(timeout);
      }

      if (!cancelled) markHydrated();

      unsub = useAppStore.subscribe(() => {
        if (skip || cancelled) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const payload = serializeAppData(useAppStore.getState() as unknown as Record<string, unknown>);
          const encoded = JSON.stringify(payload);
          if (encoded === lastPushed) return;
          lastPushed = encoded;
          void fetch("/api/sync", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload }),
          });
        }, 900);
      });
    }

    void boot();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsub?.();
    };
  }, [markHydrated]);

  return <>{children}</>;
}
