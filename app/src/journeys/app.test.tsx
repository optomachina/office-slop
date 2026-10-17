// @vitest-environment jsdom
/// <reference types="vite/client" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SceneProps } from '../contracts';
import App from '../shell/App';
import officeStyles from '../shell/styles.css?raw';
import indexHtml from '../../index.html?raw';
import { sceneLabels } from '../scene/layout';
import { selectScene } from '../scene/selectors';
import { sceneLoader } from '../shell/sceneLoader';

vi.mock('../scene/OfficeScene', () => ({ default: ({ state, reducedMotion, onSelect }: SceneProps) =>
  <div aria-label="Office scene">{sceneLabels(selectScene(state).stations, state.providers).filter(label => label.id.startsWith('station:')).map(label => <button key={label.id} onClick={() => onSelect(label.id)}>{label.text}</button>)}{reducedMotion ? 'Scene motion reduced' : 'Scene motion enabled'}<button onClick={() => onSelect('robot-moss')}>Scene robot</button><button onClick={() => onSelect('issue-onboarding')}>Scene card</button><button onClick={() => onSelect('dispatch')}>Scene dispatch</button><button onClick={() => onSelect('station:build')}>Scene station</button></div>,
}));
beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
async function enter() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /^Continue/ }));
  const skip = screen.queryByRole('button', { name: 'Skip reveal' });
  if (skip) await user.click(skip);
  return user;
}

describe('Milestone A user journeys', () => {
  it('New Game offers a skippable interview and Continue reopens the local factory', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^New Game/ }));
    expect(screen.getByRole('heading', { name: 'What are we making?' })).toBeTruthy();
    expect(screen.getByText(/repository creation.*unavailable/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    const reveal = screen.queryByRole('button', { name: 'Skip reveal' });
    if (reveal) await user.click(reveal);
    expect(screen.getByRole('button', { name: 'Back to main menu' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Back to main menu' }));
    await user.click(screen.getByRole('button', { name: /Continue.*Saved factory/ }));
    expect(screen.getByRole('button', { name: 'Back to main menu' })).toBeTruthy();
  });
  it('shows requested pause before later effective pause and preserves work', async () => {
    const user = await enter();
    await user.click(screen.getByRole('button', { name: /pause new/i }));
    expect(screen.getByText(/requested: paused/i)).toBeTruthy();
    expect(screen.getByText(/effective: running/i)).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('button', {name: 'Pause new launches', description: /effective: paused/i})).toBeTruthy(), { timeout: 2000 });
    expect(screen.getByText(/running work continues/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /pause new/i }));
    expect(screen.getByText(/requested: running/i)).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/effective: running/i)).toBeTruthy(), { timeout: 2000 });
  });
  it('keeps requested versus effective pause under fixture replay control', async () => {
    const user = await enter();
    await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'switch');
    await user.click(screen.getByRole('button', { name: 'Next event' }));
    expect(screen.getByText(/requested: paused/i)).toBeTruthy();
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 800)); });
    expect(screen.getByText(/effective: running/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Next event' }));
    expect(screen.getByText(/effective: paused/i)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Restart replay' }));
    expect(screen.getByText(/requested: running/i)).toBeTruthy();
    expect(screen.getByText(/effective: running/i)).toBeTruthy();
  });
  it('exposes independent tanks and all five capacity observations', async () => {
    const user = await enter();
    for (const name of ['Claude', 'Codex', 'Grok', 'Cursor']) {
      expect(screen.getByRole('button', { name: new RegExp(`${name}.*capacity`, 'i') })).toBeTruthy();
    }
    await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'capacity');
    for (const state of ['low', 'exhausted', 'unknown', 'stale', 'known']) {
      await user.click(screen.getByRole('button', { name: 'Next event' }));
      expect(screen.getByRole('button', { name: new RegExp(`Claude.*${state}`, 'i') })).toBeTruthy();
    }
  });
  it('starts with stuck work and opens the inspector using keyboard selection', async () => {
    const user = await enter();
    const jump = screen.getAllByRole('button', { name: /jump to blocker/i })[0];
    jump.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Work inspector' })).toBeTruthy();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.activeElement).toBe(jump));
    await user.click(screen.getByText(/Work directory/));
    const item = screen.getByRole('button', { name: /^Connect the revenue scoreboard/ });
    item.focus();
    await user.keyboard('{Enter}');
    const dialog = screen.getByRole('dialog', { name: 'Work inspector' });
    expect(within(dialog).getByText(/1 of 2 linked PRs merged/)).toBeTruthy();
    expect(within(dialog).getByText('Failed')).toBeTruthy();
  });
  it('retains reduced motion preference and passes it to the office', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Options/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Reduced motion' }));
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    expect(await screen.findByText('Scene motion reduced')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Options' }));
    expect((screen.getByRole('checkbox', { name: 'Reduced motion' }) as HTMLInputElement).checked).toBe(true);
  });
  it('exposes historical provenance without inventing activity', async () => {
    const user = await enter();
    await user.click(screen.getByText(/Work directory/));
    await user.click(screen.getByRole('button', { name: /Historical: Slop Farm/ }));
    const dialog = screen.getByRole('dialog', { name: 'Work inspector' });
    expect(within(dialog).getByText(/Imported from planning\/opus-development-plan.md/)).toBeTruthy();
  });
});

