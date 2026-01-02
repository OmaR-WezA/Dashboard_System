<?php
/**
 * Performance Optimization Script
 * Run: php optimize.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🚀 Starting Performance Optimization...\n\n";

// 1. Clear all caches
echo "1. Clearing caches...\n";
Artisan::call('cache:clear');
Artisan::call('config:clear');
Artisan::call('route:clear');
Artisan::call('view:clear');
echo "   ✅ Caches cleared\n\n";

// 2. Optimize caches
echo "2. Optimizing caches...\n";
Artisan::call('config:cache');
Artisan::call('route:cache');
Artisan::call('view:cache');
echo "   ✅ Caches optimized\n\n";

// 3. Optimize autoloader
echo "3. Optimizing autoloader...\n";
exec('composer dump-autoload --optimize --no-dev');
echo "   ✅ Autoloader optimized\n\n";

// 4. Database optimization
echo "4. Optimizing database...\n";
try {
    DB::statement('ANALYZE TABLE materials');
    DB::statement('ANALYZE TABLE users');
    echo "   ✅ Database tables analyzed\n\n";
} catch (\Exception $e) {
    echo "   ⚠️  Database optimization skipped: " . $e->getMessage() . "\n\n";
}

echo "✨ Optimization complete!\n";
echo "\n📊 Performance improvements:\n";
echo "   - Caches optimized\n";
echo "   - Routes cached\n";
echo "   - Autoloader optimized\n";
echo "   - Database analyzed\n";
echo "\n🚀 Your application is now optimized for production!\n";

