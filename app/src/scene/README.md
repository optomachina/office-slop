# Office scene extension points

`OfficeScene` consumes `SceneProps` and only sends selection IDs upstream. Domain state remains authoritative; animation never mutates it.

- `layout.ts` contains logical tile coordinates, projection, colors and station definitions. Move a station here without changing workflow semantics. The same coordinates determine desks, labels, approach points and furniture routing obstacles.
- To add a workflow stage, extend the shared `Stage` contract with the integration owner, add its station entry, then add fixture/domain evidence. The station loop renders it automatically.
- Robots and providers are created from state identities. Provider tanks select stable provider IDs. Robot cosmetics come from `Robot.color`; names and IDs remain independent.
- `gridPath` uses quarter-tile breadth-first search around shared walls, furniture footprints. Portal markers identify selected passageways; room metadata is descriptive, and walls remain the authoritative navigation boundaries. `stationSlots` reserves desk anchors before expanding a deterministic queue. Art does not drive state or merge eligibility. Future layouts should add new obstacle types to this model rather than screen-space collision guesses.
- `robot`, `desk`, `plant`, `box` and `label` are bounded procedural art helpers; swap their internals for original sprites without touching domain events.
- `src/audio/useOfficeAudio.ts` exposes `useOfficeAudio(muted, volume)` with `start()` for a user-gesture handler. It provides optional synthetic room tone with silent fallback; it makes no external requests.

`selectScene` derives card aggregation (four visible cards per station plus excess count), targets and queue facts without mutation. The selectable load story supplies 20 robots and 200 cards.

The scene has drag/arrow pan, wheel/plus/minus zoom, and zero/fit reset controls. DOM shell owns accessible list/detail parity. Reduced motion stops robot travel and idle bobbing; liquid levels remain static facts. The ticker pauses while the document is hidden. Rendering lifecycle is isolated and destroys its canvas/listeners/observer on unmount, including async initialization under StrictMode.

Verification: layout unit tests cover all station pairs, wall-free steps, queue slots, hit mapping, deterministic replay and representative counts. jsdom journeys use a scene stand-in for App and exercise the actual camera DOM wrapper separately. These are not GPU rendering or named-device frame-rate measurements.

Current limitations: no pinch gesture or obstacle editor; providers are initialized when the scene mounts (remount when changing provider roster); station dimensions are currently a shared desk footprint. Full runtime/plugin extensibility is a subsequent contract decision, not implied by this scene.

Scene labels use conservative rectangles from `sceneLabels`, shared by rendering and non-intersection tests. Historical provenance is excluded from live cards. Walls are quarter-tile segments in the same depth-sorted container as furniture and robots; only the two back edges are tall. Unreachable visual routes snap to their authoritative destination.
