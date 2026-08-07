#!/bin/bash
echo "🚀 GKT Website Deploy Script"
echo "================================"

# 1. Dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# 2. Build frontend
echo "🔨 Building frontend..."
npm run build

# 3. Create required directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p public/assets/uploads
mkdir -p server

# 4. Seed database (if fresh install)
if [ ! -f server/database.sqlite ]; then
  echo "🗄️ Seeding database..."
  node server/seeds/seed-content.js
  node server/seeds/seed-users.js
  node server/seeds/seed-events.js
  node server/seeds/seed-blog.js
  echo "✅ Database seeded"
else
  echo "ℹ️ Database already exists, skipping seed"
fi

# 5. Optimize images (if sharp is available)
echo "🖼️ Optimizing images..."
node server/optimize-images.js 2>/dev/null || echo "⚠️ Image optimization skipped"

# 6. Start/restart with PM2
echo "🔄 Starting server..."
pm2 delete gkt-website 2>/dev/null
pm2 start ecosystem.config.cjs --env production
pm2 save

echo "================================"
echo "✅ Deploy complete!"
echo "🌐 Site: https://akdenizgkt.com"
echo "🔧 Admin: https://akdenizgkt.com/admin"
echo "📊 PM2 status: pm2 status"
echo "📋 Logs: pm2 logs gkt-website"
