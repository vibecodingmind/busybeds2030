import { Client } from 'ssh2';
const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function run(conn, cmd, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let out = '';
    conn.exec(cmd, (err, stream) => {
      if (err) { reject(err); return; }
      const timer = setTimeout(() => reject(new Error('timeout')), timeout);
      stream.on('data', d => { out += d.toString(); });
      stream.stderr.on('data', d => { out += d.toString(); });
      stream.on('close', code => { clearTimeout(timer); resolve({ code, out }); });
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise((res, rej) => { conn.on('ready', res); conn.on('error', rej); conn.connect({host:VPS_HOST, port:22, username:VPS_USER, password:VPS_PASS}); });
  console.log('Connected!');

  try {
    // Stop PM2
    await run(conn, 'pm2 stop busybeds 2>/dev/null; echo stopped');
    
    // Copy ALL required files from .next/ to .next/standalone/.next/
    await run(conn, 'cd /var/www/busybeds && cp .next/BUILD_ID .next/standalone/.next/ && cp .next/build-manifest.json .next/standalone/.next/ && cp .next/app-path-routes-manifest.json .next/standalone/.next/ && cp .next/prerender-manifest.json .next/standalone/.next/ && cp .next/routes-manifest.json .next/standalone/.next/ && echo files-copied', 30000);
    
    // Copy server and build directories  
    await run(conn, 'cd /var/www/busybeds && cp -r .next/server .next/standalone/.next/ 2>/dev/null; cp -r .next/build .next/standalone/.next/ 2>/dev/null; echo dirs-copied', 60000);
    
    // Start PM2
    await run(conn, 'pm2 start busybeds 2>/dev/null; echo started');
    
    // Wait and test
    await new Promise(r => setTimeout(r, 10000));
    const r = await run(conn, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3008/ && echo " homepage" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3008/_next/static/chunks/2tcykvktof0om.css && echo " css"');
    console.log('Result:', r.out);
  } finally {
    conn.end();
  }
}
main().catch(console.error);
