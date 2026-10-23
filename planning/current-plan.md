# Slop Farm — consolidated planning draft

October 16, 2026. Revision 2 owner decisions supersede the original handoff; subsequent Claude findings are incorporated below. Candidate name only. All build packages are proposals, not authorized implementation or created issues/PRs.

## Product and entry

One GitHub repository is one game. OverDrafter is the first existing game. Main menu: New Game, Continue, Options. New Game eventually creates a repository after owner/organization, name, visibility and relevant authorization are established. Whether it first interviews the owner about an idea is unresolved. Continue selects an existing repository. Options owns connectors/settings; missing connections do not block the main menu, but dependent actions explain the dependency and route to Options.

Entering fades from black to the whole office with ambience. Reveal is skippable; audio starts from a user gesture, has persistent mute/volume and silent fallback. Demo, historical/imported and live states are visibly distinct.

The approved rectangular workflow floorplan guides room adjacency: intake upper left, planning top, parallel build desks upper right, review/QA right, merged folders bottom, capacity/routing lower left, central repair and owner holds. Use chunky original robots, cosmetic skins, electrical levers and glowing vertical liquid bars. Both top-down and isometric views derive from one coordinate layout. Illustrations are art direction, not production assets or an executable graph.

Nodes are workstations, transitions handoff routes, robots executor identities, and folders/cards issues and PRs. Activity/run identity is separate from robot identity. Skins never change identity; multiple observed executions must be explicitly distinguished. Counts say whether they count activities, unique issues or PRs.

Success: quickly identify active work, reviews/checks, owner decisions, actual merges, stale sources and provider limits. Selection opens source evidence and links. Persistent Needs You summary, jump-to-blocker and since-last-view digest support the office without replacing game-first entry. Default attention priority, timing goal and target devices remain owner decisions.

## Milestones and gates

### A — coherent local playable

Menu, simulated Options/connectors, Continue, reveal/audio, pan/zoom, selectable office, inspector/list and deterministic replay. Include simulated usage tanks and one pause-new-launches lever immediately. There is no executable provider command path or production credential in demo mode. New Game repository creation is simulated or clearly unavailable until authorized integration exists.

Fixtures: accepted issue → planning → two build lanes → PR → independent review → QA → merge; changes requested → repair → new head → fresh evidence; owner hold before a protected action; known/low/exhausted/unknown/stale capacity; requested versus effective pause; disconnect/reconcile; two linked PRs with only one merged, shown as “1 of 2 linked PRs merged.” Add an early imported real story with historical labeling and provenance, without inventing runtime activity or owner holds from GitHub/Linear.

Gate: deterministic replay, stable identities/counts, reachable stations/no wall crossing, useful inspector, keyboard/screen-reader and reduced-motion parity, coherent menu/reveal, and performance on a named device. Mixed-fixture usefulness exercise asks Blaine to locate active work, owner hold, failed check, actual merge and stale source against an agreed time goal. Initial representative load is 20 animated agents and 200 cards, not a promised frame rate.

### B — one real read-only repository and Linear project

Bounded complete snapshot, events and periodic reconciliation. Many-to-many issue/PR associations distinguish required/contributing, superseded and informational links. GitHub owns PR head/check/review/merge facts; Linear owns issue fields; executors own execution facts. No arbitrary running-agent or hold inference. Source conflicts retain both sources. A new head invalidates current eligibility but preserves evidence history. Only authoritative merge moves a PR to LANDED; deployment remains separate. Multi-PR issue completion requires explicit policy.

Gate: a real story matches sources; adversarial corpus covers duplicate/late/out-of-order events, dismissed reviews, neutral/cancelled/skipped checks, old-head results, policy/base changes, partial merges, complete pagination, crash/replay, lost cursor, denied/revoked access and stale sources. Later cases include retargeting, squash/rebase, force push, revert and merge queues, verified against GitHub semantics.

### C — supported activity and capacity

Add Claude, Codex and Grok sources separately, only when verified. Evaluate a pinned CodexBar collector before new collectors; preserve MIT notices on reuse. One real usage window and running-agent source must be proven end to end; unsupported sources remain unavailable. Token usage is not remaining subscription allowance. Sleeping machines are offline/stale; last verified state remains labeled. Always-on observation requires a verified host option.

Gate: explicit bridge enrollment and revocation; least-privileged outbound telemetry, canary-secret redaction, correct pool/window identity and sleep/reconnect freshness. Enrollment grants no execution authority. Local endpoints need loopback binding, authentication and host/origin defenses; never expose collector ports publicly.

### D — scoped dispatch controls

