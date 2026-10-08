import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieJar, cloud } = vi.hoisted(() => ({
  cookieJar: new Map<string, string>(),
  cloud: {
    ready: true,
    loadCloudState: vi.fn(),
    saveCloudState: vi.fn(),
    wipeCloudState: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => {
      if (!value) cookieJar.delete(name);
      else cookieJar.set(name, value);
    },
  }),
}));

vi.mock("@/lib/cloud/server", () => ({
  isCloudSyncReady: () => cloud.ready,
  loadCloudState: (...args: unknown[]) => cloud.loadCloudState(...args),
  saveCloudState: (...args: unknown[]) => cloud.saveCloudState(...args),
  wipeCloudState: (...args: unknown[]) => cloud.wipeCloudState(...args),
}));

import { DELETE, GET, PUT } from "./route";

function request(method: string, body?: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost/api/sync", {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const validPayload = {
  profile: { displayName: "Jesvitha" },
  companion: { name: "Pip" },
  memories: [{ id: "mem_1", key: "Favorite color", value: "teal" }],
  conversations: [],
  messages: [],
};

describe("/api/sync", () => {
  beforeEach(() => {
    cookieJar.clear();
    cloud.ready = true;
    cloud.loadCloudState.mockReset();
    cloud.saveCloudState.mockReset();
    cloud.wipeCloudState.mockReset();
  });

  it("requires the sign-in cookie", async () => {
    const res = await GET(request("GET", undefined, "203.0.113.11"));
    expect(res.status).toBe(401);
    expect(cloud.loadCloudState).not.toHaveBeenCalled();
  });

  it("reports local-only when Convex is not configured", async () => {
    cookieJar.set("omagbt_session", "1");
    cloud.ready = false;
    const res = await GET(request("GET", undefined, "203.0.113.12"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ cloud: false, payload: null, memoryCount: 0 });
  });

  it("returns the Convex snapshot for a signed-in household", async () => {
    cookieJar.set("omagbt_session", "1");
    cloud.loadCloudState.mockResolvedValue({
      payload: validPayload,
      updatedAt: "2026-10-08T00:00:00.000Z",
      memoryCount: 1,
      householdId: "jesvitha",
    });
    const res = await GET(request("GET", undefined, "203.0.113.13"));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.cloud).toBe(true);
    expect(json.memoryCount).toBe(1);
    expect(json.payload.memories[0].value).toBe("teal");
  });

  it("rejects a snapshot that is missing the child profile", async () => {
    cookieJar.set("omagbt_session", "1");
    const res = await PUT(request("PUT", { payload: { memories: [] } }, "203.0.113.14"));
    expect(res.status).toBe(400);
    expect(cloud.saveCloudState).not.toHaveBeenCalled();
  });

  it("saves a valid snapshot and can wipe it", async () => {
    cookieJar.set("omagbt_session", "1");
    cloud.saveCloudState.mockResolvedValue(undefined);
    cloud.wipeCloudState.mockResolvedValue(undefined);

    const saved = await PUT(request("PUT", { payload: validPayload }, "203.0.113.15"));
    expect(saved.status).toBe(200);
    expect(cloud.saveCloudState).toHaveBeenCalledOnce();
    const stored = cloud.saveCloudState.mock.calls[0][0];
    expect(stored.profile.displayName).toBe("Jesvitha");
    expect(stored.memories[0].value).toBe("teal");

    const wiped = await DELETE(request("DELETE", undefined, "203.0.113.16"));
    expect(wiped.status).toBe(200);
    await expect(wiped.json()).resolves.toEqual({ cloud: true, ok: true });
    expect(cloud.wipeCloudState).toHaveBeenCalledOnce();
  });
});
