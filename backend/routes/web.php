<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Material Distribution API',
        'version' => '1.0.0',
    ]);
});

