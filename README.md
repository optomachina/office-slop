# Office Slop planning workspace

Planning only. Office Slop is a candidate name; availability is unchecked.
Main conversation coordinates; this local MacBook thread owns planning artifacts.
No implementation, repository creation, credential changes, deployment, or session changes are authorized by the handoff.

- [Current plan](planning/current-plan.md)
- [Read-only inspection](references/inspection.md)
- [Graph proposal snapshot](references/overdrafter-graph-draft.3.yaml)
- [Observed PR status](references/graph-pr-status.json)

Next step: owner interview in this thread. Decisions below remain pending until answered.

## Local simulated playable

The authorized Milestone A slice lives in `app/`. Run `npm install` and
`npm run dev` there. Validate with `npm run typecheck && npm test && npm run build`.
Earlier planning-only notes above describe the original handoff; this local
prototype contains no backend, credentials, repository creation, or provider
execution. All usage windows and workflow events are fixtures.

## Defaults chosen

- New Game starts with a short idea interview and a visible Skip button. It saves
  a local brief only; repository creation is unavailable. Continue opens the local
  factory/demo, not a remote repository or persisted executor session.
- Office attention starts with an expanded Needs You list: owner holds, failed
  current-head checks, and changes requested, with jump-to-blocker inspection.
- Claude, Codex, Grok, and Cursor each have an independent simulated pool. Known,
  low, exhausted, unknown, and stale observations retain reasons. Unknown is not
  zero; stale values are last-known readings. Pools are never summed.
- Pause controls new launches only. Intent is immediate; a later simulated event
  confirms effective pause. Existing activity is unchanged.
- Imported history cites the checked-in architecture consultation and does not
  imply observed execution. All other work is synthetic.

Journey tests render the app in jsdom and replace the Pixi scene with a DOM test
stand-in, exercising entry, controls, evidence, keyboard selection and motion
preferences without WebGL. They do not establish browser rendering performance.
