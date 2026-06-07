import { Client } from 'ssh2';

const VPS_HOST = '45.151.123.253';
const VPS_USER = 'root';
const VPS_PASS = 'R@tir@dH@ro2030';

function executeCommand(conn, command, timeout = 300000) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${command.substring(0, 150)}`);
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
        resolve({ code, output, errorOutput });
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
    // Check if app is running
    console.log('\n=== Check app status ===');
    const status = await executeCommand(conn, 'pm2 list && curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/');
    console.log('Status code:', status.code);
    
    // Wait a bit for the app to start
    console.log('\n=== Waiting for app to be ready ===');
    await executeCommand(conn, 'sleep 10 && curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/');
    
    // Run the database seed
    console.log('\n=== Running database seed ===');
    const seed = await executeCommand(conn, 'cd /var/www/busybeds && npx tsx prisma/seed.ts', 120000);
    console.log('Seed output:', seed.output.substring(0, 2000));
    
    // Final verification
    console.log('\n=== Final verification ===');
    await executeCommand(conn, `
      cd /var/www/busybeds &&
      echo "Website:" &&
      curl -s -o /dev/null -w "HTTP_%{http_code}" http://localhost:3008/ &&
      echo "" &&
      echo "Hotels API:" &&
      curl -s http://localhost:3008/api/hotels | head -c 500
    `);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
