import type { IdeaBrief, Options } from "../contracts";
export const KEY = "slop-farm-save-v1";
export const PREF = "slop-farm-options-v1";
// Saves written under the previous (pre-rename) keys stay readable.
const LEGACY: Record<string, string> = {
  [KEY]: "office-slop-save-v1",
  [PREF]: "office-slop-options-v1",
};
export const defaults: Options = {
  muted: true,
  volume: 0.2,
  reducedMotion: false,
  autonomy: true,
  sharing: { revenue: "private", layout: "private", code: "private" },
};
export function read(key: string) {
  try {
    const legacy = LEGACY[key];
    return JSON.parse(
      localStorage.getItem(key) ?? (legacy ? localStorage.getItem(legacy) : null) ?? "null",
    );
  } catch {
    return null;
  }
}
export function savedBrief(): IdeaBrief | null {
  const save = read(KEY);
  return save?.version === 1 &&
    save.brief &&
    ["name", "idea", "customer", "outcome"].every(
      (key) => typeof save.brief[key] === "string",
    )
    ? save.brief
    : null;
}

export const audiences = ["private", "friends", "group", "public"] as const;
export const shareFields = [
  { key: "revenue", label: "Revenue & financials" },
  { key: "layout", label: "Office layout" },
  { key: "code", label: "Source code" },
] as const;
export function savedOptions(): Options {
  const saved = read(PREF);
  const source =
    saved?.version === 1 && saved.options && typeof saved.options === "object"
      ? saved.options
      : {};
  const sharing = { ...defaults.sharing };
  for (const field of shareFields) {
    const value = source.sharing?.[field.key];
    if (audiences.includes(value)) sharing[field.key] = value;
  }
  return {
    muted: typeof source.muted === "boolean" ? source.muted : defaults.muted,
    volume:
      typeof source.volume === "number" && Number.isFinite(source.volume)
        ? Math.min(1, Math.max(0, source.volume))
        : defaults.volume,
    autonomy:
      typeof source.autonomy === "boolean"
        ? source.autonomy
        : defaults.autonomy,
    reducedMotion:
      typeof source.reducedMotion === "boolean"
        ? source.reducedMotion
        : typeof matchMedia !== "undefined" &&
          matchMedia("(prefers-reduced-motion: reduce)").matches,
    sharing,
  };
}