describe('Slice 2 journeys', () => {
  it('plays, pauses, steps, resets and selects a load scenario', async () => {
    const user = await enter();
    await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'reconnect');
    await user.click(screen.getByRole('button', {name:'Play replay'}));
    await waitFor(() => expect(screen.getByText('1 / 4 events')).toBeTruthy(), {timeout:2200});
    await user.click(screen.getByRole('button', {name:'Pause replay'}));
    expect(screen.getByText('Synthetic source disconnected')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'Next event'}));
    expect(screen.getByText('2 / 4 events')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'Restart replay'}));
    expect(screen.getByText('0 / 4 events')).toBeTruthy();
    expect(screen.getByText('Synthetic source connected')).toBeTruthy();
    await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'load');
    await user.click(screen.getByText(/Work directory/));
    expect(screen.getByText('200 issues')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:/^Intake station/}));
    expect(within(screen.getByRole('dialog')).getByText('25 cards · 3 robots')).toBeTruthy();
  });
  it('jumps to a blocker and shows only changes since the previous digest view', async () => {
    const user = await enter();
    await user.click(screen.getByRole('button', {name:/^Needs you \d/}));
    expect(screen.getByRole('heading', {name:'Since last view'})).toBeTruthy();
    expect(screen.getByText(/Billing: 1 of 2/)).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'Close dialog'}));
    await user.click(screen.getByRole('button', {name:/^Needs you \d/}));
    expect(screen.getByText('No new changes since your last view.')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'Close dialog'}));
    await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'repair');
    await user.click(screen.getByRole('button', {name:'Next event'}));
    await user.click(screen.getByRole('button', {name:/Jump to blocker: Give every robot/}));
    expect(within(screen.getByRole('dialog')).getByText('changes_requested')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'Close dialog'}));
    await user.click(screen.getByRole('button', {name:/^Needs you \d/}));
    expect(screen.getByText(/\[fixture · repair-1\]/)).toBeTruthy();
  });
  it('persists mute and volume across remounts with AudioContext unavailable', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', {name:/Options/}));
    await user.click(screen.getByRole('button', {name:'Ambient office hum'}));
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(screen.getByRole('slider', {name:'Volume'}), {target:{value:'0.55'}});
    cleanup();
    render(<App />);
    await user.click(screen.getByRole('button', {name:/Options/}));
    expect(screen.getByRole('button', {name:'Ambient office hum'}).getAttribute('aria-pressed')).toBe('true');
    expect((screen.getByRole('slider', {name:'Volume'}) as HTMLInputElement).value).toBe('0.55');
    await user.click(screen.getByRole('button', {name:'Ambient office hum'}));
    cleanup();
    render(<App />);
    await user.click(screen.getByRole('button', {name:/Options/}));
    expect(screen.getByRole('button', {name:'Ambient office hum'}).getAttribute('aria-pressed')).toBe('false');
  });
});