Initial allowlist: pause/resume new launches, future routing preference, concurrency limits and owner-decision queue. No merge, deployment, arbitrary shell or billing commands. Pausing new work does not claim to stop running processes. Usage remains advisory until an authorized executor policy exists; no paid fallback from stale/unknown readings.

Desired-state commands include actor, canonical scope/targets, operation/arguments, expected revision, expiry, idempotency key bound to request hash/policy revision, authorization and audit provenance. Revalidate at execution. Approval binds exact effects/target/head, approver, expiry and command identity; changes invalidate it. Persist operation identity across restarts; delayed resume cannot override newer pause. Accepted/executing/succeeded/failed/expired/cancelled/outcome-unknown are distinct. Acknowledgement is not success; reconcile unknown outcomes before retry.

Gate: duplicate clicks, concurrent policy changes, lost response after success, revoked authority, changed/expired approvals and audit integrity all demonstrated.

### E — polish and packaging

Original sprites/skins, responsive touch, empty/error/loading states and project switching. Evaluate installable web app first; native wrappers or clients require a demonstrated capability gap. Verify rights before distributing recognizable branded characters.

## Contract and architecture proposals

TypeScript, React DOM shell and PixiJS scene are proposed, not pinned. Verify versions in a small rendering/touch spike after implementation authorization. One layout defines rooms/walls/portals/furniture/walkable cells/stations/approach anchors; scene positions are independent of workflow node IDs. Grid routing queues agents at busy desks. State/counts update immediately; movement is presentation. Coalesce bursts and skip obsolete travel after reconnect.

Freeze only first-fixture fields: repository scope, WorkItem, PR/head, WorkAttempt, AgentIdentity/execution instance, Dependency, ReviewEvidence, QAResult, ApprovalHold, UsageObservation, ConnectorHealth, simulated Command and OfficeLayout. Repairs create linked new attempts. Concurrent build/review/QA stays representable. Workflow revisions default to new runs; in-flight migration and reviewer join/skip rules need explicit compatibility policy.

Events retain schema/workflow version, event/source/entity IDs, per-entity sequence where supported, occurred/received times, work/attempt/actor IDs, correlation/causation and evidence kind/reference. Order per source/entity; arrival order is not truth. Unknown types must not crash or imply success. Snapshot omission means deletion only for complete authoritative generations; refetch on uncertainty/cursor loss.

Live architecture: adapters → normalized validated events → durable log/current projections → authenticated snapshot/stream API → browser. SSE for updates, HTTP for commands; small service/relational store initially, no broker fleet. Hosting/database/spend remain undecided. Persist event/projection atomically or with durable replay checkpoint. Version reducer behavior.

Canonical account/installation/repository scope comes from authenticated connectors, never payload aliases. Enforce scope in storage, deduplication, snapshots, streams and commands. Verify webhook signatures on original bytes; validate size/schema, delivery IDs and installation/repository; sanitize text/URLs and refetch authoritative state. Webhooks/tool text are data, not instructions. Define freshness thresholds, polling/rate-limit budgets, retention, revocation and deletion before private ingestion. Denied access is not deletion and must not expose cached private data by default.

Evidence retains source link/identity, occurrence/observation time, machine/account, freshness and SHA where applicable. Distinguish observed/derived/simulated/historical. Immutable review/check evidence binds head, evidence revision, check attempt, workflow/policy and tested base. Current eligibility is derived, not a mutable historical verdict.

Usage observation identifies provider, account alias, product/pool, limit type, actual window, fraction if known, reset and observation source/time. Subscription allowance, API money, local tokens and context occupancy remain separate. Never sum percentages or assume Grok/Cursor share a pool. One sight glass per selected window, detail selector for short/long windows; unknown is dim/hatched with reason, exhausted is confirmed empty. Low thresholds start as UI preferences.

Local bridge allowlists/redacts metadata before storage/transmission. Exclude raw prompts/transcripts, environment variables, cookies and vault contents; leave authentication in approved stores. Parent reports Bitwarden CLI installed but unauthenticated, Claude CLI logged out, browser review succeeded separately; these are handoff facts, not reverified credential states.

## Interaction and verification

Wide zoom shows room counts/holds/source health; medium shows robots/cards; close opens evidence. DOM list/detail drawer exposes every action to keyboard and screen reader. Preserve selection and restore focus; do not announce every animation/event. Reduced motion disables travel, liquid effects, camera easing and ambient activity while retaining state. Mobile focuses on blockers/detail/authorized actions with adequate targets. Aggregate excess cards; pause hidden-tab rendering.

