# Jev research for Office Slop

Observed October 16, 2026. Research only; no application implementation, installation, credential changes, or paid calls performed.

## Current release

TypeSafe's current model reference identifies **jev-1.14.0**, released October 14, as newest. `jev-preview` resolves to it; `jev-latest` still resolves to **jev-1.13.0**. Pin the version used in evaluations and retain the returned model ID. Both cost $0.042 per million input tokens, with output free. Default context is 64k per request and 32k per question; optional long-context mode raises both to 262k with reduced reliability and increased latency. [Model reference](https://docs.typesafe.ai/models).

The October 14 release adds experimental image inputs, Box localization and longer context, alongside general and multilingual improvements. These experiments are explicitly below TypeSafe's production reliability bar. [Release announcement](https://typesafe.ai/blog/jev-1-14).

Latest documented JavaScript SDK: **0.7.0**, October 14, requiring Node 22+. Latest documented Python SDK: **0.7.5**, October 14. These add image/Box support and request compression. [JS changelog](https://docs.typesafe.ai/sdk/javascript/changelog), [Python changelog](https://docs.typesafe.ai/sdk/python/changelog).

## UI capability: distinguish the layers

The official coding-agent guide still says Jev does not generate prose or code. It supplies typed choices, scores and probabilities to application code; a separate coding agent authors the application. This does not prevent Jev-powered UI composition: a renderer can assemble components from Jev's bounded selections, but that is a designed application workflow rather than native JSX/CSS generation. [Coding-agent guide](https://docs.typesafe.ai/introduction/coding-agents).

New image understanding is relevant to UI assessment. Images can appear in state, instructions or criteria; both 1.13 and 1.14 support them behind `TypeSafe-Danger-Zone-Images: true`. They remain experimental. [Images](https://docs.typesafe.ai/images).

**Box requires 1.14** and returns normalized bounding coordinates. It could locate a control or room in a screenshot for prototype evaluation. It always returns a box even if the target is absent: pair it with a presence question and validate independently. It is not an image-generation or UI-generation primitive. [Box reference](https://docs.typesafe.ai/primitives/box).

Public computer-use examples illustrate orchestration:

- [browser-use/jev-ultrafast](https://github.com/browser-use/jev-ultrafast): Jev selects a browser action and observed DOM target; a separate small LLM writes text. The runner performs and verifies actions. Canvas remains outside its documented MVP, so it cannot be assumed to test our isometric scene. Its speed claims are narrow demo measurements, not Office Slop benchmarks.
- [savka777/jev-use](https://github.com/savka777/jev-use): macOS Accessibility observations become bounded actions. Typed text comes from spans of the user's command; it does not freely generate code. This is a separate application requiring setup and permissions, not an automatically available Codex tool.

## X research status

**Verified through the existing Chrome X session on October 16, without credential extraction:**

- Chris Tate, September 18: [json-render + Jev demonstration](https://x.com/ctatedev/status/2101022101750571357). The author describes composing interfaces from the user's components, actions and design system, rendered in milliseconds. This is the concrete UI-building example Blaine likely meant; do not dismiss Jev's contribution merely because it does not generate code strings.
- [Author's source follow-up](https://x.com/ctatedev/status/2101022105647157442) names `experimental_composeSpec` and `experimental_createEvaluator` and links [vercel-labs/json-render](https://github.com/vercel-labs/json-render).
- The current [json-render site](https://json-render.dev/) and repository confirm a catalog/registry/render architecture and dynamic interfaces with predefined components/actions. The current README does not mention those two experimental function names; their presence is now source- and published-artifact-verified in the follow-up below. No package installed or demo executed here. The author's millisecond claim is not a local benchmark.
- Amal, October 15: [computer-use demonstration](https://x.com/amal_ytics/status/2110804111922983095) explicitly separates Jev's screenshot/accessibility action decisions from Qwen planning and text entry; the author notes an oscillating-action failure. This supports a mixed-model architecture, not autonomous UI code generation by Jev alone.

Earlier web-only X searches/direct fetches failed; the dedicated browser tab successfully resolved the relevant author thread. No posts, likes, bookmarks, or other account changes were made.

## Local readiness, inspected read-only

- Shared skill exists at `/Users/blainewilson/.codex/skills/typesafe-ai/SKILL.md`; Jev-first workflow guide exists beside it. It requires narrow decisions, ordinary-code guards, measured outcomes, and explicit fallbacks. It prohibits credential hunting.
- Existing OverDrafter client: `/Users/blainewilson/Overdrafter/scripts/jev-client.mjs`. It pins 1.13.0, supports optional model override, returns sanitized failure results, and has a synthetic `--smoke` path. Documentation describes authorized environment credentials or Claude Code's injecting proxy, not guaranteed availability on this Mac.
- Existing screen: `/Users/blainewilson/Overdrafter/scripts/jev-pr-screen.mjs`; existing bounded recovery implementation: `/Users/blainewilson/Overdrafter/worker/src/recovery/jevDecision.ts`.
- Historical live evaluation documented at `/Users/blainewilson/Overdrafter/docs/release/jarvis-loop/jev-agent-decisions.md` reports cloud calls on October 4–6. That does not verify local invocation now.
- No direct TypeSafe/Jev connector tools were exposed in the current tool catalog. Bird 0.8.0 is installed, but was not used to extract browser cookies. No secrets, environment values or keychain entries were inspected. CLI network retrieval of public docs failed DNS in the sandbox; web retrieval succeeded.
- **Invocation status: root coordinator executed the existing synthetic smoke through the authorized environment/proxy; it returned `http_403` in 273 ms with no model or usage. Current access is unavailable. No retry or credential changes.** Do not label simulated decisions as Jev outputs.

## Recommended bounded first-playable role

Use Jev as a semantic assistant to the coding graph: rank relevant evidence, triage review findings, and choose between a short or deeper onboarding branch. Keep required evidence and policy intact. For a concrete UI contribution, use the json-render + Jev pattern to compose an inspector or onboarding panel from an authored catalog of cards, choices, evidence badges and notification actions. Validate the experimental API first; an explicit bounded composition adapter is a fallback. A coding agent writes the reusable components; deterministic tests verify accessibility, identity, allowed actions and geometry. A stable scene and navigation shell should not regenerate unpredictably on every event.

Consider an isolated 1.14 image/Box experiment on synthetic office screenshots after the scene exists. Do not place experimental screenshot judgments on the critical path for merge, authorization or revenue accounting. Graph guards, PR checks, money arithmetic and source freshness remain deterministic. Record version, actual usage, latency, outcome and fallback; compare against the ordinary method on the same fixtures.

The first playable can proceed with deterministic fixtures while live Jev availability is established. This preserves the user's Jev-first preference without inventing live calls or turning setup into the main project.

## Exact next invocation option (not executed here)

Once the coordinator confirms the existing authorized TypeSafe environment or proxy on its execution host, the existing synthetic client smoke is:

```sh
NODE_USE_ENV_PROXY=1 node --no-warnings /Users/blainewilson/Overdrafter/scripts/jev-client.mjs --smoke
```

This pins 1.13.0, sends a synthetic worker-routing question, and prints sanitized status, model, latency, tokens and answer. It neither changes repository files nor searches credential stores. Successful execution must precede any claim of live Jev readiness. The existing client permits a 1.14.0 model option for text comparisons; it does not currently expose image assets or experimental headers, so the Box path requires a separate reviewed integration. Keep credentials server-side and reuse the existing mechanism rather than copying it into Office Slop.

## Source-level follow-up: composition APIs verified

Checked October 16, 2026 after the X demonstration. Public repository downloaded for inspection only; no dependencies installed, package scripts executed or app changes made.

- Repository HEAD: `72568f990e5502c4d3115691facb8ca928a5c9fc`.
- [Core exports](https://github.com/vercel-labs/json-render/blob/72568f990e5502c4d3115691facb8ca928a5c9fc/packages/core/src/index.ts) export both functions.
- [Composer](https://github.com/vercel-labs/json-render/blob/72568f990e5502c4d3115691facb8ca928a5c9fc/packages/core/src/experimental-compose.ts) is an async generator accepting catalog, atomic candidates, prompt and an evaluator; optional initial state/spec, context, budgets, strategy and AbortSignal.
- [Evaluator](https://github.com/vercel-labs/json-render/blob/72568f990e5502c4d3115691facb8ca928a5c9fc/packages/core/src/experimental-evaluator.ts) uses Vercel Gateway's experimental v4 evaluation endpoint, `typesafe-ai/jev`, server-side Gateway key and 10-second per-call default timeout. It validates offered choices and normalizes native TypeSafe confidence; it does not retry.
- [API contract](https://github.com/vercel-labs/json-render/blob/72568f990e5502c4d3115691facb8ca928a5c9fc/apps/web/content/docs/api/core.mdx) also supports a custom evaluator. Thus direct TypeSafe access can be adapted without adding a Gateway account. Existing OverDrafter client needs an adapter that preserves all question keys, validates answers, maps input usage, and properly propagates cancellation; do not assume its timeout-only interface satisfies the signal contract unchanged.
- `npm view @json-render/core version dist.tarball --json` returned **0.21.1**. Read-only inspection of the [official archive](https://registry.npmjs.org/@json-render/core/-/core-0.21.1.tgz) confirms both declarations and exports in `package/dist/index.d.ts`. Archive SHA-256: `cabbcdfc651f6509e7cc64fd57389663c60c3c77a38980fd645ee26de669566f`.
- Availability discrepancy: the Jev guide and API docs still call the feature unreleased; the repository changelog assigns it to 0.21.0, and the published 0.21.1 archive contains it. The artifact settles export availability, not runtime compatibility or quality. Pin exact versions and validate locally before adoption.

## Bounded Office Slop integration proposal

**First use:** one optional adaptive onboarding panel, followed by the work inspector. Keep the main menu, office scene, Needs You indicator and core evidence rows fixed and accessible. Jev composes supporting components inside a bounded panel; it cannot hide mandatory decisions or alter work status.

**Catalog:** Panel, Heading, Question, OptionGroup, ContextInput, EvidenceCard, Metric, NextButton, and HelpCard. App code supplies actual copy, values, references, state bindings and permitted actions. Candidates are atomic configured components; include alternatives explicitly. Jev chooses inclusion, parent/slot and order, not arbitrary HTML, CSS, code or missing prose. Candidate variants sharing one `resource` are mutually exclusive.

**Onboarding:** a synthetic or authorized redacted context describes which product assumptions remain unresolved. Mandatory consent/limits and saved user context stay outside generated composition. Offer predefined deeper questions and a short-path summary. Do not send raw form state by accident; only the prompt, descriptions and explicit context are intended evaluator input. Draft copy can come from the planning agent before composition.

**Inspector:** compose optional explanation/help and relevant evidence group ordering for the selected work item. Always pin identity, source freshness, actual status, current head and required holds in the fixed shell. Monetary values, revenue windows and exact counts are computed from source data, never inferred by Jev. Selecting a task must remain useful without an API call.

**Initial evaluation budget (proposal):** batch mode, at most 10 elements, depth 3, 2 model evaluations, 5-second overall deadline, no automatic retries. Default batch mode selects root and membership together, then arranges the result; edits are sequential and should be a later separately bounded feature. Use a fixed fallback panel when unavailable/timeout/invalid/partial. Keep focus and user input stable by composing before displaying an interactive form, never replacing it while typing.

**Rendering contract:** `step` events contain complete detached spec snapshots; `complete` returns `finish`, `limit` or `unavailable` and may still be partial or null. Do not call a partial result finished. Validate required component presence, allowed binding paths and action parameters after composition; authorize any later action independently. Use static fallback on failed semantic requirements even when schema-valid.

**Evaluation corpus:** clear idea, ambiguous customer, extra context, requested feature expansion, no optional questions, incomplete provider response, cycle/depth rejection, omitted required evidence, duplicate semantic variants, abort and 403. Verify deterministic fallback, no leaked values, keyboard/reader parity and preserved selection. Record actual model, elapsed time and nullable usage; compare usefulness and latency to the static panel. No fabricated Jev result in fixtures.

**Now:** proceed with the deterministic playable. Root's smoke returned HTTP 403 (273 ms); model and usage unavailable. This is a provider/access failure, not an approval denial or uncertain execution result. Do not retry or alter credentials. Integrating a live evaluator remains pending restored authorized access; catalog planning and offline contract tests can proceed independently.
