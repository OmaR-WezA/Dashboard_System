# دليل النشر السريع / Quick Deployment Guide

## الطريقة الأسهل (مجانية) / Easiest Way (Free)

### 1. Frontend على Vercel

```bash
cd frontend
npm install
npm run build

# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

**أو من خلال GitHub:**
1. ارفع الكود إلى GitHub
2. اذهب إلى https://vercel.com
3. اربط GitHub repository
4. Vercel سيقوم بالبناء تلقائياً

### 2. Backend على Railway

1. اذهب إلى https://railway.app
2. أنشئ حساب جديد
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر repository الخاص بك
5. أضف متغيرات البيئة:
   ```
   APP_KEY=your_app_key
   DB_CONNECTION=mysql
   DB_HOST=your_db_host
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   ```
6. Railway سيقوم بالبناء تلقائياً

### 3. Database على Supabase (PostgreSQL)

1. اذهب إلى https://supabase.com
2. أنشئ مشروع جديد
3. احصل على connection string
4. استخدمه في Railway environment variables

---

## الطريقة الاحترافية (VPS)

### DigitalOcean Droplet

1. **إنشاء Droplet:**
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - $12/month

2. **الاتصال:**
   ```bash
   ssh root@your_server_ip
   ```

3. **تثبيت المتطلبات:**
   ```bash
   # تحديث النظام
   sudo apt update && sudo apt upgrade -y

   # تثبيت Nginx
   sudo apt install nginx -y

   # تثبيت PHP 8.2
   sudo add-apt-repository ppa:ondrej/php -y
   sudo apt update
   sudo apt install php8.2-fpm php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip -y

   # تثبيت Composer
   curl -sS https://getcomposer.org/installer | php
   sudo mv composer.phar /usr/local/bin/composer

   # تثبيت Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # تثبيت MySQL
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   ```

4. **إعداد قاعدة البيانات:**
   ```bash
   sudo mysql -u root -p
   ```
   ```sql
   CREATE DATABASE material_dashboard;
   CREATE USER 'material_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON material_dashboard.* TO 'material_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **رفع الملفات:**
   ```bash
   cd /var/www
   sudo mkdir material-dashboard
   sudo chown -R $USER:$USER /var/www/material-dashboard
   
   # استخدم SCP أو Git لرفع الملفات
   ```

6. **إعداد Backend:**
   ```bash
   cd /var/www/material-dashboard/backend
   composer install --no-dev --optimize-autoloader
   cp .env.example .env
   nano .env  # عدّل الإعدادات
   php artisan key:generate
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

7. **إعداد Nginx:**
   - راجع `HOSTING_GUIDE.md` للتفاصيل الكاملة

8. **إعداد SSL:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

---

## نصائح مهمة / Important Tips

1. ✅ **الأمان:**
   - استخدم HTTPS دائماً
   - غيّر كلمات المرور الافتراضية
   - فعّل firewall

2. ✅ **الأداء:**
   - فعّل caching في Laravel
   - استخدم CDN للـ Frontend
   - فعّل compression في Nginx

3. ✅ **النسخ الاحتياطي:**
   - احتفظ بنسخ احتياطية يومية
   - استخدم cron jobs للنسخ التلقائي

---

## الدعم / Support

للمزيد من التفاصيل، راجع `HOSTING_GUIDE.md`

