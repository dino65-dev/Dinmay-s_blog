#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Dinmay's Blog — Oracle VPS Proxy Setup
# Run this once:  chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════"
echo "  Dinmay's Blog — Smart Proxy Setup"
echo "═══════════════════════════════════════════════"

# ─── 1. Install Node.js 20 LTS (if not present) ─────────────
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✅ Node.js $(node -v) already installed"
fi

# ─── 2. Install PM2 globally ────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  sudo npm install -g pm2
else
  echo "✅ PM2 already installed"
fi

# ─── 3. Install dependencies ────────────────────────────────
echo "📦 Installing proxy dependencies..."
npm install --production

# ─── 4. Create .env from template (if not exists) ───────────
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  cp .env.example .env
  echo ""
  echo "⚠️  IMPORTANT: Edit .env with your Cosmos DB connection string!"
  echo "   nano .env"
  echo ""
else
  echo "✅ .env already exists"
fi

# ─── 5. Verify Redis is running ─────────────────────────────
echo "🔍 Checking Redis..."
if redis-cli -a "$(grep REDIS_PASS .env | cut -d= -f2)" ping 2>/dev/null | grep -q PONG; then
  echo "✅ Redis is running and authenticated"
else
  echo "⚠️  Redis may not be running or password mismatch. Check:"
  echo "   sudo systemctl status redis"
  echo "   sudo grep requirepass /etc/redis/override.conf"
fi

# ─── 6. Open firewall for proxy port ────────────────────────
PROXY_PORT=$(grep PORT .env | head -1 | cut -d= -f2)
PROXY_PORT=${PROXY_PORT:-3001}
echo "🔓 Opening port ${PROXY_PORT}..."
sudo iptables -C INPUT -p tcp --dport ${PROXY_PORT} -j ACCEPT 2>/dev/null || \
  sudo iptables -I INPUT -p tcp --dport ${PROXY_PORT} -j ACCEPT

# ─── 7. Start with PM2 ──────────────────────────────────────
echo "🚀 Starting proxy with PM2..."
pm2 delete blog-proxy 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# ─── 8. Setup PM2 startup (persist across reboots) ──────────
echo "🔄 Setting up PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true
pm2 save

# ─── 9. Setup cache warmer cron ─────────────────────────────
PROXY_DIR=$(pwd)
CRON_CMD="*/5 * * * * cd ${PROXY_DIR} && /usr/bin/node warmer.js >> /var/log/cache-warmer.log 2>&1"

if crontab -l 2>/dev/null | grep -q "warmer.js"; then
  echo "✅ Warmer cron already exists"
else
  echo "⏰ Adding cache warmer cron (every 5 minutes)..."
  (crontab -l 2>/dev/null; echo "${CRON_CMD}") | crontab -
  echo "✅ Cron added"
fi

# ─── 10. Create log file ────────────────────────────────────
sudo touch /var/log/cache-warmer.log
sudo chown $USER:$USER /var/log/cache-warmer.log

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Setup Complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "  Proxy URL:  http://$(hostname -I | awk '{print $1}'):${PROXY_PORT}"
echo "  Health:     http://localhost:${PROXY_PORT}/health"
echo "  Stats:      http://localhost:${PROXY_PORT}/stats"
echo ""
echo "  Logs:       pm2 logs blog-proxy"
echo "  Restart:    pm2 restart blog-proxy"
echo "  Stop:       pm2 stop blog-proxy"
echo ""
echo "  ⚠️  Don't forget to add OCI Security List ingress rule"
echo "     for TCP port ${PROXY_PORT} (Source: 0.0.0.0/0)"
echo ""
echo "  Then set in your Render/Leapcell env:"
echo "  VPS_PROXY_URL=http://$(hostname -I | awk '{print $1}'):${PROXY_PORT}"
echo ""
