import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Let jsdom supply Web Storage rather than Node 26's file-backed global.
  test: {
    execArgv: process.allowedNodeEnvironmentFlags.has('--no-experimental-webstorage')
      ? ['--no-experimental-webstorage']
      : [],
  },
});
