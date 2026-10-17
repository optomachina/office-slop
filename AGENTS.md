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
