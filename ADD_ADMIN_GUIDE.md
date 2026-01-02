# How to Add New Admin User

## Method 1: Through Dashboard (Recommended)

1. **Login** as existing admin
2. **Click** "إدارة المستخدمين" (User Management) button
3. **Click** "إضافة مستخدم" (Add User) button
4. **Fill the form:**
   - Name: Enter user's name
   - Email: Enter email address
   - Password: Enter password (min 6 characters)
   - Check "Admin" checkbox for admin privileges
5. **Click** "إضافة" (Add) button

## Method 2: Using Tinker (Command Line)

```powershell
php artisan tinker
```

Then run:
```php
$user = new App\Models\User();
$user->name = 'Admin Name';
$user->email = 'admin@example.com';
$user->password = Hash::make('password123');
$user->is_admin = true;
$user->save();
```

## Method 3: Using API Directly

**POST** `/api/users`

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "is_admin": true
}
```

## User Permissions

- **Admin (is_admin = true)**: Full access to all features
- **Regular User (is_admin = false)**: Limited access (if implemented)

## Current Features Available to Admins

✅ Upload Excel files
✅ View all materials
✅ Add/Edit/Delete materials
✅ Search materials
✅ Filter by Subject and Stage
✅ Mark materials as received
✅ Delete all materials (with password)
✅ Manage users (add/edit/delete)

## Notes

- Email must be unique
- Password minimum 6 characters
- You cannot delete your own account
- Admin users can manage other users

