import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieJar } = vi.hoisted(() => ({
  cookieJar: new Map<string, string>(),
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

import { DELETE, POST } from "./route";

describe("/api/session", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  it("sets an httpOnly session cookie for the household login", async () => {
    const res = await POST(
      new Request("http://localhost/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "VlovesJ", password: "105441" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(cookieJar.get("omagbt_session")).toBe("1");
  });

  it("rejects the wrong password and clears the cookie on sign-out", async () => {
    cookieJar.set("omagbt_session", "1");
    const res = await POST(
      new Request("http://localhost/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: "VlovesJ", password: "wrong" }),
      }),
    );
    expect(res.status).toBe(401);
    expect(cookieJar.get("omagbt_session")).toBe("1");

    const signedOut = await DELETE();
    expect(signedOut.status).toBe(200);
    expect(cookieJar.get("omagbt_session")).toBeUndefined();
  });
});
