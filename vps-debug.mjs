import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 60000) {
  return new Promise((resolve, reject) => {
    console.log(`> ${command.substring(0, 120)}`);
    let output = '';
    conn.exec(command, (err, stream) => {
      if (err) { reject(err); return; }
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      stream.on('data', (d) => { output += d.toString(); process.stdout.write(d.toString()); });
      stream.stderr.on('data', (d) => { process.stderr.write(d.toString()); });
      stream.on('close', (code) => { clearTimeout(timer); resolve({ code, output }); });
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect({ host: VPS_HOST, port: 22, username: VPS_USER, password: VPS_PASS, readyTimeout: 30000 });
  });
  console.log('Connected!');
  
  try {
    // Check static files
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Checking .next structure ===" &&
      ls -la .next/ | head -10 &&
      echo "=== Standalone .next structure ===" &&
      ls -la .next/standalone/.next/ | head -10 &&
      echo "=== Static chunks ===" &&
      ls .next/standalone/.next/static/chunks/ | head -10 &&
      echo "=== CSS files ===" &&
      find .next/standalone/.next/static -name "*.css" | head -10 &&
      echo "=== Checking if standalone server.js exists ===" &&
      ls -la .next/standalone/server.js
    `);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
