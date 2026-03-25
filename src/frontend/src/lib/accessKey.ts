export type AccessKeyResult = "owner" | "admin" | "invalid";

import type { backendInterface } from "../backend";

type ActorWithAccessKey = backendInterface & {
  verifyAccessKey: (
    key: string,
  ) => Promise<{ owner: null } | { admin: null } | { invalid: null }>;
};

export async function verifyAccessKey(
  actor: backendInterface | null,
  key: string,
): Promise<AccessKeyResult> {
  if (!actor) return "invalid";
  try {
    const raw = await (actor as ActorWithAccessKey).verifyAccessKey(key);
    if ("owner" in raw) return "owner";
    if ("admin" in raw) return "admin";
    return "invalid";
  } catch {
    return "invalid";
  }
}
