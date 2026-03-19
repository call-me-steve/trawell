export type User = { id: string; email: string; role: "listener" | "creator" };

const KEY = "trawell_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, token);
}

