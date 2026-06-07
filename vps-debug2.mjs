import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 60000) {
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
    // Debug: check where Next.js is looking for static files
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Current working dir ===" &&
      pwd &&
      echo "=== CWD in PM2 ===" &&
      pm2 show busybeds | grep -E "(script|cwd|exec)" &&
      echo "=== Check if CSS accessible via curl ===" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/_next/static/chunks/2tcykvktof0om.css &&
      echo "" &&
      echo "=== List standalone .next static ===" &&
      ls -la .next/standalone/.next/static/chunks/ 2>/dev/null | head -5 &&
      echo "=== Check Nginx config ===" &&
      cat /etc/nginx/sites-available/busybeds.com | grep -A5 "static\|location /"
    `);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