it('creates audio only after a gesture and closes it on unmount', async () => {
  const resume = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn().mockResolvedValue(undefined);
  const stop = vi.fn();
  const construct = vi.fn();
  class Context {
    currentTime=0; destination={}; resume=resume; close=close;
    constructor(){ construct(); }
    createGain(){return {gain:{value:0,setTargetAtTime:vi.fn()},connect:vi.fn()};}
    createOscillator(){return {type:'sine',frequency:{value:0},connect:vi.fn(),start:vi.fn(),stop};}
  }
  vi.stubGlobal('AudioContext', Context);
  try {
    const user=userEvent.setup();
    const view=render(<App />);
    expect(construct).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button',{name:/Options/}));
    expect(construct).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button',{name:'Ambient office hum'}));
    expect(construct).toHaveBeenCalledTimes(1);
    expect(resume).toHaveBeenCalled();
    view.unmount();
    expect(stop).toHaveBeenCalledTimes(3);
    expect(close).toHaveBeenCalledTimes(1);
  } finally {vi.unstubAllGlobals();}
});

it('uses the same inspector for scene and DOM selections', async () => {
 const user=await enter();
 await user.click(screen.getByRole('button',{name:'Scene robot'}));
 expect(within(screen.getByRole('dialog')).getByRole('heading',{name:'Moss'})).toBeTruthy();
 expect(within(screen.getByRole('dialog')).getByText(/Queued for busy desk/)).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'Close dialog'}));
 await user.click(screen.getByRole('button',{name:'Scene card'}));
 expect(within(screen.getByRole('dialog')).getByRole('heading',{name:'Turn a spark into a product brief'})).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'Close dialog'}));
 await user.click(screen.getByRole('button',{name:'Scene station'}));
 expect(within(screen.getByRole('dialog')).getByRole('heading',{name:'build station'})).toBeTruthy();
});

it('restores the original launcher after jumping from Needs You to an inspector', async () => {
 const user=await enter();
 const launcher=screen.getByRole('button',{name:/^Needs you \d/});
 await user.click(launcher);
 await user.click(screen.getByRole('button',{name:/Inspect related work/}));
 await user.keyboard('{Escape}');
 await waitFor(()=>expect(document.activeElement).toBe(launcher));
});

it('pans, zooms and resets the real DOM camera controls with keyboard and buttons', async () => {
 const {OfficeViewport}=await vi.importActual<typeof import('../scene/OfficeViewport')>('../scene/OfficeViewport');
 const camera={pan:vi.fn(),zoom:vi.fn(),reset:vi.fn()};
 const user=userEvent.setup();
 render(<OfficeViewport camera={camera}/>);
 screen.getByRole('region').focus();
 await user.keyboard('{ArrowLeft}{ArrowDown}+-0');
 expect(camera.pan.mock.calls).toEqual([[30,0],[0,-30]]);
 expect(camera.zoom.mock.calls).toEqual([[1.15],[.85]]);
 expect(camera.reset).toHaveBeenCalledTimes(1);
 await user.click(screen.getByRole('button',{name:'Zoom in'}));
 await user.click(screen.getByRole('button',{name:'Zoom out'}));
 await user.click(screen.getByRole('button',{name:'Fit office'}));
 expect(camera.zoom).toHaveBeenCalledTimes(4);
 expect(camera.reset).toHaveBeenCalledTimes(2);
});

