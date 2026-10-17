// Indirection so the lazy Pixi chunk can be retried, reported and reloaded,
// and so tests can exercise each path.
export const sceneLoader = {
  load: () => import("../scene/OfficeScene"),
  report: (error: unknown) => console.error("Office scene failed to load", error),
  // Browsers may cache a failed module fetch, so a fresh import() can keep
  // failing; a full reload is the bounded last resort.
  reload: () => window.location.reload(),
};
