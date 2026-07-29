import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

console.log('Starting backend...');
const backend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: backendPath, stdio: 'inherit', shell: true });

setTimeout(() => {
  console.log('Starting frontend...');
  const frontend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: frontendPath, stdio: 'inherit', shell: true });

  process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 3000);