Tests by stage: reducer replay/identity/head/provenance; layout reachability/portals/hit testing; browser selection/deep links/pan/zoom/touch/keyboard/reduced motion; integration scope/reconciliation/adversarial events; later command concurrency/authorization/unknown outcomes. Check no secrets/transcripts in events, bundles, logs or exports. No tests have run or application behavior been implemented.

## Proposed work packages and ownership

Step 0: inspect chosen repo, active coordinator, effective graph and current source revision before contract freeze. Read-only graph inspection is complete; current runtime ownership and destination repository remain unresolved. Main conversation remains coordinator; no OverDrafter owner was replaced.

Proposed packages after authorization: (1) contract/fixtures/pure reducer; (2) shared layout/debug view/isometric greybox; (3) menu/Options/reveal/audio plus one-issue routing/inspector; (4) branching/repair/hold/usage/switch fixtures and accessibility; (5) real read-only GitHub/Linear slice. Suggested future paths: `src/domain/`, `src/fixtures/`, `src/scene/`, `src/ui/`, `src/adapters/`, `tests/`; these do not exist yet and must adapt to chosen repository.

One integration owner controls shared schema/main branch. If parallel work is later authorized, isolate scene, reducer, DOM UX, read-only adapters and usage feasibility; integrate scene+reducer+DOM before live adapters. Bound active PR work by review capacity. Independent checks apply to exact heads; no claims of unavailable review coverage. Do not launch agents or create issues/PRs from this plan.

## Owner interview update — October 16

These decisions supersede conflicting assumptions above. The game eventually connects Stripe/billing to measure app revenue and has a scoreboard where people compete by building code factories. Revenue and competition are product systems, not merely cosmetic engineering progress. Metric definitions, privacy, eligibility and timing remain open.

New Game should use gstack-inspired idea extraction and development of the concept before development planning. Exact stages and the transition to repository creation remain to be specified.

The owner wants pstack and conformance to poteto's process so users never need to review code or PRs. Automated implementation/review/testing is the intended product behavior. Exact upstream source/version and enforced completion gates must be inspected before claiming conformance; no pstack/poteto reference was found in the shared SKILL.md search. This product direction does not authorize starting implementation now.

Owner attention should be minimal and accessible through a button, notification bar or game-integrated queue for notifications and necessary approvals. Stuck/actionable work is the default attention priority. Exact approvals and notification behavior remain to be defined.

Reference update: pstack upstream identified as Lauren Tan's `cursor/plugins/pstack`, supported by Cursor's official catalog and OverDrafter's OVD-840/842 records. See [research](../references/pstack-research.md). The earlier request for the owner to locate the reference is withdrawn. Exact version/conformance and runtime integration remain unverified.

## Confirmed owner decisions — interview round two

Multiple leaderboards: tokens burned, cost of tokens burned, and revenue generated. No single composite score was requested. Time windows, normalization, verified sources and ranking direction remain open; the earlier 30-day/net-refunds proposal was not explicitly accepted.

Sharing uses user-controlled toggles: revenue information, office layout, and optionally code. Exact defaults and visibility audiences remain undecided; private-by-default was a recommendation, not a confirmed choice.

Onboarding takes a short path for clear ideas and deeper questions for unresolved assumptions, additional user context, added features, or help extracting the idea. Do not force a fixed-length interview.

High autonomy is the default, described by the owner as “wide open,” with toggles and explicit limits. Exact capability defaults, spending ceilings and publishing rules need specification. This describes eventual product behavior; planning-only authorization for this project remains unchanged.

The owner located the thread. No thread migration is needed.

## Remaining decision queue

1. Onboarding: gstack-inspired interview stages, plan approval and repository-creation order.
2. Competition: measurement/time windows, eligibility, ranking direction, sharing audiences/defaults and launch scope. Three leaderboards and granular sharing toggles are confirmed.
3. Autonomy: exact pstack/poteto source, operational approval boundaries and failure escalation.
4. Primary device/browser, secondary touch target, measurable usefulness/performance goals.
5. Product/repo name, owner/visibility, chosen implementation location and later hosting/spend.

The next interview resolves these without silently assuming answers. No implementation, new subscription, credential change, production mutation or deployment is authorized.

## Review provenance

Four independent AI reviews informed product, UX, QA/reliability and security. Actual Claude browser review was separate, tool-free, of a condensed original before latest onboarding choices. Its accepted additions are Step 0, historical real-story fixture, explicit runtime/hold evidence, Needs You/digest, review-capacity bounds and later GitHub edge-case tests. All are advisory, not passing tests or certification. Original/revision-2 source remains in parent thread (private thread, not public); this document consolidates it rather than claiming verbatim preservation.
