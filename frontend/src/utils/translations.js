// Translations for Arabic and English
export const translations = {
  ar: {
    // Labels
    'Subject': 'المادة',
    'Hall': 'القاعة',
    'Seat': 'المكان',
    'Stage': 'المرحلة',
    'Seat Number': 'كود الطالب',
    'ID': 'كود الطالب',
    'Material Name': 'اسم المادة',
    'Received': 'تم الاستلام',
    'Not Received': 'لم يتم الاستلام',
    'Received Status': 'حالة الاستلام',
    'Cancel Received': 'إلغاء الاستلام',
    
    // Actions
    'Search': 'بحث',
    'Add': 'إضافة',
    'Edit': 'تعديل',
    'Delete': 'حذف',
    'Upload': 'رفع',
    'Save': 'حفظ',
    'Cancel': 'إلغاء',
    'Login': 'تسجيل الدخول',
    'Logout': 'تسجيل الخروج',
    
    // Messages
    'Upload successful': 'تم الرفع بنجاح',
    'Material added': 'تمت إضافة المادة',
    'Material updated': 'تم تحديث المادة',
    'Material deleted': 'تم حذف المادة',
    'Mark as received': 'تحديد كمستلم',
    'Delete all materials': 'حذف جميع المواد',
    'Enter password': 'أدخل كلمة المرور',
    'No materials found': 'لم يتم العثور على مواد',
    'No materials found for Seat Number': 'لم يتم العثور على مواد لكود الطالب',
    'Found': 'تم العثور على',
    'material(s) for Seat Number': 'مادة لكود الطالب',
    
    // Filters
    'Filter by Subject': 'تصفية حسب المادة',
    'Filter by Stage': 'تصفية حسب المرحلة',
    'All Subjects': 'جميع المواد',
    'All Stages': 'جميع المراحل',
    'No Stage': 'بدون مرحلة',
    
    // User Management
    'Users': 'المستخدمون',
    'Add User': 'إضافة مستخدم',
    'Edit User': 'تعديل مستخدم',
    'Name': 'الاسم',
    'Email': 'البريد الإلكتروني',
    'Password': 'كلمة المرور',
    'Admin': 'مدير',
    'Regular User': 'مستخدم عادي',
    
    // Common
    'Chair': 'كرسي',
  },
  en: {
    // Labels
    'Subject': 'Subject',
    'Hall': 'Hall',
    'Seat': 'Seat',
    'Stage': 'Level',
    'Seat Number': 'STU-ID',
    'ID': 'STU-ID',
    'Material Name': 'Material Name',
    'Received': 'Received',
    'Not Received': 'Not Received',
    'Received Status': 'Received Status',
    'Cancel Received': 'Cancel Received',
    
    // Actions
    'Search': 'Search',
    'Add': 'Add',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'Upload': 'Upload',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Login': 'Login',
    'Logout': 'Logout',
    
    // Messages
    'Upload successful': 'Upload successful',
    'Material added': 'Material added',
    'Material updated': 'Material updated',
    'Material deleted': 'Material deleted',
    'Mark as received': 'Mark as received',
    'Delete all materials': 'Delete all materials',
    'Enter password': 'Enter password',
    'No materials found': 'No materials found',
    'No materials found for Seat Number': 'No materials found for STU-ID',
    'Found': 'Found',
    'material(s) for Seat Number': 'material(s) for STU-ID',
    
    // Filters
    'Filter by Subject': 'Filter by Subject',
    'Filter by Stage': 'Filter by Stage',
    'All Subjects': 'All Subjects',
    'All Stages': 'All Stages',
    'No Stage': 'No Stage',
    
    // User Management
    'Users': 'Users',
    'Add User': 'Add User',
    'Edit User': 'Edit User',
    'Name': 'Name',
    'Email': 'Email',
    'Password': 'Password',
    'Admin': 'Admin',
    'Regular User': 'Regular User',
    
    // Common
    'Chair': 'Chair',
  }
}

export const t = (key, lang = 'ar') => {
  return translations[lang]?.[key] || key;
}
