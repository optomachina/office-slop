import { useEffect, useRef, useState } from "react";
import OfficeScene from "../scene/OfficeScene";
import { createInitialState, reduceEvent, scenarios } from "../domain";
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
export default function App() {
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
    [limit, setLimit] = useState("25");
  const sceneScenario =
    scenarios.find((s) => s.id === scenarioId) || scenarios[0];
  const returnFocus = useRef<HTMLElement | null>(null),
    dialogRef = useRef<HTMLDivElement>(null),
    audio = useRef<AudioContext | null>(null),
    gain = useRef<GainNode | null>(null);
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
    if (gain.current)
      gain.current.gain.value = options.muted ? 0 : options.volume * 0.035;
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
    setModal(which);
  }
  function select(id: string) {
    returnFocus.current = document.activeElement as HTMLElement;
    setModal(null);
    setSelected(id);
  }
  function enter(save = false) {
    if (save) persist();
    setScreen("office");
    setReveal(true);
  }
  function sound() {
    if (!audio.current) {
      try {
        const a = new AudioContext(),
          g = a.createGain(),
          osc = a.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 110;
        osc.connect(g);
        g.connect(a.destination);
        g.gain.value = 0.007;
        osc.start();
        audio.current = a;
        gain.current = g;
      } catch {
        setNotice("Audio unavailable; the office works silently.");
        return;
      }
    }
    void audio.current.resume();
    setOptions((o) => ({ ...o, muted: !o.muted }));
  }
  function reset(id = sceneScenario?.id) {
    setPlaying(false);
    setCursor(0);
    setState(createInitialState());
    setScenarioId(id || "");
  }
  function step() {
    if (sceneScenario && cursor < sceneScenario.events.length) {
      setState((s) => reduceEvent(s, sceneScenario.events[cursor]));
      setCursor((c) => c + 1);
    }
  }
  const holds = state.holds.filter((h) => !h.resolved),
    issue =
      state.issues.find((i) => i.id === selected) ||
      state.issues.find(
        (i) => i.id === state.robots.find((r) => r.id === selected)?.issueId,
      ) ||
      state.issues.find(
        (i) => i.id === state.prs.find((p) => p.id === selected)?.issueId,
      ),
    provider = state.providers.find((p) => p.id === selected),
    robot = state.robots.find((r) => r.id === selected),
    prs = issue ? state.prs.filter((p) => issue.prIds.includes(p.id)) : [];
  return (
    <div className="game-app">
      <div className="world">
        <OfficeScene
          state={state}
          reducedMotion={options.reducedMotion}
          selectedId={selected}
          onSelect={screen === "office" ? select : () => {}}
        />
      </div>
      {screen === "menu" && (
        <main className="menu-screen">
          <div className="menu-copy">
            <p className="eyebrow">SMALL ROBOTS. REAL AMBITION.</p>
            <h1>
              OFFICE
              <br />
              <span>SLOP</span>
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
            <span>OFFICE SLOP / 001</span>
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
              synthetic work; no repository or agents are created.
            </aside>
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
                className={holds.length ? "needs" : ""}
              >
                Needs you <b>{holds.length}</b>
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
          <details className="work-list">
            <summary>
              Work directory <span>{state.issues.length} issues</span>
            </summary>
            <div>
              {state.issues.map((i) => (
                <button key={i.id} onClick={() => select(i.id)}>
                  <span>{i.title}</span>
                  <small>
                    {i.stage} ·{" "}
                    {
                      i.prIds.filter(
                        (id) => state.prs.find((p) => p.id === id)?.merged,
                      ).length
                    }
                    /{i.prIds.length} PRs merged
                  </small>
                </button>
              ))}
            </div>
          </details>
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
                aria-label={playing ? "Pause replay" : "Play replay"}
              >
                {playing ? "Ⅱ" : "▶"}
              </button>
              <button
                onClick={step}
                disabled={cursor >= sceneScenario?.events.length}
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
              onClick={() => {
                const desired = !state.requestedPause;
                setState((s) =>
                  reduceEvent(s, {
                    id: `manual-request-${Date.now()}`,
                    at: s.tick + 1,
                    source: "fixture",
                    type: "pause",
                    entityId: "dispatch",
                    payload: { requested: desired },
                  }),
                );
                setTimeout(
                  () =>
                    setState((s) =>
                      reduceEvent(s, {
                        id: `manual-effective-${Date.now()}`,
                        at: s.tick + 1,
                        source: "fixture",
                        type: "pause",
                        entityId: "dispatch",
                        payload: { effective: desired },
                      }),
                    ),
                  700,
                );
              }}
            >
              <span
                className={
                  state.paused ? "lever-indicator off" : "lever-indicator"
                }
              />
              {state.requestedPause !== state.paused
                ? "Switch pending…"
                : state.paused
                  ? "Resume new work"
                  : "Pause new work"}
              <small>SIMULATED DISPATCH</small>
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
                    <button aria-pressed={!options.muted} onClick={sound}>
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
                  Needs you <span>{holds.length}</span>
                </h2>
                <p>Only decisions worth interrupting your day.</p>
                {holds.length ? (
                  holds.map((h) => (
                    <article className="hold" key={h.id}>
                      <h3>{h.title}</h3>
                      <p>{h.detail}</p>
                      <button
                        className="primary"
                        onClick={() =>
                          setState((s) =>
                            reduceEvent(s, {
                              id: `manual-hold-${Date.now()}`,
                              at: s.tick + 1,
                              type: "hold",
                              source: "fixture",
                              entityId: h.id,
                              payload: { resolved: true },
                            }),
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
                    Nothing waiting on you. The little crew has it from here.
                  </aside>
                )}
                <h3>Since this session began</h3>
                <ul className="digest">
                  {state.log.length ? (
                    state.log.slice(0, 6).map((l, i) => <li key={i}>{l}</li>)
                  ) : (
                    <li>
                      The demo office is ready. Play a story to see changes.
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
                    "Workstation"}
                </h2>
                {robot && (
                  <p>
                    {robot.provider} · {robot.role}
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
                    <div className="note">
                      {prs.filter((p) => p.merged).length} of {prs.length}{" "}
                      linked PRs merged
                      {prs.length > 1 && prs.some((p) => !p.merged)
                        ? " — this issue is not complete."
                        : ""}
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
                        : `${Math.round(provider.level * 100)}% remaining`}
                    </h3>
                    <p>Reset: {provider.reset}</p>
                    <aside className="note">
                      Source: synthetic provider window. This is not your
                      account usage.
                    </aside>
                  </>
                )}
                {!issue && !provider && (
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
