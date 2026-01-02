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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('seat_number', 50)->index(); // Indexed for fast search
            $table->string('subject_name', 255);
            $table->string('material_name', 255);
            $table->string('hall', 100);
            $table->string('seat', 50);
            $table->string('stage', 100)->nullable(); // Optional stage
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};

