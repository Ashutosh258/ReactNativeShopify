import { spawn } from 'node:child_process';

const [storeId, ...rest] = process.argv.slice(2);
if (!storeId) {
  console.error('Usage: node scripts/store.mjs <storeId> [--simulate-errors] [expo start args]');
  process.exit(1);
}

const simulateErrors = rest.includes('--simulate-errors');
const args = rest.filter((a) => a !== '--simulate-errors');

const child = spawn('npx', ['expo', 'start', '--clear', ...args], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, STORE: storeId, EXPO_PUBLIC_SIMULATE_ERRORS: simulateErrors ? '1' : '0' },
});
child.on('exit', (code) => process.exit(code ?? 0));
