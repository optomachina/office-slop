# Local Claude execution

Claude CLI is authenticated through the macOS credential store. In this Codex
workspace, restricted execution cannot see that credential store and misleadingly
reports `loggedIn: false`. Do not repeat login or copy credentials into files.

Use the approved `exec_command` escalation mechanism (`require_escalated`) for
Claude CLI calls that need authentication. Honor the task's tool/write scope;
for advisory review use `claude -p --model opus --tools '' --no-session-persistence`
and supply the review material in the prompt. Do not resume unrelated sessions.

Verified on October 16, 2026: normal-host `claude auth status` reports logged in
with Claude Max, and a tool-free Opus request returned `CLI_AUTH_OK` (exit 0).
This fixes the invocation path; the restricted sandbox itself remains unchanged.

# Engineering rules (pstack-lite, adapted from OverDrafter practice)

- Simulation only. No backend, no provider/executor command paths, no real
  credentials, no network calls to GitHub/Linear/Stripe from the app.
- Never print, commit or log secrets. `.env*` is gitignored.
- Small verified commits on `master` (or short-lived branches/PRs). Before every
  commit run, from `app/`: `npm run typecheck && npm test && npm run build`.
  CI (`.github/workflows/ci.yml`) runs the same three gates; keep it green.
- Journey test requirement: any user-visible change (menu, office, inspector,
  options, levers, tanks, keyboard/a11y behavior) must add or update a journey
  test under `app/src/journeys/` that drives the UI the way a user would
  (render App, click/keyboard, assert visible text/roles). Pure domain changes
  need reducer unit tests instead.
- Domain stays pure and deterministic: reducer -> selectors -> scene/DOM. Scene
  animation never writes state. Every scene fact is also reachable in the DOM list
  /inspector for keyboard and screen-reader users; reduced motion keeps facts.
- Writers do not review their own work: a different agent/model reviews each
  milestone slice before it is called done. Reviews are advisory, not test passes.
- Do not claim pstack/poteto conformance; this is a lightweight adaptation.
