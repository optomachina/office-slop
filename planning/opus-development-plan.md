# Opus development consultation

Source: (private design thread, not public)
Observed model: Opus 5.5 Medium. Completed browser response October 16, 2026. CLI unauthenticated; existing sessions unchanged.

Recommended Vite/React/TypeScript/Pixi, pure evidence reducer → selectors → scene and DOM shell, no animation writes to state. Freeze contracts, split domain/fixtures, scene/audio, shell, independent verification ownership. Synthetic saved New Game, Continue, Options; replay happy path, repair/new head, holds, quotas, reconnect and linked PRs. Review current-head evidence, idempotency, save version, input recovery, reduced motion and accessible list parity. UI safety relies on no external executor paths, not comments.

Coordinator dispositions: accepted architecture and isolated lanes. Corrected proposed issue-close-on-one-merge policy: required sibling PR remains open; show 1 of 2 merged. Kept simulated leaderboard and sharing controls in scope to express user's product. No promise of 60fps without measurement. A static grep is not a security boundary. Use localStorage with guarded versioned serialization for the bounded prototype; no backend. React version resolved from registry rather than assuming Opus's React 18 suggestion is current.

First build contracts are app/src/contracts/index.ts. Domain exports createInitialState(), reduceEvent(state,event), scenarios, issueProgress(state,id). Scene exports default OfficeScene accepting SceneProps. Shell imports domain and scene. All app execution is simulated. Distinct reviewer and QA follow integration; no claim of full pstack runtime conformance.
