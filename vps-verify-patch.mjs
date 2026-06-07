import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 120000) {
  return new Promise((resolve, reject) => {
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
    // Check if distDir was patched correctly in server.js
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Check distDir in server.js ===" &&
      grep -o '"distDir":"[^"]*"' .next/standalone/server.js | head -1 &&
      echo "=== Check if CSS files exist in standalone ===" &&
      find .next/standalone/.next/static -name "*.css" 2>/dev/null &&
      echo "=== Try fetching CSS with full path === &&
      CSS_HASH=$(ls .next/standalone/.next/static/chunks/*.css 2>/dev/null | head -1 | xargs basename 2>/dev/null) &&
      echo "CSS file: $CSS_HASH" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" "http://localhost:3008/_next/static/chunks/$CSS_HASH"
    `);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