it('opens dispatch with requested/effective state and pause evidence', async () => {
 const user=await enter();
 await user.click(screen.getByRole('button',{name:'Pause new launches'}));
 await waitFor(()=>expect(screen.getByRole('status').textContent).toMatch(/Effective: paused/),{timeout:2000});
 await user.click(screen.getByRole('button',{name:'Scene dispatch'}));
 const dialog=within(screen.getByRole('dialog'));
 expect(dialog.getByRole('heading',{name:'Dispatch'})).toBeTruthy();
 expect(dialog.getByText('Requested: paused')).toBeTruthy();
 expect(dialog.getByText('Effective: paused')).toBeTruthy();
 expect(dialog.getByText('Running work continues.')).toBeTruthy();
 expect(dialog.getByText(/executor confirmed dispatch paused/)).toBeTruthy();
});
it('defaults motion from OS while retaining explicit override', async () => {
 vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true})));
 try {
  const user=userEvent.setup(); render(<App/>);
  expect(await screen.findByText('Scene motion reduced')).toBeTruthy();
  await user.click(screen.getByRole('button',{name:/Options/}));
  await user.click(screen.getByRole('checkbox',{name:'Reduced motion'}));
  cleanup(); render(<App/>);
  expect(await screen.findByText('Scene motion enabled')).toBeTruthy();
 } finally {vi.unstubAllGlobals();}
});
it('labels stale capacity and shows robot linked issue and stage', async () => {
 const user=await enter();
 expect(screen.getByRole('button',{name:/Cursor capacity: stale · last known 40%/})).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'Scene robot'}));
 const dialog=within(screen.getByRole('dialog'));
 expect(dialog.getByText('Turn a spark into a product brief')).toBeTruthy();
 expect(dialog.getByText('build')).toBeTruthy();
});
it('excludes history from the planning inspector', async () => {
 const user=await enter();
 await user.click(screen.getByText(/Work directory/));
 await user.click(screen.getByRole('button',{name:/^Planning station/}));
 expect(within(screen.getByRole('dialog')).getByText('1 cards · 1 robots')).toBeTruthy();
 expect(within(screen.getByRole('dialog')).queryByRole('button',{name:/Historical:/})).toBeNull();
});
it('separates manual pause from replay and retains repeated digest events', async () => {
 const user=await enter();
 await user.click(screen.getByRole('button',{name:'Play replay'}));
 expect((screen.getByRole('button',{name:'Pause new launches'}) as HTMLButtonElement).disabled).toBe(true);
 await user.click(screen.getByRole('button',{name:'Pause replay'}));
 for(let i=0;i<3;i++) {
  await user.click(screen.getByRole('button',{name:'Pause new launches'}));
  expect((screen.getByRole('button',{name:'Play replay'}) as HTMLButtonElement).disabled).toBe(true);
  await waitFor(()=>expect((screen.getByRole('button',{name:'Play replay'}) as HTMLButtonElement).disabled).toBe(false),{timeout:2000});
  await user.click(screen.getByRole('button',{name:/^Needs you \d/}));
  expect(within(screen.getByRole('dialog')).getByText(new RegExp(`Dispatch ${i===1?'resume':'pause'} requested`))).toBeTruthy();
  await user.click(screen.getByRole('button',{name:'Close dialog'}));
 }
});

it('keeps capacity and blockers accessible while station counts stay in the directory', async () => {
 const user = await enter();
 await user.click(screen.getByRole('button', {name:/Cursor capacity:/}));
 expect(within(screen.getByRole('dialog')).getByRole('heading', {name:'Cursor'})).toBeTruthy();
 await user.keyboard('{Escape}');
 await user.click(screen.getAllByRole('button', {name:/Jump to blocker:/})[0]);
 expect(screen.getByRole('dialog', {name:'Work inspector'})).toBeTruthy();
 await user.keyboard('{Escape}');
 await user.selectOptions(screen.getByLabelText('DEMO STORY'), 'load');
 await user.click(screen.getByText(/Work directory/));
 expect(screen.getByRole('button', {name:'BUILD LAB · 25'})).toBeTruthy();
 expect(screen.queryByText(/grouped/)).toBeNull();
 await user.click(screen.getByRole('button', {name:'BUILD LAB · 25'}));
 expect(within(screen.getByRole('dialog')).getByText(/25 cards/)).toBeTruthy();
});

