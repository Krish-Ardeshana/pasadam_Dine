import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('  PRASADAM DINE - DEVELOPMENT ENVIRONMENT LAUNCHER');
console.log('======================================================\n');

function runProcess(name, command, args, cwd, color) {
  const proc = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
  });

  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`[${name}] Exited with code ${code}`);
    }
  });

  return proc;
}

const processes = [];

// 1. Start Frontend (Next.js 16 on port 3000)
console.log('[System] Launching Frontend (Next.js 16) on http://localhost:3000 ...');
const frontend = runProcess(
  'Frontend',
  'npm',
  ['run', 'dev'],
  path.join(rootDir, 'frontend'),
  '\x1b[36m'
);
processes.push(frontend);

// 2. Start Backend (NestJS 12 on port 4000)
console.log('[System] Launching Backend (NestJS 12) on http://localhost:4000/api/v1 ...');
const backend = runProcess(
  'Backend',
  'npm',
  ['run', 'start:dev'],
  path.join(rootDir, 'backend'),
  '\x1b[32m'
);
processes.push(backend);

// Handle graceful termination
function shutdown() {
  console.log('\n[System] Gracefully shutting down all development services...');
  for (const p of processes) {
    try {
      p.kill('SIGINT');
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
