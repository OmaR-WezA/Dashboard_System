# دليل التثبيت / Installation Guide

## المتطلبات / Requirements

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/PostgreSQL

## خطوات التثبيت / Installation Steps

### 1. إعداد قاعدة البيانات / Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE material_dashboard;
EXIT;
```

### 2. إعداد Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edit .env and set database credentials
php artisan migrate
php artisan db:seed
php artisan serve
```

### 3. إعداد Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. الوصول / Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## إضافة مدير / Adding Admin

راجع `ADD_ADMIN_GUIDE.md` / See `ADD_ADMIN_GUIDE.md`
