# Office polish verification — 2026-10-16

Owner: Codex integration thread. Host: local macOS workspace. Branch:
`polish/milestone-a`; source baseline `8719799`. Scope: reversible local UI,
bundle and test-dependency changes, verification and commits; no push.
Completion condition: requested layout and label changes, every JS chunk under
500 kB, zero audit vulnerabilities, passing app commands and root preflight,
independent advisory review, redacted tree/history scan, local commit.
Visual acceptance at the four requested viewports remains unverified.

Capacity, the scene/attention row and replay now occupy separate grid rows.
Desktop attention has its own column; mobile attention flows below the scene
in a scrolling office. Each station has one compact name/count sign; detailed
aggregation and robot counts remain in the inspector/directory.
The scene is lazy loaded with a visible loading status.

Node 26.11.1, npm 11.20.0. Vitest 4.1.12 replaces the vulnerable Vitest 3 tree.
Tests disable Node's native experimental Web Storage, when supported, so jsdom supplies it.
App typecheck, 54 tests (including 20 DOM/Pixi-stand-in journeys), and production
build pass. Root and app npm audit each report zero vulnerabilities.
Entry JS: 263.99 kB (83.14 kB gzip); scene: 295.33 kB (92.75 kB gzip).
Remaining JS chunks: 0.91–73.66 kB. No 500 kB warning.

Root preflight:

```text
preflight: typecheck PASS
preflight: test PASS
preflight: test:app PASS
preflight: build PASS
```

Independent read-only agent review found no actionable findings. This is advisory,
not an Opus review or approval to merge sensitive dependency changes. Jev was
unconfigured; no live Jev review is claimed. No workflows or gate scripts changed.

Browser evidence: Playwright Chrome launch failed inside the sandbox. The browser
connector then explicitly denied localhost access. No workaround was attempted
following that denial. Pixel layout at 1280×800, 1440×900, 1920×1080 and ~390px,
and real Pixi rendering, are unverified. Grid separation is structural evidence;
jsdom journeys cannot establish CSS geometry. Scene unit tests check conservative
label bounds for ordinary and 200-card fixtures.

The public-data scan examined current tracked/untracked source and every unique
path/blob in all nine reachable commits (`git rev-list --all`, `git ls-tree`,
`git cat-file`), including removed historical content. Heuristics covered provider
credential formats, private keys, assigned credential literals, URL credentials,
bearer strings, email addresses, local/private URLs, personal paths and named owner
references. Generated dependencies/build output and .git internals were excluded;
unreachable objects, remote-only refs and arbitrary high-entropy strings were not
exhaustively analyzed. Findings are in `public-data-scan.txt`, file/line/type only;
historical coordinates may differ from the current file. Test-only candidates are
labeled synthetic/local. A credential-pattern substring inside an identifier was
excluded after boundary checking. No credential was identified by these checks.
Personal metadata and private conversation links remain for owner disposition.
History was not rewritten, and no finding values were printed in scan output.
