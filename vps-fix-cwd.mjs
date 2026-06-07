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
    // Check PM2 logs for errors
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Recent PM2 logs ===" &&
      pm2 logs busybeds --nostream --lines 30 2>&1 | tail -30
    `);
    
    // The issue: standalone server can't find static files
    // In Next.js 16, standalone server resolves paths relative to its own directory
    // Need to change CWD to .next/standalone or symlink files
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Current standalone .next structure ===" &&
      ls -la .next/standalone/.next/ &&
      echo "=== Check if server.js expects different paths ===" &&
      head -20 .next/standalone/server.js
    `);
    
    // Fix: Change PM2 CWD to .next/standalone so it can find its files
    // OR create symlinks from .next/standalone to the build root
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "=== Fix: Update ecosystem.config.js CWD ===" &&
      cat > ecosystem.config.js << 'ECOSYSTEM'
module.exports = {
  apps: [{
    name: 'busybeds',
    script: 'server.js',
    cwd: '/var/www/busybeds/.next/standalone',
    env: {
      NODE_ENV: 'production',
      PORT: 3008,
      HOSTNAME: '0.0.0.0'
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    kill_timeout: 5000,
    listen_timeout: 15000,
    shutdown_with_message: true,
    wait_ready: false,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 3000,
    error_file: '/root/.pm2/logs/busybeds-error.log',
    out_file: '/root/.pm2/logs/busybeds-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
ECOSYSTEM
      echo "=== Verify file ===" &&
      cat ecosystem.config.js | head -10
    `);

    // Restart PM2 with new config
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      pm2 delete busybeds 2>/dev/null || true &&
      pm2 start ecosystem.config.js &&
      pm2 save &&
      sleep 8 &&
      echo "=== Test static files ===" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/ &&
      echo "" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/_next/static/chunks/2tcykvktof0om.css &&
      echo ""
    `);
    
  } finally {
    conn.end();
  }
}

main().catch(console.error);
