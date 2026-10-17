# Office scene extension points

`OfficeScene` consumes `SceneProps` and only sends selection IDs upstream. Domain state remains authoritative; animation never mutates it.

- `layout.ts` contains logical tile coordinates, projection, colors and station definitions. Move a station here without changing workflow semantics. The same coordinates determine desks, labels, approach points and furniture routing obstacles.
- To add a workflow stage, extend the shared `Stage` contract with the integration owner, add its station entry, then add fixture/domain evidence. The station loop renders it automatically.
- Robots and providers are created from state identities. Provider tanks select stable provider IDs. Robot cosmetics come from `Robot.color`; names and IDs remain independent.
- `route` uses quarter-tile breadth-first search around desk and tank footprints. Art does not drive state or merge eligibility. Future layouts should add new obstacle types to this model rather than screen-space collision guesses.
- `robot`, `desk`, `plant`, `box` and `label` are bounded procedural art helpers; swap their internals for original sprites without touching domain events.
- `src/audio/useOfficeAudio.ts` exposes `useOfficeAudio(muted, volume)` with `start()` for a user-gesture handler. It provides optional synthetic room tone with silent fallback; it makes no external requests.

The scene has fit, pan and zoom controls. DOM shell owns accessible list/detail parity. Reduced motion stops robot travel and idle bobbing. Rendering lifecycle is isolated and destroys its canvas/listeners/observer on unmount, including async initialization under StrictMode.

Current limitations: no pinch gesture or obstacle editor; providers are initialized when the scene mounts (remount when changing provider roster); station dimensions are currently a shared desk footprint. Full runtime/plugin extensibility is a subsequent contract decision, not implied by this scene.
