import { cookies } from "next/headers";

export const SESSION_COOKIE = "omagbt_session";

export async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === "1";
}
