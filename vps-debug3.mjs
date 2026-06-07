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
    // Check both .next/static and standalone locations
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== .next/static/chunks CSS files ===" &&
      find .next/static/chunks -name "*.css" 2>/dev/null &&
      echo "=== Try fetching CSS directly ===" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/_next/static/chunks/2tcykvktof0om.css &&
      echo "" &&
      echo "=== Try fetching JS ===" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/_next/static/chunks/webpack.js &&
      echo "" &&
      echo "=== Check PM2 env ===" &&
      pm2 show busybeds | grep -E "PORT|NODE_ENV|HOME" | head -5
    `);
    
    // The standalone server.js serves files relative to its own directory
    // We need to make sure the static files are accessible
    // Let's check the actual structure the standalone server expects
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Check standalone server file references ===" &&
      head -50 .next/standalone/server.js | grep -i "static\|public\|next" | head -10
    `);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
