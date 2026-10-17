# Extending the playable

The shell and scene consume `GameState`; neither owns engineering truth. Keep domain state changes in the pure reducer and derive UI summaries with selectors such as `issueProgress`. `domain/index.ts` preserves the public facade for existing callers.

## Fixtures

`fixtures/initialState.ts` creates a fresh synthetic office. `fixtures/scenarios.ts` supplies ordered, deterministic stories. Both import only contracts, so importing the domain facade introduces no fixture/domain cycle. Add a story here to exercise a new interaction before adding a real connector. Use stable IDs and explicitly synthetic evidence. Add invariant tests when a story changes completion or permission semantics.

## Workflow

`domain/workflow.ts` contains the playable's versioned stage vocabulary and current-head merge prerequisite predicate. Stage validation is shared through `isWorkflowStage`; the exhaustive record makes a new contract stage require a vocabulary entry. Adding a stage also requires layout/station support and accessible UI coverage outside this directory. The definition is not a runtime import of the OverDrafter graph, and stage changes are not an executor transition engine. The merge predicate is a demo policy, not proof of pstack conformance.

## Future adapters

Connectors should authenticate and validate upstream observations outside the reducer, then emit a deliberately versioned normalized contract. Do not add networking, credentials, provider SDKs or executor commands to this domain. A real adapter must not relabel observations as `source: 'fixture'`. Today's contract accepts only fixtures and cannot safely represent live scope, provider revisions, policy versions, review identities/dismissals, multiple check attempts, or authoritative reconciliation. Extend the contract with those fields and adversarial tests before connecting private live data.

UI switches currently record synthetic intent; fixture acknowledgements separately change effective state. They do not invoke provider operations. Production commands need durable identity, revision-bound authorization, idempotency and outcome reconciliation in a separate service. `resolveHold` is likewise only a simulated product decision.

Current PR links are all treated as required. Current reviews/QA retain one verdict per head, and issue stage is a coarse summary shared with its robots. Rich simultaneous activities, optional PR relationships and production workflow migration require explicit contract evolution. Keep these limitations visible instead of building a plugin loader around insufficient data.