it('stacks mobile attention, directory and usable replay after the two-column tanks', async () => {
 const user = await enter();
 const needs = screen.getByText('Needs You', {selector:'summary'}).closest('details')!;
 const directory = screen.getByText(/Work directory/, {selector:'summary'}).closest('details')!;
 const panels = needs.parentElement!;
 const footer = screen.getByLabelText('DEMO STORY').closest('footer')!;
 expect(panels.className).toBe('work-panels');
 expect(directory.parentElement).toBe(panels);
 expect(needs.nextElementSibling).toBe(directory);
 expect(panels.nextElementSibling).toBe(footer);
 expect(footer.className).toBe('replay-bar');
 await user.click(within(directory).getByText(/Work directory/));
 await user.click(screen.getByRole('button', {name:'Next event'}));
 expect(screen.getByRole('button', {name:'Play replay'})).toBeTruthy();
 expect(within(screen.getByRole('region', {name:'Simulated provider capacity'})).getAllByRole('button')).toHaveLength(4);
 // jsdom has no layout: pin the flow rules as well as the real App structure.
 expect(officeStyles).toContain('.screen-office .replay-bar { position: static;');
 const mobile = officeStyles.slice(officeStyles.lastIndexOf('@media (max-width: 600px)'));
 expect(mobile).toContain('grid-template-rows: auto auto minmax(260px, 40dvh) auto auto');
 expect(mobile).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
 expect(mobile).toContain('grid-row: 4; min-height: auto; overflow: visible');
 expect(mobile).toContain('.screen-office .replay-bar { grid-row: 5; }');
});

it('shows a retryable fallback when the office scene chunk fails and keeps the rest of the office usable', async () => {
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 const error=vi.spyOn(console,'error').mockImplementation(()=>{});
 const load=vi.spyOn(sceneLoader,'load').mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'));
 try {
  const user=await enter();
  const alert=await screen.findByRole('alert');
  expect(within(alert).getByText('The office floor could not load.')).toBeTruthy();
  expect(screen.queryByLabelText('Office scene')).toBeNull();
  expect(within(screen.getByRole('region',{name:'Simulated provider capacity'})).getAllByRole('button')).toHaveLength(4);
  const launcher=screen.getByRole('button',{name:/^Needs you \d/});
  await user.click(launcher);
  await user.click(screen.getByRole('button',{name:/Inspect related work/}));
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button',{name:'Play replay'})).toBeTruthy();
  await user.click(within(alert).getByRole('button',{name:'Retry loading office'}));
  expect(await screen.findByLabelText('Office scene')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(load).toHaveBeenCalledTimes(2);
 } finally { load.mockRestore(); warn.mockRestore(); error.mockRestore(); }
});

it('shows the Slop Farm name on the main menu, footer and tab title, and keeps pre-rename saves', async () => {
 localStorage.setItem('office-slop-save-v1', JSON.stringify({version:1,brief:{name:'Legacy factory',idea:'i',customer:'c',outcome:'o'},context:{}}));
 render(<App />);
 expect(screen.getByRole('heading', {level:1}).textContent).toBe('SLOPFARM');
 expect(screen.getByText('SLOP FARM / 001')).toBeTruthy();
 expect(screen.queryByText(/office slop/i)).toBeNull();
 expect(screen.getByRole('button', {name:/Continue.*Saved factory/})).toBeTruthy();
});

it('names the app Slop Farm in the HTML title', () => {
 expect(indexHtml).toContain('<title>Slop Farm — Your little code factory</title>');
 expect(indexHtml).not.toMatch(/office slop/i);
});
