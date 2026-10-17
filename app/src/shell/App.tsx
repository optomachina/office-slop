import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useOfficeAudio } from "../audio/useOfficeAudio";
import { createLoadState } from "../fixtures/load";
import { workflowDefinition } from "../domain/workflow";
import { selectScene } from "../scene/selectors";
import { createInitialState, reduceEvent, scenarios, issueProgress, setPause, resolveHold } from "../domain";
import type { GameState, IdeaBrief, Options } from "../contracts";
import "./styles.css";
import {
  KEY,
  PREF,
  read,
  savedBrief,
  savedOptions,
  audiences,
} from "./storage";
import Leaderboard from "./Leaderboard";
import SceneBoundary from "./SceneBoundary";
import { sceneLoader } from "./sceneLoader";

export default function App() {
  const [sceneAttempt, setSceneAttempt] = useState(0);
  // A rejected lazy() stays rejected, so each retry builds a fresh one.
  const OfficeScene = useMemo(() => lazy(() => sceneLoader.load()), [sceneAttempt]);
  const [state, setState] = useState<GameState>(createInitialState),
    [screen, setScreen] = useState<"menu" | "interview" | "office">("menu"),
    [modal, setModal] = useState<"options" | "leaderboard" | "needs" | null>(
      null,
    ),
    [selected, setSelected] = useState<string | null>(null),
    [options, setOptions] = useState<Options>(savedOptions),
    [brief, setBrief] = useState<IdeaBrief>(
      () =>
        savedBrief() || {
          name: "My little factory",
          idea: "",
          customer: "",
          outcome: "",
        },
    ),
    [hasSave, setHasSave] = useState(!!savedBrief()),
    [deep, setDeep] = useState(false),
    [context, setContext] = useState(() => {
      const saved = read(KEY);
      return saved?.version === 1 && typeof saved.context === "string"
        ? saved.context
        : "";
    }),
    [notice, setNotice] = useState(""),
    [reveal, setReveal] = useState(false),
    [scenarioId, setScenarioId] = useState(""),
    [cursor, setCursor] = useState(0),
    [playing, setPlaying] = useState(false),
    [limit, setLimit] = useState("25"),
    [manualPause, setManualPause] = useState<boolean | null>(null);
  const [viewedLog, setViewedLog] = useState(0);
  const [digest, setDigest] = useState<string[]>([]);
  const audio = useOfficeAudio(options.muted, options.volume);
  const sceneScenario =
    scenarios.find((s) => s.id === scenarioId) || scenarios[0];
  const returnFocus = useRef<HTMLElement | null>(null),
    dialogRef = useRef<HTMLDivElement>(null);
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, brief, context }));
      setHasSave(true);
    } catch {
      setNotice("Storage is unavailable. You can still play this session.");
    }
  }
  useEffect(() => {
    try {
      localStorage.setItem(PREF, JSON.stringify({ version: 1, options }));
    } catch {
      /* Session preferences still work. */
    }

  }, [options]);
  useEffect(() => {
    if (!playing || !sceneScenario) return;
    if (cursor >= sceneScenario.events.length) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => {
      setState((s) => reduceEvent(s, sceneScenario.events[cursor]));
      setCursor(cursor + 1);
    }, 1600);
    return () => clearTimeout(t);
  }, [playing, sceneScenario, cursor]);
  useEffect(() => {
    if (screen !== "office" || manualPause === null) return;
    const desired = manualPause;
    const timer = window.setTimeout(() => {
      setState((s) => reduceEvent(s, {
        id: `manual-effective-${s.seen.length}`,
        at: s.tick + 1, source: "fixture", type: "pause", entityId: "dispatch",
        payload: { effective: desired },
      }));
      setManualPause(null);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [screen, manualPause, scenarioId]);
  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(
      () => setReveal(false),
      options.reducedMotion ? 0 : 2000,
    );
    return () => clearTimeout(t);
  }, [reveal, options.reducedMotion]);
  useEffect(() => {
    if (modal || selected) {
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
  }, [modal, selected]);
  function close() {
    setModal(null);
    setSelected(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && (modal || selected)) {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,[href]",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialogRef.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [modal, selected]);
  function open(which: "options" | "leaderboard" | "needs") {
    returnFocus.current = document.activeElement as HTMLElement;
    setSelected(null);
    if (which === "needs") {
      setDigest(state.log.slice(0, state.logCount - viewedLog));
      setViewedLog(state.logCount);
    }
    setModal(which);
  }
  function select(id: string) {
    if (!modal && !selected) returnFocus.current = document.activeElement as HTMLElement;
    setModal(null);
    setSelected(id);
  }
  function enter(save = false) {
    audio.start();
    if (save) persist();
    setScreen("office");
    setReveal(true);
  }
  function sound() {
    audio.start();
    setOptions((o) => ({ ...o, muted: !o.muted }));
  }
  function reset(id = sceneScenario?.id) {
    setManualPause(null);
    setPlaying(false);
    setCursor(0);
    setState(id === "load" ? createLoadState() : createInitialState());
    setViewedLog(0);
    setDigest([]);
    setSelected(null);
    setScenarioId(id || "");
  }
  function step() {
    setPlaying(false);
    if (sceneScenario && cursor < sceneScenario.events.length) {
      setState((s) => reduceEvent(s, sceneScenario.events[cursor]));
      setCursor((c) => c + 1);
    }
  }
  const sceneFacts = selectScene(state);
  const holds = state.holds.filter((h) => !h.resolved),
    issue =
      state.issues.find((i) => i.id === selected) ||
      state.issues.find(
        (i) => i.id === state.robots.find((r) => r.id === selected)?.issueId,
      ) ||
      state.issues.find(
        (i) => i.id === state.prs.find((p) => p.id === selected)?.issueId,
      ),
    stuck = state.issues.filter((i) => holds.some((h) => h.issueId === i.id) || state.prs.some((p) => p.issueId === i.id && !p.merged && (p.reviews[p.head] === "changes_requested" || p.qa[p.head] === false))),
    provider = state.providers.find((p) => p.id === selected),
    robot = state.robots.find((r) => r.id === selected),
    prs = issue ? state.prs.filter((p) => issue.prIds.includes(p.id)) : [];
  return (
    <div className={`game-app screen-${screen} ${options.reducedMotion ? "reduced-motion" : ""}`}>
      <div className="world">
        <SceneBoundary key={sceneAttempt} retried={sceneAttempt > 0} onRetry={() => setSceneAttempt((n) => n + 1)}>
          <Suspense fallback={<p className="scene-loading" role="status">Loading office…</p>}>
            <OfficeScene
              state={state}
              reducedMotion={options.reducedMotion}
              selectedId={selected}
              onSelect={screen === "office" ? select : () => {}}
            />
          </Suspense>
        </SceneBoundary>
      </div>
      {screen === "menu" && (
        <main className="menu-screen">
          <div className="menu-copy">
            <p className="eyebrow">SMALL ROBOTS. REAL AMBITION.</p>
            <h1>
              SLOP
              <br />
              <span>FARM</span>
            </h1>
            <p className="menu-description">
              Your idea. Their little desks.
              <br />
              Build a code factory worth coming back to.
            </p>
            <nav className="menu-actions" aria-label="Main menu">
              <button
                className="primary"
                onClick={() => setScreen("interview")}
              >
                New Game <span>↗</span>
              </button>
              <button onClick={() => enter()}>
                Continue{" "}
                <span>{hasSave ? "Saved factory" : "Demo office"} →</span>
              </button>
              <button onClick={() => open("options")}>
                Options <span>⚙</span>
              </button>
            </nav>
            <p className="tiny">
              PLAYABLE PROTOTYPE · ALL ACTIVITY IS SIMULATED
            </p>
          </div>
          <div className="preview-caption">
            <span className="live-dot" /> A little factory, full of
            possibilities.
            <br />
            <small>Explore the office. Meet the crew. Make a plan.</small>
          </div>
          <footer className="menu-footer">
            <span>SLOP FARM / 001</span>
            <button onClick={() => open("leaderboard")}>
              Visit the leaderboard ↗
            </button>
          </footer>
        </main>
      )}
      {screen === "interview" && (
        <main className="interview-wrap">
          <form
            className="interview"
            onSubmit={(e) => {
              e.preventDefault();
              enter(true);
            }}
          >
            <button
              type="button"
              className="text-button"
              onClick={() => setScreen("menu")}
            >
              ← Back to menu
            </button>
            <p className="eyebrow">NEW GAME / YOUR FIRST BRIEF</p>
            <h2>What are we making?</h2>
            <p>
              Give the crew something to work toward. Clear idea? Keep it short.
              Still finding it? Leave room to explore.
            </p>
            <label>
              Factory name
              <input
                required
                maxLength={60}
                value={brief.name}
                onChange={(e) => setBrief({ ...brief, name: e.target.value })}
              />
            </label>
            <label>
              The idea
              <textarea
                required
                placeholder="An app that helps…"
                value={brief.idea}
                onChange={(e) => setBrief({ ...brief, idea: e.target.value })}
              />
            </label>
            <div className="two-col">
              <label>
                Who is it for?
                <input
                  required
                  value={brief.customer}
                  onChange={(e) =>
                    setBrief({ ...brief, customer: e.target.value })
                  }
                  placeholder="People who…"
                />
              </label>
              <label>
                What would success look like?
                <input
                  required
                  value={brief.outcome}
                  onChange={(e) =>
                    setBrief({ ...brief, outcome: e.target.value })
                  }
                  placeholder="The first useful outcome"
                />
              </label>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => setDeep(!deep)}
              aria-expanded={deep}
            >
              {deep ? "− Less detail" : "+ Help me unpack the idea"}
            </button>
            {deep && (
              <label>
                Features, context, assumptions, and open questions
                <textarea
                  rows={4}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="What is hard today? What have you tried? Which feature matters most? Paste extra context here."
                />
                <small>
                  A future planning agent will use this to ask deeper questions.
                  This demo saves your brief locally.
                </small>
              </label>
            )}
            <aside className="note">
              Demo rehearsal: your brief stays in this browser. The office uses
              synthetic work. Repository creation is unavailable; no repository or agents are created.
            </aside>
            <button type="button" onClick={() => enter(true)}>Skip</button>
            <button className="primary" type="submit">
              Save brief & enter office ↗
            </button>
          </form>
        </main>
      )}
      {screen === "office" && (
        <>
          <header className="office-header">
            <button
              className="wordmark"
              onClick={() => {
                setPlaying(false);
                setScreen("menu");
              }}
              aria-label="Back to main menu"
            >
              OS<span>↙</span>
            </button>
            <div className="office-name">
              <strong>
                {hasSave ? brief.name : "The little demo factory"}
              </strong>
              <small>
                <span className="live-dot" />{" "}
                {state.connected
                  ? "Synthetic source connected"
                  : "Synthetic source disconnected"}
              </small>
            </div>
            <span className="demo-badge">DEMO</span>
            <div className="header-actions">
              <button
                onClick={() => open("needs")}
                className={stuck.length ? "needs" : ""}
              >
                Needs you <b>{stuck.length}</b>
              </button>
              <button
                onClick={() => open("leaderboard")}
                aria-label="Leaderboard"
              >
                ↗ <span className="hide-small">Leaderboard</span>
              </button>
              <button
                onClick={sound}
                aria-label={
                  options.muted ? "Enable ambient sound" : "Mute ambient sound"
                }
              >
                {options.muted ? "Sound off" : "Sound on"}
              </button>
              <button onClick={() => open("options")} aria-label="Options">
                ⚙
              </button>
            </div>
          </header>
          <section className="office-caption">
            <p className="eyebrow">YOUR FACTORY FLOOR</p>
            <h2>Ideas in. Possibilities out.</h2>
            <p>Pick a robot or folder to see the work behind it.</p>
          </section>
          <section className="capacity-toolbar" aria-label="Simulated provider capacity">
            {state.providers.map((p) => <button key={p.id} className={`capacity-tank ${p.state}`} onClick={() => select(p.id)} aria-label={`${p.name} capacity: ${p.state === "ok" ? "known" : p.state}${p.level !== null ? ` · ${p.state === "stale" ? "last known " : ""}${Math.round(p.level * 100)}%` : ""}. ${p.reason}`}>
              <span className="tank-glass" aria-hidden="true"><span className="tank-liquid" style={{ height: `${(p.level ?? 0) * 100}%` }} /></span>
              <span><strong>{p.name}</strong><small>{p.state === "ok" ? "known" : p.state}{p.level !== null ? ` · ${p.state === "stale" ? "last known " : ""}${Math.round(p.level * 100)}%` : ""}</small><small>{p.reason}</small></span>
            </button>)}
          </section>
          <div className="work-panels">
          <details className="work-list" open>
            <summary>Needs You <span>{stuck.length} stuck issues</span></summary>
            <div>{stuck.length ? stuck.map((i) => <button key={i.id} onClick={() => select(i.id)}><span>Jump to blocker: {i.title}</span><small>{holds.some((h) => h.issueId === i.id) ? "Owner hold" : "Changes requested or failed check"}</small></button>) : <p>No stuck work. Play a story to explore.</p>}</div>
          </details>
          <details className="work-list directory">
            <summary>
              Work directory <span>{state.issues.length} issues</span>
            </summary>
            <div>
              {Object.entries(workflowDefinition.stages).map(([id, station]) => <button key={id} onClick={() => select(`station:${id}`)}><span>{station.label} station</span><small>{state.issues.filter(i => !i.provenance && i.stage === id).length} cards · {state.robots.filter(r => r.stage === id).length} robots</small></button>)}
              <button onClick={() => select("station:capacity")}>Capacity station</button>
              {state.issues.map((i) => (
                <button key={i.id} onClick={() => select(i.id)}>
                  <span>{i.title}</span>
                  <small>
                    {i.provenance ? "Historical archive" : i.stage} · {issueProgress(state, i.id)}
                  </small>
                </button>
              ))}
              {state.robots.map((r) => <button key={r.id} onClick={() => select(r.id)}><span>{r.name}</span><small>{r.role} · {r.stage} · {sceneFacts.robots.find(bot => bot.id === r.id)?.queued ? "Queued for busy desk" : "At desk"}</small></button>)}
            </div>
          </details>
          </div>
          <footer className="replay-bar">
            <div className="replay-select">
              <label htmlFor="scenario">DEMO STORY</label>
              <select
                id="scenario"
                value={sceneScenario?.id || ""}
                onChange={(e) => reset(e.target.value)}
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="replay-controls">
              <button
                onClick={() => {
                  if (cursor >= sceneScenario.events.length) reset();
                  setPlaying(!playing);
                }}
                disabled={!sceneScenario.events.length || manualPause !== null}
                aria-label={playing ? "Pause replay" : "Play replay"}
              >
                {playing ? "Ⅱ" : "▶"}
              </button>
              <button
                onClick={step}
                disabled={cursor >= sceneScenario?.events.length || manualPause !== null}
                aria-label="Next event"
              >
                Step →
              </button>
              <button onClick={() => reset()} aria-label="Restart replay">
                ↺
              </button>
            </div>
            <div className="replay-progress">
              <span>{sceneScenario?.description}</span>
              <progress
                value={cursor}
                max={sceneScenario?.events.length || 1}
              />
              <small>
                {cursor} / {sceneScenario?.events.length} events
              </small>
            </div>
            <button
              className="lever"
              aria-label="Pause new launches"
              aria-describedby="dispatch-status"
              disabled={playing}
              aria-pressed={state.requestedPause}
              onClick={() => { const desired = !state.requestedPause; setState((s) => setPause(s, desired)); setManualPause(desired); }}
            >
              <span
                className={
                  state.paused ? "lever-indicator off" : "lever-indicator"
                }
              />
              Pause new launches
              <span id="dispatch-status" role="status" aria-live="polite"><small>Requested: {state.requestedPause ? "paused" : "running"}</small>
              <small>Effective: {state.paused ? "paused" : "running"}</small>
              <small>Running work continues.</small></span>
            </button>
          </footer>
          {reveal && (
            <div
              className="reveal"
              style={{ animationDuration: options.reducedMotion ? "0s" : "2s" }}
            >
              <span>Opening the office…</span>
              <button onClick={() => setReveal(false)}>Skip reveal</button>
            </div>
          )}
        </>
      )}
      {(modal || selected) && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "options"
                ? "Office options"
                : modal === "leaderboard"
                  ? "Leaderboard"
                  : modal === "needs"
                    ? "Needs you"
                    : "Work inspector"
            }
            className={`dialog ${selected ? "inspector" : ""}`}
          >
            <button className="close" onClick={close} aria-label="Close dialog">
              ×
            </button>
            {modal === "options" && (
              <>
                <p className="eyebrow">MAKE YOURSELF AT HOME</p>
                <h2>Office options</h2>
                <section>
                  <h3>Sound & motion</h3>
                  <label className="toggle">
                    <span>Ambient office hum</span>
                    <button aria-label="Ambient office hum" aria-pressed={!options.muted} onClick={sound}>
                      {options.muted ? "Off" : "On"}
                    </button>
                  </label>
                  <label>
                    Volume
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step=".05"
                      value={options.volume}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          volume: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="toggle">
                    Reduced motion
                    <input
                      type="checkbox"
                      checked={options.reducedMotion}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          reducedMotion: e.target.checked,
                        })
                      }
                    />
                  </label>
                </section>
                <section>
                  <h3>
                    Autonomy & limits <span className="demo-badge">DEMO</span>
                  </h3>
                  <label className="toggle">
                    Broad autonomy
                    <input
                      type="checkbox"
                      checked={options.autonomy}
                      onChange={(e) =>
                        setOptions({ ...options, autonomy: e.target.checked })
                      }
                    />
                  </label>
                  <p>
                    The crew handles implementation, review, and QA. Product
                    decisions come to you.
                  </p>
                  <label>
                    Illustrative daily spending limit ($)
                    <input
                      type="number"
                      min="0"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                    />
                  </label>
                  <small>
                    Preference preview only. No execution or billing is
                    connected.
                  </small>
                </section>
                <section>
                  <h3>Your factory, your audience</h3>
                  {(["revenue", "layout", "code"] as const).map((k) => (
                    <label className="sharing" key={k}>
                      <span>
                        {k === "revenue"
                          ? "Revenue & financials"
                          : k === "layout"
                            ? "Office layout"
                            : "Source code"}
                      </span>
                      <select
                        value={options.sharing[k]}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            sharing: {
                              ...options.sharing,
                              [k]: e.target.value,
                            },
                          })
                        }
                      >
                        {audiences.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <small>
                    Sharing preferences are saved locally. Nothing is published.
                  </small>
                </section>
                <section>
                  <h3>Connectors</h3>
                  {["GitHub", "Linear", "Claude / Codex / Jev", "Stripe"].map(
                    (n) => (
                      <div className="connector" key={n}>
                        <span>{n}</span>
                        <span>Simulated / not connected</span>
                      </div>
                    ),
                  )}
                </section>
              </>
            )}
            {modal === "leaderboard" && <Leaderboard />}
            {modal === "needs" && (
              <>
                <p className="eyebrow">THE CREW NEEDS A HAND</p>
                <h2>
                  Needs you <span>{stuck.length}</span>
                </h2>
                <p>Owner holds, failed checks, and changes requested.</p>
                {holds.length ? (
                  holds.map((h) => (
                    <article className="hold" key={h.id}>
                      <h3>{h.title}</h3>
                      <p>{h.detail}</p>
                      <button
                        className="primary"
                        onClick={() =>
                          setState((s) =>
                            resolveHold(s, h.id),
                          )
                        }
                      >
                        Approve in demo ✓
                      </button>
                      <button
                        className="text-button"
                        onClick={() => select(h.issueId)}
                      >
                        Inspect related work →
                      </button>
                    </article>
                  ))
                ) : (
                  <aside className="note">
                    No owner decisions waiting.
                  </aside>
                )}
                {stuck.filter((i) => !holds.some((h) => h.issueId === i.id)).map((i) => <article className="hold" key={i.id}><h3>{i.title}</h3><p>Changes requested or failed check</p><button onClick={() => select(i.id)}>Jump to blocker</button></article>)}
                <h3>Since last view</h3>
                <ul className="digest">
                  {digest.length ? (
                    digest.map((l, i) => <li key={i}>{l}</li>)
                  ) : (
                    <li>
                      No new changes since your last view.
                    </li>
                  )}
                </ul>
              </>
            )}
            {selected && (
              <>
                <p className="eyebrow">OFFICE INSPECTOR / SIMULATED EVIDENCE</p>
                <h2>
                  {robot?.name ||
                    issue?.title ||
                    provider?.name ||
                    (selected === "dispatch" ? "Dispatch" : "Workstation")}
                </h2>
                {selected.startsWith("station:") && <section><h3>{selected.slice(8)} station</h3><p>{state.issues.filter(i => !i.provenance && i.stage === selected.slice(8)).length} cards · {state.robots.filter(r => r.stage === selected.slice(8)).length} robots</p>{state.issues.filter(i => !i.provenance && i.stage === selected.slice(8)).map(i => <button key={i.id} onClick={() => select(i.id)}>{i.title}</button>)}{selected === "station:capacity" && state.providers.map(p => <button key={p.id} onClick={() => select(p.id)}>{p.name}: {p.state}</button>)}</section>}
                {selected === "dispatch" && <section><h3>Launch control</h3><p>Requested: {state.requestedPause ? "paused" : "running"}</p><p>Effective: {state.paused ? "paused" : "running"}</p><p>Running work continues.</p><h3>Last pause events</h3><ul>{state.log.filter(line => /dispatch (pause|resume|paused|resumed)/i.test(line)).slice(0, 5).map((line, index) => <li key={index}>{line}</li>)}</ul>{!state.log.some(line => /dispatch (pause|resume|paused|resumed)/i.test(line)) && <p>No pause events yet.</p>}</section>}
                {robot && (
                  <p>
                    {robot.provider} · {robot.role} · {sceneFacts.robots.find(bot => bot.id === robot.id)?.queued ? "Queued for busy desk" : "At desk"}
                    <br />
                    <small>
                      Executor {robot.id} / activity {robot.activityId}
                    </small>
                  </p>
                )}
                {issue && (
                  <>
                    <span className="stage-label">{issue.stage}</span>
                    <p>{issue.title}</p>
                    {issue.provenance && <p className="note">Historical imported story · Provenance: {issue.provenance}</p>}
                    <div className="note">
                      {issueProgress(state, issue.id)}
                    </div>
                    {prs.map((p) => (
                      <article className="pr-evidence" key={p.id}>
                        <h3>{p.title}</h3>
                        <p>
                          {p.merged ? "✓ Merged" : "◌ Open"} ·{" "}
                          <code>{p.head}</code>
                        </p>
                        <dl>
                          <dt>Current-head review</dt>
                          <dd>{p.reviews[p.head] || "No verified result"}</dd>
                          <dt>Current-head QA</dt>
                          <dd>
                            {p.qa[p.head] === true
                              ? "Passed"
                              : p.qa[p.head] === false
                                ? "Failed"
                                : "No verified result"}
                          </dd>
                          <dt>Evidence source</dt>
                          <dd>
                            fixture:{sceneScenario?.id || "initial"} / {p.id}
                          </dd>
                        </dl>
                      </article>
                    ))}
                  </>
                )}
                {provider && (
                  <>
                    <p className="stage-label">{provider.state}</p>
                    <h3>
                      {provider.level === null
                        ? "Unknown capacity"
                        : `${provider.state === "stale" ? "Last known " : ""}${Math.round(provider.level * 100)}% remaining`}
                    </h3>
                    <p>{provider.reason}</p>
                    <p>Reset: {provider.reset}</p>
                    <aside className="note">
                      Source: synthetic provider window. This is not your
                      account usage.
                    </aside>
                  </>
                )}
                {!issue && !provider && selected !== "dispatch" && (
                  <p>
                    This workstation is part of the office workflow. Choose an
                    issue or robot from the work directory to inspect its
                    evidence.
                  </p>
                )}
                <p className="tiny">
                  Observed in deterministic demo state · tick {state.tick}
                  <br />
                  Animation does not determine work status.
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
