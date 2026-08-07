# GKT Website — Sunucu Kurulum Rehberi

## Gereksinimler
- Ubuntu 22.04 / 24.04
- Node.js 18+
- npm 9+
- PM2
- Nginx

## Kurulum

### 1. Dosyaları yükle
```bash
scp gkt-website-deploy.zip kullanici@sunucu-ip:/home/kullanici/
ssh kullanici@sunucu-ip
unzip gkt-website-deploy.zip
cd gkt-website
```

### 2. Node.js kur (yoksa)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
```

### 3. Bağımlılıkları kur
```bash
npm install --production
```

### 4. Klasörleri oluştur
```bash
mkdir -p logs
mkdir -p public/assets/uploads
```

### 5. .env dosyasını hazırla
```bash
cp .env.production .env
nano .env  # JWT_SECRET, RECOVERY_SECRET ve ADMIN_INITIAL_PASSWORD'ü güçlü değerlerle doldur
```

### 6. Veritabanını oluştur
```bash
node server/seeds/seed-content.js
node server/seeds/seed-users.js
node server/seeds/seed-events.js
node server/seeds/seed-blog.js
```

### 7. PM2 ile başlat
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

### 8. Nginx reverse proxy
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/akdenizgkt.com
```

İçerik:
```nginx
server {
    listen 80;
    server_name akdenizgkt.com www.akdenizgkt.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /assets/ {
        alias /home/kullanici/gkt-website/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 1000;
}
```

Aktif et:
```bash
sudo ln -s /etc/nginx/sites-available/akdenizgkt.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d akdenizgkt.com -d www.akdenizgkt.com
sudo certbot renew --dry-run
```

### 10. Test
- Site: https://akdenizgkt.com
- Admin: https://akdenizgkt.com/admin
- Super Admin: https://akdenizgkt.com/superadmin

## Giriş Bilgileri
Bu repo herkese açık — **şifreleri asla buraya veya koda yazma.**

- `admin` hesabı veritabanı ilk oluşturulurken açılır. Şifre `.env` içindeki `ADMIN_INITIAL_PASSWORD`
  değerinden (en az 12 karakter) alınır; tanımlı değilse rastgele üretilip **bir kez** konsola yazılır.
- `seed-users.js` koordinatör/direktör hesaplarını rastgele şifrelerle açar ve şifreleri **bir kez** tablo olarak gösterir.
- Şifreleri ekiple yalnızca özel kanaldan paylaş; ilk girişten sonra panelden değiştir.
- Super Admin kurtarma anahtarı: `.env` içindeki `RECOVERY_SECRET`.

## Güncelleme
```bash
cd gkt-website
npm install --production
npm run build
pm2 restart gkt-website
```

## Sorun Giderme
```bash
pm2 status
pm2 logs gkt-website
pm2 restart gkt-website
sudo nginx -t
curl http://localhost:3001
```
