import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Let jsdom supply Web Storage rather than Node 26's file-backed global.
  test: {
    // Journey tests read styles.css?raw to pin layout rules jsdom cannot measure.
    css: { include: [/styles\.css/] },
    execArgv: process.allowedNodeEnvironmentFlags.has('--no-experimental-webstorage')
      ? ['--no-experimental-webstorage']
      : [],
  },
});
