// Simple GitHub webhook listener for auto-deploy
const http = require('http');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SECRET = process.env.WEBHOOK_SECRET || 'busybeds-webhook-secret-2026';
const PORT = 9000;
const DEPLOY_SCRIPT = '/var/www/busybeds/deploy.sh';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/deploy') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const signature = req.headers['x-hub-signature-256'];
        if (signature) {
          const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');
          if (signature !== expected) {
            res.writeHead(403);
            res.end('Invalid signature');
            return;
          }
        }
        
        const payload = JSON.parse(body);
        console.log('Received push event:', payload.ref);
        
        if (payload.ref === 'refs/heads/main') {
          console.log('Deploying...');
          try {
            const output = execSync(DEPLOY_SCRIPT, { timeout: 300000 }).toString();
            console.log('Deploy output:', output);
          } catch (e) {
            console.error('Deploy failed:', e.message);
          }
        }
        
        res.writeHead(200);
        res.end('OK');
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('Webhook listener running on port ' + PORT);
});
