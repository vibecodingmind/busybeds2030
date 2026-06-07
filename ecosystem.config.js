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
    // Logging
    error_file: '/root/.pm2/logs/busybeds-error.log',
    out_file: '/root/.pm2/logs/busybeds-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

