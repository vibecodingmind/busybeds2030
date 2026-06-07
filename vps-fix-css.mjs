import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 120000) {
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
    // Check where static files are
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== .next/static ===" &&
      ls -la .next/static/ 2>/dev/null | head -5 &&
      echo "=== .next/static/chunks CSS ===" &&
      find .next/static -name "*.css" 2>/dev/null | head -5 &&
      echo "=== Standalone .next ===" &&
      ls -la .next/standalone/.next/ 2>/dev/null &&
      echo "=== Fix: copy static to standalone ===" &&
      cp -rv .next/static .next/standalone/.next/ 2>&1 | tail -5 &&
      echo "=== Verify CSS files now exist ===" &&
      find .next/standalone/.next/static -name "*.css" | head -5
    `);
    
    // Restart PM2
    await executeCommand(conn, 'cd /var/www/busybeds && pm2 restart busybeds && sleep 5 && pm2 list');
    
    // Test CSS loading
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Testing CSS ===" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/ &&
      echo "" &&
      curl -s http://localhost:3008/ | grep -o 'href="[^"]*\.css"' | head -3
    `);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
