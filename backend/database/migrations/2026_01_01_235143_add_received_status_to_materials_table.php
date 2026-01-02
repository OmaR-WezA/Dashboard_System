<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->boolean('received')->default(false)->after('stage');
            $table->timestamp('received_at')->nullable()->after('received');
            $table->unsignedBigInteger('received_by')->nullable()->after('received_at');
            $table->foreign('received_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->dropColumn(['received', 'received_at', 'received_by']);
        });
    }
};
