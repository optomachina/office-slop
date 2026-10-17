// Indirection so the lazy Pixi chunk can be retried and its failure exercised in tests.
export const sceneLoader = {
  load: () => import("../scene/OfficeScene"),
};
