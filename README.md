# نظام توزيع المواد الدراسية
# Material Distribution System

نظام كامل لإدارة وتوزيع المواد الدراسية للطلاب مع واجهة عربية/إنجليزية.

A complete system for managing and distributing student materials with Arabic/English interface.

## المميزات الرئيسية / Main Features

- ✅ رفع ملفات Excel / Excel file upload
- ✅ البحث برقم المقعد / Search by seat number
- ✅ إدارة المستخدمين / User management
- ✅ تصفية حسب المادة والمرحلة / Filter by subject and stage
- ✅ تتبع حالة الاستلام / Received status tracking
- ✅ واجهة عربية/إنجليزية / Arabic/English interface

## التثبيت السريع / Quick Installation

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure database in .env
php artisan migrate
php artisan db:seed
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## بيانات الدخول الافتراضية / Default Credentials

- Email: `admin@example.com`
- Password: `password`

## إضافة مدير جديد / Adding New Admin

1. سجل الدخول كمدير / Login as admin
2. اضغط "إدارة المستخدمين" / Click "User Management"
3. اضغط "إضافة مستخدم" / Click "Add User"
4. املأ النموذج واختر "مدير" / Fill form and check "Admin"

## تنسيق ملف Excel / Excel Format

العمود المطلوب / Required columns:
- `SeatNumber` - رقم المقعد / Seat Number
- `SubjectName` - اسم المادة / Subject Name
- `MaterialName` - اسم المادة / Material Name
- `Hall` - القاعة / Hall
- `Seat` - المكان / Seat Location
- `Stage` - المرحلة (اختياري) / Stage (optional)

## الدعم / Support

للحصول على المساعدة، راجع الملفات في مجلد `backend/excel_sheets/`

For help, see files in `backend/excel_sheets/` folder
