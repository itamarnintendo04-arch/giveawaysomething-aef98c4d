import type { z } from "zod";

export async function signDashboardRequest(secret: string, timestamp: string, nonce: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${nonce}.${body}`));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function requestBot<T>(
  baseUrl: string | undefined,
  botToken: string | undefined,
  path: string,
  method: "GET" | "POST",
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  if (!baseUrl || !botToken) throw new Error("The bot connection needs its Render address before it can be used.");
  const serializedBody = method === "POST" ? JSON.stringify(body ?? {}) : "";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const signature = await signDashboardRequest(botToken, timestamp, nonce, serializedBody);
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, "")}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        "X-Dashboard-Timestamp": timestamp,
        "X-Dashboard-Nonce": nonce,
        "X-Dashboard-Signature": signature,
      },
      body: method === "POST" ? serializedBody : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new Error("The bot could not be reached. Check that it is online on Render.");
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : "The bot could not complete this action.";
    throw new Error(message);
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error("The bot returned an unexpected response. Update the bot and try again.");
  return parsed.data;
}
