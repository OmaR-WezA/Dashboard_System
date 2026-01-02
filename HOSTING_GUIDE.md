# دليل الاستضافة الكامل / Complete Hosting Guide

## خيارات الاستضافة / Hosting Options

### الخيار 1: استضافة مجانية (للاختبار) / Free Hosting (For Testing)

#### 1.1 Vercel (Frontend) + Railway/Render (Backend) + Supabase (Database)

**Frontend على Vercel:**
```bash
cd frontend
npm install
npm run build
# Upload dist folder to Vercel
```

**Backend على Railway:**
1. اذهب إلى https://railway.app
2. أنشئ مشروع جديد
3. اربط GitHub repository
4. اختر Laravel template
5. أضف متغيرات البيئة (.env)

**Database على Supabase:**
1. اذهب إلى https://supabase.com
2. أنشئ مشروع جديد
3. احصل على connection string
4. استخدم PostgreSQL

---

### الخيار 2: استضافة مدفوعة (احترافية) / Paid Hosting (Professional)

#### 2.1 DigitalOcean / Linode / AWS

**المتطلبات:**
- VPS (Virtual Private Server)
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- 20GB Storage

**خطوات التثبيت:**

```bash
# 1. تحديث النظام
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Nginx
sudo apt install nginx -y

# 3. تثبيت PHP 8.2
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip -y

# 4. تثبيت Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 5. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 6. تثبيت MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 7. إنشاء قاعدة البيانات
sudo mysql -u root -p
CREATE DATABASE material_dashboard;
CREATE USER 'material_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON material_dashboard.* TO 'material_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 8. رفع ملفات Backend
cd /var/www
sudo mkdir material-dashboard
sudo chown -R $USER:$USER /var/www/material-dashboard
# Upload backend files here
cd material-dashboard/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
# Edit .env with database credentials
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# 9. إعداد Nginx للBackend
sudo nano /etc/nginx/sites-available/material-dashboard-api
```

**إعداد Nginx للBackend:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/material-dashboard/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/material-dashboard-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**إعداد Frontend:**
```bash
cd /var/www/material-dashboard/frontend
npm install
npm run build
# Build output in dist folder
```

**إعداد Nginx للFrontend:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/material-dashboard/frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**إعداد SSL (HTTPS) مع Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

**إعداد PM2 للBackend (اختياري):**
```bash
sudo npm install -g pm2
cd /var/www/material-dashboard/backend
pm2 start "php artisan serve --host=0.0.0.0 --port=8000" --name material-api
pm2 save
pm2 startup
```

---

### الخيار 3: استضافة مشتركة (Shared Hosting)

**إذا كان لديك استضافة مشتركة:**

1. **رفع Backend:**
   - ارفع ملفات `backend` إلى مجلد `public_html/api` أو `public_html/backend`
   - تأكد من أن `public/index.php` في المجلد الصحيح
   - عدّل `.htaccess` إذا لزم الأمر

2. **رفع Frontend:**
   - اعمل build: `npm run build`
   - ارفع محتويات `dist` إلى `public_html`

3. **قاعدة البيانات:**
   - استخدم cPanel لإنشاء قاعدة بيانات MySQL
   - عدّل `.env` بمعلومات قاعدة البيانات

---

## إعدادات مهمة / Important Settings

### 1. ملف .env للBackend (Production)

```env
APP_NAME="Material Dashboard"
APP_ENV=production
APP_KEY=base64:your_generated_key_here
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=material_dashboard
DB_USERNAME=material_user
DB_PASSWORD=strong_password_here

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

### 2. تحديث Frontend API URL

في `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';
```

في `frontend/.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
```

### 3. CORS Configuration

في `backend/config/cors.php`:
```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

---

## خطوات النشر السريع / Quick Deployment Steps

### للمبتدئين (استخدام Vercel + Railway):

1. **Frontend على Vercel:**
   ```bash
   cd frontend
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Backend على Railway:**
   - ارفع الكود إلى GitHub
   - اربط Railway بـ GitHub
   - أضف متغيرات البيئة
   - Railway سيقوم بالبناء تلقائياً

3. **Database:**
   - استخدم Supabase (PostgreSQL) أو Railway MySQL

---

## نصائح الأمان / Security Tips

1. ✅ استخدم HTTPS دائماً
2. ✅ غيّر كلمات المرور الافتراضية
3. ✅ فعّل firewall
4. ✅ حدّث النظام بانتظام
5. ✅ استخدم كلمات مرور قوية
6. ✅ فعّل rate limiting
7. ✅ احتفظ بنسخ احتياطية

---

## النسخ الاحتياطي / Backup

```bash
# Backup Database
mysqldump -u material_user -p material_dashboard > backup_$(date +%Y%m%d).sql

# Backup Files
tar -czf backup_files_$(date +%Y%m%d).tar.gz /var/www/material-dashboard
```

---

## الدعم / Support

للمساعدة في الاستضافة، راجع:
- Laravel Deployment: https://laravel.com/docs/deployment
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

