// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SceneProps } from '../contracts';
import App from '../shell/App';

vi.mock('../scene/OfficeScene', () => ({ default: ({ reducedMotion }: SceneProps) =>
  <div aria-label="Office scene">{reducedMotion ? 'Scene motion reduced' : 'Scene motion enabled'}</div>,
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
    await waitFor(() => expect(screen.getByText(/effective: paused/i)).toBeTruthy(), { timeout: 2000 });
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
    expect(screen.getByText('Scene motion reduced')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Options' }));
    expect((screen.getByRole('checkbox', { name: 'Reduced motion' }) as HTMLInputElement).checked).toBe(true);
  });
  it('exposes historical provenance without inventing activity', async () => {
    const user = await enter();
    await user.click(screen.getByText(/Work directory/));
    await user.click(screen.getByRole('button', { name: /Historical: Office Slop/ }));
    const dialog = screen.getByRole('dialog', { name: 'Work inspector' });
    expect(within(dialog).getByText(/Imported from planning\/opus-development-plan.md/)).toBeTruthy();
  });
});
