const KEY = "nlang_api_key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export function setApiKey(value: string): void {
  window.sessionStorage.setItem(KEY, value);
}

export function clearApiKey(): void {
  window.sessionStorage.removeItem(KEY);
}

