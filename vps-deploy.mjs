import { Client } from 'ssh2';
import { readFileSync } from 'fs';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';
const APP_DIR = '/var/www/busybeds';

function executeCommand(conn, command, timeout = 300000) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${command.substring(0, 120)}...`);
    let output = '';
    let errorOutput = '';
    
    conn.exec(command, { pty: false }, (err, stream) => {
      if (err) {
        reject(new Error(`Exec error: ${err.message}`));
        return;
      }
      
      const timer = setTimeout(() => {
        reject(new Error('Command timed out'));
      }, timeout);
      
      stream.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });
      
      stream.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });
      
      stream.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${errorOutput.substring(0, 500)}`));
        }
      });
    });
  });
}

async function main() {
  const conn = new Client();
  
  console.log('Connecting to VPS...');
  
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect({
      host: VPS_HOST,
      port: 22,
      username: VPS_USER,
      password: VPS_PASS,
      readyTimeout: 30000,
    });
  });
  
  console.log('Connected!');
  
  try {
    // Step 1: Check current deployment status
    console.log('\n=== Step 1: Check current status ===');
    await executeCommand(conn, 'cd /var/www/busybeds && pm2 list && echo "---" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3008/');
    
    // Step 2: Run the zero-downtime deployment script
    console.log('\n=== Step 2: Run deployment script ===');
    await executeCommand(conn, `cd /var/www/busybeds && bash deploy.sh`, 600000);
    
    // Step 3: Run database seed
    console.log('\n=== Step 3: Run database seed ===');
    await executeCommand(conn, `cd /var/www/busybeds && npx tsx prisma/seed.ts`, 120000);
    
    // Step 4: Verify deployment
    console.log('\n=== Step 4: Verify deployment ===');
    await executeCommand(conn, `
      cd /var/www/busybeds && 
      echo "PM2 Status:" &&
      pm2 list &&
      echo "" &&
      echo "Website check:" &&
      curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3008/ &&
      echo "" &&
      echo "Hotel API check:" &&
      curl -s http://localhost:3008/api/hotels | head -c 200
    `);
    
    console.log('\n\n=== Deployment Complete! ===');
    console.log('Website: https://busybeds.com');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
