import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 600000) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${command.substring(0, 120)}`);
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
    // Update ecosystem.config.js back to correct path first
    await executeCommand(conn, `
      cd /var/www/busybeds &&
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
    `);

    // Run the deployment script
    await executeCommand(conn, 'cd /var/www/busybeds && bash deploy.sh', 600000);
    
    // Restart PM2 with correct CWD
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      pm2 delete busybeds 2>/dev/null || true &&
      pm2 start ecosystem.config.js &&
      pm2 save
    `);
    
    // Wait for app to start and test
    await executeCommand(conn, `
      sleep 10 &&
      cd /var/www/busybeds &&
      echo "=== Testing ===" &&
      curl -s -o /dev/null -w "Homepage: HTTP_%{http_code}" http://localhost:3008/ &&
      echo "" &&
      CSS_FILE=$(curl -s http://localhost:3008/ | grep -o 'href="/_next/static/chunks/[^"]*\\.css"' | head -1 | sed 's/href="\\///' | sed 's/"//') &&
      echo "CSS file: $CSS_FILE" &&
      curl -s -o /dev/null -w "CSS: HTTP_%{http_code}" http://localhost:3008/$CSS_FILE &&
      echo "" &&
      echo "Hotels API:" &&
      curl -s http://localhost:3008/api/hotels | head -c 200
    `);
    
  } finally {
    conn.end();
  }
}

main().catch(console.error);
