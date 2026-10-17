# Shell extension points

- `App.tsx` composes the main-menu, local brief, office controls and evidence dialogs. Domain events alone change projected work status; scene movement does not.
- `Leaderboard.tsx` owns metric definitions, formatting and time-window definitions. Add entries to those arrays to extend the demo without altering the table. Replace the synthetic rows with a scoped adapter only after a live-data contract exists.
- `storage.ts` owns versioned persistence keys, safe JSON reads, saved-brief shape checks, validated options and sharing audiences. Evolve versions with an explicit migration rather than silently interpreting a new payload.
- Replay stories come from the domain's `scenarios` export. No scenario-specific rendering is embedded in the shell.
- Sharing and autonomy are local preference previews. They cannot invoke provider actions or publish data. The spending-limit field is intentionally a session-only illustrative control.
- Audio is instantiated from a button gesture only; mute and volume persist. No automatic browser audio permissions are required.
- Dialogs trap keyboard focus and restore their launching element. The work directory offers DOM access to each issue independently of the canvas.

Remaining production work: actual adaptive interview agent, saved simulation checkpoints, live connectors, audience membership, real revenue verification and executor-enforced autonomy policies.
